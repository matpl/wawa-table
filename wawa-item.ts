export class WawaItem {

    public modifiedCallback?: () => void;
    private _monitor: boolean = false;
    private _item!: any;
    public index: number;

    public constructor(item: any, index: number, monitor: boolean) {
        this._monitor = monitor;
        this.item = item;
        this.index = index;
    }

    public get item(): any {
        return this._item;
    }

    public set item(val: any) {
        this._item = val;
        var wawaItem = this;
        if(this._monitor) {
            this._item.updatewawa = false;
            for(let property in this._item) {
                if(property !== "updatewawa") {
                    let orig = this._item[property];
                    Object.defineProperty(this._item, property, {
                        get: function() {
                            return this[property + "wawa"];
                        },
                        set: function(val) {
                            this[property + "wawa"] = val;
                            if(this.updatewawa && wawaItem.modifiedCallback) {
                                wawaItem.modifiedCallback();
                            }
                        }
                    });
                    this._item[property] = orig;
                }
            }
            this._item.updatewawa = true;
        }
    }
}