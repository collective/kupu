/*****************************************************************************
 *
 * Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id$

function InitKupuCheckersTestCase() {
    // Please note that we are cheating here a bit:
    // 1. No idea how to get the real checkers without setting up a complete
    //    Kupu, so we work on a copy here.
    // 2. We test getSelectedNode, ParentWithStyleChecker and the arguments
    //    used in initKupu simultanously, so these tests don't tell you what's
    //    responsible if they fail.

    /*Moz:
       <span style="font-weight: bold;">foo</span>
       <span style="font-style: italic;">bar</span>
       <span style="text-decoration: underline;">baz</span>
       <sub>spam</sub>
       <sup>eggs</sup>
      Moz noCSS:
       <b>foo</b>
       <i>bar</i>
       <u>baz</u>
       <sub>spam</sub>
       <sup>eggs</sup>
      IE:
       <STRONG>foo</STRONG>
       <EM>bar</EM>
       <U>baz</U>
       <SUB>spam</SUB>
       <SUP>eggs</SUP>*/

    this.setUp = function() {
        var iframe = document.getElementById('iframe');
        this.doc = iframe.contentWindow.document;
        this.body = this.doc.getElementsByTagName('body')[0];
        this.kupudoc = new KupuDocument(iframe);
        this.selection = this.kupudoc.getSelection();
        this.kupudoc.getWindow().focus();
    };

    this._makeBoldchecker = function() {
        // XXX copied from initKupu, must be synced manually!
        var boldchecker = ParentWithStyleChecker(new Array('b', 'strong'),
    					     'font-weight', 'bold');
        return boldchecker;
        };

    this._makeItalicschecker = function() {
        // XXX copied from initKupu, must be synced manually!
        var italicschecker = ParentWithStyleChecker(new Array('i', 'em'),
    						'font-style', 'italic');
        return italicschecker;
        };

    this._setSelection = function(startTag, startOffset, endTag, endOffset,
                                  verificationString) {
        var startElement = this.body.getElementsByTagName(startTag)[0];
        var endElement = this.body.getElementsByTagName(endTag)[0];
        var innerSelection = this.selection.selection;
        if (_SARISSA_IS_IE) {
            var range = innerSelection.createRange();
            var endrange = innerSelection.createRange();
            range.moveToElementText(startElement);
            range.moveStart('character', startOffset);
            endrange.moveToElementText(endElement);
            endrange.moveStart('character', endOffset);
            range.setEndPoint('EndToStart', endrange);
            range.select();
        } else {
            innerSelection.collapse(startElement.firstChild, startOffset);
            if (startElement != endElement || startOffset != endOffset) {
                innerSelection.extend(endElement.firstChild, endOffset);
            };
        };
        this.assertEquals(this.selection.toString(), verificationString);
    };

    this.testBoldcheckerBold = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                        |ar|
        this._setSelection('b', 1, 'b', 3, 'ar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerMixed = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                  |o <b>bar|
        this._setSelection('p', 2, 'b', 3, 'o bar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), false);
    };

    this.XXXtestBoldcheckerBoldLeftOuter = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                    |<b>bar|
        this._setSelection('p', 4, 'b', 3, 'bar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerBoldInner = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                       |bar|
        this._setSelection('b', 0, 'b', 3, 'bar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.XXXtestBoldcheckerExecCommand = function() {
        this.body.innerHTML = '<p>foo bar</p>';
        // select                    |bar|
        this._setSelection('p', 4, 'p', 7, 'bar');
        this.doc.execCommand('bold', null, null);
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.XXXtestBoldcheckerExecCommandCollapsed = function() {
        this.body.innerHTML = '<p>foo bar</p>';
        // select                   ||
        this._setSelection('p', 3, 'p', 3, '');
        this.doc.execCommand('bold', null, null);
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.XXXtestBoldcheckerExecCommandNoCSS = function() {
        if (_SARISSA_IS_IE) return;
        this.doc.execCommand('useCSS', null, true);

        this.body.innerHTML = '<p>foo bar</p>';
        // select                    |bar|
        this._setSelection('p', 4, 'p', 7, 'bar');
        this.doc.execCommand('bold', null, null);
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);

        this.doc.execCommand('useCSS', null, false);
    };

    this.testBoldcheckerStrong = function() {
        this.body.innerHTML = '<p>foo <strong>bar</strong></p>';
        // select                             |ar|
        this._setSelection('strong', 1, 'strong', 3, 'ar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.XXXtestBoldcheckerStyle = function() {
        this.body.innerHTML =
                      '<p>foo <span style="font-weight: bold;">bar</span></p>';
        // select                                              |ar|
        this._setSelection('span', 1, 'span', 3, 'ar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testItalicscheckerItalics = function() {
        this.body.innerHTML = '<p>foo <i>bar</i></p>';
        // select                        |ar|
        this._setSelection('i', 1, 'i', 3, 'ar');
        var selNode = this.selection.getSelectedNode();
        var italicschecker = this._makeItalicschecker();
        this.assertEquals(italicschecker(selNode), true);
    };

    this.testItalicscheckerEmphasis = function() {
        this.body.innerHTML = '<p>foo <em>bar</em></p>';
        // select                         |ar|
        this._setSelection('em', 1, 'em', 3, 'ar');
        var selNode = this.selection.getSelectedNode();
        var italicschecker = this._makeItalicschecker();
        this.assertEquals(italicschecker(selNode), true);
    };

    this.XXXtestItalicscheckerStyle = function() {
        this.body.innerHTML =
                     '<p>foo <span style="font-style: italic;">bar</span></p>';
        // select                                              |ar|
        this._setSelection('span', 1, 'span', 3, 'ar');
        var selNode = this.selection.getSelectedNode();
        var italicschecker = this._makeItalicschecker();
        this.assertEquals(italicschecker(selNode), true);
    };

    this.tearDown = function() {
        this.body.innerHTML = '';
    };
};

InitKupuCheckersTestCase.prototype = new TestCase;
