/*****************************************************************************
 *
 * Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id$

function SilvaLinkTool() {
    /* redefine the contextmenu elements */
    
    this.createContextMenuElements = function(selNode, event) {
        /* create the 'Create link' or 'Remove link' menu elements */
        var ret = new Array();
        var link = this.editor.getNearestParentOfType(selNode, 'a');
        if (link) {
            ret.push(new ContextMenuElement('Delete link', this.deleteLink, this));
        } else {
            ret.push(new ContextMenuElement('Create link', getLink, this));
        };
        return ret;
    };
};

SilvaLinkTool.prototype = new LinkTool;

function SilvaLinkToolBox(inputid, addbuttonid, updatebuttonid, delbuttonid, toolboxid, plainclass, activeclass) {
    /* create and edit links */
    
    this.input = document.getElementById(inputid);
    this.addbutton = document.getElementById(addbuttonid);
    this.updatebutton = document.getElementById(updatebuttonid);
    this.delbutton = document.getElementById(delbuttonid);
    this.toolboxel = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;
    
    this.initialize = function(tool, editor) {
        this.tool = tool;
        this.editor = editor;
        addEventHandler(this.addbutton, 'click', this.createLinkHandler, this);
        addEventHandler(this.updatebutton, 'click', this.createLinkHandler, this);
        addEventHandler(this.delbutton, 'click', this.tool.deleteLink, this);
        this.editor.logMessage('Link tool initialized');
    };

    this.createLinkHandler = function(event) {
        var url = this.input.value;
        this.tool.createLink(url);
    };
    
    this.updateState = function(selNode, event) {
        var currnode = selNode;
        var link = false;
        var href = '';
        while (currnode) {
            if (currnode.nodeName.toLowerCase() == 'a') {
                href = currnode.getAttribute('href');
                if (href) {
                    if (this.toolboxel) {
                        this.toolboxel.className = this.activeclass;
                    };
                    this.input.value = href;
                    this.addbutton.style.display = 'none';
                    this.updatebutton.style.display = 'inline';
                    this.delbutton.style.display = 'inline';
                    return;
                };
            };
            currnode = currnode.parentNode;
        };
        this.updatebutton.style.display = 'none';
        this.delbutton.style.display = 'none';
        this.addbutton.style.display = 'inline';
        if (this.toolboxel) {
            this.toolboxel.className = this.plainclass;
        };
        this.input.value = '';
    };
};

SilvaLinkToolBox.prototype = new LinkToolBox;

function SilvaImageTool(editelid, urlinputid, targetselectid, hireslinkradioid, linklinkradioid, linkinputid, 
                        alignselectid, toolboxid, plainclass, activeclass) {
    /* Silva specific image tool */
    this.editel = document.getElementById(editelid);
    this.urlinput = document.getElementById(urlinputid);
    this.targetselect = document.getElementById(targetselectid);
    this.hireslinkradio = document.getElementById(hireslinkradioid);
    this.linklinkradio = document.getElementById(linklinkradioid);
    this.linkinput = document.getElementById(linkinputid);
    this.alignselect = document.getElementById(alignselectid);
    this.toolboxel = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;

    this.initialize = function(editor) {
        this.editor = editor;
        addEventHandler(this.targetselect, 'click', this.setTarget, this);
        addEventHandler(this.hireslinkradio, 'click', this.setHires, this);
        addEventHandler(this.linklinkradio, 'click', this.setNoHires, this);
        addEventHandler(this.linkinput, 'keypress', this.setLink, this);
        addEventHandler(this.linkinput, 'change', this.setLink, this);
        addEventHandler(this.alignselect, 'change', this.setAlign, this);
        this.editor.logMessage('Image tool initialized');
    };

    this.createContextMenuElements = function(selNode, event) {
        return new Array(new ContextMenuElement('Create image', getImage, this));
    };

    this.updateState = function(selNode, event) {
        var image = this.editor.getNearestParentOfType(selNode, 'img');
        if (image) {
            this.editel.style.display = 'block';
            var src = image.getAttribute('src');
            this.urlinput.value = src;
            var target = image.getAttribute('target');
            if (!target) {
                target = '_self';
            };
            selectSelectItem(this.targetselect, target);
            var hires = image.getAttribute('link_to_hires') == '1';
            if (!hires) {
                var link = image.getAttribute('link');
                this.linklinkradio.checked = 'selected';
                this.linkinput.value = link;
            } else {
                this.hireslinkradio.checked = 'checked';
                this.linkinput.value = '';
            };
            if (this.toolboxel) {
                this.toolboxel.className = this.activeclass;
            };
            var align = image.getAttribute('alignment');
            if (!align) {
                align = 'left';
            };
            selectSelectItem(this.alignselect, align);
        } else {
            this.editel.style.display = 'none';
            this.urlinput.value = '';
            if (this.toolboxel) {
                this.toolboxel.className = this.plainclass;
            };
        };
    };

    this.setTarget = function() {
        var target = this.targetselect.options[this.targetselect.selectedIndex].value;
        var selNode = this.editor.getSelectedNode();
        var image = this.editor.getNearestParentOfType(selNode, 'img');
        if (!image) {
            this.editor.logMessage('No image selected!', 1);
        };
        image.setAttribute('target', target);
    };

    this.setHires = function() {
        var selNode = this.editor.getSelectedNode();
        var image = this.editor.getNearestParentOfType(selNode, 'img');
        if (!image) {
            this.editor.logMessage('No image selected!', 1);
            return;
        };
        image.setAttribute('link_to_hires', '1');
        image.removeAttribute('link');
        this.linkinput.value = '';
    };

    this.setNoHires = function() {
        var selNode = this.editor.getSelectedNode();
        var image = this.editor.getNearestParentOfType(selNode, 'img');
        if (!image) {
            this.editor.logMessage('Not inside an image!', 1);
            return;
        };
        var link = this.linkinput.value;
        image.setAttribute('link_to_hires', '0');
        image.setAttribute('link', link);
        this.linklinkradio.setAttribute('selected', 'selected');
    };

    this.setLink = function() {
        var link = this.linkinput.value;
        var selNode = this.editor.getSelectedNode();
        var image = this.editor.getNearestParentOfType(selNode, 'img');
        if (!image) {
            this.editor.logMessage('No image selected!', 1);
            return;
        };
        image.setAttribute('link', link);
        image.setAttribute('link_to_hires', '0');
    };

    this.setAlign = function() {
        var selNode = this.editor.getSelectedNode();
        var image = this.editor.getNearestParentOfType(selNode, 'img');
        if (!image) {
            this.editor.logMessage('Not inside an image', 1);
            return;
        };
        var align = this.alignselect.options[this.alignselect.selectedIndex].value;
        image.setAttribute('alignment', align);
    };
}

SilvaImageTool.prototype = new ImageTool;

