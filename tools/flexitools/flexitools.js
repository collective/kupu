/*****************************************************************************
 *
 * Copyright (c) 2004 Tomas Hnilica, tomas.hnilica@webstep.net. 
 * All rights reserved.
 *
 * Tool for KUPU, allows making only parts of a document editable, 
 * all elements that don't contain an attribute "editable" with 
 * a value "yes" will refuse keystrokes. 
 * 
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt in the Kupu package.
 *
 *****************************************************************************/


function fxWritable() {
    
    this.fxWritable_status = false;
    
    this.initialize = function(editor) {
        /* initialize the tool */
        var doc = editor.getInnerDocument();
        this.editor = editor; 
        /* set event onKeyPress, onKeyDown */
        addEventHandler(doc, 'keydown', this.checkWrite, this);

        if (editor.getBrowserName() == 'Mozilla') {
            addEventHandler(doc, 'keypress', this.checkWrite, this);
        };
    };
   
    this.checkWrite = function(ev) {
        /* check if editing is allowed, prevent event if not */
        if (this.fxWritable_status) {
            return true;
        } else {
            if (ev.preventDefault) {
                ev.preventDefault();
            }else{
                ev.returnValue = false;
            };
        };
    };
       
    this.updateState = function(selNode, event) {
        /* evaluate if we are in editable area */
        this.fxWritable_status = false;
        var currnode = selNode;
        while (currnode.nodeName != '#document' && 
                this.fxWritable_status == false) {
            if (currnode.nodeType == 1 &&
                    currnode.getAttribute("editable")=="yes") {
                this.fxWritable_status = true;
                this.editor._initialized = true;
                break;
            };
            currnode = currnode.parentNode;
        };
        this.editor._initialized = false;
    };
};

fxWritable.prototype = new KupuTool;
