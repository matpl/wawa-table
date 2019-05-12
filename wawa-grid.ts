
import { LitElement, customElement, TemplateResult, html, property, PropertyValues } from "lit-element";
import {repeat} from 'lit-html/directives/repeat';
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
import { LoadingTemplate } from "./loading-template";

@customElement("wawa-grid")
export class WawaGrid extends LitElement {

    @property({type: Array})
    public items: any[] = [];

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

    private rowTemplate: string = "";
    private headerTemplate?: Element[];
    private loadingTemplate?: Element[];

    private rows: [TemplateResult, boolean][] = []; 

    public constructor() {
        super();
        for(let i = 0; i < this.children.length; i++) {
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
            this.loadingData!.fetching = true;

            this.fetchData(this.pageNumber, this.pageSize).then(items => {
                var grid = this;
                for(let i = 0; i < items.length; i++) {

                    let pos = this.items.length;
                    if(this.monitor) {
                        let item = items[i];
                        item.updatewawa = false;
                        for(let property in item) {
                            if(property !== "updatewawa") {
                                let orig = item[property];
                                console.log('define ' + property);
                                Object.defineProperty(item, property, {
                                    get: function() {
                                        return this[property + "wawa"];
                                    },
                                    set: function(val) {
                                        this[property + "wawa"] = val;

                                        if(this.updatewawa) {
                                            console.log('UPDATE YO');
                                            if(grid.rows.length > pos) {
                                                grid.rows[pos][1] = true;
                                                grid.requestUpdate();
                                            }
                                        }
                                    }
                                });
                                item[property] = orig;
                            }
                        }
                        item.updatewawa = true;
                    }

                    this.items.push(items[i]);
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

    public onScroll(e: Event): void {
        let div: HTMLDivElement = e.composedPath()[0] as HTMLDivElement;
        if (div.scrollHeight - div.clientHeight - div.scrollTop < this.scrollOffset) {
            this.fetch();
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties);

        this.loadingData = this.renderRoot.querySelector("loading-data") as LoadingData;
    }

    protected update(_changedProperties: PropertyValues) {
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

    private renderRow(item: any, index: number): TemplateResult {
        if(index >= this.rows.length) {
            this.rows.push([Function('html', 'item', 'index', '"use strict";return (' + 'html`' + this.rowTemplate + '`' + ')')(html, item, index), false]);
        } else if(this.rows[index][1]) {
            // re-render
            this.rows[index] = [Function('html', 'item', 'index', '"use strict";return (' + 'html`' + this.rowTemplate + '`' + ')')(html, item, index), false];
        }
        return this.rows[index][0];
    }
 
    public render(): TemplateResult {
        console.log('RENDER ' + this.monitor);
        return html`${this.renderStyles()}<div style="width:100%;" @scroll=${this.onScroll}>
            <table part="table" style="border-collapse: collapse;width:100%;">
                <thead part="head">
                    ${this.headerTemplate}
                </thead>
                <tbody part="body">
                    ${repeat(this.items, (i, index) => index, (i, index) => html`${this.renderRow(i, index)}`)}
                </tbody>
            </table>
            <loading-data .loadingTemplate=${this.loadingTemplate}></loading-data>
        </div>`;
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