import { WawaItem } from "./wawa-item";
import { TemplateResult, html } from "lit-html";

export class WawaRow {
    private _item!: WawaItem;
    private _rowTemplate: string;
    private _template!: TemplateResult;
    public modifiedCallback?: () => void;

    public constructor(rowTemplate: string, item: WawaItem, modifiedCallback: () => void) {
        this._rowTemplate = rowTemplate;
        this.item = item;
        this.modifiedCallback = modifiedCallback;
    }

    public get item(): WawaItem {
        return this._item;
    }

    public set item(val: WawaItem) {
        if(this._item) {
            this._item.modifiedCallback = undefined;
        }
        this._item = val;
        if(this._item) {
            this._updateTemplate();
            this._item.modifiedCallback = () => {
                this._updateTemplate();
                if(this.modifiedCallback) {
                    this.modifiedCallback();
                }
            };
        }
    }

    public get template(): TemplateResult {
        if(!this._template) {
            this._updateTemplate();
        }

        return this._template;
    }

    private _updateTemplate(): void {
        this._template = Function('html', 'item', 'index', '"use strict";return (' + 'html`' + this._rowTemplate + '`' + ')')(html, this._item.item, this._item.index);
    }
}