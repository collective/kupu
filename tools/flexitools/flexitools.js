/*****************************************************************************
 *
 * Copyright (c) 2004 Tomas Hnilica,  tomas.hnilica@webstep.net. 
 * All rights reserved.
 *
 * Tool for KUPU, allows edit only parts of document, which are in the
 * DIV elements that containts attribute "editable" with value "yes". 
 * 
 * init: iframe is the edited iframe element
 *
 * The tool works fine in IE5.5+, cannot protect typing in mozilla based 
 * browsers (there is a bug on keydown event). 
 *
 *****************************************************************************/


function fxWritable(iframe) {
	
    this.editable = false;
    var fxWritable_status = false;
    var fxWritable_MOZ_WARN = false;    
    
     this.initialize = function(editor) {
        /* initialize the tool */
      var doc = editor.getInnerDocument();
      this.editable = false;
     
     /* set event onKeyPress, onKeyDown */
     if (_SARISSA_IS_IE) doc.onkeydown = this.checkWrite;
     if (_SARISSA_IS_MOZ) {
     		doc.addEventListener('keydown',this.checkWrite, true);
     		doc.captureEvents(Event.KEYPRESS);
     		doc.onkeypress = this.checkWrite;
	}
   };
   
   this.checkWrite = function(ev) {
   	if (!fxWritable_MOZ_WARN) {alert('Content outside the areas can not be modified.');fxWritable_MOZ_WARN = true;}
   	if (fxWritable_status) return true;
	else return false;
   };
    
   this.updateState = function(selNode, event) {
            /* evaluate if we are in editable area */
           fxWritable_status = false;
            var currnode = selNode;
            while (currnode.nodeName != '#document' && fxWritable_status == false) {
            	if (currnode.nodeName.toLowerCase()=="div" && currnode.getAttribute("editable")=="yes") fxWritable_status = true;
                currnode = currnode.parentNode;
            };
        };

};

fxWritable.prototype = new KupuTool;
