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

function KupuEditorTestCase() {
    this.setUp = function() {
        this.editor = new KupuEditor(null, {}, null);
    };
        
    this.test_serializeOutputToString = function() {
        var doc = Sarissa.getDomDocument();
        //alert(doc.nodeName);
	//var docel = doc.documentElement;
        var docel = doc.documentElement ? doc.documentElement : doc;
	var html = doc.createElement('html');
	docel.appendChild(html);
	var head = doc.createElement('head');
	html.appendChild(head);
	var title = doc.createElement('title');
	head.appendChild(title);
	var titletext = doc.createTextNode('foo');
	title.appendChild(titletext);
	var body = doc.createElement('body');
	html.appendChild(body);
	var sometext1 = doc.createTextNode('foo');
	body.appendChild(sometext1);
	var br = doc.createElement('br');
	body.appendChild(br);
	var sometext2 = doc.createTextNode('bar');
	body.appendChild(sometext2);
	var result_not_replaced = '<html><head><title>foo</title></head><body>foo<br/>bar</body></html>';
        this.assertEquals(this.editor._serializeOutputToString(docel), result_not_replaced);
	var result_replaced = '<html><head><title>foo</title></head><body>foo<br />bar</body></html>';
	this.editor.config.compatible_singletons = true;
	this.assertEquals(this.editor._serializeOutputToString(docel), result_replaced);
	var result_strict = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ' + 
	  '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' + 
	  '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>foo</title></head><body>foo<br />bar</body></html>';
	this.editor.config.strict_output = true;
	this.assertEquals(this.editor._serializeOutputToString(docel), result_strict);
    };
};

KupuEditorTestCase.prototype = new TestCase;
