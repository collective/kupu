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


//----------------------------------------------------------------------------
// Sample initialization function
//----------------------------------------------------------------------------

function initKupu(iframe) {
    /* Although this is meant to be a sample implementation, it can
        be used out-of-the box to run the sample pagetemplate or for simple
        implementations that just don't use some elements. When you want
        to do some customization, this should probably be overridden. For 
        larger customization actions you will have to subclass or roll your 
        own UI object.
    */

    // first we create a logger
    var l = new PlainLogger('kupu-toolbox-debuglog', 5);
    
    // now some config values
    var conf = loadDictFromXML(document, 'kupuconfig');
    
    // the we create the document, hand it over the id of the iframe
    var doc = new KupuDocument(iframe);
    
    // now we can create the controller
    var kupu = new KupuEditor(doc, conf, l);

    // add the contextmenu
    var cm = new ContextMenu();
    kupu.setContextMenu(cm);

    // now we can create a UI object which we can use from the UI
    var ui = new KupuUI('kupu-tb-styles');

    // the ui must be registered to the editor like a tool so it can be notified
    // of state changes
    kupu.registerTool('ui', ui); // XXX Should this be a different method?

    // add the buttons to the toolbar
    var savebuttonfunc = function(button, editor) {editor.saveDocument()};
    var savebutton = new KupuBaseButton('kupu-save-button', savebuttonfunc);
    kupu.registerTool('savebutton', savebutton);

    var boldbuttonfunc = function(button, editor) {editor.execCommand('bold')};
    var boldcheckfunc = new StateButtonCheckFunction(
                            new Array('b', 'strong'), 'font-weight', 'bold');
    var boldbutton = new KupuStateButton('kupu-bold-button', 
                                         boldbuttonfunc, 
                                         boldcheckfunc.execute, 
                                         'kupu-bold', 
                                         'kupu-bold-pressed');
    kupu.registerTool('boldbutton', boldbutton);

    var italicbuttonfunc = function(button, editor) {editor.execCommand('italic')};
    var italiccheckfunc = new StateButtonCheckFunction(
                            new Array('i', 'em'), 'font-style', 'italic');
    var italicbutton = new KupuStateButton('kupu-italic-button', 
                                           italicbuttonfunc, 
                                           italiccheckfunc.execute, 
                                           'kupu-italic', 
                                           'kupu-italic-pressed');
    kupu.registerTool('italicbutton', italicbutton);

    var underlinebuttonfunc = function(button, editor) {editor.execCommand('underline')};
    var underlinebuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('u'));
    var underlinebutton = new KupuStateButton('kupu-underline-button', 
                                              underlinebuttonfunc, 
                                              underlinebuttoncheckfunc.execute, 
                                              'kupu-underline', 
                                              'kupu-underline-pressed');
    kupu.registerTool('underlinebutton', underlinebutton);

    var subscriptbuttonfunc = function(button, editor) {editor.execCommand('subscript')};
    var subscriptbuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('sub'));
    var subscriptbutton = new KupuStateButton('kupu-subscript-button', 
                                              subscriptbuttonfunc, 
                                              subscriptbuttoncheckfunc.execute, 
                                              'kupu-subscript', 
                                              'kupu-subscript-pressed');
    kupu.registerTool('subscriptbutton', subscriptbutton);

    var superscriptbuttonfunc = function(button, editor) {editor.execCommand('superscript')};
    var superscriptbuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('super'));
    var superscriptbutton = new KupuStateButton('kupu-superscript-button', 
                                                superscriptbuttonfunc, 
                                                superscriptbuttoncheckfunc.execute, 
                                                'kupu-superscript', 
                                                'kupu-superscript-pressed');
    kupu.registerTool('superscriptbutton', superscriptbutton);

    var justifyleftbuttonfunc = function(button, editor) {editor.execCommand('justifyleft')};
    var justifyleftbutton = new KupuBaseButton('kupu-justifyleft-button', justifyleftbuttonfunc);
    kupu.registerTool('justifyleftbutton', justifyleftbutton);

    var justifycenterbuttonfunc = function(button, editor) {editor.execCommand('justifycenter')};
    var justifycenterbutton = new KupuBaseButton('kupu-justifycenter-button', justifycenterbuttonfunc);
    kupu.registerTool('justifycenterbutton', justifycenterbutton);

    var justifyrightbuttonfunc = function(button, editor) {editor.execCommand('justifyright')};
    var justifyrightbutton = new KupuBaseButton('kupu-justifyright-button', justifyrightbuttonfunc);
    kupu.registerTool('justifyrightbutton', justifyrightbutton);

    var outdentbuttonfunc = function(button, editor) {editor.execCommand('outdent')};
    var outdentbutton = new KupuBaseButton('kupu-outdent-button', outdentbuttonfunc);
    kupu.registerTool('outdentbutton', outdentbutton);

    var indentbuttonfunc = function(button, editor) {editor.execCommand('indent')};
    var indentbutton = new KupuBaseButton('kupu-indent-button', indentbuttonfunc);
    kupu.registerTool('indentbutton', indentbutton);

    var undobuttonfunc = function(button, editor) {editor.execCommand('undo')};
    var undobutton = new KupuBaseButton('kupu-undo-button', undobuttonfunc);
    kupu.registerTool('undobutton', undobutton);

    var redobuttonfunc = function(button, editor) {editor.execCommand('redo')};
    var redobutton = new KupuBaseButton('kupu-redo-button', redobuttonfunc);
    kupu.registerTool('redobutton', redobutton);

    // add some tools
    // XXX would it be better to pass along elements instead of ids?
    var colorchoosertool = new ColorchooserTool('kupu-forecolor-button', 'kupu-hilitecolor-button', 'kupu-colorchooser');
    kupu.registerTool('colorchooser', colorchoosertool);

    var listtool = new ListTool('kupu-list-ul-addbutton', 'kupu-list-ol-addbutton', 'kupu-ulstyles', 'kupu-olstyles');
    kupu.registerTool('listtool', listtool);

    // since we use the inspector we don't need much else ;)
    var inspector = new KupuInspector('kupu-inspector-form');
    kupu.registerTool('inspector', inspector);
    
    var linktool = new LinkTool();
    kupu.registerTool('linktool', linktool);

    var imagetool = new ImageTool();
    kupu.registerTool('imagetool', imagetool);

    var tabletool = new TableTool();
    kupu.registerTool('tabletool', tabletool);

    var showpathtool = new ShowPathTool();
    kupu.registerTool('showpathtool', showpathtool);
    
    var viewsourcetool = new ViewSourceTool();
    kupu.registerTool('viewsourcetool', viewsourcetool);
    
    // register some cleanup filter
    // remove tags that aren't in the XHTML DTD
    var nonxhtmltagfilter = new NonXHTMLTagFilter();
    kupu.registerFilter(nonxhtmltagfilter);

    return kupu;
}
