/*****************************************************************************
 *
 * Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id: kupueditor.js 5867 2004-08-04 12:19:51Z guido $

// a mapping from validator id to validator, the validators are
// used to validate the form values a user has entered
var VALIDATORS = {
    'requiredInteger': function(data) {
        return (typeof(data) == typeof(1));
    },
    'optionalInteger': function(data) {
        return (!data || typeof(data) == typeof(1));
    },
    'requiredString': function(data) {
        return (typeof(data) == typeof(''));
    },
    'optionalString': function(data) {
        return (!data || typeof(data) == typeof(''));
    }
};

function GenericElementsTool(xmlid) {
    /* a tool to add placeholders for generic elements to the document

        the placeholders can later on be replaced by their real counterparts
        on the server (or in some contentfilter), that way it's possible to
        use Kupu to add arbitrary elements (e.g. form elements or non-HTML
        elements) to a document

    */
    
    this.xmlid = xmlid;
    
    this.initialize = function(editor) {
        this.editor = editor;
        var dom = document.getElementById(this.xmlid);
        this.elements = this._parseXML(dom);
    };

    this.getElementIds = function() {
        /* returns a list with the ids of all available elements */
        var ids = new Array();
        for (var i=0; i < this.elements.length; i++) {
            ids.push(this.elements[i][0]);
        };
        return ids;
    };

    this.getElementIdNameTuples = function() {
        /* returns a list with tuples (id, name) for all available elements */
        var idnames = new Array();
        for (var i=0; i < this.elements.length; i++) {
            var el = this.elements[i];
            idnames.push(new Array(el[0], el[1]));
        };
        return idnames;
    };

    this.addElement = function(elid, properties) {
        /* add an element to the current location */
        var el = this.getElementById(elid);
        
    };

    this.delElement = function() {
        /* remove the element in which the cursor is currently located */
    };

    this.changeElement = function(properties) {
        /* change the current element's properties */
    };

    this.getFormFor = function(elid) {
        /* get the form for a specific type of element */
    };

    this.arePropertiesInvalid = function(elid, properties) {
        /* validate the form properties for some type of element 
        
            properties should be a dict (object) with field ids as
            its keys and values as its values
            
        */
        var errors = new Array();
        for (id in properties) {
            var validator = this.getValidatorForField(elid, id);
            var value = properties[id];
            if (!validator(value)) {
                errors.push(id);
            };
        };
        if (errors.length) {
            return errors;
        } else {
            return false;
        };
    };

    this.getElementById = function(id) {
        for (var i=0; i < this.elements.length; i++) {
            var el = this.elements[i];
            if (el[0] == id) {
                return el;
            };
        };
        return false;
    };

    this._parseXML = function(dom) {
        /* parses the XML into a (more?) handy list
        
            format of the XML:

              <elements>
                <element>
                  <id>[id]</id>
                  <name>[element name]</name>
                  <form>
                    <field>
                      <id>[id]</id>
                      <title>[title]</title>
                      <type>[fieldtype]</type>
                      <validator>[validator id]</validator>
                    </field>
                    ...
                  </form>
                  <replacement>
                    <name>[name of replacement element]</name>
                    <properties>
                        <property>
                            <name>[propertyname]</name>
                            <value>[property value]</value>
                        </property>
                    </properties>
                  </replacement>
                </element>
                ...
              </elements>
        
            format of the list:

              [
                [<element id>, 
                    <tagname>,
                    [
                        [<fieldid>, 
                            <fieldtitle>,
                            <fieldtype>,
                            <fieldvalidatorid>,
                            <fieldvalidator>
                            ],
                        ...
                        ],
                    ],
                    <replacement_name>,
                    [
                        [<replacement_property_name>,
                            <replacement_property_value>],
                        ...
                    ]
                ]

            (so essentially it's a list of tuples 
            (id, name, form, replacementid, replacementproperties))

        */
        var elements = dom.getElementsByTagName('element');
        var elementlist = new Array();
        for (var i=0; i < elements.length; i++) {
            // handle each element
            // get each property from the XML one by one
            var eltuple = new Array();
            var el = elements[i];
            
            // first basic stuff, id, name
            var id = el.getElementsByTagName('id')[0].
                        childNodes[0].nodeValue.strip();
            eltuple.push(id);
            
            var name = el.getElementsByTagName('name')[0].
                        childNodes[0].nodeValue.strip();
            eltuple.push(name);
            
            // now the form, a nested structure so it'll be somewhat more 
            // complex (read: messy)
            var form = el.getElementsByTagName('form')[0];
            var fieldelements = form.getElementsByTagName('field');
            var formfields = new Array();
            for (var j=0; j < fieldelements.length; j++) {
                var field = fieldelements[j];
                if (field.nodeType != 1) {
                    continue;
                };

                var id;
                var title;
                var type;
                var valid;
                var validator;
                for (var k=0; k < field.childNodes.length; k++) {
                    var fieldchild = field.childNodes[k];
                    if (fieldchild.nodeType != 1) {
                        continue;
                    };
                    var nodeName = fieldchild.nodeName.toLowerCase();
                    if (nodeName == 'id') {
                        id = fieldchild.childNodes[0].nodeValue.strip();
                    } else if (nodeName == 'title') {
                        title = fieldchild.childNodes[0].nodeValue.strip();
                    } else if (nodeName == 'type') {
                        type = fieldchild.childNodes[0].nodeValue.strip();
                    } else if (nodeName == 'validator') {
                        valid = fieldchild.childNodes[0].nodeValue.strip();
                        validator = this._getValidator(valid);
                    };
                };
                formfields.push(new Array(id, title, type, valid, validator));
            };
            eltuple.push(formfields);

            // now do the replacement element, also nested so also somewhat messier
            var replacementel = el.getElementsByTagName('replacement')[0];
            var repname;
            var repprops = new Array();
            for (var j=0; j < replacementel.childNodes.length; j++) {
                var repchild = replacementel.childNodes[j];
                if (repchild.nodeType != 1) {
                    continue;
                };
                var nodeName = repchild.nodeName.toLowerCase();
                if (nodeName == 'name') {
                    repname = repchild.childNodes[0].nodeValue.strip();
                } else if (nodeName == 'properties') {
                    var props = repchild.getElementsByTagName('property');
                    for (var k=0; k < props.length; k++) {
                        var prop = props[k];
                        var propname;
                        var propvalue;
                        for (var l=0; l < prop.childNodes.length; l++) {
                            // XXX WAAAAAAAH!!! QUADRUPLE NESTED FOR-LOOP ALERT!!!
                            // /me notes: ignorable whitespace SUCKS!!!
                            var propchild = prop.childNodes[l];
                            if (propchild.nodeType != 1) {
                                continue;
                            };
                            var propNodeName = propchild.nodeName.toLowerCase();
                            if (propNodeName == 'name') {
                                propname = propchild.childNodes[0].nodeValue;
                            } else if (propNodeName == 'value') {
                                propvalue = propchild.childNodes[0].nodeValue;
                            };
                        };
                        repprops.push(new Array(propname, propvalue));
                    };
                };
            };
            eltuple.push(repname);
            eltuple.push(repprops);
            
            elementlist.push(eltuple);
        };
        return elementlist;
    };

    this._getValidator = function(id) {
        return VALIDATORS[id];
    };

    this._getValidatorForField = function(elid, fieldid) {
        var el = this.getElementById(elid);
        var validator;
        for (var i=0; i < el[2].length; i++) {
            var field = el[2][i];
            if (field[3] == fieldid) {
                return field[4];
            };
        };
        return false;
    };
};

GenericElementsTool.prototype = new KupuTool;