function SilvaTableTool() {
    /* Silva specific table functionality
        overrides most of the table functionality, required because Silva requires
        a completely different format for tables
    */

    this.createTable = function(rows, cols, makeHeader, tableclass) {
        /* add a Silvs specific table, with an (optional) header with colspan */
        var doc = this.editor.getInnerDocument();

        var table = doc.createElement('table');
        table.style.width = "100%";
        table.className = tableclass;

        var tbody = doc.createElement('tbody');
        
        if (makeHeader) {
            this._addRowHelper(doc, tbody, 'th', -1, cols);
        }

        for (var i=0; i < rows; i++) {
            this._addRowHelper(doc, tbody, 'td', -1, cols);
        }

        table.appendChild(tbody);

        var iterator = new NodeIterator(table);
        var currnode = null;
        var contentcell = null;
        while (currnode = iterator.next()) {
            var nodename = currnode.nodeName.toLowerCase();
            if (nodename == 'td' || nodename == 'th') {
                contentcell = currnode;
                break;
            };
        };
        
        var setcursoratend = false;
        if (contentcell) {
            while (contentcell.hasChildNodes()) {
                contentcell.removeChild(contentcell.firstChild);
            };
            
            var selection = this.editor.getSelection();
            var docfrag = selection.cloneContents();
            while (docfrag.hasChildNodes()) {
                contentcell.appendChild(docfrag.firstChild);
                setcursoratend = true;
            };
        };
        this.editor.insertNodeAtSelection(table);

        if (contentcell) {
            var selection = this.editor.getSelection();
            selection.selectNodeContents(contentcell);
            selection.collapse(setcursoratend);
        };

        this.editor.logMessage('Table added');
    };

    this.addTableRow = function() {
        /* add a table row or header */
        var currnode = this.editor.getSelectedNode();
        var doc = this.editor.getInnerDocument();
        var tbody = this.editor.getNearestParentOfType(currnode, 'tbody');
        if (!tbody) {
            this.editor.logMessage('No table found!', 1);
            return;
        }
        var cols = this._countCells(tbody);
        var currrow = this.editor.getNearestParentOfType(currnode, 'tr');
        if (!currrow) {
            this.editor.logMessage('Not inside a row!', 1);
            return;
        };
        var index = this._getRowIndex(currrow) + 1;
        // should check what to add as well
        this._addRowHelper(doc, tbody, 'td', index, cols);

        this.editor.logMessage('Table row added');
    };

    this.delTableRow = function() {
        /* delete a table row or header */
        var currnode = this.editor.getSelectedNode();
        var currtr = this.editor.getNearestParentOfType(currnode, 'tr');

        if (!currtr) {
            this.editor.logMessage('Not inside a row!', 1);
            return;
        };

        currtr.parentNode.removeChild(currtr);

        this.editor.logMessage('Table row removed');
    };

    this.addTableColumn = function() {
        /* add a table column */
        var currnode = this.editor.getSelectedNode();
        var doc = this.editor.getInnerDocument();
        var body = this.editor.getNearestParentOfType(currnode, 'tbody');
        if (!body) {
            this.editor.logMessage('Not inside a table!');
            return;
        };
        var currcell = this.editor.getNearestParentOfType(currnode, 'td');
        if (!currcell) {
            var currcell = this.editor.getNearestParentOfType(currnode, 'th');
            if (!currcell) {
                this.editor.logMessage('Not inside a row!', 1);
                return;
            } else {
                var index = -1;
            };
        } else {
            var index = this._getColIndex(currcell) + 1;
        };
        var numcells = this._countCells(body);
        this._addColHelper(doc, body, index, numcells);

        this.editor.logMessage('Column added');
    };

    this.delTableColumn = function() {
        /* delete a column */
        var currnode = this.editor.getSelectedNode();
        var body = this.editor.getNearestParentOfType(currnode, 'tbody');
        if (!body) {
            this.editor.logMessage('Not inside a table body!', 1);
            return;
        }
        var currcell = this.editor.getNearestParentOfType(currnode, 'td');
        if (!currcell) {
            currcell = this.editor.getNearestParentOfType(currnode, 'th');
            if (!currcell) {
                this.editor.logMessage('Not inside a cell!');
                return;
            };
            var index = -1;
        } else {
            var index = this._getColIndex(currcell);
        };

        this._delColHelper(body, index);

        this.editor.logMessage('Column deleted');
    };

    this.setColumnWidths = function(widths) {
        /* sets relative column widths */
        var selNode = this.editor.getSelectedNode();
        var table = this.editor.getNearestParentOfType(selNode, 'table');

        // first remove all current width settings from the table
        var iterator = new NodeIterator(table);
        var currnode = null;
        while (currnode = iterator.next()) {
            if (currnode.nodeName.toLowerCase() == 'td') {
                if (currnode.getAttribute('width')) {
                    currnode.removeAttribute('width');
                } else if (currnode.style.width) {
                    delete currnode.style.width;
                };
            };
        };
        
        var silva_column_info = new Array();
        widths = widths.split(',');
        for (var i=0; i < widths.length; i++) {
            widths[i] = widths[i].strip();
            silva_column_info.push('C:' + widths[i]);
            widths[i] = parseInt(widths[i]);
        };
        silva_column_info = silva_column_info.join(' ');
        table.setAttribute('silva_column_info', silva_column_info);
        
        // now convert the relative widths to percentages
        // first find the first row containing cells
        var totalunits = 0;
        for (var i=0; i < widths.length; i++) {
            totalunits += widths[i];
        };
        var iterator = new NodeIterator(table);
        var currnode = null;
        var row = null;
        while (currnode = iterator.next()) {
            if (currnode.nodeName.toLowerCase() == 'td') {
                row = currnode.parentNode;
                break;
            };
        };
        var iterator = new NodeIterator(row);
        var percent_per_unit = 100.0 / totalunits;
        var currcell = null;
        for (var i=0; i < widths.length; i++) {
            while (currcell = iterator.next()) {
                if (currcell.nodeName.toLowerCase() == 'td') {
                    currcell.setAttribute('width', '' + (widths[i] * percent_per_unit) + '%');
                    break;
                };
            };
        };
    };

    this.getColumnWidths = function(table) {
        var silvacolinfo = table.getAttribute('silva_column_info');
        var widths = new Array();
        if (!silvacolinfo) {
            var body = null;
            var iterator = new NodeIterator(table);
            var body = iterator.next();
            while (body.nodeName.toLowerCase() != 'tbody') {
                body = iterator.next();
            };
            var numcols = this._countCells(body);
            for (var i=0; i < numcols; i++) {
                widths.push(1);
            };
        } else {
            silvacolinfo = silvacolinfo.split(' ');
            for (var i=0; i < silvacolinfo.length; i++) {
                var pair = silvacolinfo[i].split(':');
                widths.push(parseInt(pair[1]));
            };
            widths = this._factorWidths(widths);
        };
        return widths;
    };

    this._factorWidths = function(widths) {
        var highest = 0;
        for (var i=0; i < widths.length; i++) {
            if (widths[i] > highest) {
                highest = widths[i];
            };
        };
        var factor = 1;
        for (var i=0; i < highest; i++) {
            var testnum = highest - i;
            var isfactor = true;
            for (var j=0; j < widths.length; j++) {
                if (widths[j] % testnum != 0) {
                    isfactor = false;
                    break;
                };
            };
            if (isfactor) {
                factor = testnum;
                break;
            };
        };
        if (factor > 1) {
            for (var i=0; i < widths.length; i++) {
                widths[i] = widths[i] / factor;
            };
        };
        return widths;
    };

    this._addRowHelper = function(doc, body, celltype, index, numcells) {
        /* actually adds a row to the table */
        var row = doc.createElement('tr');

        // fill the row with cells
        if (celltype == 'td') {
            for (var i=0; i < numcells; i++) {
                var cell = doc.createElement(celltype);
                var nbsp = doc.createTextNode("\u00a0");
                cell.appendChild(nbsp);
                row.appendChild(cell);
            }
        } else if (celltype == 'th') {
            var cell = doc.createElement(celltype);
            cell.setAttribute('colSpan', numcells);
            var nbsp = doc.createTextNode("\u00a0");
            cell.appendChild(nbsp);
            row.appendChild(cell);
        }

        // now append it to the tbody
        var rows = this._getAllRows(body);
        if (index == -1 || index >= rows.length) {
            body.appendChild(row);
        } else {
            var nextrow = rows[index];
            body.insertBefore(row, nextrow);
        }

        return row;
    };

    this._addColHelper = function(doc, body, index, numcells) {
        /* actually adds a column to a table */
        var rows = this._getAllRows(body);
        for (var i=0; i < rows.length; i++) {
            var row = rows[i];
            var cols = this._getAllColumns(row);
            var col = cols[0];
            if (col.nodeName.toLowerCase() == 'th') {
                var colspan = col.getAttribute('colSpan');
                if (colspan) {
                    colspan = parseInt(colspan);
                } else {
                    colspan = 1;
                }
                col.setAttribute('colSpan', colspan + 1);
            } else {
                var cell = doc.createElement('td');
                var nbsp = doc.createTextNode('\u00a0');
                cell.appendChild(nbsp);
                if (index == -1 || index >= rows.length) {
                    row.appendChild(cell);
                } else {
                    row.insertBefore(cell, cols[index]);
                };
            };
        };
    };

    this._delColHelper = function(body, index) {
        /* actually delete all cells in a column */
        var rows = this._getAllRows(body);
        for (var i=0; i < rows.length; i++) {
            var row = rows[i];
            var cols = this._getAllColumns(row);
            if (cols[0].nodeName.toLowerCase() == 'th') {
                // is a table header, so reduce colspan
                var th = cols[0];
                var colspan = th.getAttribute('colSpan');
                if (!colspan || colspan == '1') {
                    body.removeChild(row);
                } else {
                    colspan = parseInt(colspan);
                    th.setAttribute('colSpan', colspan - 1);
                };
            } else {
                // is a table cell row, remove one
                if (index > -1) {
                    row.removeChild(cols[index]);
                } else {
                    row.removeChild(cols[cols.length - 1]);
                }
            }
        };
    };

    this._getRowIndex = function(row) {
        /* get the current rowindex */
        var rowindex = 0;
        var prevrow = row.previousSibling;
        while (prevrow) {
            if (prevrow.nodeName.toLowerCase() == 'tr') {
                rowindex++;
            };
            prevrow = prevrow.previousSibling;
        };
        return rowindex;
    };

    this._countCells = function(body) {
        /* get the current column index */
        var numcols = 0;
        var cols = this._getAllColumns(this._getAllRows(body)[0]);
        for (var i=0; i < cols.length; i++) {
            var node = cols[i];
            if (node.nodeName.toLowerCase() == 'th') {
                var colspan = node.getAttribute('colSpan');
                if (colspan) {
                    colspan = parseInt(colspan);
                } else {
                    colspan = 1;
                };
                numcols += colspan;
            } else {
                numcols++;
            };
        };
        return numcols;
    };

    this._getAllRows = function(body) {
        /* returns an Array of all available rows */
        var rows = new Array();
        for (var i=0; i < body.childNodes.length; i++) {
            var node = body.childNodes[i];
            if (node.nodeName.toLowerCase() == 'tr') {
                rows.push(node);
            };
        };
        return rows;
    };

    this._getAllColumns = function(row) {
        /* returns an Array of all columns in a row */
        var cols = new Array();
        for (var i=0; i < row.childNodes.length; i++) {
            var node = row.childNodes[i];
            if (node.nodeName.toLowerCase() == 'td' || 
                    node.nodeName.toLowerCase() == 'th') {
                cols.push(node);
            };
        };
        return cols;
    };
}

