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

function KupuHelpersTestCase() {
    this.setUp = function() {
        this.doc = document.getElementById('iframe').contentWindow.document;
        var html = this.doc.createElement('html');
        var head = this.doc.createElement('head');
        var title = this.doc.createElement('title');
        var titletext = this.doc.createTextNode('test');
        this.body = this.doc.createElement('body');

        title.appendChild(titletext);
        head.appendChild(title);
        html.appendChild(head);
        html.appendChild(this.body);
        this.doc.documentElement.appendChild(html);
    };
        
    this.testSelectSelectItem = function() {
        var select = this.doc.createElement('select');
        this.body.appendChild(select);
        var option = this.doc.createElement('option');
        option.value = 'foo';
        select.appendChild(option);
        var option2 = this.doc.createElement('option');
        option2.value = 'bar';
        select.appendChild(option2);

        this.assertEquals(select.selectedIndex, 0);
        var ret = selectSelectItem(select, 'bar');
        this.assertEquals(select.selectedIndex, 1);
        var ret = selectSelectItem(select, 'baz');
        this.assertEquals(select.selectedIndex, 0);
    };

    this.testArrayContains = function() {
        var array = new Array(1, 2, 3);
        this.assert(array.contains(1));
        this.assert(array.contains(2));
        this.assertFalse(array.contains(4));
        this.assert(array.contains('1'));
        this.assertFalse(array.contains('1', 1));
    };

    this.testLoadDictFromXML = function() {
        var dict = loadDictFromXML(document, 'xmlisland');
        this.assertEquals(dict['foo'], 'bar');
        this.assertEquals(dict['sna'], 'fu');
        for (var attr in dict) {
            this.assert(attr == 'foo' || attr == 'sna' || attr == 'some_int');
        };
        this.assertEquals(dict['some_int'], 1);
    };
};

KupuHelpersTestCase.prototype = new TestCase;

function KupuSelectionTestCase() {
    this.setUp = function() {
        this.iframe = document.getElementById('iframe');
        this.kupudoc = new KupuDocument(this.iframe);
        this.document = this.iframe.contentWindow.document;
        var doc = this.document;
        var docel = doc.documentElement ? doc.documentElement : doc;
        this.docel = docel;
        var html = doc.createElement('html');
        docel.appendChild(html);
        this.body = doc.createElement('body');
        html.appendChild(this.body);
    };

    this.testReplaceWithNode = function() {
        var node = this.document.createElement('p');
        var nbsp = this.document.createTextNode('\xa0');
        node.appendChild(nbsp);
        this.body.appendChild(node);
        var selection = _SARISSA_IS_IE ? new IESelection(this.kupudoc) : new MozillaSelection(this.kupudoc);
        selection.selectNodeContents(this.body.childNodes[0]);
        this.assertEquals(selection.getSelectedNode(), node);
    };

    this.tearDown = function() {
        while (this.iframe.hasChildNodes()) {
            this.iframe.removeChild(this.iframe.firstChild);
        };
    };
};

KupuSelectionTestCase.prototype = new TestCase;
