import { html, render, TemplateResult } from "lit-html";
import { WawaItem } from "./wawa-item";

export class WawaTr extends HTMLTableRowElement {

    private _item: WawaItem;

    public get item(): WawaItem {
        return this._item;
    }

    public set item(val: WawaItem) {
        this._item = val;
        var wawaTr = this;
        if(val.table.monitor) {
            this._item.item.updatewawa = false;
            for(let property in this._item.item) {
                if(property !== "updatewawa" && !property.endsWith("wawa")) {
                    let orig = this._item.item[property];
                    Object.defineProperty(this._item.item, property, {
                        get: function() {
                            return this[property + "wawa"];
                        },
                        set: function(val) {
                            this[property + "wawa"] = val;
                            if(this.updatewawa) {
                                wawaTr.item.updateTemplate();
                                render(Function('html', 'item', 'index', 'table', 'wawaitem', '"use strict";return (' + 'html`' + wawaTr.item.table.innerRowTemplate + '`' + ')')(html, wawaTr.item.item, wawaTr.item.index, wawaTr.item.table, wawaTr.item), wawaTr);
                            }
                        }
                    });
                    this._item.item[property] = orig;
                }
            }
            this._item.item.updatewawa = true;
        }
    }
}

window.customElements.define("wawa-tr", WawaTr, { extends: "tr" });