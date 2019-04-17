
import { LitElement, customElement, TemplateResult, html, property } from "lit-element";

@customElement("wawa-grid")
export class WawaGrid extends LitElement {

    private static fetchOffset: number = 50;

    @property({type: Array})
    private items: any[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

    @property({type: Boolean})
    private fetching: boolean = false;

    public onScroll(e: Event): void {
        let div: HTMLDivElement = e.composedPath()[0] as HTMLDivElement;
        if (!this.fetching && div.scrollHeight - div.clientHeight - div.scrollTop < WawaGrid.fetchOffset) {
            this.fetching = true;

            // simulate lengthy fetch
            let p = new Promise((resolve, reject) => {
                setTimeout(() => {
                    for(let i = 0; i < 20; i++) {
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

    private renderStyles(): TemplateResult {
        return html`
        <style>
            div {
                height: 600px;
                overflow-y: auto;
                background-color: green;
            }
        </style>
        `;
    }

    public render(): TemplateResult {
        console.log(this.items.length);
        return html`${this.renderStyles()}<div @scroll=${this.onScroll}>

            <table>
                ${this.items.map(i => html`<tr style='height:50px;'><td>${i}</td></tr>`)}
            </table>
            ${this.fetching ? html`<span style='position:absolute;top:0px;background-color:pink;'>fetching...</span>` : html``}
        </div>`;
    }
}