import { html, render, TemplateResult } from "lit-html";

export class WawaTr extends HTMLTableRowElement {

    private _item;
    private _template: (name) => TemplateResult;

    get item() {
        return this._item;
    }

    set item(val) {
        this._item = val;
        this._item.modifiedCallback = () => {
            console.log('BRO WAWA');
            var name = Math.random() + " wawa";
            render(this._template(name), this);
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