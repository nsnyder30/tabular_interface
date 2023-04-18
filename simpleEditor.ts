import { IColumn } from './types';
import { IRecord } from './types';
import { IRecordEditor } from './types';

export class SimpleEditor implements IRecordEditor {
    original: IRecord;
    record: IRecord;
    readonly columns: IColumn[];
    private modal: Element;
    private frm: HTMLFormElement;
    readonly mode: string;

    constructor(mode?: string) {
        this.mode = mode || 'insert';
    }

    protected mod = (obj: IRecord) => {
        console.log({ obj: obj });
        this.original = obj;
        this.original.fields['Lot_Type'] = 'TEST PASSED';
/*
        this.record = JSON.parse(JSON.stringify(this.original));
        this.record['rec']['Week'] = 'FALSE WEEK';
*/

        const d1 = document.createElement('div');
        d1.style.position = 'fixed';
        d1.style.top = '0px';
        d1.style.left = '0px';
        d1.style.height = '100%';
        d1.style.width = '100%';

        const d2 = document.createElement('div');
        d2.style.position = 'fixed';
        d2.style.top = '0px';
        d2.style.left = '0px';
        d2.style.height = '100%';
        d2.style.width = '100%';
        d2.style.opacity = '0.3';
        d2.style.backgroundColor = '#000';
        d2.onclick = () => {
            this.close('cancel');
        }
        d1.appendChild(d2);

        const d3 = document.createElement('div');
        d3.style.position = 'fixed';
        d3.style.top = '25%';
        d3.style.left = '25%';
        d3.style.height = '50%';
        d3.style.width = 'fit-content';
        d3.style.backgroundColor = '#FFF';
        d1.appendChild(d3);

        this.frm = document.createElement('form');
        this.frm.style.margin = '5px';

        let d4 = document.createElement('div');
        d4.style.position = 'absolute';
        d4.style.margin = '5px';
        d4.style.bottom = '0px';
        d4.style.right = '0px';

        let btnSubmit = document.createElement('button');
        btnSubmit.textContent = 'Submit';
        btnSubmit.style.marginRight = '5px';
        let btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancel';

        d4.appendChild(btnSubmit);
        d4.appendChild(btnCancel);
        this.frm.appendChild(d4);

        d3.appendChild(this.frm);

        btnSubmit.onclick = () => {
            console.log(this);
            this.original.fields['Week'] = 'TEST 3 PASSED'
            this.close.call(this, 'submit');
        }

        btnCancel.onclick = () => {
            this.close('cancel');
        }

        this.modal = d1;
        document.body.append(this.modal);
    }

    readonly open = (columns: IColumn[], record?: IRecord, mode?: string) => {
        console.log({ msg: 'columns', cols: JSON.parse(JSON.stringify(columns)) });
        console.log({ msg: 'record', rec: JSON.parse(JSON.stringify(record)) });
        this.original = record;
        this.record = record || {
            fields: {},
            visible: false, 
            canUpdate: false, 
            canDelete: false
        };
        this.record = JSON.parse(JSON.stringify((this.record)));

        console.log({ record: this.record });
        const d1 = document.createElement('div');
        d1.style.position = 'fixed';
        d1.style.top = '0px';
        d1.style.left = '0px';
        d1.style.height = '100%';
        d1.style.width = '100%';

        const d2 = document.createElement('div');
        d2.style.position = 'fixed';
        d2.style.top = '0px';
        d2.style.left = '0px';
        d2.style.height = '100%';
        d2.style.width = '100%';
        d2.style.opacity = '0.3';
        d2.style.backgroundColor = '#000';
        d2.onclick = () => {
            this.close('cancel');
        }
        d1.appendChild(d2);

        const d3 = document.createElement('div');
        d3.style.position = 'fixed';
        d3.style.top = '25%';
        d3.style.left = '25%';
        d3.style.height = '50%';
        d3.style.width = 'fit-content';
        d3.style.backgroundColor = '#FFF';
        d1.appendChild(d3);

        this.frm = document.createElement('form');
        this.frm.style.margin = '5px';
        const tbl = document.createElement('table');
        this.frm.appendChild(tbl);
        const lim = Math.ceil(columns.length / 2);
        for (let i = 0; i < lim; i++) {
            const row = document.createElement('tr');
            tbl.appendChild(row);
            for (let c of [i, i + lim]) {
                const lbl = document.createElement('td');
                const cell = document.createElement('td');
                if (columns[c]) {
                    const col = columns[c];

                    lbl.textContent = col.header;
                    lbl.style.textAlign = 'right';
                    lbl.style['font-weight'] = 'bold';

                    const inp = document.createElement('input');
                    inp.name = col.field;
                    if (col.dataType == 'string') {
                        inp.type = 'text';
                    } else if (col.dataType == 'number') {
                        inp.type = 'number';
                    } else if (col.dataType == 'boolean') {
                        inp.type = 'checkbox';
                    }
                    console.log({ col: col, field: this.record.fields[col.field] });
                    inp.value = this.record.fields[col.field] || null;
                    cell.append(inp);
                    cell.style.textAlign = 'left';
                }
                row.appendChild(lbl);
                row.appendChild(cell);
            }
        }

        let d4 = document.createElement('div');
        d4.style.position = 'absolute';
        d4.style.margin = '5px';
        d4.style.bottom = '0px';
        d4.style.right = '0px';

        let btnSubmit = document.createElement('button');
        btnSubmit.textContent = 'Submit';
        btnSubmit.style.marginRight = '5px';
        let btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancel';

        d4.appendChild(btnSubmit);
        d4.appendChild(btnCancel);
        this.frm.appendChild(d4);

        d3.appendChild(this.frm);

        btnSubmit.onclick = () => {
            this.close('submit');
        }
        
        btnCancel.onclick = () => {
            this.close('cancel');
        }

        this.modal = d1;
        document.body.append(this.modal);
    }

    readonly close = (action: string) => {
        console.log(JSON.parse(JSON.stringify(this.original)));
        this.original.fields['Entity'] = 'TEST 2 PASSED';
        console.log(JSON.parse(JSON.stringify(this.original)));
        console.log({ close_action: action });
        this.modal.remove();
        let result;
        if (action == 'submit') {
/*
            console.log({ original: JSON.parse(JSON.stringify(this.original)), record: JSON.parse(JSON.stringify(this.record)) });
            result = {}

            if (this.original.hasOwnProperty('rec')) {
                for (let i in this.record['rec']) {
                    this.original['rec'][i] = this.record['rec'][i];
                }
            } else {
                for (let i in this.record) {
                    this.original[i] = this.record[i];
                }
            }
            console.log({ original: JSON.parse(JSON.stringify(this.original)), record: JSON.parse(JSON.stringify(this.record)) });
            let frmDat = new FormData(this.frm);
            for (const inp of frmDat.entries()) {
                result[inp[0]] = inp[1];

                if (this.original.hasOwnProperty('rec')) {
                    this.original['rec'] = this.record;
                } else {
                    this.original = this.record;
                }
            }
*/
        } else {
            result = null;
        }
        console.log(result);
        return result;
    }
}