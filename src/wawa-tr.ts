import { html, render, TemplateResult } from "lit-html";
import { WawaItem } from "./wawa-item";

export class WawaTr extends HTMLTableRowElement {

    private _item: WawaItem;
    private _template: (name) => TemplateResult;

    get item(): WawaItem {
        return this._item;
    }

    set item(val: WawaItem) {
        this._item = val;
        this._item.modifiedCallback = () => {
            render(Function('html', 'item', 'index', 'table', 'wawaitem', '"use strict";return (' + 'html`' + this._item.innerRowTemplate + '`' + ')')(html, this._item.item, this._item.index, 'wawa', this._item), this);
        }
        if(this._item.modified) { // i don't think this condition is necessary
            this._item.modified = false;
            this._item.modifiedCallback();
        }
    }

    constructor() {
        super();
        
        this._template = (name) => html`<p>sup ${name}</p>`;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        console.log("attribute changed");
    }
}

window.customElements.define("wawa-tr", WawaTr, { extends: "tr" });