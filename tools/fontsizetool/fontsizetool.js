/*****************************************************************************
 *
 * Copyright (c) 2004 Tomas Hnilica, tomas.hnilica@webstep.net. 
 * All rights reserved.
 *
 * Tool for KUPU, allows set Font-family and Font-size of a part
 *
 * init: fontselectid: ID of the SELECT element containing fonts
 *	 sizeselectid: ID of the SELECT element containing sizes
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/


/*
This Tool allows change font and size of the text

init:
     var sui = new KupuStyleUI('kupu-font-styles','kupu-size-styles'); 
     kupu.registerTool('sui', sui); 

code in the form:
	  <select id="kupu-font-styles">
              <option value="" >Font</option>
			<option value="Andale Mono" >Andale Mono</option>
            </select>

            <select id="kupu-size-styles">
              <option value="" >Size</option>
              <option value="1" >1</option>
              <option value="9">9</option>
            </select>

*/


function KupuStyleUI(fontselectid,sizeselectid) {
   
    
    // attributes
    this.fontselect = document.getElementById(fontselectid);
    this.sizeselect = document.getElementById(sizeselectid);
    
   
    this.initialize = function(editor) {
        /* initialize the ui like tools */
        this.editor = editor;
        addEventHandler(this.fontselect, 'change', this.setFontHandler, this);
        addEventHandler(this.sizeselect, 'change', this.setSizeHandler, this);
    };

    this.setFontHandler = function(event) {
        var font = this.fontselect.options[this.fontselect.selectedIndex].value;
        if (font != "" ) this.editor.execCommand('FontName', font);
        // reset the select after selection
        this.fontselect.selectedIndex = 0;
    };
    
    this.setSizeHandler = function(event) {
        var size = this.sizeselect.options[this.sizeselect.selectedIndex].value;
        if (size != "" ) this.editor.execCommand('FontSize', size);
        // reset the select after selection
        this.sizeselect.selectedIndex = 0;
    };


    this.updateState = function(selNode) {
       
    };
  
    this.createContextMenuElements = function(selNode, event) {
        var ret = new Array();
        return ret;
    };
}

KupuStyleUI.prototype = new KupuTool;