SilvaTableTool.prototype = new TableTool;

function SilvaTableToolBox(addtabledivid, edittabledivid, newrowsinputid, 
                        newcolsinputid, makeheaderinputid, classselectid, alignselectid, widthinputid,
                        addtablebuttonid, addrowbuttonid, delrowbuttonid, addcolbuttonid, delcolbuttonid, 
                        fixbuttonid, toolboxid, plainclass, activeclass) {
    /* Silva specific table functionality
        overrides most of the table functionality, required because Silva requires
        a completely different format for tables
    */

    this.addtablediv = document.getElementById(addtabledivid);
    this.edittablediv = document.getElementById(edittabledivid);
    this.newrowsinput = document.getElementById(newrowsinputid);
    this.newcolsinput = document.getElementById(newcolsinputid);
    this.makeheaderinput = document.getElementById(makeheaderinputid);
    this.classselect = document.getElementById(classselectid);
    this.alignselect = document.getElementById(alignselectid);
    this.widthinput = document.getElementById(widthinputid);
    this.addtablebutton = document.getElementById(addtablebuttonid);
    this.addrowbutton = document.getElementById(addrowbuttonid);
    this.delrowbutton = document.getElementById(delrowbuttonid);
    this.addcolbutton = document.getElementById(addcolbuttonid);
    this.delcolbutton = document.getElementById(delcolbuttonid);
    this.fixbutton = document.getElementById(fixbuttonid);
    this.toolboxel = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;

    this.initialize = function(tool, editor) {
        /* attach the event handlers */
        this.tool = tool;
        this.editor = editor;
        addEventHandler(this.addtablebutton, "click", this.addTable, this);
        addEventHandler(this.addrowbutton, "click", this.tool.addTableRow, this.tool);
        addEventHandler(this.delrowbutton, "click", this.tool.delTableRow, this.tool);
        addEventHandler(this.addcolbutton, "click", this.tool.addTableColumn, this.tool);
        addEventHandler(this.delcolbutton, "click", this.tool.delTableColumn, this.tool);
        addEventHandler(this.fixbutton, "click", this.fixTable, this);
        addEventHandler(this.alignselect, "change", this.setColumnAlign, this);
        addEventHandler(this.classselect, "change", this.setTableClass, this);
        addEventHandler(this.widthinput, "change", this.setColumnWidths, this);
        this.addtablediv.style.display = "block";
        this.edittablediv.style.display = "none";
        this.editor.logMessage('Table tool initialized');
    };

    this.updateState = function(selNode) {
        /* update the state (add/edit) and update the pulldowns (if required) */
        var table = this.editor.getNearestParentOfType(selNode, 'table');
        if (table) {
            this.addtablediv.style.display = "none";
            this.edittablediv.style.display = "block";
            var td = this.editor.getNearestParentOfType(selNode, 'td');
            if (!td) {
                td = this.editor.getNearestParentOfType(selNode, 'th');
                this.inputwidth.value = '';
            } else {
                this.widthinput.value = this.tool.getColumnWidths(table);
            };
            if (td) {
                var align = td.getAttribute('align');
                if (this.editor.config.use_css) {
                    align = td.style.textAlign;
                };
                selectSelectItem(this.alignselect, align);
            };
            selectSelectItem(this.classselect, table.className);
            if (this.toolboxel) {
                this.toolboxel.className = this.activeclass;
            };
        } else {
            this.edittablediv.style.display = "none";
            this.addtablediv.style.display = "block";
            this.alignselect.selectedIndex = 0;
            this.classselect.selectedIndex = 0;
            if (this.toolboxel) {
                this.toolboxel.className = this.plainclass;
            };
        };
    };

    this.addTable = function() {
        /* add a Silvs specific table, with an (optional) header with colspan */
        var rows = parseInt(this.newrowsinput.value);
        var cols = parseInt(this.newcolsinput.value);
        var makeHeader = this.makeheaderinput.checked;
        var classchooser = document.getElementById("kupu-table-classchooser-add");
        var tableclass = this.classselect.options[this.classselect.selectedIndex].value;
        this.tool.createTable(rows, cols, makeHeader, tableclass);
    };

    this.setTableClass = function() {
        var cls = this.classselect.options[this.classselect.selectedIndex].value;
        this.tool.setTableClass(cls);
    };

    this.setColumnWidths = function() {
        var widths = this.widthinput.value;
        this.tool.setColumnWidths(widths);
    };

    this.fixTable = function(event) {
        /* fix the table so it is Silva (and this tool) compliant */
        // since this can be quite a nasty creature we can't just use the
        // helper methods
        
        // first we create a new tbody element
        var currnode = this.editor.getSelectedNode();
        var table = this.editor.getNearestParentOfType(currnode, 'TABLE');
        if (!table) {
            this.editor.logMessage('Not inside a table!');
            return;
        };
        var doc = this.editor.getInnerDocument();
        var tbody = doc.createElement('tbody');

        var allowed_classes = new Array('plain', 'grid', 'list', 'listing', 'data');
        if (!allowed_classes.contains(table.getAttribute('class'))) {
            table.setAttribute('class', 'plain');
        };
        
        table.setAttribute('cellpadding', '0');
        table.setAttribute('cellspacing', '0');

        // now get all the rows of the table, the rows can either be
        // direct descendants of the table or inside a 'tbody', 'thead'
        // or 'tfoot' element
        var rows = new Array();
        var parents = new Array('thead', 'tbody', 'tfoot');
        for (var i=0; i < table.childNodes.length; i++) {
            var node = table.childNodes[i];
            if (node.nodeName.toLowerCase() == 'tr') {
                rows.push(node);
            } else if (parents.contains(node.nodeName.toLowerCase())) {
                for (var j=0; j < node.childNodes.length; j++) {
                    var inode = node.childNodes[j];
                    if (inode.nodeName.toLowerCase() == 'tr') {
                        rows.push(inode);
                    };
                };
            };
        };
        
        // now find out how many cells our rows should have
        var numcols = 0;
        for (var i=0; i < rows.length; i++) {
            var row = rows[i];
            var currnumcols = 0;
            for (var j=0; j < row.childNodes.length; j++) {
                var node = row.childNodes[j];
                if (node.nodeName.toLowerCase() == 'td' ||
                        node.nodeName.toLowerCase() == 'th') {
                    var colspan = 1;
                    if (node.getAttribute('colSpan')) {
                        colspan = parseInt(node.getAttribute('colSpan'));
                    };
                    currnumcols += colspan;
                };
            };
            if (currnumcols > numcols) {
                numcols = currnumcols;
            };
        };

        // now walk through all rows to clean them up
        for (var i=0; i < rows.length; i++) {
            var row = rows[i];
            var newrow = doc.createElement('tr');
            var currcolnum = 0;
            var inhead = -1;
            while (row.childNodes.length > 0) {
                var node = row.childNodes[0];
                if (node.nodeName.toLowerCase() == 'td') {
                    if (inhead == -1) {
                        inhead = 0;
                        node.setAttribute('colSpan', '1');
                    };
                } else if (node.nodeName.toLowerCase() == 'th') {
                    if (inhead == -1) {
                        inhead = 1;
                        newrow.appendChild(node);
                        node.setAttribute('colSpan', '1');
                        node.setAttribute('rowSpan', '1');
                        continue;
                    } else if (inhead == 0) {
                        var td = doc.createElement('td');
                        while (node.childNodes.length) {
                            td.appendChild(node.childNodes[0]);
                        };
                        row.removeChild(node);
                        node = td;
                    };
                } else {
                    row.removeChild(node);
                    continue;
                };
                node.setAttribute('rowspan', '1');
                if (inhead) {
                    while (node.childNodes.length) {
                        newrow.childNodes[0].appendChild(node.childNodes[0]);
                    };
                    var colspan = node.getAttribute('colSpan');
                    if (colspan) {
                        colspan = parseInt(colspan);
                    } else {
                        colspan = 1;
                    }
                    var current_colspan = parseInt(newrow.childNodes[0].getAttribute('colSpan'));
                    newrow.childNodes[0].setAttribute('colSpan', (current_colspan + colspan).toString());
                    row.removeChild(node);
                } else {
                    node.setAttribute('colSpan', 1);
                    node.setAttribute('rowSpan', 1);
                    newrow.appendChild(node);
                };
            };
            if (newrow.childNodes.length) {
                tbody.appendChild(newrow);
            };
        };

        // now make sure all rows have the correct length
        for (var i=0; i < tbody.childNodes.length; i++) {
            var row = tbody.childNodes[i];
            if (row.childNodes.length && row.childNodes[0].nodeName.toLowerCase() == 'th') {
                row.childNodes[0].setAttribute('colSpan', numcols);
            } else {
                while (row.childNodes.length < numcols) {
                    var td = doc.createElement('td');
                    var nbsp = doc.createTextNode('\u00a0');
                    td.appendChild(nbsp);
                    row.appendChild(td);
                };
            };
        };
        
        // now remove all the old stuff from the table and add the new tbody
        var tlength = table.childNodes.length;
        for (var i=0; i < tlength; i++) {
            table.removeChild(table.childNodes[0]);
        };
        table.appendChild(tbody);

        this.editor.getDocument().getWindow().focus();

        this.editor.logMessage('Table cleaned up');
    };

    this._fixAllTables = function() {
        /* fix all the tables in the document at once */
        return;
        var tables = this.editor.getInnerDocument().getElementsByTagName('table');
        for (var i=0; i < tables.length; i++) {
            this.fixTable(tables[i]);
        };
    };
}

