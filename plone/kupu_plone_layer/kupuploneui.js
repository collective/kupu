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
    
    function cleanStyles(options) {
        for (var i=0; i < options.length; i++) {
            var style = options[i].value;
            if (style.indexOf('|') > -1) {
                var split = style.split('|');
                style = split[0].toLowerCase() + "|" + split[1];
            };
            styles[style] = i;
        };
    }
    cleanStyles(this.tsselect.options);

    this.nodeStyle = function(node) {
        var currnode = node;
        var index = -1;
        var styles = this.styles;
        var options = this.tsselect.options;
        this.styletag = undefined;

        while (currnode) {
            if (currnode.nodeType==1) {
                var tag = currnode.tagName;
                if (tag=='BODY') {
                    if (!this.styletag) {
                        // Force style setting
                        this.setTextStyle(options[0].value, true);
                        return 0;
                    }
                    break;
                }
                tag = tag.toLowerCase();
                if (/p|div|h.|t.|ul|ol|dl|menu|dir|pre|blockquote|address|center/.test(tag)) {
                    var className = currnode.className;
                    this.styletag = tag;
                    var style = tag+'|'+className;
                    if (style in styles) {
                        index = styles[style];
                    } else if (!className && tag in styles) {
                        index = styles[tag];
                    }
                }
            }
            currnode = currnode.parentNode;
        }
        return index;
    }
    
    this.updateState = function(selNode) {
        /* set the text-style pulldown */

        // first get the nearest style
        // search the list of nodes like in the original one, break if we encounter a match,
        // this method does some more than the original one since it can handle commands in
        // the form of '<style>|<classname>' next to the plain
        // '<style>' commands
        var index = undefined;
        var mixed = false;

        var selection = this.editor.getSelection();
            
        for (var el=selNode.firstChild; el; el=el.nextSibling) {
            if (el.nodeType==1 && selection.containsNode(el)) {
                var i = this.nodeStyle(el);
                if (index===undefined)
                    index = i;
                if (index != i) {
                    mixed = true;
                    break;
                }
            }
        }

        if (index===undefined) {
            index = this.nodeStyle(selNode);
        }

        if (index < 0 || mixed) {
            if (!this.otherstyle) {
                var opt = document.createElement('option');
                this.tsselect.appendChild(opt);
                this.otherstyle = opt;
            }
            if (mixed) {
                this.otherstyle.text = 'Mixed styles';
            } else {
                this.otherstyle.text = 'Other: ' + this.styletag + ' '+ className;
            }
            index = this.tsselect.length-1;
        } else if (this.otherstyle) {
            this.tsselect.removeChild(this.otherstyle);
            this.otherstyle = null;
        }
        this.tsselect.selectedIndex = Math.max(index,0);
    };
  
    this.setTextStyle = function(style, noupdate) {
        /* parse the argument into a type and classname part
           generate a block element accordingly 
        */
        var classname = '';
        var eltype = style.toUpperCase();
        if (style.indexOf('|') > -1) {
            style = style.split('|');
            eltype = style[0].toUpperCase();
            classname = style[1];
        };

        function setClass(el) {
            var parent = el.parentNode;
            if (parent.tagName=='DIV' && parent.childNodes.length==1) {
            // fixup buggy formatting
                var gp = parent.parentNode;
                gp.insertBefore(el, parent);
                gp.removeChild(parent);
                this.editor.getSelection().selectNodeContents(el);
            }
            // now set the classname
            el.className = classname;
        }
        var command = eltype;
        // first create the element, then find it and set the classname
        if (this.editor.getBrowserName() == 'IE') {
            command = '<' + eltype + '>';
        };
        this.editor.getDocument().execCommand('formatblock', command);

        // now get a reference to the element just added
        var selNode = this.editor.getSelectedNode();
        var el = this.editor.getNearestParentOfType(selNode, eltype);
        if (el) {
            setClass(el);
        } else {
            var selection = this.editor.getSelection();
            for (el = selNode.firstChild; el; el=el.nextSibling) {
                if (el.tagName==eltype && selection.containsNode(el)) {
                    setClass(el);
                }
            }
        }
        if (!noupdate) {
            this.editor.updateState();
        }
    };
};

PloneKupuUI.prototype = new KupuUI;
