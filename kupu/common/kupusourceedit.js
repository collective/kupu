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

function cleanupSource() {
    /* Called from toolbar button, convert vomit to filtered XHTML */

    var editorframe = document.getElementById('kupu-editor');
    var sourcearea = document.getElementById('kupu-editor-textarea');
    var kupudocroot = kupu.getInnerDocument().documentElement;

    /* Build up the blacklist of things to remove */
    var blacklist = "";
    blacklist += "//*[substring-before(name(),':')]"; // Foreign namespaces
    blacklist += "|//comment()"; // Comment nodes
    blacklist += "|//@class[.='MsoNormal']"; // Bogus formatting classes

    /* Convert ugly HTML to XHTML and remove some offending elements */
    var xhtmldoc = Sarissa.getDomDocument();  // XXX Refactor filterContent
    var transform = kupu._filterContent(kupudocroot).selectSingleNode("body");
    xhtmldoc.loadXML(transform.xml); // XXX Double-parsing is dumb!!
    var rejected = xhtmldoc.selectNodes(blacklist);
    alert("rejected: " + rejected.length);
    for (i=0; i < rejected.length; i++) {
        rejected[i].parentNode.removeChild(rejected[i]);
    }


    /* Grab body contents and shove into editor */
    var contents = xhtmldoc.xml.replace(/<\/?body[^>]*>/g, "");
    kupudocroot.getElementsByTagName('body')[0].innerHTML = contents;

    alert(kupudocroot.getElementsByTagName('body')[0].innerHTML);
    return;

}
