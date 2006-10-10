/*****************************************************************************
 *
 * Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 * 
 *****************************************************************************/

/* Javascript to aid migration page. */

function Migration() {};
(function(p){
    var fudge = new LibraryDrawer();
    p._loadXML = fudge._loadXML;
    p._xmlcallback = function(dom) {
        this.xmldata = dom;
        this.updateDisplay();
    };
    p.updateDisplay = function() {
        var nodes = this.xmldata.selectNodes("//*[@kj:mode]");
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var mode = n.getAttribute('kj:mode');
            n = document.importNode(n, true);
            var id = n.getAttribute('id');
            var target;
            if (id) {
                target = document.getElementById(id);
            } else {
                target = document.getElementById('kupu-default-target');
                mode = 'append';
            }
            if (mode=='append') {
                while(n.firstChild) {
                    target.appendChild(n.firstChild);
                };
            } else if (mode=='replace') {
                Sarissa.copyChildNodes(n, target);
            } else if (mode=='prepend') {
                var t = target.firstChild;
                while (n.firstChild) {
                    target.insertBefore(n.firstChild, t);
                };
            };
        };
        this.nextRequest();
    };
    p.nextRequest = function() {
        var next = this.xmldata.selectSingleNode('//*[@kj:next]');
        if (next) {
            var xmluri = next.getAttribute('kj:next');
            this._loadXML(xmluri, this._xmlcallback);
        } else {
            this.trace("complete");
        };
    };
    p.newRequest = function(uri) {
        this._loadXML(uri, this._xmlcallback);
    };
    p.clearLog = function() {
        var el = document.getElementById("log");
        while (el.firstChild) el.removeChild(el.firstChild);
    };
    p.submitForm = function(form) {
        var fields = [];
        function push(el, v) {
            fields.push(el.name+"="+encodeURIComponent(v));
        }
        for(var i=0; i < form.elements.length; i++)
        {
            var el = form.elements[i];
            var name = /input/i.test(el.tagName)?el.type:el.tagName;
            if (/checkbox|radio/i.test(name) && !el.checked) continue;
            if (/select/i.test(name)) {
                push(el, options[el.selectedIndex].value);
                continue;
            }
            if (/text|hidden|checkbox|radio|textarea/i.test(name)) {
                push(el, el.value);
            };
        }
        //alert(fields.join('\n'));
        this._loadXML(form.getAttribute('action'), this._xmlcallback, fields.join('&'));
        return false;
    };
    p.trace = function(s) {
        var el = document.getElementById("log");
        if (el) el.appendChild(newElement("div", [s]));
    };
})(Migration.prototype);

var kj = new Migration();
