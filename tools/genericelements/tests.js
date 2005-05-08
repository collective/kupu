/*****************************************************************************
 *
 * Copyright (c) 2004 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id: testecmaunit.js 4667 2004-05-27 09:53:14Z philikon $

var xml1 = '<?xml version="1.0" encoding="UTF-8" ?>' +
            '<elements>' +
            '   <genericelement>' +
            '       <id>foo</id>' +
            '       <name>Foo</name>' +
            '       <formdef>' +
            '           <field>' +
            '               <id>some_string</id>' +
            '               <name>Some String Element</name>' +
            '               <type>text</type>' +
            '               <validator>requiredString</validator>' +
            '           </field>' +
            '           <field>' +
            '               <id>some_int</id>' +
            '               <name>Some Integer Element</name>' +
            '               <type>text</type>' +
            '               <validator>requiredInteger</validator>' +
            '           </field>' +
            '       </formdef>' +
            '       <replacement>' +
            '           <element name="div" value="foo">' +
            '             <property name="class">some_element</property>' +
            '             <property name="someattr">some_value</property>' +
            '             <children>' +
            '               <element name="span">' +
            '                 <property name="class">some_other_element' +
                                '</property>' +
            '               </element>' +
            '             </children>' +
            '           </element>' +
            '       </replacement>' +
            '   </genericelement>' +
            '</elements>';

function GenericElementsTestCase() {
    this.setUp = function() {
        // instantiate a tool, but without giving it the location of an
        // XML island, we'll provide the XML from the tests
        this.tool = new GenericElementsTool();
        var dom1 = Sarissa.getDomDocument();
        dom1.loadXML(xml1);
        this.tool.elements = this.tool._parseXML(dom1);
    };

    this.testXmlParser = function() {
        var el = this.tool.elements[0];
        this.assertEquals(el[0], 'foo');
        this.assertEquals(el[1], 'Foo');
        this.assertEquals(el[2].length, 2);
        this.assertEquals(el[2][0][0], 'some_string')
        this.assertEquals(el[2][1][0], 'some_int')
        this.assertEquals(el[2][0][1], 'Some String Element')
        this.assertEquals(el[2][1][1], 'Some Integer Element')
        this.assertEquals(el[2][0][2], 'text')
        this.assertEquals(el[2][1][2], 'text')
        this.assertEquals(el[2][0][3], 'requiredString')
        this.assertEquals(el[2][1][3], 'requiredInteger')
        this.assertEquals(el[2][0][4], this.tool._getValidator('requiredString'))
        this.assertEquals(el[2][1][4], this.tool._getValidator('requiredInteger'))
        this.assertEquals(el[3][0][0], 'div');
        this.assertEquals(el[3][0][1].length, 2);
        // deeply nested? this? :\
        this.assertEquals(el[3][0][1][0][0], 'class');
        this.assertEquals(el[3][0][1][0][1], 'some_element');
        this.assertEquals(el[3][0][1][1][0], 'someattr');
        this.assertEquals(el[3][0][1][1][1], 'some_value');
    };
};

GenericElementsTestCase.prototype = new TestCase;
