import { WawaTable } from "./wawa-table";
import { TemplateResult, html } from "lit-html";

export class WawaItem {
    public item: any;
    public index: number;
    public table: WawaTable;
    private _template!: TemplateResult;

    public constructor(item: any, table: WawaTable) {
        this.item = item;
        this.index = table.items.length;
        this.table = table;
    }

    public get template(): TemplateResult {
        if(!this._template) {
            this.updateTemplate();
        }

        return this._template;
    }

    public updateTemplate(): void {
        this._template = Function('html', 'item', 'index', 'table', 'wawaitem', '"use strict";return (' + 'html`' + this.table.rowTemplate + '`' + ')')(html, this.item, this.index, this.table, this);
    }
}