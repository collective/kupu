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

function PloneKupuUI(textstyleselectid) {
    this.tsselect = document.getElementById(textstyleselectid);

    this.updateState = function(selNode) {
        /* set the text-style pulldown */

        // first get the nearest style
        var styles = {}; // use an object here so we can use the 'in' operator later on
        for (var i=0; i < this.tsselect.options.length; i++) {
            // XXX we should cache this
            styles[this.tsselect.options[i].value] = i;
        };
        
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
                    if (nodename == tuple[0].toLowerCase() &&
                        currnode.className == tuple[1]) {
                        index = styles[style];
                        break;
                    };
                };
            };
            currnode = currnode.parentNode;
        };
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
        el.className = classname;
        this.editor.updateState();
    };
};

PloneKupuUI.prototype = new KupuUI;
