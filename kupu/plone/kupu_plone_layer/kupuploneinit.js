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

function initPloneKupu(iframe, fieldname) {
    var l = new DummyLogger();

    var iframehead = iframe.contentWindow.document.getElementsByTagName('head')[0];
    var styles = Array( 'kupuplone.css', 'plone.css', 'ploneCustom.css');
    for (var i = 0; i < styles.length; i++) {
        var link = iframe.contentWindow.document.createElement('link');
        link.href = styles[i];
        link.rel = 'stylesheet';
        link.type = 'text/css';
        iframehead.appendChild(link);
    };

    iframe.contentWindow.document.getElementsByTagName('body')[0].innerHTML = document.getElementById(fieldname).value;
		
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
    var ui = new PloneKupuUI('kupu-tb-styles');
    kupu.registerTool('ui', ui);

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

    var subscriptbuttonfunc = function(button, editor) {editor.execCommand('subscript')};
    var subscriptbuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('sub'));
    var subscriptbutton = new KupuStateButton('kupu-subscript-button', 
                                              execCommand('subscript'),
                                              subscriptbuttoncheckfunc.execute, 
                                              'kupu-subscript', 
                                              'kupu-subscript-pressed');
    kupu.registerTool('subscriptbutton', subscriptbutton);

    var superscriptbuttonfunc = function(button, editor) {editor.execCommand('superscript')};
    var superscriptbuttoncheckfunc = new StateButtonCheckFunction(
                            new Array('super'));
    var superscriptbutton = new KupuStateButton('kupu-superscript-button', 
                                                execCommand('superscript'),
                                                superscriptbuttoncheckfunc.execute, 
                                                'kupu-superscript', 
                                                'kupu-superscript-pressed');
    kupu.registerTool('superscriptbutton', superscriptbutton);

    var justifyleftbutton = new KupuBaseButton('kupu-justifyleft-button',
                                               execCommand('justifyleft'));
    kupu.registerTool('justifyleftbutton', justifyleftbutton);

    var justifycenterbutton = new KupuBaseButton('kupu-justifycenter-button',
                                                 execCommand('justifycenter'));
    kupu.registerTool('justifycenterbutton', justifycenterbutton);

    var justifyrightbutton = new KupuBaseButton('kupu-justifyright-button',
                                                execCommand('justifyright'));
    kupu.registerTool('justifyrightbutton', justifyrightbutton);

    var outdentbutton = new KupuBaseButton('kupu-outdent-button', execCommand('outdent'));
    kupu.registerTool('outdentbutton', outdentbutton);

    var indentbutton = new KupuBaseButton('kupu-indent-button', execCommand('indent'));
    kupu.registerTool('indentbutton', indentbutton);

    var undobutton = new KupuBaseButton('kupu-undo-button', execCommand('undo'));
    kupu.registerTool('undobutton', undobutton);

    var redobutton = new KupuBaseButton('kupu-redo-button', execCommand('redo'));
    kupu.registerTool('redobutton', redobutton);


    var listtool = new ListTool('kupu-list-ul-addbutton',
                                'kupu-list-ol-addbutton',
                                'kupu-ulstyles',
                                'kupu-olstyles');
    kupu.registerTool('listtool', listtool);

    var tabletool = new TableTool();
    kupu.registerTool('tabletool', tabletool);

    var showpathtool = new ShowPathTool('kupu-showpath-field');
    kupu.registerTool('showpathtool', showpathtool);

    var jumplinks = new JumpLinkTool();
    kupu.registerTool('jumplinktool', jumplinks);

    var imagetool = new ImageTool();
    kupu.registerTool('imagetool', imagetool);

    var linktool = new LinkTool();
    kupu.registerTool('linktool', linktool);

    // let's register saveOnPart(), to ask the user if he wants to save when 
    // leaving after editing
    if (kupu.getBrowserName() == 'IE') {
        // IE supports onbeforeunload, so let's use that
        addEventHandler(window, 'beforeunload', saveOnPart);
    } else {
        // some versions of Mozilla support onbeforeunload (starting with 1.7)
        // so let's try to register and if it fails fall back on onunload
        var re = /rv:([0-9\.]+)/;
        var match = re.exec(navigator.userAgent);
        if (match[1] && parseFloat(match[1]) > 1.6) {
            addEventHandler(window, 'beforeunload', saveOnPart);
        } else {
            addEventHandler(window, 'unload', saveOnPart);
        };
    };

    // Drawers...

    // Function that returns function to open a drawer
    var opendrawer = function(drawerid) {
        return function(button, editor) {
            drawertool.openDrawer(drawerid);
        };
    };

    var imagedrawerbutton = new KupuBaseButton('kupu-imagedrawer-button',
                                               opendrawer('imagedrawer'));
    kupu.registerTool('imagedrawerbutton', imagedrawerbutton);

    var linkdrawerbutton = new KupuBaseButton('kupu-linkdrawer-button',
                                              opendrawer('linkdrawer'));
    kupu.registerTool('linkdrawerbutton', linkdrawerbutton);

    var tabledrawerbutton = new KupuBaseButton('kupu-tabledrawer-button',
                                               opendrawer('tabledrawer'));
    kupu.registerTool('tabledrawerbutton', tabledrawerbutton);

    // create some drawers, drawers are some sort of popups that appear when a 
    // toolbar button is clicked
    var drawertool = new DrawerTool();
    kupu.registerTool('drawertool', drawertool);

    var linkdrawer = new LinkDrawer(linktool, conf['link_xsl_uri'],
                                    conf['link_libraries_uri'], conf['link_images_uri']);
    drawertool.registerDrawer('linkdrawer', linkdrawer);

    var imagedrawer = new ImageDrawer(imagetool, conf['image_xsl_uri'],
                                      conf['image_libraries_uri'], conf['search_images_uri']);
    drawertool.registerDrawer('imagedrawer', imagedrawer);

    var tabledrawer = new TableDrawer('kupu-table-drawer-add',
                                      'kupu-table-drawer-edit',
                                       tabletool);
    drawertool.registerDrawer('tabledrawer', tabledrawer);

    // register form submit handler, remove the drawer's contents before submitting 
    // the form since it seems to crash IE if we leave them alone
    function prepareForm(event) {
        kupu.saveDataToField(this.form, field);
        var drawer = document.getElementById('kupu-librarydrawer');
        drawer.parentNode.removeChild(drawer);
    };
    var field = document.getElementById(fieldname);
    addEventHandler(field.form, 'submit', prepareForm, field);
		
    return kupu;
};
