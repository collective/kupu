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

// Various tests for html -> xhtml processing.

function KupuXhtmlTestCase() {
    this.name = 'KupuXhtmlTestCase';

    this.incontext = function(s) {
        return '<html><head><title>test</title></head><body>'+s+'</body></html>';
    }

    this.setUp = function() {
        this.editor = new KupuEditor(null, {}, null);
        this.doc = document.getElementById('iframe').contentWindow.document;
        var head = this.doc.createElement('head');
        var title = this.doc.createElement('title');
        var titletext = this.doc.createTextNode('test');
        this.body = this.doc.createElement('body');

        title.appendChild(titletext);
        head.appendChild(title);
        var html = this.doc.documentElement;
        while (html.childNodes.length > 0)
            html.removeChild(html.childNodes[0]);
        html.appendChild(head);
        html.appendChild(this.body);
    };

    this.arrayContains = function(ary, test) {
        for (var i = 0; i < ary.length; i++) {
            if (ary[i]==test) {
                return 1;
            }
        }
        return 0;
    }
    this.testExclude = function() {
        // Check that the exclude functions work as expected.
        var validator = new XhtmlValidation();
        var events = ['onclick', 'ondblclick', 'onmousedown',
        'onmouseup', 'onmouseover', 'onmousemove',
        'onmouseout', 'onkeypress', 'onkeydown',
        'onkeyup'];
        var expected = ['onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseout', 'onkeypress', 'onkeyup'];

        var actual = validator._exclude(events, 'onmouseover|onmousemove|onkeydown');
        this.assertEquals(actual.toString(), expected.toString());

        // check is also works with arrays.
        actual = validator._exclude(events, ['onmouseover','onmousemove','onkeydown']);
        this.assertEquals(actual.toString(), expected.toString());

        // Check we have a bgcolor attribute
        var attrs = validator.Attributes.thead;
        this.assertTrue(this.arrayContains(attrs, 'charoff'));
        validator._excludeAttributes(['charoff']);
        this.assertTrue(!this.arrayContains(attrs, 'charoff'));
        this.assertTrue(this.arrayContains(validator.Attributes.img, 'height'));
        this.assertTrue(this.arrayContains(validator.Attributes.th, 'height'));
        validator._excludeAttributesForTags(['width','height'],['table','th','td']);
        this.assertTrue(this.arrayContains(validator.Attributes.img, 'height'));
        this.assertFalse(this.arrayContains(validator.Attributes.th, 'height'));
    }

    this.testSet = function() {
        var validator = new XhtmlValidation();

        var set1 = new validator.Set(['a','b','c']);
        this.assertTrue(set1.a && set1.b && set1.c);
        var set2 = new validator.Set(set1);
        this.assertTrue(set2.a && set2.b && set2.c);
    }
    this.testValidator = function() {
        var validator = new XhtmlValidation();
        //alert("p attrs="+validator.Attributes['p']);
        //alert("attrs ="+validator.attrs);
        //alert("td attrs="+validator.Attributes['td']);
        var table = validator.States['table'];
        var tags = [];
        for (var tag in table) {
            this.assertEquals(table[tag], 1);
            tags.push(tag);
        }
        this.assertEquals(tags.toString(),
                          ['caption','col','colgroup',
                          'thead','tfoot','tbody','tr'].toString());
    };

    this.testConvertToSarissa = function() {
        var doc = this.doc.documentElement;
        var editor = this.editor;
        this.body.innerHTML = '<p class="blue">This is a test</p>';
        var xhtmldoc = Sarissa.getDomDocument();
        var newdoc = editor._convertToSarissaNode(xhtmldoc, this.doc.documentElement);
        this.assertEquals(newdoc.xml,
            this.incontext('<p class="blue">This is a test</p>'));
    }
    this.testConvertToSarissa2 = function() {
        var doc = this.doc.documentElement;
        var editor = this.editor;
        this.body.innerHTML = '<div id="div1">This is a test</div>';
        var xhtmldoc = Sarissa.getDomDocument();
        var newdoc = editor._convertToSarissaNode(xhtmldoc, this.doc.documentElement);
        this.assertEquals(newdoc.xml,
                          this.incontext('<div id="div1">This is a test</div>'));
    }
    this.testbadTags = function() {
        var doc = this.doc.documentElement;
        var editor = this.editor;
        this.body.innerHTML = '<div><center>centered</center><p>Test</p><o:p>zzz</o:p></div>';
        var xhtmldoc = Sarissa.getDomDocument();
        var newdoc = editor._convertToSarissaNode(xhtmldoc, this.doc.documentElement);
        this.assertEquals(newdoc.xml,
                          this.incontext('<div>centered<p>Test</p>zzz</div>'));
    }
}

KupuXhtmlTestCase.prototype = new TestCase;
