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

function DrawerTool() {
    /* a tool to open and fill drawers

        this tool has to (and should!) only be instantiated once
    */
    this.drawers = {};
    this.current_drawer = null;
    
    this.initialize = function(editor) {
        this.editor = editor;
        // this essentially makes the drawertool a singleton
        window.drawertool = this;
    };

    this.registerDrawer = function(id, drawer) {
        this.drawers[id] = drawer;
        drawer.initialize(this.editor, this);
    };

    this.openDrawer = function(id) {
        /* open a drawer */
        if (this.current_drawer) {
            this.closeDrawer();
        };
        var drawer = this.drawers[id];
        drawer.createContent();
        this.current_drawer = drawer;
    };

    this.updateState = function(selNode) {
        if (this.current_drawer) {
            this.closeDrawer();
        };
    };

    this.closeDrawer = function() {
        if (!this.current_drawer) {
            return;
        };
        this.current_drawer.hide();
        this.current_drawer = null;
    };

    this.getDrawerEnv = function(iframe_win) {
        var drawer = null;
	for (var id in this.drawers) {
	    var ldrawer = this.drawers[id];
	    // Note that we require drawers to provide us with an
	    // element property!
	    if (ldrawer.element.contentWindow == iframe_win) {
	        drawer = ldrawer;
            };
	};
	if (!drawer) {
	    this.editor.logMessage("Drawer not found", 1);
	    return;
	};
	return {
	    'drawer': drawer,
	    'drawertool': this,
	    'tool': drawer.tool
	};
    };
};

DrawerTool.prototype = new KupuTool;

function Drawer(iframeid, tool) {
    /* base prototype for drawers */

    this.element = document.getElementById(iframeid);
    this.tool = tool;
    
    this.initialize = function(editor, drawertool) {
        this.editor = editor;
        this.drawertool = drawertool;
    };
    
    this.createContent = function() {
        /* fill the drawer with some content */
        // here's where any intelligence and XSLT transformation and such 
        // is done
        this.element.style.display = 'block';
    };

    this.hide = function() {
        this.element.style.display = 'none';
    };
};

// XXX needs to be re-implemented, probably using a base prototype and
// two separate drawers, TableAddDrawer and TableEditDrawer.
function TableDrawer(addiframeid, editiframeid, tool) {
    this.addelement = document.getElementById(addiframeid);
    this.editelement = document.getElementById(editiframeid);
    this.tool = tool;

    this.createContent = function() {
        var selNode = this.editor.getSelectedNode();
        var table = this.editor.getNearestParentOfType(selNode, 'table');

        if (!table) {
            // show add table drawer
            element = this.addelement;
            hideelement = this.editelement;
        } else {
            // show edit table drawer
            element = this.editelement;
            hideelement = this.addelement;
        };
        hideelement.style.display = 'none';
        element.style.display = 'block';
    };

    this.hide = function() {
        this.addelement.style.display = 'none';
        this.editelement.style.display = 'none';
    };
};

TableDrawer.prototype = new Drawer;
