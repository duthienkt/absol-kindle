var core = new Dom();
var _ = core._;
var $ = core.$;
var screenSize = Dom.getScreenSize();

function FTable(data) {
    var r = data.rows || 1;
    var c = data.cols || 1;
    return _({
        class: ['ftable', 'r' + r + 'c' + c],
        child: Array(c * r).fill(0).map(function(u, i) {
            return {
                class: ['ftable-cell', 'i' + (i / c >> 0) + 'j' + (i % c)],
                style: {
                    left: (100 * (i % c) / c) + '%',
                    top: (100 * (i / c >> 0) / r) + '%',
                    width: (100 / c) + '%',
                    height: (100 / r) + '%'
                }
            };
        }),
        props: {
            _childCount: 0
        }
    });
}

FTable.prototype.addChild = function(e) {
    this.childNodes[this._childCount].addChild(e);
    this._childCount++;
};

core.install('ftable', FTable);

function SudokuTable() {

    var tSize = Math.min(screenSize.width, screenSize.height - (screenSize.width - 9) / 10) - 40;
    var cells = Array(81).fill('.sudoku-cell').map(function(query) { return _(query); });
    var subTables = Array(9).fill(0).map(function(u, i) {
        var ti = i / 3 >> 0;
        var tj = i % 3;

        return _({
            tag: 'ftable',
            class: 'sudoku-sub',
            data: { rows: 3, cols: 3 },
            child: cells.slice(ti * 27 + tj * 3, ti * 27 + tj * 3 + 3)
                .concat(cells.slice(ti * 27 + tj * 3 + 9, ti * 27 + tj * 3 + 3 + 9))
                .concat(cells.slice(ti * 27 + tj * 3 + 18, ti * 27 + tj * 3 + 3 + 18))
        });
    });
    var res = _({
        tag: 'ftable',
        class: 'sudoku-table',
        style: {
            width: tSize + 'px',
            height: tSize + 'px',
            lineHeight: tSize / 9 + 'px'
        },
        data: { rows: 3, cols: 3 },
        child: subTables

    });
    cells.forEach(function(elt, i) {
        elt.on('click', function() {
            res.selectCell(i / 9 >> 0, i % 9);
        });
    });
    res.cells = cells;
    res.subTables = subTables;

    return res;
}

SudokuTable.prototype.selectCell = function(i, j) {
    if (this._selectedCell) {
        this._selectedCell.removeClass('selected');
    }
    if (this._selectedSubTable) {
        this._selectedSubTable.removeClass('hover');
    }

    if (this.hoverCells && this.hoverCells.length > 0) {
        this.hoverCells.forEach(function(e) {
            e.removeClass('hover');
        });
    }

    this.hoverCells = [];
    this._selectedCell = this.getCell(i, j);

    this._selectedSubTable = this.getSubTable((i / 3) >> 0, (j / 3) >> 0);
    if (this._selectedCell) {
        this._selectedCell.addClass('selected');
    }

    if (this._selectedSubTable) {
        this._selectedSubTable.addClass('hover');
    }

    for (var x = 0; x < 9; ++x) {
        var cell;
        if (x != j) {
            cell = this.getCell(i, x);
            cell.addClass('hover');
            this.hoverCells.push(cell);
        }
        if (x != i) {
            cell = this.getCell(x, j);
            cell.addClass('hover');
            this.hoverCells.push(cell);
        }
    }
    Log("selectCell", { i: i, j: j })
};

SudokuTable.prototype.setSelecedCellValue = function(value) {
    if (this._selectedCell) {
        var locked = this._selectedCell.containsClass('locked');
        if (value > 0 && !locked) {
            this._selectedCell.innerHTML = value + '';
            this._selectedCell.__value__ = value;
        }
        else if (value == 0 && !locked) {
            this._selectedCell.innerHTML = '';
            this._selectedCell.__value__ = value;
        }
        else if (value < 0 && (this._selectedCell.__value__ < 0 || this._selectedCell.__value__ > 0)) {
            if (locked) {
                this._selectedCell.removeClass('locked');
                this._selectedCell.__value__ = Math.abs(this._selectedCell.__value__);
            }
            else {
                this._selectedCell.addClass('locked');
                this._selectedCell.__value__ = -Math.abs(this._selectedCell.__value__);
            }
        }
    }
};

SudokuTable.prototype.getCell = function(i, j) {
    return this.cells[i * 9 + j];
};


SudokuTable.prototype.getSubTable = function(i, j) {
    return this.subTables[i * 3 + j];
};

SudokuTable.prototype.getData = function() {
    return this.cells.map(function(e) {
        return e.__value__ || 0;
    });
};

SudokuTable.prototype.setData = function(data) {
    return this.cells.map(function(e, i) {
        var value = data[i] || 0;
        if (value > 0) {
            e.innerHTML = value + '';

        }
        else if (value == 0) {
            e.innerHTML = '';
        }
        else if (value < 0) {
            e.innerHTML = (-value) + '';
            e.addClass('locked');
        }
        return e.__value__ = value;
    });
};


core.install('sudokutable', SudokuTable);

var lockIco = '<svg style="width:24px;height:24px" viewBox="0 0 24 24">\
    <path fill="#000000" d="M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17Z" />\
</svg>';

var eraseIco = '<svg style="width:24px;height:24px" viewBox="0 0 24 24">\
    <path fill="#000000" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z" />\
</svg>';

function NumberKeyboar() {
    var btSize = (screenSize.width - 12) / 11 - 10;

    var res = _({
        class: 'numnber-keyboar',
        extendEvent: ['press'],
        child: Array(11).fill(0).map(function(u, i) {
            return {
                tag: 'button',
                style: {
                    width: btSize + 'px',
                    height: btSize + 'px'

                },
                class: 'numnber-keyboar-bt',
                child: i == 0 ? lockIco : (i == 1 ? eraseIco : { text: '' + (i - 1) }),
                on: {
                    mousedown: function() {
                        this.addStyle('background-color', 'gray');
                        var self = this;
                        setTimeout(function() {
                            self.removeStyle('background-color');
                        }, 200);

                        res.emit('press', { target: this, key: (i - 1) + '', number: i - 1 });
                    }
                }
            };
        })
    });


    return res;
}



core.install('numberkeyboar', NumberKeyboar);

var table = _('sudokutable').addTo(document.body);

var saveGame = ('localStorage' in window)?(function(){
    localStorage.setItem('sudokuGameData', JSON.stringify(table.getData()));
}):(function(){});

var loadGame = ('localStorage' in window)?(function(){
    var dataJson = localStorage.getItem('sudokuGameData');
    if (dataJson){
        var data = JSON.parse(dataJson);
        table.setData(data);
    }
}):(function(){
    return Array(81).fill(0);
});

loadGame();

var keyboard = _('numberkeyboar').addClass('show').addTo(document.body).on('press', function(event) {
    table.setSelecedCellValue(event.number);
    saveGame();
});

