var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, customElement, html, property } from "lit-element";
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";
let WawaGrid = class WawaGrid extends LitElement {
    constructor() {
        super();
        this.items = [];
        this.fetching = false;
        this.scrollOffset = 50;
        this.pageSize = 3;
        this.pageNumber = 0;
        this.fetchData = undefined;
        this.rowTemplate = "";
        this.headerTemplate = "";
        this.rows = [];
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof HeaderTemplate) {
                if (this.headerTemplate != "") {
                    console.error("Only one header-template required");
                }
                this.headerTemplate = this.children[i].innerHTML.replace("`", "\\`");
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
            this.fetchData(this.pageNumber, this.pageSize).then(items => {
                for (let i = 0; i < items.length; i++) {
                    this.items.push(items[i]);
                }
                this.pageNumber++;
                this.fetching = false;
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
    interpolate(template, item) {
        const names = Object.keys(item);
        const vals = Object.values(item);
        return new Function(...names, `return \`${template}\`;`)(...vals);
    }
    renderRow(item, index) {
        /*let wawa = {item: item};
        const stringArray = [this.interpolate(this.rowTemplate, wawa)] as any;
        stringArray.raw = [this.interpolate(this.rowTemplate, wawa)];
        return html(stringArray as TemplateStringsArray);*/
        if (index >= this.rows.length) {
            this.rows.push(eval('html`' + this.rowTemplate + '`'));
        }
        return this.rows[index];
    }
    renderHeader() {
        const template = this.interpolate(this.headerTemplate, {});
        const stringArray = [template];
        stringArray.raw = [template];
        return html(stringArray);
    }
    render() {
        return html `${this.renderStyles()}<div @scroll=${this.onScroll}>
            <table>
                ${this.renderHeader()}
                ${this.items.map((elt, i) => html `${this.renderRow(elt, i)}`)}
            </table>
            ${this.fetching ? html `<span style='position:absolute;top:0px;background-color:pink;'>fetching...</span>` : html ``}
        </div>`;
    }
};
__decorate([
    property({ type: Array })
], WawaGrid.prototype, "items", void 0);
__decorate([
    property({ type: Boolean })
], WawaGrid.prototype, "fetching", void 0);
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
let WawaRow = class WawaRow extends LitElement {
    render() {
        return html `<h4>${this.yoyo.name}</h4>`;
    }
};
__decorate([
    property({ type: Object })
], WawaRow.prototype, "yoyo", void 0);
WawaRow = __decorate([
    customElement("wawa-row")
], WawaRow);
export { WawaRow };
