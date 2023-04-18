import { IRecord, IColumn, IRecordEditor } from "./types";

export class Tabular {
    protected allowInsert: boolean = false;
    protected allowUpdate: boolean = false;
    protected allowDelete: boolean = false;
    protected filterable: boolean = false;
    protected sortable: boolean = false;
    protected paginate: boolean = false;
    protected columns: IColumn[];
    protected records: IRecord[];
    protected editor: IRecordEditor;

    // Figure out how to allow passing keyword arguments to constructor and so select arguments can be left unspecified
    // Apparently this can be done by specifying an interface for the constructor, similar to IFilter
    constructor(records?: IRecord[], columns?: IColumn[], editor?: IRecordEditor, allowInsert?: boolean, allowUpdate?: boolean, allowDelete?: boolean, filterable?: boolean, paginate?: boolean, sortable?: boolean) {
        console.log(arguments);
        this.allowInsert = allowInsert ? allowInsert : false;
        this.allowUpdate = allowUpdate ? allowUpdate : false;
        this.allowDelete = allowDelete ? allowDelete : false;
        this.filterable = filterable ? filterable : true;
        this.paginate = paginate ? paginate : false;
        this.sortable = sortable ? sortable : true;
        if (records != null) { this.importRecs(records); }
        if (columns != null) { this.loadCols(columns); }
        if (editor != null) { this.editor = editor; }
    }

    public importRecs = (records: any, inpFormat?: string) => {
        if (inpFormat == 'json' && typeof records == 'string') {
            records = JSON.parse(records);
        }

        try {
            console.log(this);
            this.records = [...records].map((r) => ({ fields: r, visible: true, canUpdate: this.allowUpdate, canDelete: this.allowDelete }));
        } catch (e) {
            if (typeof e == 'string') {
                console.error(e);
            } else if (e instanceof Error) {
                console.error(e.message);
            } else {
                console.error(e);
            }
        }
    }

    public exportRecs = (outFormat?: string) => {
        let output = [...this.records].map(function (r) { return r.fields; });
        if (outFormat == 'json') {
            return JSON.stringify(output);
        } else {
            return output;
        }
    }

    public sortRecs = (col: number, reverse?: boolean) => {
        if (this.sortable) {
            let i: any;
            let sortCols = this.columns.filter(function (c) { return c.sortable; });
            if (sortCols.length > 0) {
                for (i in sortCols) {
                    const c = sortCols[i];
                    c.sortOrder = c.displayOrder == col ? 0 : c.sortOrder + 1;
                    c.reverseSort = c.displayOrder != col ? c.reverseSort : reverse == null ? !c.reverseSort && c.reverseSort != null : reverse;
                }

                sortCols = [...sortCols].filter((c)  => !isNaN(c.sortOrder)).sort((a, b) =>  a.sortOrder <= b.sortOrder ? -1 : 1 );
                this.records.sort(function (a, b) {
                    let r1 = a.fields;
                    let r2 = b.fields;
                    for (i in sortCols) {
                        const sc = sortCols[i];
                        const f: string = sc.field;
                        const sortFn = sc.cSort;
                        const direction: number = sc.reverseSort ? -1 : 1;
                        if (sc.sortable) {
                            let result = 0;
                            if (r1[f] && r2[f]) {
                                result = direction * sortFn(r1[f], r2[f]);
                            } else if (r1[f] || r2[f]) {
                                result = direction * (r1[f] ? -1 : r2[f] ? 1 : 0);
                            }
                            if (result != 0) { return result; }
                        }
                    }
                    return 0;
                });
            }
        }
    }

    public filterRecs= (columns?: IColumn[]) => {
        if (this.filterable) {
            let i: any;
            let k: any;
            let filterCols = columns !== undefined ? columns.map(function (c) { return c }) : this.columns.filter(function (c) { return c.filterable; });
            for (i in this.records) {
                let rec = this.records[i].fields;
                let visible = true;
                for (k in filterCols) {
                    let c = filterCols[k];
                    let filterFn = c.cFilter;
                    visible = visible && filterFn(rec[c.field]);
                }
                this.records[i].visible = visible;
            }
        }
    }

    public loadCols = (columns?: IColumn[]) => {
        if (columns !== undefined) {
            this.columns = columns;
            this.columns.sort(function (a, b) {
                if (a.displayOrder && b.displayOrder) {
                    return a.displayOrder <= b.displayOrder ? -1 : 1;
                } else {
                    return a.displayOrder ? -1 : b.displayOrder ? 1 : 0;
                }
            })

            let i: any;
            let k: any;
            let d: number = 0;
            for (i in this.columns) {
                const c = this.columns[i];
                if (c.displayOrder) {
                    d = c.displayOrder + 1;
                } else {
                    c.displayOrder = d;
                    d += 1;
                }

                if (c.dataType.toLowerCase() == 'number') {
                    for (k in this.records) {
                        const r = this.records[k].fields;
                        r[c.field] = r[c.field] ? Number(r[c.field]) : null;
                    }
                }
            }
        } else if (this.records != undefined) {
            let col_names = [].concat.apply([], this.records.map(function (r) { return Object.keys(r.fields); }));
            col_names = col_names.filter(function (c, i) { return i == col_names.indexOf(c); });
            this.columns = col_names.map((c, i) => {
                let tmp_col: IColumn = {
                    field: c,
                    header: c,
                    dataType: this.guessType(this.records.map((r) => r[c] || null)),
                    sortable: true,
                    filterable: true,
                    editable: false,
                    displayOrder: i, 
                    sortOrder: null, 
                    reverseSort: false,
                    visible: true,
                    cSort: (a: any, b: any) => 0,
                    cFilter: (v: any) => true,
                    cFormat: (v: any) => v
                };
                return { col: tmp_col };
            });
        }
    }

    // Possibly move this method to a separate class or script?
    // Write unit tests for the method.
    protected guessType = (arr: any[]) => {
        console.log({ msg: 'guess type', arr: arr });
        if (arr.length == 0) { return 'string'; }
        let c: number = arr.length < 10 ? arr.length : arr.length < 100 ? 10 : Math.floor(Math.sqrt(arr.length));
        let sub: any[] = [];
        while (c--) {
            sub.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
        }
        const rNumeric = /[^0-9\.\,\s]/;

        let i: any;
        let returnType: string;
        for (i in sub) {
            const v: any = sub[i];
            const vType: string = typeof v;
            if (vType != null) {
                if (['object', 'function'].indexOf(vType) > -1) {
                    if ([null, vType].indexOf(returnType) > -1) {
                        returnType = vType;
                    } else {
                        console.log('object or func, any');
                        return 'any';
                    }
                } else if (['number', 'boolean'].indexOf(vType) > -1) {
                    if ([null, vType].indexOf(returnType) > -1) {
                        returnType = vType;
                    } else if (['object', 'function'].indexOf(returnType) > -1) {
                        console.log('number or boolean, any');
                        return 'any';
                    } else {
                        returnType = 'string';
                    }
                } else if (['true', 'false'].indexOf(v.toLowerCase()) > -1) {
                    if ([null, 'boolean'].indexOf(returnType) > -1) {
                        returnType = 'boolean';
                    } else {
                        returnType = 'string';
                    }
                } else {
                    const vNum = Number(v);
                    if (!isNaN(vNum) && !rNumeric.test(v)) {
                        if ([null, 'number'].indexOf(returnType) > -1) {
                            returnType = 'number';
                        } else {
                            returnType = 'string';
                        }
                    }
                }
            }
        }
        console.log({ returnType: returnType });
        return returnType;
    }
}