SilvaTableToolBox.prototype = new TableToolBox;

function SilvaIndexTool(inputid, addbuttonid, updatebuttonid, deletebuttonid, toolboxid, plainclass, activeclass) {
    /* a tool to manage index items (named anchors) for Silva */
    this.input = document.getElementById(inputid);
    this.addbutton = document.getElementById(addbuttonid);
    this.updatebutton = document.getElementById(updatebuttonid);
    this.deletebutton = document.getElementById(deletebuttonid);
    this.toolboxel = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;

    this.initialize = function(editor) {
        /* attach the event handlers */
        this.editor = editor;
        addEventHandler(this.input, 'blur', this.updateIndex, this);
        addEventHandler(this.addbutton, 'click', this.addIndex, this);
        addEventHandler(this.updatebutton, 'click', this.updateIndex, this);
        addEventHandler(this.deletebutton, 'click', this.deleteIndex, this);
        addEventHandler(editor.getInnerDocument(), 'keyup', this.handleKeyPressOnIndex, this);
        this.updatebutton.style.display = 'none';
        this.deletebutton.style.display = 'none';
    };

    this.addIndex = function(event) {
        /* create an index */
        var name = this.input.value;
        var currnode = this.editor.getSelectedNode();
        var indexel = this.editor.getNearestParentOfType(currnode, 'A');
        
        if (indexel && indexel.getAttribute('href')) {
            this.editor.logMessage('Can not add index items in anchors');
            return;
        };
        
        if (!indexel) {
            var doc = this.editor.getDocument();
            if (!name) {
                var selection = this.editor.getSelection();
                var cloned = selection.cloneContents();
                var iterator = new NodeIterator(cloned);
                var name = '';
                var currnode = null;
                while (currnode = iterator.next()) {
                    name += currnode.nodeValue;
                };
                if (name) {
                    this.input.value = name;
                };
            };
            var docel = doc.getDocument();
            indexel = docel.createElement('a');
            var text = docel.createTextNode('[' + name + ']');
            indexel.appendChild(text);
            indexel = this.editor.insertNodeAtSelection(indexel, true);
            indexel.className = 'index';
        };
        
        indexel.setAttribute('name', name);
        var sel = this.editor.getSelection();
        sel.collapse(true);
        this.editor.logMessage('Index added');
    };

    this.updateIndex = function(event) {
        /* update an existing index */
        var currnode = this.editor.getSelectedNode();
        var indexel = this.editor.getNearestParentOfType(currnode, 'A');
        if (!indexel) {
            return;
        };

        if (indexel && indexel.getAttribute('href')) {
            this.editor.logMessage('Can not add an index element inside a link!');
            return;
        };

        var name = this.input.value;
        indexel.setAttribute('name', name);
        while (indexel.hasChildNodes()) {
            indexel.removeChild(indexel.firstChild);
        };
        var text = this.editor.getInnerDocument().createTextNode('[' + name + ']')
        indexel.appendChild(text);
        this.editor.logMessage('Index modified');
    };

    this.deleteIndex = function() {
        var selNode = this.editor.getSelectedNode();
        var a = this.editor.getNearestParentOfType(selNode, 'a');
        if (!a || a.getAttribute('href')) {
            this.editor.logMessage('Not inside an index element!');
            return;
        };
        a.parentNode.removeChild(a);
        this.editor.logMessage('Index element removed');
    };

    this.handleKeyPressOnIndex = function(event) {
        var selNode = this.editor.getSelectedNode();
        var a = this.editor.getNearestParentOfType(selNode, 'a');
        if (!a || a.getAttribute('href')) {
            return;
        };
        var keyCode = event.keyCode;
        if (keyCode == 8 || keyCode == 46) {
            a.parentNode.removeChild(a);
        };
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        };
    };

    this.updateState = function(selNode) {
        var indexel = this.editor.getNearestParentOfType(selNode, 'A');
        if (indexel && !indexel.getAttribute('href')) {
            if (this.toolboxel) {
                this.toolboxel.className = this.activeclass;
            };
            this.input.value = indexel.getAttribute('name');
            this.addbutton.style.display = 'none';
            this.updatebutton.style.display = 'inline';
            this.deletebutton.style.display = 'inline';
        } else {
            if (this.toolboxel) {
                this.toolboxel.className = this.plainclass;
            };
            this.input.value = '';
            this.updatebutton.style.display = 'none';
            this.deletebutton.style.display = 'none';
            this.addbutton.style.display = 'inline';
        };
    };

    this.createContextMenuElements = function(selNode, event) {
        var indexel = this.editor.getNearestParentOfType(selNode, 'A');
        if (indexel && !indexel.getAttribute('href')) {
            return new Array(new ContextMenuElement('Delete index', this.deleteIndex, this));
        } else {
            return new Array();
        };
    };
};

