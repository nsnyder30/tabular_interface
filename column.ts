import { IColumn } from './types';
import { IFilter } from './types';

export class Column implements IColumn {
    readonly field: string;
    header: string;
    readonly dataType: string;
    readonly sortable: boolean;
    readonly editable: boolean;
    readonly filterable: boolean;
    displayOrder: number = 0;
    sortOrder: number = 0;
    fParams: IFilter;
    reverseSort: boolean;
    visible: boolean;

    constructor(field: string, header?: string, dataType?: string, sortable?: boolean, filterable?: boolean, editable?: boolean, reverseSort?: boolean, visible?: boolean) {
        this.field = field;
        this.header = header || field;
        this.dataType = dataType || 'string';
        this.sortable = sortable || true;
        this.filterable = filterable || true;
        this.editable = editable || false;
        this.reverseSort = reverseSort || null;
        this.visible = visible || true;
        this.fParams = { nulls: true, nonNulls: true, nMax: null, nMin: null, rEx: null, bool: null };
        console.log({ fParams: this.fParams });
    }

    public cSort = (a: any, b: any, ai?: number, bi?: number) => {
        // Used orderBy method from AngularJS module by default
        if (!this.sortable) return 0;
        let result = 0;
        let type1 = typeof a;
        let type2 = typeof b;
        ai = ai || 1;
        bi = bi || 2;

        if (type1 === type2) {
            let v1 = a;
            let v2 = b;

            if (type1 === 'string') {
                v1 = v1.toLowerCase();
                v2 = v2.toLowerCase();
            } else if (type1 === 'object') {
                v1 = v1 || ai;
                v2 = v2 || bi;
            }

            if (v1 !== v2) {
                result = v1 < v2 ? -1 : 1;
            }
        } else {
            result = (type1 === 'undefined') ? 1 :
                (type2 === 'undefined') ? -1 :
                    (a === null) ? 1 :
                        (b === null) ? -1 :
                            (type1 < type2) ? -1 : 1;
        }
        return result;
    };
    
    public cFilter = (v: any) => {
        const nullPass = (v == null && this.fParams.nulls);
        const nonNullPass = (v != null && this.fParams.nonNulls);

        if (this.dataType == 'number') {
            return (this.fParams.nMin == null || v >= this.fParams.nMin) && (this.fParams.nMax == null || v <= this.fParams.nMax);
        } else if (this.dataType == 'string') {
            if (this.fParams.rEx != null) {
                const rx = new RegExp(this.fParams.rEx);
                return nonNullPass && rx.test(v);
            }
        } else if (this.dataType == 'boolean') {
            return nullPass || nonNullPass && (this.fParams.bool == null || v == this.fParams.bool);
        }
        return nullPass || nonNullPass;
    };

    public cFormat = (v: any) => {
        if (v != null && this.dataType == 'number') {
            const scale = Math.pow(10, 0);
            let val: string = (Math.round(Number(v))).toFixed(0).toLocaleString();
            let val_split = val.toString().split('.');
            val = val_split[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (typeof val_split[1] !== 'undefined') { val = val + '.' + val_split[1]; }
            return val;
        } else {
            return v == null ? "" : typeof v == "object" ? JSON.stringify(v) : v.toString();
        }
    };
}