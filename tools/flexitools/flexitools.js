/*****************************************************************************
 *
 * Copyright (c) 2004 Tomas Hnilica, tomas.hnilica@webstep.net. 
 * All rights reserved.
 *
 * Tool for KUPU, allows edit only parts of document, which are in the
 * DIV elements that containts attribute "editable" with value "yes". 
 * 
 * init: iframe is the edited iframe element
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/


function fxWritable() {
    """Tool to make only certain parts of the iframe editable"""
    
    this.fxWritable_status = false;
    this.fxWritable_MOZ_WARN = false;    
    
    this.initialize = function(editor) {
        /* initialize the tool */
        var doc = editor.getInnerDocument();
     
        /* set event onKeyPress, onKeyDown */
        addEventHandler(doc, 'keydown', this.checkWrite, this);
        if (editor.getBrowserName() == 'Mozilla') {
            addEventHandler(doc, 'keypress', this.checkWrite, this);
        };
    };
   
    this.checkWrite = function(ev) {
        if (!this.fxWritable_MOZ_WARN) {
            // commented this out because event.preventDefault() should make
            // that the user can't even edit anymore
            // alert('Content outside the areas can not be modified.');
            this.fxWritable_MOZ_WARN = true;
        };
        if (this.fxWritable_status) {
            return true;
        } else {
            if (ev.preventDefault) {
                ev.preventDefault();
            };
            return false;
        };
    };
    
    this.updateState = function(selNode, event) {
        /* evaluate if we are in editable area */
        this.fxWritable_status = false;
        var currnode = selNode;
        while (currnode.nodeName != '#document' && 
                this.fxWritable_status == false) {
            if (currnode.nodeName.toLowerCase()=="div" && 
                    currnode.getAttribute("editable")=="yes") {
                this.fxWritable_status = true;
            };
            currnode = currnode.parentNode;
        };
    };
};

fxWritable.prototype = new KupuTool;
