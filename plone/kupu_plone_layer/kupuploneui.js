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
    this.otherstyle = null;
    this.styles = {};
    var styles = this.styles; // use an object here so we can use the 'in' operator later on
    for (var i=0; i < this.tsselect.options.length; i++) {
        styles[this.tsselect.options[i].value] = i;
    };

    this.updateState = function(selNode) {
        /* set the text-style pulldown */

        // first get the nearest style
        // search the list of nodes like in the original one, break if we encounter a match,
        // this method does some more than the original one since it can handle commands in
        // the form of '<style>|<classname>' next to the plain '<style>' commands
        var currnode = selNode;
        if (selNode.firstChild) currnode = selNode.firstChild; // In case selNode is body.
        var index = -1;
        var styles = this.styles;
        var options = this.tsselect.options;

        while (currnode) {
            var tag = currnode.tagName;
            if (tag) tag = tag.toLowerCase();
            if (tag=='body') {
                if (!styletag) {
                    this.setTextStyle(options[0].value);
                    index = 0;
                }
                break;
            }
            if (/p|div|h.|t.|ul|ol|dl|menu|dir|pre|blockquote|address|center/.test(tag)) {
                var className = currnode.className;
                var styletag = tag;
                var style = tag+'|'+className;
                if (style in styles) {
                    index = styles[style];
                } else if (!className && tag in styles) {
                    index = styles[tag];
                }
            }
            currnode = currnode.parentNode;
        }

        if (index < 0) {
            if (!this.otherstyle) {
                var opt = document.createElement('option');
                this.tsselect.appendChild(opt);
                this.otherstyle = opt;
            }
            this.otherstyle.text = 'Other: ' + styletag + ' '+ className;
            index = this.tsselect.length-1;
        } else if (this.otherstyle) {
            this.tsselect.removeChild(this.otherstyle);
            this.otherstyle = null;
        }
        this.tsselect.selectedIndex = Math.max(index,0);
    };
  
    this.setTextStyle = function(style) {
        /* parse the argument into a type and classname part
        
            generate a block element accordingly 
        */
        var classname = '';
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
