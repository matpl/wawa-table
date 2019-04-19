var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, customElement, html, property } from "lit-element";
import { repeat } from 'lit-html/directives/repeat';
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
import { LoadingTemplate } from "./loading-template";
let WawaGrid = class WawaGrid extends LitElement {
    constructor() {
        super();
        this.items = [];
        this.scrollOffset = 50;
        this.pageSize = 20;
        this.pageNumber = 0;
        this.fetching = false;
        this.fetchData = undefined;
        this.rowTemplate = "";
        this.rows = [];
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof HeaderTemplate) {
                if (this.headerTemplate) {
                    console.error("Only one header-template required");
                }
                this.headerTemplate = document.importNode(this.children[i].content, true);
            }
            else if (this.children[i] instanceof LoadingTemplate) {
                if (this.loadingTemplate) {
                    console.error("Only one loading-template required");
                }
                this.loadingTemplate = document.importNode(this.children[i].content, true);
            }
            else if (this.children[i] instanceof RowTemplate) {
                if (this.rowTemplate != "") {
                    console.error("Only one row-template required");
                }
                this.rowTemplate = this.children[i].innerHTML.replace("`", "\\`");
            }
        }
    }
    fetch() {
        if (!this.fetching && this.fetchData) {
            this.fetching = true;
            this.loadingData.fetching = true;
            this.fetchData(this.pageNumber, this.pageSize).then(items => {
                for (let i = 0; i < items.length; i++) {
                    this.items.push(items[i]);
                }
                this.pageNumber++;
                this.fetching = false;
                this.loadingData.fetching = false;
                this.requestUpdate();
                if (items.length > 0) {
                    let div = this.renderRoot.querySelector("div");
                    if (div.scrollHeight <= div.clientHeight) {
                        this.fetch();
                    }
                }
            });
        }
    }
    onScroll(e) {
        let div = e.composedPath()[0];
        if (div.scrollHeight - div.clientHeight - div.scrollTop < this.scrollOffset) {
            this.fetch();
        }
    }
    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this.loadingData = this.renderRoot.querySelector("loading-data");
    }
    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has("fetchData")) {
            this.items = [];
            this.pageNumber = 0;
            this.fetch();
        }
    }
    renderStyles() {
        return html `
        <style>
            div {
                height: 100%;
                overflow-y: auto;
            }
        </style>
        `;
    }
    renderRow(item, index) {
        if (index >= this.rows.length) {
            this.rows.push(Function('html', 'item', 'index', '"use strict";return (' + 'html`' + this.rowTemplate + '`' + ')')(html, item, index));
        }
        return this.rows[index];
    }
    render() {
        return html `${this.renderStyles()}<div style="width:100%;" @scroll=${this.onScroll}>
            <table style="border-collapse: collapse;width:100%;">
                <thead part="head">
                    ${this.headerTemplate}
                </thead>
                <tbody part="body">
                    ${repeat(this.items, (i, index) => index, (i, index) => html `${this.renderRow(i, index)}`)}
                </tbody>
            </table>
            <loading-data .loadingTemplate=${this.loadingTemplate}></loading-data>
        </div>`;
    }
};
__decorate([
    property({ type: Array })
], WawaGrid.prototype, "items", void 0);
__decorate([
    property({ type: Number })
], WawaGrid.prototype, "scrollOffset", void 0);
__decorate([
    property({ type: Number })
], WawaGrid.prototype, "pageSize", void 0);
__decorate([
    property()
], WawaGrid.prototype, "fetchData", void 0);
WawaGrid = __decorate([
    customElement("wawa-grid")
], WawaGrid);
export { WawaGrid };
let LoadingData = class LoadingData extends LitElement {
    constructor() {
        super(...arguments);
        this.fetching = false;
    }
    render() {
        if (this.fetching) {
            if (this.loadingTemplate) {
                return html `${this.loadingTemplate}`;
            }
            else {
                return html `<div style='position:relative;bottom: 0px;width:100%;text-align:center;font-style:italic;color:#757575;'>Loading...</div>`;
            }
        }
        return html ``;
    }
};
__decorate([
    property({ type: Boolean })
], LoadingData.prototype, "fetching", void 0);
__decorate([
    property()
], LoadingData.prototype, "loadingTemplate", void 0);
LoadingData = __decorate([
    customElement("loading-data")
], LoadingData);
export { LoadingData };
