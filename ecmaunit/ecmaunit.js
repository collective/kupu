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

/*
   Object Oriented prototype-based unit test suite
*/

function TestCase() {
    /* a single test case */
    
    this.initialize = function(outputelid) {
        /* call this before running the test */
        this._outputel = document.getElementById(outputelid);

        // this array will be displayed when done (if it contains anything)
        this._exceptions = new Array();
    };

    this.setUp = function() {
        /* this will be called on before each test method that is ran */
    };

    this.tearDown = function() {
        /* this will be called after each test method that has been ran */
    };

    this.assertEquals = function(var1, var2) {
        /* assert whether 2 vars have the same value */
        if (var1 && var1.toSource && var2 && var2.toSource) {
            if (var1.toSource() != var2.toSource()) {
                throw('Assertion failed: ' + var1 + ' != ' + var2);
            };
        } else {
            if (var1 != var2) {
                throw('Assertion failed: ' + var1 + ' != ' + var2);
            };
        };
    };

    this.assert = function(statement) {
        /* assert whether a variable resolves to true */
        if (!statement) {
            throw('Assertion ' + statement.toString ? statement.toString() : statement + ' failed');
        };
    };

    this.assertTrue = this.assert;

    this.assertFalse = function(statement) {
        /* assert whether a variable resolves to false */
        if (statement) {
            throw('Assertion ' + statement.toString() + ' failed');
        };
    };

    this.assertRaises = function(func, exception, context) {
        /* assert whether a certain exception is raised */
        if (!context) {
            context = null;
        };
        var exception_thrown = false;
        try {
            func.apply(context, arguments);
        } catch(e) {
            if (!exception) {
                return;
            };
            if (exception.toSource && e.toSource) {
                exception = exception.toSource();
                e = e.toSource();
            } else if (exception.toString && e.toString) {
                exception = exception.toString();
                e = e.toString();
            };
            if (e != exception) {
                throw('Function threw the wrong exception ' + 
                        e.toString() + ', while expecting ' + 
                        exception.toString());
            };
            exception_thrown = true;
        };
        if (!exception_thrown) {
            if (exception) {
                throw("function didn\'t raise exception \'" + 
                        exception.toString() + "'");
            } else {
                throw('function didn\'t raise exception');
            };
        };
    };

    this.runTests = function() {
        /* find all methods of which the name starts with 'test'
            and call them */
        var ret = this._runHelper();
        this._writeFinalOutput(ret[0], ret[1]);
    };

    this._runHelper = function() {
        /* this actually runs the tests
            return value is an array [total tests ran, total time spent (ms)]
        */
        var now = new Date();
        var starttime = now.getTime();
        var numtests = 0;
        for (var attr in this) {
            if (attr.substr(0, 4) == 'test') {
                this.setUp();
                try {
                    this[attr]();
                    this._writeSuccessOutput();
                } catch(e) {
                    this._writeErrorOutput(attr, e);
                    this._exceptions.push(new Array(attr, e));
                };
                this.tearDown();
                numtests++;
            };
        };
        var now = new Date();
        var totaltime = now.getTime() - starttime;
        return new Array(numtests, totaltime);
    };

    this._writeSuccessOutput = function() {
        /* output a dot */
        // a single dot looks rather small
        var dot = document.createTextNode('+');
        this._outputel.appendChild(dot);
    };

    this._writeErrorOutput = function(attr, exception) {
        /* output a failure message */
        var f = document.createTextNode('F');
        this._outputel.appendChild(f);
    };

    this._writeFinalOutput = function(numtests, time) {
        /* write the result output to the html node */
        var p = document.createElement('p');
        var text = document.createTextNode(numtests + ' tests ran in ' + 
                                            time / 1000.0 + ' seconds');
        p.appendChild(text);
        this._outputel.appendChild(p);
        if (this._exceptions.length) {
            for (var i=0; i < this._exceptions.length; i++) {
                var attr = this._exceptions[i][0];
                var exception = this._exceptions[i][1];
                var div = document.createElement('div');
                var text = document.createTextNode('Test ' + attr + 
                                            ', exception: ' + exception);
                div.appendChild(text);
                div.style.color = 'red';
                this._outputel.appendChild(div);
            };
            var div = document.createElement('div');
            var text = document.createTextNode('NOT OK!');
            div.appendChild(text);
            div.style.backgroundColor = 'red';
            div.style.color = 'black';
            div.style.fontWeight = 'bold';
            div.style.textAlign = 'center';
            div.style.marginTop = '1em';
            this._outputel.appendChild(div);
        } else {
            var div = document.createElement('div');
            var text = document.createTextNode('OK!');
            div.appendChild(text);
            div.style.backgroundColor = 'lightgreen';
            div.style.color = 'black';
            div.style.fontWeight = 'bold';
            div.style.textAlign = 'center';
            div.style.marginTop = '1em';
            this._outputel.appendChild(div);
        };
    };
};

