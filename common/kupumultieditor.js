/*****************************************************************************
 *
 * Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id: kupumultieditor.js 3450 2004-03-28 11:07:30Z guido $

function KupuMultiEditor(documents, config, logger) {
    /* multiple kupus in one form */
    this.documents = documents; // array of documents
    this.config = config;
    this.log = logger;
    this.tools = {};

    this._designModeAttempts = 0;
    this._initialized = false;

    this._previous_range = null;

    // here's where the current active document will be stored
    this._current_document = documents[0];
    
    this.initialize = function() {
        this._initializeEventHandlers();
        this.getDocument().getWindow().focus();
        if (this.getBrowserName() == 'IE') {
            this._saveSelection();
            for (var i=0; i < this.documents.length; i++) {
                var body = this.documents[i].getDocument().getElementsByTagName('body')[0];
                body.setAttribute('contentEditable', 'true');
            };
            this._initialized = true;
            this.logMessage('Editor initialized');
        } else {
            this._setDesignModeWhenReady();
        };
    };

    this.updateStateHandler = function(event) {
        /* check whether the event is interesting enough to trigger the 
        updateState machinery and act accordingly */
        var interesting_codes = new Array(8, 13, 37, 38, 39, 40, 46);
        // unfortunately it's not possible to do this on blur, since that's
        // too late. also (some versions of?) IE 5.5 doesn't support the
        // onbeforedeactivate event, which would be ideal here...
        if (this.getBrowserName() == 'IE') {
            this._saveSelection();
        };

        if (event.type == 'click' || 
                (event.type == 'keyup' && 
                    interesting_codes.contains(event.keyCode))) {
            var target = event.target ? event.target : event.srcElement;
            // find the document targeted
            while (target.nodeType != 9) {
                target = target.parentNode;
            };
            var document = null;
            for (var i=0; i < this.documents.length; i++) {
                document = this.documents[i];
                if (document.getDocument() == target) {
                    break;
                };
            };
            if (!document) {
                alert('No document found!');
                return;
            };
            this._current_document = document;
            this.updateState(event);
        }
    };

    this.saveDocument = function() {
        throw('Not supported, use prepareForm to attach the editor to a form');
    };

    this.prepareForm = function(form) {
        /* prepare the form
            
            unlike the version in the superclass this gets one argument, the form,
            the ids of the iframe should be set as 'fieldid' attributes on the iframe
        */
        // make sure people can't edit or save during saving
        if (!this._initialized) {
            return;
        }
        this._initialized = false;
        
        // set the window status so people can see we're actually saving
        window.status= "Please wait while saving document...";

        for (var i=0; i < this.documents.length; i++) {
            var document = this.documents[i];
            var iframe = document.getEditable();
            var fieldid = iframe.getAttribute('fieldid');

            if (!fieldid) {
                throw('Missing fieldid attribute on iframe');
            };
            
            var transform = this._filterContent(document.getDocument().documentElement);
            
            // XXX need to fix this.  Sometimes a spurious "\n\n" text 
            // node appears in the transform, which breaks the Moz 
            // serializer on .xml
            var contents =  '<html>' + 
                            transform.getElementsByTagName("head")[0].xml +
                            transform.getElementsByTagName("body")[0].xml +
                            '</html>';
            
            // now create the form input
            var targetdocument = form.ownerDocument;
            var textarea = targetdocument.createElement('textarea');
            textarea.style.visibility = 'hidden';
            var text = document.createTextNode(contents);
            textarea.appendChild(text);
            textarea.setAttribute('name', fieldid);
            
            // and add it to the form
            form.appendChild(textarea);
        };
    };

    this.getDocument = function() {
        /* return the current active document */
        return this._current_document;
    };

    this._initializeEventHandlers = function() {
        /* attache the event handlers to the iframe */
        for (var i=0; i < this.documents.length; i++) {
            var doc = this.documents[i].getDocument();
            this._addEventHandler(doc, "click", this.updateStateHandler, this);
            this._addEventHandler(doc, "keyup", this.updateStateHandler, this);
            if (this.getBrowserName() == "IE") {
                this._addEventHandler(doc, "focus", this._clearSelection, this);
            };
        };
    };

    this._setDesignModeWhenReady = function() {
        this._designModeSetAttempts++;
        if (this._designModeSetAttempts > 25) {
            alert('Couldn\'t set design mode. Kupu will not work on this browser.');
            return;
        };
        var should_retry = false;
        for (var i=0; i < this.documents.length; i++) {
            var document = this.documents[i];
            if (!document._designModeSet) {
                try {
                    this._setDesignMode(document);
                    document._designModeSet = true;
                } catch(e) {
                    should_retry = true;
                };
            };
        };
        if (should_retry) {
            timer_instance.registerFunction(this, this._setDesignModeWhenReady, 100);
        } else {
            this._initialized = true;
        };
    };

    this._setDesignMode = function(doc) {
        doc.getDocument().designMode = "On";
        doc.execCommand("undo");
        // note the negation: the argument doesn't work as expected...
        // XXX somehow calling execCommand('useCSS',...) here doesn't seem to have effect unless it's
        // called with a timeout... don't know why, crappy workaround...
        timer_instance.registerFunction(doc, doc.execCommand, 0, "useCSS", !this.config.use_css);
    };
};

KupuMultiEditor.prototype = new KupuEditor;