SilvaIndexTool.prototype = new KupuTool;

function SilvaTocTool(depthselectid, addbuttonid, delbuttonid, toolboxid, plainclass, activeclass) {
    this.depthselect = document.getElementById(depthselectid);
    this.addbutton = document.getElementById(addbuttonid);
    this.delbutton = document.getElementById(delbuttonid);
    this.toolbox = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;
    this._inside_toc = false;

    this.initialize = function(editor) {
        this.editor = editor;
        addEventHandler(this.addbutton, 'click', this.addOrUpdateToc, this);
        addEventHandler(this.depthselect, 'change', this.updateToc, this);
        addEventHandler(this.delbutton, 'click', this.deleteToc, this);
        addEventHandler(editor.getInnerDocument(), 'keyup', this.handleKeyPressOnToc, this);
    };

    this.handleKeyPressOnToc = function(event) {
        if (!this._inside_toc) {
            return;
        };
        var keyCode = event.keyCode;
        if (keyCode == 8 || keyCode == 46) {
            var selNode = this.editor.getSelectedNode();
            var toc = this.getNearestToc(selNode);
            toc.parentNode.removeChild(toc);
        };
        if (keyCode == 13) {
            var selNode = this.editor.getSelectedNode();
            var toc = this.getNearestToc(selNode);
            var doc = this.editor.getInnerDocument();
            var selection = this.editor.getSelection();
            if (toc.nextSibling) {
                var sibling = toc.nextSibling;
                selection.selectNodeContents(toc.nextSibling);
                selection.collapse();
            } else {
                var parent = toc.parentNode;
                var p = doc.createElement('p');
                parent.appendChild(p);
                var text = doc.createTextNode('\xa0');
                p.appendChild(text);
                selection.selectNodeContents(p);
            };
        };
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        };
    };

    this.updateState = function(selNode, event) {
        var toc = this.getNearestToc(selNode);
        if (toc) {
            var depth = toc.getAttribute('toc_depth');
            selectSelectItem(this.depthselect, depth);
            this.addbutton.style.display = 'none';
            this.delbutton.style.display = 'inline';
            this._inside_toc = true;
            if (this.toolbox) {
                this.toolbox.className = this.activeclass;
            };
        } else {
            this.depthselect.selectedIndex = 0;
            this.delbutton.style.display = 'none';
            this.addbutton.style.display = 'inline';
            this._inside_toc = false;
            if (this.toolbox) {
                this.toolbox.className = this.plainclass;
            };
        };
    };

    this.addOrUpdateToc = function(event, depth) {
        var selNode = this.editor.getSelectedNode();
        var depth = depth ? depth : this.depthselect.options[this.depthselect.selectedIndex].value;
        var toc = this.getNearestToc(selNode);
        var doc = this.editor.getInnerDocument();
        var toctext = this.getTocText(depth);
        if (toc) {
            // there's already a toc, just update the depth
            toc.setAttribute('toc_depth', depth);
            while (toc.hasChildNodes()) {
                toc.removeChild(toc.firstChild);
            };
            toc.appendChild(doc.createTextNode(toctext));
        } else {
            // create a new toc
            var div = doc.createElement('div');
            div.setAttribute('toc_depth', depth);
            div.setAttribute('is_toc', 1);
            div.className = 'toc';
            var text = doc.createTextNode(toctext);
            div.appendChild(text);
            this.editor.insertNodeAtSelection(div);
        };
    };

    this.createDefaultToc = function() {
        // XXX nasty workaround, entering null as the event...
        this.addOrUpdateToc(null, '-1');
    };

    this.updateToc = function() {
        var selNode = this.editor.getSelectedNode();
        var toc = this.getNearestToc(selNode);
        if (toc) {
            var depth = this.depthselect.options[this.depthselect.selectedIndex].value;
            var toctext = this.getTocText(depth);
            toc.setAttribute('toc_depth', depth);
            while (toc.hasChildNodes()) {
                toc.removeChild(toc.firstChild);
            };
            doc = this.editor.getInnerDocument();
            toc.appendChild(doc.createTextNode(toctext));
        };
    };

    this.deleteToc = function() {
        var selNode = this.editor.getSelectedNode();
        var toc = this.getNearestToc(selNode);
        if (!toc) {
            this.editor.logMessage('Not inside a toc!', 1);
            return;
        };
        toc.parentNode.removeChild(toc);
    };
    
    this.getNearestToc = function(selNode) {
        var currnode = selNode;
        while (currnode) {
            if (currnode.nodeName.toLowerCase() == 'div' &&
                    currnode.getAttribute('is_toc')) {
                return currnode;
            };
            currnode = currnode.parentNode;
        };
        return false;
    };
    
    this.createContextMenuElements = function(selNode, event) {
        /* create the 'Delete TOC' menu elements */
        var ret = new Array();
        if (this.getNearestToc(selNode)) {
            ret.push(new ContextMenuElement('Delete TOC', this.deleteToc, this));
        } else {
            ret.push(new ContextMenuElement('Create TOC', this.createDefaultToc, this));
        };
        return ret;
    };

    this.getTocText = function(depth) {
        var toctext = 'Table of Contents ';
        switch (depth) {
            case '-1':
                toctext += '(unlimited levels)';
                break;
            case '1':
                toctext += '(1 level)';
                break;
            default:
                toctext += '(' + depth + ' levels)';
                break;
        };
        return toctext;
    };
};

