
import { LitElement, customElement, TemplateResult, html, property } from "lit-element";
import { RowTemplate } from "./row-template";
import { HeaderTemplate } from "./header-template";

@customElement("wawa-grid")
export class WawaGrid extends LitElement {

    private static fetchOffset: number = 50;

    @property({type: Array})
    private items: any[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

    @property({type: Boolean})
    private fetching: boolean = false;

    private rowTemplate: string = "";
    private headerTemplate: string = "";

    public constructor() {
        super();
        for(let i = 0; i < this.children.length; i++) {
            if(this.children[i] instanceof HeaderTemplate) {
                if(this.headerTemplate != "") {
                    console.error("Only one header-template required");
                }
                this.headerTemplate = this.children[i].innerHTML.replace("`", "\\`");
            } else if(this.children[i] instanceof RowTemplate) {
                if(this.headerTemplate != "") {
                    console.error("Only one row-template required");
                }
                this.rowTemplate = this.children[i].innerHTML.replace("`", "\\`");
            }
        }
    }

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
                height: 100%;
                overflow-y: auto;
            }
        </style>
        `;
    }

    private interpolate(template: string, item: any) {
        const names = Object.keys(item);
        const vals = Object.values(item);
        return new Function(...names, `return \`${template}\`;`)(...vals);
    }

    private renderThing(tot: number): TemplateResult {
        let wawa = {item: { name: "crap123123123", total: tot }};
        const stringArray = [this.interpolate(this.rowTemplate, wawa)] as any;
        stringArray.raw = [this.interpolate(this.rowTemplate, wawa)];
        return html(stringArray as TemplateStringsArray);
    }

    public renderHeader(): TemplateResult {
        const template = this.interpolate(this.headerTemplate, {});
        const stringArray = [template] as any;
        stringArray.raw = [template];
        return html(stringArray as TemplateStringsArray);
    }
 
    public render(): TemplateResult {
        console.log(this.items.length);
        return html`${this.renderStyles()}<div @scroll=${this.onScroll}>
            <table>
                ${this.renderHeader()}
                ${this.items.map(i => html`<tr style='height:50px;'><td>${this.renderThing(i)}</td></tr>`)}
            </table>
            ${this.fetching ? html`<span style='position:absolute;top:0px;background-color:pink;'>fetching...</span>` : html``}
        </div>`;
    }
}