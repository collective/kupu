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

function initSilvaKupu(iframe) {
    // first we create a logger
    var l = new PlainLogger('kupu-toolbox-debuglog', 5);

    // now some config values
    var conf = loadDictFromXML(document, 'kupuconfig');
    
    // the we create the document, hand it over the id of the iframe
    var doc = new KupuDocument(iframe);

    // now we can create the controller
    var kupu = new KupuEditor(doc, conf, l);
    
    var cm = new ContextMenu();
    kupu.setContextMenu(cm);

    // now we can create a UI object which we can use from the UI
    var ui = new SilvaKupuUI('kupu-tb-styles');
    kupu.registerTool('ui', ui);

    var savebuttonfunc = function(button, editor) {editor.saveDocument()};
    var savebutton = new KupuBaseButton('kupu-save-button', savebuttonfunc);
    kupu.registerTool('savebutton', savebutton);

    // function that returns a function to execute a button command
    var execCommand = function(cmd) {
        return function(button, editor) {
            editor.execCommand(cmd);
        };
    };

    var boldcheckfunc = new StateButtonCheckFunction(
                            new Array('b', 'strong'), 'font-weight', 'bold');
    var boldbutton = new KupuStateButton('kupu-bold-button', 
                                         execCommand('bold'),
                                         boldcheckfunc.execute, 
                                         'kupu-bold', 
                                         'kupu-bold-pressed');
    kupu.registerTool('boldbutton', boldbutton);

    var italiccheckfunc = new StateButtonCheckFunction(
                            new Array('i', 'em'), 'font-style', 'italic');
    var italicbutton = new KupuStateButton('kupu-italic-button', 
                                           execCommand('italic'),
                                           italiccheckfunc.execute, 
                                           'kupu-italic', 
                                           'kupu-italic-pressed');
    kupu.registerTool('italicbutton', italicbutton);

    var underlinebuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('u'));
    var underlinebutton = new KupuStateButton('kupu-underline-button', 
                                              execCommand('underline'),
                                              underlinebuttoncheckfunc.execute, 
                                              'kupu-underline', 
                                              'kupu-underline-pressed');
    kupu.registerTool('underlinebutton', underlinebutton);

    var subscriptbuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('sub'));
    var subscriptbutton = new KupuStateButton('kupu-subscript-button', 
                                              execCommand('subscript'),
                                              subscriptbuttoncheckfunc.execute, 
                                              'kupu-subscript', 
                                              'kupu-subscript-pressed');
    kupu.registerTool('subscriptbutton', subscriptbutton);

    var superscriptbuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('super'));
    var superscriptbutton = new KupuStateButton('kupu-superscript-button', 
                                                execCommand('superscript'),
                                                superscriptbuttoncheckfunc.execute, 
                                                'kupu-superscript', 
                                                'kupu-superscript-pressed');
    kupu.registerTool('superscriptbutton', superscriptbutton);

    var listtool = new ListTool('kupu-list-ul-addbutton', 'kupu-list-ol-addbutton', 'kupu-ulstyles', 'kupu-olstyles');
    kupu.registerTool('listtool', listtool);

    var dltool = new SilvaDefinitionListTool('kupu-definitionlist-button');
    kupu.registerTool('dltool', dltool);

    var toctool = new SilvaTocTool('kupu-toolbox-toc-depth', 'kupu-toc-add-button', 'kupu-toc-del-button',
                                    'kupu-toolbox-toc', 'kupu-toolbox', 'kupu-toolbox-active');
    kupu.registerTool('toctool', toctool);
    
    var linktool = new SilvaLinkTool("kupu-link-input", "kupu-link-button");
    kupu.registerTool('linktool', linktool);
    var linktoolbox = new SilvaLinkToolBox("kupu-link-input", "kupu-link-button", 'kupu-toolbox-links', 'kupu-toolbox', 'kupu-toolbox-active');
    linktool.registerToolBox("linktoolbox", linktoolbox);
  
    var indextool = new SilvaIndexTool("kupu-index-input", 'kupu-index-addbutton', 'kupu-index-updatebutton', 'kupu-index-deletebutton', 'kupu-toolbox-indexes', 'kupu-toolbox', 'kupu-toolbox-active');
    kupu.registerTool('indextool', indextool);

    var citationtool = new SilvaCitationTool('kupu-citation-authorinput', 'kupu-citation-sourceinput', 'kupu-citation-addbutton', 
                                                'kupu-citation-updatebutton', 'kupu-citation-deletebutton');
    kupu.registerTool('citationtool', citationtool);
  
    var imagetool = new SilvaImageTool('kupu-toolbox-image-edit', 'kupu-toolbox-image-src', 'kupu-toolbox-image-target', 
                                        'kupu-toolbox-image-link-radio-hires', 'kupu-toolbox-image-link-radio-link', 
                                        'kupu-toolbox-image-link', 'kupu-toolbox-image-align', 'kupu-toolbox-images', 'kupu-toolbox', 
                                        'kupu-toolbox-active');
    kupu.registerTool('imagetool', imagetool);

    var tabletool = new SilvaTableTool(); 
    kupu.registerTool('tabletool', tabletool);
    var tabletoolbox = new SilvaTableToolBox('kupu-toolbox-addtable', 
        'kupu-toolbox-edittable', 'kupu-table-newrows', 'kupu-table-newcols',
        'kupu-table-makeheader', 'kupu-table-classchooser', 'kupu-table-alignchooser',
        'kupu-table-addtable-button', 'kupu-table-addrow-button', 'kupu-table-delrow-button', 'kupu-table-addcolumn-button',
        'kupu-table-delcolumn-button', 'kupu-table-fix-button', 'kupu-toolbox-tables', 'kupu-toolbox', 'kupu-toolbox-active'
        );
    tabletool.registerToolBox('tabletoolbox', tabletoolbox);

    var showpathtool = new ShowPathTool();
    kupu.registerTool('showpathtool', showpathtool);

    var viewsourcetool = new ViewSourceTool();
    kupu.registerTool('viewsourcetool', viewsourcetool);
    
    var nonxhtmltagfilter = new NonXHTMLTagFilter();
    kupu.registerFilter(nonxhtmltagfilter);

    return kupu;
};
