
import { LitElement, customElement, TemplateResult, html, property, PropertyValues } from "lit-element";
import {repeat} from 'lit-html/directives/repeat';
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
import { LoadingTemplate } from "./loading-template";

@customElement("wawa-grid")
export class WawaGrid extends LitElement {

    @property({type: Array})
    private items: any[] = [];

    @property({type: Number})
    private scrollOffset: number = 50;
    @property({type: Number})
    private pageSize: number = 20;

    private pageNumber: number = 0;

    private fetching: boolean = false;
    private loadingData?: LoadingData;

    @property()
    private fetchData?: (pageNumber: number, pageSize: number) => Promise<any[]> = undefined;

    private rowTemplate: string = "";
    private headerTemplate?: DocumentFragment;
    private loadingTemplate?: DocumentFragment;

    private rows: TemplateResult[] = []; 

    public constructor() {
        super();
        for(let i = 0; i < this.children.length; i++) {
            if(this.children[i] instanceof HeaderTemplate) {
                if(this.headerTemplate) {
                    console.error("Only one header-template required");
                }
                this.headerTemplate = document.importNode((this.children[i] as HeaderTemplate).content, true);
            } else if(this.children[i] instanceof LoadingTemplate) {
                if(this.loadingTemplate) {
                    console.error("Only one loading-template required");
                }
                this.loadingTemplate = document.importNode((this.children[i] as LoadingTemplate).content, true);
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
                for(let i = 0; i < items.length; i++) {
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

    private renderRow(item: any, index: number): TemplateResult {
        if(index >= this.rows.length) {
            this.rows.push(Function('html', 'item', 'index', '"use strict";return (' + 'html`' + this.rowTemplate + '`' + ')')(html, item, index));
        }
        return this.rows[index];
    }
 
    public render(): TemplateResult {
        return html`${this.renderStyles()}<div style="width:100%;" @scroll=${this.onScroll}>
            <table style="border-collapse: collapse;width:100%;">
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
    private loadingTemplate?: DocumentFragment;

    public render(): TemplateResult {
        if(this.fetching) {
            if(this.loadingTemplate) {
                return html`${this.loadingTemplate}`;
            } else {
                return html`<div style='position:relative;bottom: 0px;width:100%;text-align:center;font-style:italic;color:#757575;'>Loading...</div>`;
            }
        }
        return html``;
    }
}