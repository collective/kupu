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

function JumpLinkTool() {

    this.initialize = function(editor) {
        this.editor = editor;
        this.editor.logMessage('Jumplink tool initialized');
    };

    this.updateState = function(selNode, event) {
    };

    this.createContextMenuElements = function(selNode, event) {
        var ret = new Array();
        ret.push(new ContextMenuElement('Insert ToC', this.insertJumplinks, this));
        return ret;
    };

    this.removeDivNodes = function() {
        var doc = this.editor.getInnerDocument();
        var nodes = doc.getElementsByTagName("DIV");

        for (var j = nodes.length-1; j >= 0; j--) {
            var node = nodes[j];
            var classname=node.className; // node.getAttribute("class") for Mozilla?
            if (classname=="jumpLinkTable" || classname=="backToTop") {
                node.parentNode.removeChild(node);
            };
        };
    };

    this.removeJumplinks = function() {
        this.removeDivNodes();
    };

    this.insertJumplinks = function() {
        // First thing is we must strip out previously generated
        // jumplinks
        this.removeJumplinks();
        
        var doc = this.editor.getInnerDocument();
        var jumptable = doc.createElement("div");
        jumptable.setAttribute("class", "jumpLinkTable");

        var headings = doc.getElementsByTagName("h3");
        // For each heading/subheading in the document
        // Insert it into the jumptable.
        for (var i = 0; i < headings.length; i++) {
            var entrydiv = doc.createElement("div");
            var entry = doc.createElement("a");
            var caption;
            if (_SARISSA_IS_IE) {
                caption = headings[i].innerText;
            } else {
                caption = headings[i].textContent;
                alert("caption="+caption);
            }
            
            entry.setAttribute("href", "#section"+(i+1));
            entry.setAttribute("title", caption);
            entry.appendChild(doc.createTextNode(caption));
            entrydiv.appendChild(entry);
            jumptable.appendChild(entrydiv);

            // Insert a jump target into the relevant heading.
            // Insert a 'back to top' div before the heading
            var backtotop = doc.createElement("div");
            backtotop.setAttribute("class", "backToTop");
            var link = doc.createElement("a");
            link.setAttribute("href", "#");
            link.setAttribute("name", "section"+(i+1));
            link.appendChild(doc.createTextNode("Back to top"));
            backtotop.appendChild(link);
            headings[i].parentNode.insertBefore(backtotop, headings[i]);
        }
        this.editor.insertNodeAtSelection(jumptable);
        this.editor.logMessage("Jump table added");
    };
};

// override LinkDrawer.save so all links have a _self target
LinkDrawer.prototype.save = function() {
    /* add or modify a link */
    var input = document.getElementById('kupu-linkdrawer-input');
    var url = input.value;
    var currnode = this.editor.getSelectedNode();
    var linkel = this.editor.getNearestParentOfType(currnode, 'a');
    if (linkel) {
        linkel.setAttribute('href', url);
    } else {
        this.tool.createLink(url, null, null, '_blank');
    };
    input.value = '';

    // XXX when reediting a link, the drawer does not close for
    // some weird reason. BUG! Close the drawer manually until we
    // find a fix:
    this.drawertool.closeDrawer();
};
