var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WawaGrid_1;
import { LitElement, customElement, html, property } from "lit-element";
let WawaGrid = WawaGrid_1 = class WawaGrid extends LitElement {
    constructor() {
        super(...arguments);
        this.items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        this.fetching = false;
    }
    onScroll(e) {
        let div = e.composedPath()[0];
        if (!this.fetching && div.scrollHeight - div.clientHeight - div.scrollTop < WawaGrid_1.fetchOffset) {
            this.fetching = true;
            // simulate lengthy fetch
            let p = new Promise((resolve, reject) => {
                setTimeout(() => {
                    for (let i = 0; i < 20; i++) {
                        this.items.push(i);
                    }
                    resolve();
                }, 300);
            });
            p.then(() => {
                this.fetching = false;
            });
        }
    }
    renderStyles() {
        return html `
        <style>
            div {
                height: 600px;
                overflow-y: auto;
                background-color: green;
            }
        </style>
        `;
    }
    render() {
        console.log(this.items.length);
        return html `${this.renderStyles()}<div @scroll=${this.onScroll}>

            <table>
                ${this.items.map(i => html `<tr style='height:50px;'><td>${i}</td></tr>`)}
            </table>
            ${this.fetching ? html `<span style='position:absolute;top:0px;background-color:pink;'>fetching...</span>` : html ``}
        </div>`;
    }
};
WawaGrid.fetchOffset = 50;
__decorate([
    property({ type: Array })
], WawaGrid.prototype, "items", void 0);
__decorate([
    property({ type: Boolean })
], WawaGrid.prototype, "fetching", void 0);
WawaGrid = WawaGrid_1 = __decorate([
    customElement("wawa-grid")
], WawaGrid);
export { WawaGrid };
