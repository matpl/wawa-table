import { html, render, TemplateResult } from "lit-html";
import { WawaItem } from "./wawa-item";
import { WawaTable } from "./wawa-table";

export class WawaTr extends HTMLTableRowElement {

    public renderInnerRowCallback: (item: any, index: number, table: WawaTable, wawaitem: WawaItem) => TemplateResult;

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
                            }
                        }
                    });
                    this._item.item[property] = orig;
                }
            }
            this._item.item.updatewawa = true;
        }
    }

    connectedCallback() {
        this._item.templateUpdatedCallback = this.render.bind(this);
        if(!this.item.table.innerRowTemplate && this.renderInnerRowCallback) {
            this.render();
        }
    }

    disconnectedCallback() {
        this._item.templateUpdatedCallback = undefined;
    }

    private render(): void {
        if(this.item.table.innerRowTemplate) {
            render(Function('html', 'item', 'index', 'table', 'wawaitem', '"use strict";return (' + 'html`' + this.item.table.innerRowTemplate + '`' + ')')(html, this.item.item, this.item.index, this.item.table, this.item), this);
        } else if(this.renderInnerRowCallback) {
            render(this.renderInnerRowCallback(this.item.item, this.item.index, this.item.table, this.item), this);
        }
    }
}

window.customElements.define("wawa-tr", WawaTr, { extends: "tr" });