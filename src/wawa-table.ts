
import { LitElement, customElement, TemplateResult, html, property, PropertyValues, query } from "lit-element";
import { repeat } from "lit-html/directives/repeat";
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
import { LoadingTemplate } from "./loading-template";
import { WawaItem } from "./wawa-item";
import "./wawa-tr";

@customElement("wawa-table")
export class WawaTable extends LitElement {

    @property({type: Array})
    public items: WawaItem[] = [];

    @property({type: Number})
    public scrollOffset: number = 50;
    @property({type: Number})
    public pageSize: number = 20;

    // setting the rowHeight enables virtualization
    @property({type: Number})
    public rowHeight: number = 0;

    private pageNumber: number = 0;

    private fetching: boolean = false;
    @query("loading-data")
    private loadingData?: LoadingData;

    @property({type: Number})
    protected startIndex: number = 0;
    @property({type: Number})
    protected visibleRows: number = 0;

    @property()
    public fetchData?: (pageNumber: number, pageSize: number) => Promise<any[]> = undefined;
    @property({type: Boolean})
    public monitor: boolean = false;
    /** Enables changing the header and/or row templates dynamically */
    @property({type: Boolean})
    public observeChildren: boolean = false;

    private childObserver: MutationObserver = new MutationObserver(() => { this.loadTemplates(); this.requestUpdate(); });
    public rowTemplate: string = "";
    public innerRowTemplate: string = "";
    private headerTemplate?: Element[];
    private loadingTemplate?: Element[];

    public constructor() {
        super();
        this.loadTemplates();
    }

    private loadTemplates(): void {
        this.headerTemplate = undefined;
        this.loadingTemplate = undefined;
        this.rowTemplate = "";
        this.innerRowTemplate = "";
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
                this.rowTemplate = this.children[i].innerHTML.replace(/`/g, "\\`").replace(/<tr/,"<tr is='wawa-tr' .item=${wawaitem}");
                for(let j = 0; j < (this.children[i] as HTMLTemplateElement).content.children.length; j++) {
                    if((this.children[i] as HTMLTemplateElement).content.children[j] instanceof HTMLTableRowElement) {
                        this.innerRowTemplate = (this.children[i] as HTMLTemplateElement).content.children[j].innerHTML.replace(/`/g, "\\`");
                        break;
                    }
                }
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
            if (this.loadingData) {
                this.loadingData.fetching = true;
            }

            this.fetchData(this.pageNumber, this.pageSize).then(items => {
                for(let i: number = 0; i < items.length; i++) {
                    this.items.push(new WawaItem(items[i], this));
                }
                this.pageNumber++;
                this.fetching = false;
                if (this.loadingData) {
                    this.loadingData.fetching = false;
                }

                this.computeVisibleRows();

                this.requestUpdate();

                if(items.length > 0) {
                    let div: HTMLDivElement = this.renderRoot.querySelector("div") as HTMLDivElement;
                    if(div && div.clientHeight !== 0 && div.scrollHeight <= div.clientHeight) {
                        this.fetch();
                    }
                }
            });
        }
    }

    private lastScroll:number = 0;
    private computeVisibleRows(): void {
        let div: HTMLDivElement = this.renderRoot.querySelector("div") as HTMLDivElement;
        let thead: HTMLElement = this.renderRoot.querySelector("thead") as HTMLElement;
        if(this.rowHeight > 0) {
            let visibleRows = Math.ceil(div.clientHeight / this.rowHeight) * 2;
            let startIndex = Math.max(Math.floor((div.scrollTop - thead.clientHeight) / this.rowHeight - this.visibleRows / 4), 0);
            let lastScroll = (div.scrollTop - thead.clientHeight) / this.rowHeight;
            if(visibleRows != this.visibleRows || Math.abs(this.lastScroll - lastScroll) > visibleRows / 4) {
                // if the number of visible rows changed, it's enough to request a render
                // if we scrolled one half table height, it's enough to request a render
                this.visibleRows = visibleRows;
                this.startIndex = startIndex;
                this.lastScroll = lastScroll;
            }
        }
    }

    private onScroll(e: Event): void {
        let div: HTMLDivElement = e.composedPath()[0] as HTMLDivElement;

        this.computeVisibleRows();

        if (div.scrollHeight - div.clientHeight - div.scrollTop < this.scrollOffset) {
            this.fetch();
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties);
        this.resetObserver();
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

    protected render(): TemplateResult {
        return html`${this.renderStyles()}<div style="width:100%;" @scroll=${this.onScroll}>
            <table part="table" style="border-collapse: collapse;width:100%;">
                <thead part="head">
                    ${this.headerTemplate}
                </thead>
                <tbody part="body">
                    ${this.startIndex > 0 ? html`<tr style="height:${this.startIndex * this.rowHeight}px"></tr>` : html``}
                    ${repeat(this.items, (i, index) => index, (i, index) => {
                        if (index >= this.startIndex && (this.visibleRows == 0 || index < this.startIndex + this.visibleRows)) {
                            return html`${i.template}`;
                        } else {
                            return  html``;
                        }
                    })}
                    ${this.visibleRows > 0 && this.items.length - this.visibleRows - this.startIndex > 0 ? html`<tr style="height:${(this.items.length - this.visibleRows - this.startIndex) * this.rowHeight}px"></tr>` : html``}
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
        const newItem: WawaItem = new WawaItem(item, this);
        this.items.filter(i => i.index >= index).forEach(i => i.index += 1);
        this.items.splice(index, 0, newItem);
        this.requestUpdate(); // add the new item to the table
        this.items.forEach(i => i.updateTemplate()); // update the existing items
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
        this.requestUpdate();
        this.items.forEach(i => i.updateTemplate());
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