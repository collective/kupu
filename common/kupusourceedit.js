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


function SourceEditTool(sourcebuttonid, sourceareaid) {
    /* Source edit tool to edit document's html source */
    this.sourceButton = document.getElementById(sourcebuttonid);
    this.sourceArea = document.getElementById(sourceareaid);
    
    this.initialize = function(editor) {
        /* attach the event handlers */
        this.editor = editor;
        addEventHandler(this.sourceButton, "click", this.switchSourceEdit, this);
        this.editor.logMessage('Source edit tool initialized');
    };
 
    this.switchSourceEdit = function(event) {
        var kupu = this.editor;
        var editorframe = kupu.getDocument().getEditable();
        var sourcearea = this.sourceArea;
        var kupudoc = kupu.getInnerDocument();
    
        if (editorframe.style.display != 'none') {
            if (kupu.getBrowserName() == 'Mozilla') {
                kupudoc.designMode = 'Off';
            };
            kupu._initialized = false;
            var data = kupu.getInnerDocument().documentElement.getElementsByTagName('body')[0].innerHTML;
            sourcearea.value = data;
            editorframe.style.display = 'none';
            sourcearea.style.display = 'block';
          } else {
            var data = sourcearea.value;
            kupu.getInnerDocument().documentElement.getElementsByTagName('body')[0].innerHTML = data;
            sourcearea.style.display = 'none';
            editorframe.style.display = 'block';
            if (kupu.getBrowserName() == 'Mozilla') {
                kupudoc.designMode = 'On';
            };
            kupu._initialized = true;
        };
     };
};

SourceEditTool.prototype = new KupuTool;

