import { WawaTable } from "./wawa-table";
import { TemplateResult, html } from "lit-html";

export class WawaItem {
    public item: any;
    public index: number;
    public id: number;
    public table: WawaTable;
    private _template!: TemplateResult;

    public templateUpdatedCallback: () => void;

    private static _uniqueIdCount: number = 0;

    public constructor(item: any, table: WawaTable) {
        this.item = item;
        this.index = table.items.length;
        this.table = table;
        this.id = WawaItem._uniqueIdCount;
        WawaItem._uniqueIdCount++;
    }

    public get template(): TemplateResult {
        if(!this._template) {
            this.updateTemplate();
        }

        return this._template;
    }

    public updateTemplate(): void {
        if(this.table.rowTemplate) {
            this._template = Function('html', 'item', 'index', 'table', 'wawaitem', '"use strict";return (' + 'html`' + this.table.rowTemplate + '`' + ')')(html, this.item, this.index, this.table, this);
        } else if(this.table.renderRowCallback) {
            this._template = this.table.renderRowCallback(this.item, this.index, this.table, this);
        }
        if(this.templateUpdatedCallback) {
            this.templateUpdatedCallback();
        }
    }
}