SilvaTocTool.prototype = new KupuTool;

function SilvaCitationTool(authorinputid, sourceinputid, addbuttonid, updatebuttonid, delbuttonid, 
                            toolboxid, plainclass, activeclass) {
    /* tool to manage citation elements */
    this.authorinput = document.getElementById(authorinputid);
    this.sourceinput = document.getElementById(sourceinputid);
    this.addbutton = document.getElementById(addbuttonid);
    this.updatebutton = document.getElementById(updatebuttonid);
    this.delbutton = document.getElementById(delbuttonid);
    this.toolbox = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;
    this._inside_citation = false;
    
    this.initialize = function(editor) {
        this.editor = editor;
        addEventHandler(this.addbutton, 'click', this.addCitation, this);
        addEventHandler(this.updatebutton, 'click', this.updateCitation, this);
        addEventHandler(this.delbutton, 'click', this.deleteCitation, this);
        addEventHandler(editor.getInnerDocument(), 'keypress', this.handleKeyPressOnCitation, this);
        addEventHandler(editor.getInnerDocument(), 'keyup', this.cancelEnterPress, this);
        
        this.updatebutton.style.display = 'none';
        this.delbutton.style.display = 'none';
    };

    this.cancelEnterPress = function(event) {
        if (!this._inside_citation || event.keyCode != 13) {
            return;
        };
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        };
    };

    this.handleKeyPressOnCitation = function(event) {
        var keyCode = event.keyCode;
        if (!this._inside_citation || keyCode != 13 || this.editor.getBrowserName() != 'IE') {
            return;
        };
        var citation = this.getNearestCitation();
        var doc = this.editor.getInnerDocument();
        var br = doc.createElement('br');
        var selection = this.editor.getSelection();
        var currnode = selection.getSelectedNode();
        selection.replaceWithNode(br);
        selection.selectNodeContents(br);
        selection.collapse(true);
        event.returnValue = false;
    };

    this.updateState = function(selNode, event) {
        var citation = this.getNearestCitation(selNode);
        if (citation) {
            this.addbutton.style.display = 'none';
            this.updatebutton.style.display = 'inline';
            this.delbutton.style.display = 'inline';
            this.authorinput.value = citation.getAttribute('author');
            this.sourceinput.value = citation.getAttribute('source');
            this._inside_citation = true;
        } else {
            this.addbutton.style.display = 'inline';
            this.updatebutton.style.display = 'none';
            this.delbutton.style.display = 'none';
            this.authorinput.value = '';
            this.sourceinput.value = '';
            this._inside_citation = false;
        };
    };

    this.addCitation = function() {
        var selNode = this.editor.getSelectedNode();
        var citation = this.getNearestCitation(selNode);
        if (citation) {
            this.editor.logMessage('Nested citations are not allowed!');
            return;
        };
        var author = this.authorinput.value;
        var source = this.sourceinput.value;
        var doc = this.editor.getInnerDocument();
        var div = doc.createElement('div');
        div.className = 'citation';
        div.setAttribute('author', author);
        div.setAttribute('source', source);
        div.setAttribute('is_citation', '1');
        var selection = this.editor.getSelection();
        var docfrag = selection.cloneContents();
        var placecursoratend = false;
        if (docfrag.hasChildNodes()) {
            for (var i=0; i < docfrag.childNodes.length; i++) {
                div.appendChild(docfrag.childNodes[i]);
            };
            placecursoratend = true;
        } else {
            var text = doc.createTextNode('\xa0');
            div.appendChild(text);
        };
        this.editor.insertNodeAtSelection(div, 1);
        var selection = this.editor.getSelection();
        selection.collapse(placecursoratend);
        this.editor.getDocument().getWindow().focus();
        var selNode = selection.getSelectedNode();
        this.editor.updateState(selNode);
    };

    this.updateCitation = function() {
        var selNode = this.editor.getSelectedNode();
        var citation = this.getNearestCitation(selNode);
        if (!citation) {
            this.editor.logMessage('Not inside a citation element!');
            return;
        };
        citation.setAttribute('author', this.authorinput.value);
        citation.setAttribute('source', this.sourceinput.value);
    };

    this.deleteCitation = function() {
        var selNode = this.editor.getSelectedNode();
        var citation = this.getNearestCitation(selNode);
        if (!citation) {
            this.editor.logMessage('Not inside citation element!');
            return;
        };
        citation.parentNode.removeChild(citation);
    };

    this.getNearestCitation = function(selNode) {
        var currnode = selNode;
        while (currnode) {
            if (currnode.nodeName.toLowerCase() == 'div' &&
                    currnode.getAttribute('is_citation')) {
                return currnode;
            };
            currnode = currnode.parentNode;
        };
        return false;
    };
    
    this.createContextMenuElements = function(selNode, event) {
        /* create the 'Delete citation' menu elements */
        var ret = new Array();
        if (this.getNearestCitation(selNode)) {
            ret.push(new ContextMenuElement('Delete cite', this.deleteCitation, this));
        };
        return ret;
    };
};

