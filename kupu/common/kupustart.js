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

function startKupu() {
    // initialize the editor, initKupu groks 1 arg, a reference to the iframe
    var frame = document.getElementById('kupu-editor'); 
    var kupu = initKupu(frame);
    
    // first let's load the message catalog
    // if there's no global 'i18n_message_catalog' variable available, don't
    // try to load any translations
    if (!window.i18n_message_catalog) {
        continueStartKupu(kupu);
        return kupu;
    };
    // loading will be done asynchronously (to keep Mozilla from freezing)
    // so we'll continue in a follow-up function (continueStartKupu() below)
    var handler = function(request) {
        if (this.readyState == 4) {
            var status = this.status;
            if (status != '200') {
                alert(_('Error loading translation (status ${status} ' +
                        '), falling back to english'), {'status': status});
                continueStartKupu(kupu);
                return;
            };
            var dom = this.responseXML;
            window.i18n_message_catalog.initialize(dom);
            continueStartKupu(kupu);
        };
    };
    var request = Sarissa.getXmlHttpRequest();
    request.onreadystatechange = (new ContextFixer(handler, request)).execute;
    request.open('GET', 'kupu.pox', true);
    request.send('');

    // we need to return a reference to the editor here for certain 'external'
    // stuff, developers should note that it's not yet initialized though, we
    // need to wait for i18n data before we can do that
    return kupu;
};

function continueStartKupu(kupu) {
    // this makes the editor's content_changed attribute set according to changes
    // in a textarea or input (registering onchange, see saveOnPart() for more
    // details)
    kupu.registerContentChanger(document.getElementById('kupu-editor-textarea'));

    // let's register saveOnPart(), to ask the user if he wants to save when 
    // leaving after editing
    if (kupu.getBrowserName() == 'IE') {
        // IE supports onbeforeunload, so let's use that
        addEventHandler(window, 'beforeunload', saveOnPart);
    } else {
        // some versions of Mozilla support onbeforeunload (starting with 1.7)
        // so let's try to register and if it fails fall back on onunload
        var re = /rv:([0-9\.]+)/
        var match = re.exec(navigator.userAgent)
        if (match[1] && parseFloat(match[1]) > 1.6) {
            addEventHandler(window, 'beforeunload', saveOnPart);
        } else {
            addEventHandler(window, 'unload', saveOnPart);
        };
    };

    // and now we can initialize...
    kupu.initialize();

    return kupu;
};
