/*****************************************************************************
 *
 * Copyright (c) 2003-2004 EcmaUnit Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the EcmaUnit
 * License. See LICENSE.txt for license text. For a list of EcmaUnit
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id$

function TestTestCase() {
    this.setUp = function() {
        /* not in use here, didn't have to define it but this might be
	   used as a reference
	*/
    };

    this.testAssert = function() {
        this.assert(true);
	this.assert(false);
    };
        
    this.testAssertEquals = function() {
        this.assertEquals('foo', 'foo');
	this.assertEquals('foo', 'bar');
    };

    this.testAssertTrue = function() {
        this.assertTrue(1);
	this.assertTrue('foo');
	this.assertTrue(false);
    };

    this.testAssertFalse = function() {
        this.assertFalse(0);
	this.assertFalse('');
	this.assertFalse(true);
    };

    this.testAssertRaises = function() {
        this.assertRaises(function() {throw('foo')}, 'foo');
	this.assertRaises(function() {throw(new Array(1,2))}, new Array(1,2));
	this.assertRaises(function() {throw('bar')});
	this.assertRaises(function() {}, 'baz');
    };

    this.tearDown = function() {
        /* not in use here, didn't have to define it but this might be
	   used as a reference
	*/
    };
};

TestTestCase.prototype = new TestCase;

function TestTestCase2() {
    this.setUp = function() {
        function Foo() {
	    this.returnfoo = function() {
	      return 'foo';
	    };
	    this.throwfoo = function() {
	      throw('foo');
	    };
	};
	this.foo = new Foo();
    };

    this.testAssert = function() {
        this.assert(this.foo.returnfoo() == 'foo');
    };
        
    this.testAssertEquals = function() {
        this.assertEquals(this.foo.returnfoo(), 'foo');
    };

    this.testAssertTrue = function() {
        this.assertTrue(this.foo.returnfoo(), 'foo');
    };

    this.testAssertFalse = function() {
        this.assertFalse(this.foo.returnfoo() == 'bar');
    };

    this.testAssertRaises = function() {
        this.assertRaises(this.foo.throwfoo, 'foo');
    };
};

TestTestCase2.prototype = new TestCase;