SilvaCitationTool.prototype = new KupuTool;

function SilvaExternalSourceTool(idselectid, formcontainerid, addbuttonid, cancelbuttonid,
                                    updatebuttonid, delbuttonid, toolboxid, plainclass, activeclass) {
    this.idselect = document.getElementById(idselectid);
    this.formcontainer = document.getElementById(formcontainerid);
    this.addbutton = document.getElementById(addbuttonid);
    this.cancelbutton = document.getElementById(cancelbuttonid);
    this.updatebutton = document.getElementById(updatebuttonid);
    this.delbutton = document.getElementById(delbuttonid);
    this.toolbox = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;

    this._editing = false;
    this._url = null;
    this._id = null;
    this._form = null;
    this._insideExternalSource = false;

    // store the base url, this will be prepended to the id to form the url to
    // get the codesource from (Zope's acquisition will make sure it ends up on
    // the right object)
    var urlparts = document.location.toString().split('/')
    this._baseurl = urlparts.slice(0, urlparts.length - 2).join('/');

    this.initialize = function(editor) {
        this.editor = editor;
        addEventHandler(this.addbutton, 'click', this.startExternalSourceAddEdit, this);
        addEventHandler(this.cancelbutton, 'click', this.resetTool, this);
        addEventHandler(this.updatebutton, 'click', this.startExternalSourceAddEdit, this);
        addEventHandler(this.delbutton, 'click', this.delExternalSource, this);
        addEventHandler(editor.getInnerDocument(), 'keypress', this.handleKeyPressOnExternalSource, this);
        
        this.updatebutton.style.display = 'none';
        this.delbutton.style.display = 'none';
        this.cancelbutton.style.display = 'none';
    };

    this.updateState = function(selNode) {
        var extsource = this.getNearestExternalSource(selNode);
        if (extsource) {
            this._insideExternalSource = true;
            selectSelectItem(this.idselect, extsource.getAttribute('source_id'));
            this.startExternalSourceUpdate(extsource);
        } else {
            this._insideExternalSource = false;
            this.resetTool();
        };
    };

    this.handleKeyPressOnExternalSource = function(event) {
        if (!this._insideExternalSource) {
            return;
        };
        if (event.keyCode == 13) {
            var selNode = this.editor.getSelectedNode();
            var div = this.getNearestExternalSource(selNode);
            if (div.nextSibling) {
                var selection = this.editor.getSelection();
                selection.selectNodeContents(div.nextSibling);
                selection.collapse();
            } else {
                var doc = this.editor.getInnerDocument();
                var p = doc.createElement('p');
                var nbsp = doc.createTextNode('\xa0');
                p.appendChild(nbsp);
                div.parentNode.appendChild(p);
                var selection = this.editor.getSelection();
                selection.selectNodeContents(p);
                selection.collapse();
            };
        };
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        };
    };

    this.startExternalSourceAddEdit = function() {
        // get the appropriate form and display it
        if (!this._editing) {
            var id = this.idselect.options[this.idselect.selectedIndex].value;
            this._id = id;
            var url = this._baseurl + '/' + id;
            this._url = url;
            url = url + '/get_rendered_form_for_editor';
            var request = Sarissa.getXmlHttpRequest();
            request.open('GET', url, true);
            var callback = new ContextFixer(this._addFormToTool, request, this);
            request.onreadystatechange = callback.execute;
            request.send(null);
            while (this.formcontainer.hasChildNodes()) {
                this.formcontainer.removeChild(this.formcontainer.firstChild);
            };
            var text = document.createTextNode('Loading...');
            this.formcontainer.appendChild(text);
            this.updatebutton.style.display = 'none';
            this.cancelbutton.style.display = 'inline';
            this.addbutton.style.display = 'inline';
            this._editing = true;
        } else {
            // validate the data and take further actions
            var formdata = this._gatherFormData();
            var doc = window.document;
            var request = Sarissa.getXmlHttpRequest();
            request.open('POST', this._url + '/validate_form_to_request', true);
            var callback = new ContextFixer(this._addExternalSourceIfValidated, request, this);
            request.onreadystatechange = callback.execute;
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setRequestHeader('Content-Length:', formdata.length);
            request.send(formdata);
        };
    };

    this.startExternalSourceUpdate = function(extsource) {
        this._id = extsource.getAttribute('source_id');
        this._url = this._baseurl + '/' + this._id;
        url = this._url + '/get_rendered_form_for_editor';
        var formdata = this._gatherFormDataFromElement();
        var request = Sarissa.getXmlHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('Content-Length:', formdata.length);
        var callback = new ContextFixer(this._addFormToTool, request, this);
        request.onreadystatechange = callback.execute;
        request.send(formdata);
        this._editing = true;
        while (this.formcontainer.hasChildNodes()) {
            this.formcontainer.removeChild(this.formcontainer.firstChild);
        };
        var text = document.createTextNode('Loading...');
        this.formcontainer.appendChild(text);
        this.addbutton.style.display = 'none';
        this.cancelbutton.style.display = 'none';
        this.updatebutton.style.display = 'inline';
        this.delbutton.style.display = 'inline';
    };

    this._addFormToTool = function(object) {
        if (this.readyState == 4) {
            while (object.formcontainer.hasChildNodes()) {
                object.formcontainer.removeChild(object.formcontainer.firstChild);
            };
            // XXX Somehow appending the XML to the form using DOM doesn't 
            // work correctly, it looks like the elements aren't HTMLElements 
            // but XML elements, don't know how to fix now so I'll use string 
            // insertion for now, needless to say it should be changed to DOM
            // manipulation asap...
            // XXX why is this.responseXML.documentElement.xml sometimes 'undefined'?
            object.formcontainer.innerHTML = this.responseText;
            object.idselect.style.display = 'none';
            // the formcontainer will contain a table with a form
            var form = null;
            var iterator = new NodeIterator(object.formcontainer);
            while (form == null) {
                var next = iterator.next();
                if (next.nodeName.toLowerCase() == 'form') {
                    form = next;
                };
            };
            object._form = form;
        };
    };

    this._addExternalSourceIfValidated = function(object) {
        if (this.readyState == 4) {
            if (this.status == '200') {
                // success, add the external source element to the document
                var selNode = object.editor.getSelectedNode();
                var currsource = object.getNearestExternalSource(selNode);
                var doc = object.editor.getInnerDocument();
                
                var extsource = doc.createElement('div');
                extsource.setAttribute('source_id', object._id);
                var header = doc.createElement('h3');
                var htext = doc.createTextNode('External Source "' + object._id + '"');
                header.appendChild(htext);
                extsource.appendChild(header);
                extsource.className = 'externalsource';
                for (var i=0; i < this.responseXML.documentElement.childNodes.length; i++) {
                    var child = this.responseXML.documentElement.childNodes[i];
                    if (child.nodeName.toLowerCase() == 'parameter') {
                        var key = child.getAttribute('key');
                        var value = '';
                        for (var j=0; j < child.childNodes.length; j++) {
                            value += child.childNodes[j].nodeValue;
                        };
                        extsource.setAttribute(key, value);
                        var div = doc.createElement('div');
                        var textel = doc.createTextNode('Key: ' + key + ', value: ' + value.toString());
                        div.appendChild(textel);
                        extsource.appendChild(div);
                    };
                };
                extsource.appendChild(doc.createElement('br'));
                if (!currsource) {
                    object.editor.insertNodeAtSelection(extsource);
                } else {
                    currsource.parentNode.replaceChild(extsource, currsource);
                    var selection = object.editor.getSelection();
                    selection.selectNodeContents(extsource);
                    selection.collapse(true);
                };
                object.resetTool();
                object.editor.updateState();
            } else if (this.status == '400') {
                // failure, provide some feedback and return to the form
                alert('Form could not be validated, error message: ' + this.responseText);
            } else {
                alert('POST failed with unhandled status ' + this.status);
                throw('Error handling POST, server returned ' + this.status + ' HTTP status code');
            };
        };
    };

    this.delExternalSource = function() {
        var selNode = this.editor.getSelectedNode();
        var source = this.getNearestExternalSource(selNode);
        if (!source) {
            this.editor.logMessage('Not inside external source!', 1);
            return;
        };
        var nextsibling = source.nextSibling;
        source.parentNode.removeChild(source);
        if (nextsibling) {
            var selection = this.editor.getSelection();
            selection.selectNodeContents(nextsibling);
            selection.collapse();
        };
    };

    this.resetTool = function() {
        while (this.formcontainer.hasChildNodes()) {
            this.formcontainer.removeChild(this.formcontainer.firstChild);
        };
        this.idselect.style.display = 'inline';
        this.addbutton.style.display = 'inline';
        this.cancelbutton.style.display = 'none';
        this.cancelbutton.style.display = 'none';
        this.delbutton.style.display = 'none';
        //this.editor.updateState();
        this._editing = false;
    };

    this._gatherFormData = function() {
        /* walks through the form and creates a POST body */
        // XXX we may want to turn this into a helper function, since it's 
        // quite useful outside of this object I reckon
        var form = this._form;
        if (!form) {
            this.editor.logMessage('Not currently editing');
            return;
        };
        // first place all data into a dict, convert to a string later on
        var data = {};
        for (var i=0; i < form.elements.length; i++) {
            var child = form.elements[i];
            var elname = child.nodeName.toLowerCase();
            if (elname == 'input') {
                var name = child.getAttribute('name');
                var type = child.getAttribute('type');
                if (!type || type == 'text' || type == 'hidden' || type == 'password') {
                    data[name] = child.value;
                } else if (type == 'checkbox' || type == 'radio') {
                    if (child.checked) {
                        if (data[name]) {
                            if (typeof data[name] == typeof('')) {
                                var value = new Array(data[name]);
                                value.push(child.value);
                                data[name] = value;
                            } else {
                                data[name].push(child.value);
                            };
                        } else {
                            data[name] = value;
                        };
                    };
                };
            } else if (elname == 'textarea') {
                data[child.getAttribute('name')] = child.value;
            } else if (elname == 'select') {
                var name = child.getAttribute('name');
                var multiple = child.getAttribute('multiple');
                if (!multiple) {
                    data[name] = child.options[child.selectedIndex].value;
                } else {
                    var value = new Array();
                    for (var i=0; i < child.options.length; i++) {
                        if (child.options[i].checked) {
                            value.push(options[i].value);
                        };
                        if (value.length > 1) {
                            data[name] = value;
                        } else if (value.length) {
                            data[name] = value[0];
                        };
                    };
                };
            };
        };
        
        // now we should turn it into a query string
        var ret = new Array();
        for (var key in data) {
            var value = data[key];
            // XXX does IE5 support encodeURIComponent?
            ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        };
        
        return ret.join("&");
    };

    this._gatherFormDataFromElement = function() {
        var selNode = this.editor.getSelectedNode();
        var source = this.getNearestExternalSource(selNode);
        if (!source) {
            return '';
        };
        var ret = new Array();
        for (var i=0; i < source.attributes.length; i++) {
            var attr = source.attributes[i];
            var name = attr.nodeName;
            var value = attr.nodeValue;
            if (name != 'class' && name != 'source_id' && name != 'id') {
                ret.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
            };
        };
        return ret.join('&');
    };

    this.getNearestExternalSource = function(selNode) {
    
        var currnode = selNode;
        while (currnode) {
            if (currnode.nodeName.toLowerCase() == 'div' && currnode.className == 'externalsource') {
                return currnode;
            };
            currnode = currnode.parentNode;
        };
    };
};

