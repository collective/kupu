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

KupuEditor.prototype.makeLinksRelative = function(contents) {
    // After extracting text from Internet Explorer, all the links in
    // the document are absolute.
    // we can't use the DOM to convert them to relative links, since
    // its the DOM that corrupts them to absolute to begin with.
    // Instead we can find the base from the DOM and do replace on the
    // text until all our links are relative.
    var doc = this.getInnerDocument();
    var nodes = doc.getElementsByTagName("BASE");
    if (nodes.length==0) {
        var head = doc.getElementsByTagName("HEAD")[0];
        head.appendChild(doc.createElement("base"));
        nodes = doc.getElementsByTagName("BASE");
    };
    var base = nodes[0];
    var href = base.href;
    var hrefparts = href.split('/');
    return contents.replace(/(<[^>]* href=")([^"]*)"/g,
        function(str, tag, url, offset, contents) {
            var urlparts = url.split('/');
            var common = 0;
            while (common < urlparts.length &&
                   common < hrefparts.length &&
                   urlparts[common]==hrefparts[common])
                common++;
            // The base and the url have 'common' parts in common.
            // First two are the protocol, so only do stuff if more
            // than two match.
            if (common > 2) {
                var path = new Array();
                var i = 0;
                for (; i+common < hrefparts.length-1; i++) {
                    path[i] = '..';
                };
                while (common < urlparts.length) {
                    path[i++] = urlparts[common++];
                };
                str = tag + path.join('/')+'"';
            };
            return str;
        });
};

KupuEditor.prototype.saveDataToField = function(form, field) {
    if (!this._initialized) {
        return;
    };
    this._initialized = false;

    // set the window status so people can see we're actually saving
    window.status= "Please wait while saving document...";

    // pass the content through the filters
    this.logMessage("Starting HTML cleanup");

    var transform = this._filterContent(this.getInnerDocument().documentElement);

    // We need to get the contents of the body node as xml, but we don't
    // want the body node itself, so we use a regex to remove it
    contents = transform.getElementsByTagName("body")[0].xml;
    contents = this.makeLinksRelative(contents).replace(/<\/?body[^>]*>/g, "");
    this.logMessage("Cleanup done, sending document to server");

    // now create the form input
    var document = form.ownerDocument;

    field.value = contents;
    
    kupu.content_changed = false;
};
