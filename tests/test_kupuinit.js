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

    this._makeBoldchecker = function() {
        // XXX copied from initKupu, must be synced manually!
        var boldchecker = ParentWithStyleChecker(new Array('b', 'strong'),
                                                 'fontWeight', 'bold');
        return boldchecker;
        };

    this._makeItalicschecker = function() {
        // XXX copied from initKupu, must be synced manually!
        var italicschecker = ParentWithStyleChecker(new Array('i', 'em'),
                                                    'fontStyle', 'italic');
        return italicschecker;
        };

    this._makeUnderlinechecker = function() {
        // XXX copied from initKupu, must be synced manually!
        var underlinechecker = ParentWithStyleChecker(new Array('u'),
                                                'textDecoration', 'underline');
        return underlinechecker;
        };

    this.testBoldcheckerBold = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                        |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerMixed = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                  |o <b>bar|
        this._setSelection(2, null, 7, false, 'o bar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), false);
    };

    this.testBoldcheckerBoldLeftOuter = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                    |<b>bar|
        this._setSelection(4, false, 7, false, 'bar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerBoldInner = function() {
        this.body.innerHTML = '<p>foo <b>bar</b></p>';
        // select                       |bar|
        this._setSelection(4, true, 7, false, 'bar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerExecCommand = function() {
        this.body.innerHTML = '<p>foo bar</p>';
        // select                    |bar|
        this._setSelection(4, true, 7, false, 'bar');
        this.doc.execCommand('bold', null, null);
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.XXXtestBoldcheckerExecCommandCollapsed = function() {
        this.body.innerHTML = '<p>foo bar</p>';
        // select                   ||
        this._setSelection(3, null, 3, null, '');
        this.doc.execCommand('bold', null, null);
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerExecCommandNoCSS = function() {
        if (_SARISSA_IS_IE) return;
        this.doc.execCommand('useCSS', null, true);

        this.body.innerHTML = '<p>foo bar</p>';
        // select                    |bar|
        this._setSelection(4, null, 7, false, 'bar');
        this.doc.execCommand('bold', null, null);
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);

        this.doc.execCommand('useCSS', null, false);
    };

    this.testBoldcheckerStrong = function() {
        this.body.innerHTML = '<p>foo <strong>bar</strong></p>';
        // select                             |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testBoldcheckerStyle = function() {
        this.body.innerHTML =
                      '<p>foo <span style="font-weight: bold;">bar</span></p>';
        // select                                              |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var boldchecker = this._makeBoldchecker();
        this.assertEquals(boldchecker(selNode), true);
    };

    this.testItalicscheckerItalics = function() {
        this.body.innerHTML = '<p>foo <i>bar</i></p>';
        // select                        |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var italicschecker = this._makeItalicschecker();
        this.assertEquals(italicschecker(selNode), true);
    };

    this.testItalicscheckerEmphasis = function() {
        this.body.innerHTML = '<p>foo <em>bar</em></p>';
        // select                         |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var italicschecker = this._makeItalicschecker();
        this.assertEquals(italicschecker(selNode), true);
    };

    this.testItalicscheckerStyle = function() {
        this.body.innerHTML =
                     '<p>foo <span style="font-style: italic;">bar</span></p>';
        // select                                              |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var italicschecker = this._makeItalicschecker();
        this.assertEquals(italicschecker(selNode), true);
    };

    this.testUnderlinecheckerStyle = function() {
        this.body.innerHTML =
             '<p>foo <span style="text-decoration: underline;">bar</span></p>';
        // select                                              |ar|
        this._setSelection(5, null, 7, false, 'ar');
        var selNode = this.selection.getSelectedNode();
        var underlinechecker = this._makeUnderlinechecker();
        this.assertEquals(underlinechecker(selNode), true);
    };
};

InitKupuCheckersTestCase.prototype = new SelectionTestCase;