SilvaExternalSourceTool.prototype = new KupuTool;

function SilvaKupuUI(textstyleselectid) {
    this.tsselect = document.getElementById(textstyleselectid);

    this.updateState = function(selNode) {
        /* set the text-style pulldown */

        // first get the nearest style
        var styles = {}; // use an object here so we can use the 'in' operator later on
        for (var i=0; i < this.tsselect.options.length; i++) {
            // XXX we should cache this
            styles[this.tsselect.options[i].value] = i;
        }
        
        // search the list of nodes like in the original one, break if we encounter a match,
        // this method does some more than the original one since it can handle commands in
        // the form of '<style>|<classname>' next to the plain '<style>' commands
        var currnode = selNode;
        var index = -1;
        while (index==-1 && currnode) {
            var nodename = currnode.nodeName.toLowerCase();
            for (var style in styles) {
                if (style.indexOf('|') < 0) {
                    // simple command
                    if (nodename == style.toLowerCase() && !currnode.className) {
                        index = styles[style];
                        break;
                    };
                } else {
                    // command + classname
                    var tuple = style.split('|');
                    if (nodename == tuple[0].toLowerCase() && currnode.className == tuple[1]) {
                        index = styles[style];
                        break;
                    };
                };
            };
            currnode = currnode.parentNode;
        }
        this.tsselect.selectedIndex = Math.max(index,0);
    };
  
    this.setTextStyle = function(style) {
        /* parse the argument into a type and classname part
        
            generate a block element accordingly 
        */
        var classname = "";
        var eltype = style;
        if (style.indexOf('|') > -1) {
            style = style.split('|');
            eltype = style[0];
            classname = style[1];
        };

        var command = eltype;
        // first create the element, then find it and set the classname
        if (this.editor.getBrowserName() == 'IE') {
            command = '<' + eltype + '>';
        };
        this.editor.getDocument().execCommand('formatblock', command);

        // now get a reference to the element just added
        var selNode = this.editor.getSelectedNode();
        var el = this.editor.getNearestParentOfType(selNode, eltype);

        // now set the classname
        if (classname) {
            el.className = classname;
            el.setAttribute('silva_type', classname);
        };
        this.editor.updateState();
    };
};

SilvaKupuUI.prototype = new KupuUI;
