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
		
    var conf = {
        'src': iframe.getAttribute('src'),
        'dst': iframe.getAttribute('dst'),
        'use_css': (iframe.getAttribute('usecss') != "0"),
        'reload_after_save': (iframe.getAttribute('reloadsrc') == "1")
    };

    var image_libraries_uri = iframe.getAttribute('image_libraries_uri');
    var link_libraries_uri = iframe.getAttribute('link_libraries_uri');
    var search_images_uri = iframe.getAttribute('search_images_uri');
    var search_links_uri = iframe.getAttribute('search_links_uri');
    var image_xsl_uri = 'kupudrawers/imagedrawer.xsl';
    var link_xsl_uri = 'kupudrawers/linkdrawer.xsl';

    var doc = new KupuDocument(iframe);
    var kupu = new KupuEditor(doc, conf, l);

    // add the contextmenu
    var cm = new ContextMenu();
    kupu.setContextMenu(cm);

    var listtool = new ListTool('kupu-list-ul-addbutton',
                                'kupu-list-ol-addbutton',
                                'kupu-ulstyles',
                                'kupu-olstyles');
    kupu.registerTool('listtool', listtool);

    var tabletool = new TableTool();
    kupu.registerTool('tabletool', tabletool);

    var showpathtool = new ShowPathTool('kupu-showpath-field');
    kupu.registerTool('showpathtool', showpathtool);

    var ui = new PloneKupuUI('kupu-tb-styles');
    kupu.registerTool('ui', ui);

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

    var drawertool = new DrawerTool();
    kupu.registerTool('drawertool', drawertool);

    var linkdrawer = new LinkDrawer(linktool, link_xsl_uri,
                                    link_libraries_uri, search_links_uri);
    drawertool.registerDrawer('linkdrawer', linkdrawer);

    var imagedrawer = new ImageDrawer(imagetool, image_xsl_uri,
                                      image_libraries_uri, search_images_uri);
    drawertool.registerDrawer('imagedrawer', imagedrawer);

    document.getElementById(fieldname).form.onsubmit = function() {
        kupu.saveDataToField(document.getElementById(fieldname).form,
			     document.getElementById(fieldname));
    };
		
    return kupu;
};
