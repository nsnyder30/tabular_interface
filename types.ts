export interface IColumn {
    readonly field: string;
    header: string;
    readonly dataType: string;
    readonly sortable: boolean;
    readonly filterable: boolean;
    readonly editable: boolean;
    displayOrder: number;
    sortOrder: number;
    reverseSort: boolean;
    visible: boolean;
    cSort: (a: any, b: any, ai?: number, bi?: number) => number;
    cFilter: (v: any) => boolean;
    cFormat: (v: any) => string;
}

export interface IRecord {
    fields: object;
    visible: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export interface IFilter {
    nulls: boolean;
    nonNulls: boolean;
    nMin: number;
    nMax: number;
    rEx: string;
    bool: boolean;
}

export interface IRecordEditor {
    record: object;

    // Read up on whether this is good practice - one interface being reliant on another
    readonly columns: IColumn[];
    readonly open: (columns: IColumn[], record?: object) => void;
    readonly close: (action: string) => object;
}

export interface IHttp {

}

export interface IField {
    readonly id: string;
    readonly dataType: string;
    fieldName: string;
    readonly allow_multiselect: boolean;
    readonly allow_null: boolean;
}