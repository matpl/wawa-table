import { html } from "lit-element";

export class WawaHeaderTr extends HTMLTableRowElement {

    private headerBeingResized;
    private columns = [];
    private min = 150;

    constructor() {
        super();

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    connectedCallback() {
        let headers = this.querySelectorAll("th");
        this.columns = [];
        let styles = document.createElement("style");
        styles.innerHTML = `
            .resize-handle {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                background: black;
                opacity: 0;
                width: 6px;
                cursor: col-resize;
            }

            .resize-handle:hover,
            .header--being-resized .resize-handle {
                opacity: 0.5;
            }

            th {
                position:relative;
                padding: 0px;
            }

            tr:hover .resize-handle {
            opacity: 0.3;
            }
        `;
        this.prepend(styles);
        
        /*headers.forEach((h, i) => {
            this.columns.push(h);
            if(i !== headers.length - 1 && h.getAttribute("resizable") != null) {
                console.log(i);
                h.innerHTML += html`
                    <span class="resize-handle">
                    </span>
                `.getHTML();

                h.querySelector('.resize-handle').addEventListener('mousedown', this.initResize.bind(this));
            }
        });*/

        let resizeHandlesThs = [];
        headers.forEach((h, i) => {
            this.columns.push(h);
            if(h.getAttribute("resizable") != null) {
                if(i !== 0 && !resizeHandlesThs.includes(i - 1)) {
                    resizeHandlesThs.push(i - 1);
                }
                if(i !== headers.length - 1  && !resizeHandlesThs.includes(i)) {
                    resizeHandlesThs.push(i);
                }
            }
        });
        resizeHandlesThs.forEach((i) => {
            console.log(i);
            headers[i].innerHTML += html`
                    <span class="resize-handle">
                    </span>
                `.getHTML();

            headers[i].querySelector('.resize-handle').addEventListener('mousedown', this.initResize.bind(this));
        });
    }

    private initResize({ target }) {
        console.log('initResize');

        this.headerBeingResized = target.parentNode;
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        this.headerBeingResized.classList.add('header--being-resized');
    }

    private onMouseMove(e) {
        e.preventDefault();
        requestAnimationFrame(() => {
            console.log('onMouseMove');

            // Calculate the desired width
            var horizontalScrollOffset = document.documentElement.scrollLeft;

            // first NOT resizable OR THAT HIS OFFSETWIDTH IS NOT THIS.MIN (treat min size headers the same way as unresizable headers? no not the same, as you can't ever grow an unresizable, but you can grow a min width one)

            // Update the column object with the new size value
            const selectedColumnIndex = this.columns.findIndex((header) => header === this.headerBeingResized);
            let columnIndex = -1;
            for(let i = selectedColumnIndex; i >= 0; i--) {
                if(this.columns[i].getAttribute("resizable") !== null) {
                    columnIndex = i;
                    break;
                }
            }

            let width;
            if(selectedColumnIndex == columnIndex && selectedColumnIndex !== -1) {
                width = horizontalScrollOffset + e.clientX - this.columns[columnIndex].offsetLeft;
            } else if(columnIndex !== -1) {
                let totalClientX = e.clientX;
                for(let i = columnIndex + 1; i <= selectedColumnIndex; i++) {
                    totalClientX -= this.columns[i].offsetWidth;
                }
                width = horizontalScrollOffset + totalClientX - this.columns[columnIndex].offsetLeft;
            }

            // for all column headers, set the width to its offsetWidth (in case the table size was changed)
            let offsets = this.columns.map(c => c.offsetWidth);
            this.columns.forEach((c, i) => {
                c.style.width = offsets[i] + 'px';
            });

            let nextResizableColumnIndex = this.columns.findIndex((header, i) => header.getAttribute("resizable") !== null && i > selectedColumnIndex); // only works for resize right
            if(columnIndex !== -1 && nextResizableColumnIndex !== -1) {
                let totalTwoResizedColumns = this.columns[columnIndex].offsetWidth + this.columns[nextResizableColumnIndex].offsetWidth;

                let newSize = Math.min(Math.max(this.min, width), totalTwoResizedColumns - this.min);

                this.columns[columnIndex].style.width = newSize + 'px';
                this.columns[nextResizableColumnIndex].style.width = (totalTwoResizedColumns - newSize) + 'px';
            }
        });
    }

    private onMouseUp() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.headerBeingResized.classList.remove('header--being-resized');
        this.headerBeingResized = null;
    }
}

window.customElements.define("wawa-header-tr", WawaHeaderTr, { extends: "tr" });