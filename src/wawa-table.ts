
import { LitElement, customElement, TemplateResult, html, property, PropertyValues } from "lit-element";
import { repeat } from "lit-html/directives/repeat";
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
import { LoadingTemplate } from "./loading-template";
import { WawaRow } from "./wawa-row";
import { WawaItem } from "./wawa-item";

@customElement("wawa-table")
export class WawaTable extends LitElement {

    @property({type: Array})
    public items: WawaItem[] = [];

    @property({type: Number})
    public scrollOffset: number = 50;
    @property({type: Number})
    public pageSize: number = 20;

    private pageNumber: number = 0;

    private fetching: boolean = false;
    private loadingData?: LoadingData;

    @property()
    public fetchData?: (pageNumber: number, pageSize: number) => Promise<any[]> = undefined;
    @property({type: Boolean})
    public monitor: boolean = false;
    /** Enables changing the header and/or row templates dynamically */
    @property({type: Boolean})
    public observeChildren: boolean = false;

    private childObserver: MutationObserver = new MutationObserver(() => { this.loadTemplates(); this.requestUpdate(); });
    private rowTemplate: string = "";
    private headerTemplate?: Element[];
    private loadingTemplate?: Element[];

    private rows: WawaRow[] = [];

    public constructor() {
        super();
        this.loadTemplates();
    }

    private loadTemplates(): void {
        this.headerTemplate = undefined;
        this.loadingTemplate = undefined;
        this.rowTemplate = "";
        for(let i: number = 0; i < this.children.length; i++) {
            if(this.children[i] instanceof HeaderTemplate) {
                if(this.headerTemplate) {
                    console.error("Only one header-template required");
                }
                this.headerTemplate = Array.from(document.importNode((this.children[i] as HeaderTemplate).content, true).children);
            } else if(this.children[i] instanceof LoadingTemplate) {
                if(this.loadingTemplate) {
                    console.error("Only one loading-template required");
                }
                this.loadingTemplate = Array.from(document.importNode((this.children[i] as LoadingTemplate).content, true).children);
            } else if(this.children[i] instanceof RowTemplate) {
                if(this.rowTemplate !== "") {
                    console.error("Only one row-template required");
                }
                this.rowTemplate = this.children[i].innerHTML.replace("`", "\\`");
            }
        }
    }

    private resetObserver(): void {
        this.childObserver.disconnect();
        if (this.observeChildren) {
            this.childObserver.observe(this, { childList: true });
            this.loadTemplates();
            this.requestUpdate();
        }
    }

    private fetch(): void {
        if(!this.fetching && this.fetchData) {
            this.fetching = true;
            this.loadingData!.fetching = true;

            this.fetchData(this.pageNumber, this.pageSize).then(items => {
                for(let i: number = 0; i < items.length; i++) {
                    this.items.push(new WawaItem(items[i], this.items.length, this.monitor));
                }
                this.pageNumber++;
                this.fetching = false;
                this.loadingData!.fetching = false;

                this.requestUpdate();

                if(items.length > 0) {
                    let div: HTMLDivElement = this.renderRoot.querySelector("div") as HTMLDivElement;
                    if(div.scrollHeight <= div.clientHeight) {
                        this.fetch();
                    }
                }
            });
        }
    }

    private onScroll(e: Event): void {
        let div: HTMLDivElement = e.composedPath()[0] as HTMLDivElement;
        if (div.scrollHeight - div.clientHeight - div.scrollTop < this.scrollOffset) {
            this.fetch();
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties);
        this.resetObserver();
        this.loadingData = this.renderRoot.querySelector("loading-data") as LoadingData;
    }

    protected update(_changedProperties: PropertyValues): void {
        if(_changedProperties.has("fetchData")) {
            this.items = [];
            this.pageNumber = 0;
            this.fetch();
        }
        if(_changedProperties.has("monitor")) {
            if(this.monitor) {
                // monitor existing items
            }
        }
        if (_changedProperties.has("observeChildren")) {
            this.resetObserver();
        }
        super.update(_changedProperties);
    }

    private renderStyles(): TemplateResult {
        return html`
        <style>
            div {
                height: 100%;
                overflow-y: auto;
            }
        </style>
        `;
    }

    private renderRow(item: WawaItem): TemplateResult {
        if(item.index >= this.rows.length) {
            this.rows.push(new WawaRow(this.rowTemplate, item, this, () => this.requestUpdate()));
        }
        return this.rows[item.index].template;
    }

    protected render(): TemplateResult {
        return html`${this.renderStyles()}<div style="width:100%;" @scroll=${this.onScroll}>
            <table part="table" style="border-collapse: collapse;width:100%;">
                <thead part="head">
                    ${this.headerTemplate}
                </thead>
                <tbody part="body">
                    ${repeat(this.items, (i, index) => index, (i, index) => html`${this.renderRow(i)}`)}
                </tbody>
            </table>
            <loading-data .loadingTemplate=${this.loadingTemplate}></loading-data>
        </div>`;
    }

    /**
     * Insert an item into the table at a specific index.
     * @param item The item to insert into the table
     * @param index The index to insert the item at
     */
    public insertItem(item: any, index: number): void {
        const newItem: WawaItem = new WawaItem(item, index, this.monitor);
        this.items.filter(i => i.index >= index).forEach(i => i.index += 1);
        this.items.splice(index, 0, newItem);
        this.rows = [];
        this.requestUpdate();
    }

    /**
     * Remove an item from the table. Does nothing if the item is not present.
     * @param item The item to remove
     */
    public removeItem(item: any): void {
        const index: number = this.items.findIndex(i => i.item === item);
        if (index === -1) {
            return;
        }
        this.items.splice(index, 1);
        this.rows = [];
        this.requestUpdate();
    }
}

@customElement("loading-data")
export class LoadingData extends LitElement {

    @property({type: Boolean})
    public fetching: boolean = false;

    @property()
    private loadingTemplate?: Element[];

    public render(): TemplateResult {
        if(this.fetching) {
            if(this.loadingTemplate) {
                return html`${this.loadingTemplate}`;
            }
        }
        return html``;
    }
}