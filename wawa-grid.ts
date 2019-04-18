
import { LitElement, customElement, TemplateResult, html, property, PropertyValues } from "lit-element";
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
import { Template } from "lit-html";

@customElement("wawa-grid")
export class WawaGrid extends LitElement {

    @property({type: Array})
    private items: any[] = [];

    @property({type: Boolean})
    private fetching: boolean = false;

    @property({type: Number})
    private scrollOffset: number = 50;
    @property({type: Number})
    private pageSize: number = 3;

    private pageNumber: number = 0;

    @property()
    private fetchData?: (pageNumber: number, pageSize: number) => Promise<any[]> = undefined;

    private rowTemplate: string = "";
    private headerTemplate: string = "";

    private rows: TemplateResult[] = []; 

    public constructor() {
        super();
        for(let i = 0; i < this.children.length; i++) {
            if(this.children[i] instanceof HeaderTemplate) {
                if(this.headerTemplate != "") {
                    console.error("Only one header-template required");
                }
                this.headerTemplate = this.children[i].innerHTML.replace("`", "\\`");
            } else if(this.children[i] instanceof RowTemplate) {
                if(this.rowTemplate != "") {
                    console.error("Only one row-template required");
                }
                this.rowTemplate = this.children[i].innerHTML.replace("`", "\\`");
            }
        }
    }

    private fetch() {
        if(!this.fetching && this.fetchData) {
            this.fetching = true;

            this.fetchData(this.pageNumber, this.pageSize).then(items => {
                for(let i = 0; i < items.length; i++) {
                    this.items.push(items[i]);
                }
                this.pageNumber++;
                this.fetching = false;

                if(items.length > 0) {
                    let div: HTMLDivElement = this.renderRoot.querySelector("div") as HTMLDivElement;
                    if(div.scrollHeight <= div.clientHeight) {
                        this.fetch();
                    }
                }
            });
        }
    }

    public onScroll(e: Event): void {
        let div: HTMLDivElement = e.composedPath()[0] as HTMLDivElement;
        if (div.scrollHeight - div.clientHeight - div.scrollTop < this.scrollOffset) {
            this.fetch();
        }
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if(_changedProperties.has("fetchData")) {
            this.items = [];
            this.pageNumber = 0;
            this.fetch();
        }
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

    private interpolate(template: string, item: any) {
        const names = Object.keys(item);
        const vals = Object.values(item);
        return new Function(...names, `return \`${template}\`;`)(...vals);
    }

    private renderRow(item: any, index: number): TemplateResult {
        /*let wawa = {item: item};
        const stringArray = [this.interpolate(this.rowTemplate, wawa)] as any;
        stringArray.raw = [this.interpolate(this.rowTemplate, wawa)];
        return html(stringArray as TemplateStringsArray);*/

        if(index >= this.rows.length) {
            this.rows.push(eval('html`' + this.rowTemplate + '`'));
        }
        return this.rows[index];
    }

    public renderHeader(): TemplateResult {
        const template = this.interpolate(this.headerTemplate, {});
        const stringArray = [template] as any;
        stringArray.raw = [template];
        return html(stringArray as TemplateStringsArray);
    }
 
    public render(): TemplateResult {
        return html`${this.renderStyles()}<div @scroll=${this.onScroll}>
            <table>
                ${this.renderHeader()}
                ${this.items.map((elt, i) => html`${this.renderRow(elt, i)}`)}
            </table>
            ${this.fetching ? html`<span style='position:absolute;top:0px;background-color:pink;'>fetching...</span>` : html``}
        </div>`;
    }
}

@customElement("wawa-row")
export class WawaRow extends LitElement {

    @property({type: Object})
    public yoyo: any;

    public render(): TemplateResult {
        return html`<h4>${this.yoyo.name}</h4>`;
    }
}