function TestSuite(outputelid) {
    /* run a suite of tests */
    this._outputel = document.getElementById(outputelid);
    this._outputelid = outputelid;
    this._tests = new Array();
    this._exceptions = new Array();
    
    this.registerTest = function(name, test) {
        /* register a test */
        if (!test) {
            throw('TestSuite.registerTest() takes two arguments, got one.');
        };
        this._tests.push(new Array(name, test));
    };

    this.runSuite = function() {
        /* run the suite */
        var now = new Date();
        var starttime = now.getTime();
        var testsran = 0;
        for (var i=0; i < this._tests.length; i++) {
            var testinfo = this._tests[i];
            var test = new testinfo[1]();
            test.initialize(this._outputelid);
            testsran += test._runHelper()[0];
            // the TestCase class handles output of dots and Fs, but we
            // should take care of the exceptions
            if (test._exceptions.length) {
                for (var j=0; j < test._exceptions.length; j++) {
                    // attr, exc in the org array, so here it becomes
                    // name, attr, exc
                    var excinfo = test._exceptions[j];
                    this._exceptions.push(new Array(testinfo[0], 
                                        excinfo[0], excinfo[1]));
                };
            };
        };
        var now = new Date();
        var totaltime = now.getTime() - starttime;
        this._writeFinalOutput(testsran, totaltime);
    };

    this._writeFinalOutput = function(numtests, time) {
        /* write the result output to the html node */
        var p = document.createElement('p');
        var text = document.createTextNode(numtests + ' tests ran in ' + 
                                            time / 1000.0 + ' seconds');
        p.appendChild(text);
        this._outputel.appendChild(p);
        if (this._exceptions.length) {
            for (var i=0; i < this._exceptions.length; i++) {
                var testname = this._exceptions[i][0];
                var attr = this._exceptions[i][1];
                var exception = this._exceptions[i][2];
                var div = document.createElement('div');
                var text = document.createTextNode('Test ' + testname + '.' + 
                                            attr + ', exception: ' + exception);
                div.appendChild(text);
                div.style.color = 'red';
                this._outputel.appendChild(div);
            };
            var div = document.createElement('div');
            var text = document.createTextNode('NOT OK!');
            div.appendChild(text);
            div.style.backgroundColor = 'red';
            div.style.color = 'black';
            div.style.fontWeight = 'bold';
            div.style.textAlign = 'center';
            div.style.marginTop = '1em';
            this._outputel.appendChild(div);
        } else {
            var div = document.createElement('div');
            var text = document.createTextNode('OK!');
            div.appendChild(text);
            div.style.backgroundColor = 'lightgreen';
            div.style.color = 'black';
            div.style.fontWeight = 'bold';
            div.style.textAlign = 'center';
            div.style.marginTop = '1em';
            this._outputel.appendChild(div);
        };
    };
};
