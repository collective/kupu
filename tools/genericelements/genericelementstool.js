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
    'alwaysOkay': function(data) {
        return true;
    },
    'requiredInteger': function(data) {
        return (/[0-9]+/.exec(data));
    },
    'requiredIntegerError': 'value required, needs to be a number',
    'optionalInteger': function(data) {
        return (!data || /[0-9]+/.exec(data));
    },
    'optionalIntegerError': 'value needs to be a number',
    'requiredString': function(data) {
        return !!data;
    },
    'requiredStringError': 'value required',
    'optionalString': function(data) {
        return 1;
    }
};

// a list of elements that are likely to get used as a placeholder and 
// that must get content in XHTML, they will get an &nbsp; as content
var NON_SINGLE = new Array('div', 'span', 'p', 'textarea');

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
        this._insideElement = false;
        addEventHandler(editor.getInnerDocument(), 'keypress', this.handleKeyPress, this);
    };

    this.updateState = function(selNode) {
        var genericel = this.getNearestGenericElement(selNode);
        if (genericel) {
            this._insideElement = true;
        } else {
            this._insideElement = false;
        };
        for (var tbid in this.toolboxes) {
            this.toolboxes[tbid].updateState(selNode);
        };
    };

    this.handleKeyPress = function(event) {
        if (!this._insideElement) {
            return;
        };
        if (event.keyCode == 13) {
            var selNode = this.editor.getSelectedNode();
            var div = this.getNearestGenericElement(selNode);
            if (div.nextSibling) {
                var selection = this.editor.getSelection();
                selection.selectNodeContents(div.nextSibling);
                selection.collapse();
            } else {
                var doc = this.editor.getInnerDocument();
                var p = doc.createElement('p');
                var nbsp = doc.createTextNode('\xa0');
                p.appendChild(nbsp);
                div.parentNode.appendChild(p);
                var selection = this.editor.getSelection();
                selection.selectNodeContents(p);
                selection.collapse();
            };
        };
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        };
    };

    this.getNearestGenericElement = function(selNode) {
        var currnode = selNode;
        while (currnode && currnode.nodeType != 9) {
            if (currnode.nodeType == 3) {
                currnode = currnode.parentNode;
            };
            if (currnode.getAttribute('genericelement')) {
                return currnode;
            };
            currnode = currnode.parentNode;
        };
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
        var selNode = this.editor.getSelectedNode();
        
        var el = this.getElementById(elid);
        var errors = this.arePropertiesInvalid(el, properties);
        if (errors) {
            var error = 'Invalid property values for: ' + errors.join(', ');
            throw(error);
        };
        
        var node = this.editor.getInnerDocument().createElement(el[3]);
        node.setAttribute('genericelement', elid);
        for (var i=0; i < el[4].length; i++) {
            node.setAttribute(el[4][i][0], el[4][i][1]);
        };

        for (var id in properties) {
            var value = properties[id];
            if (typeof(value) != typeof('')) {
                value = value.join('||');
            };
            node.setAttribute('genelprop_' + id, value);
        };

        if (NON_SINGLE.contains(el[3])) {
            var doc = this.editor.getInnerDocument();
            var title = doc.createElement('h3');
            var titlecontent = doc.createTextNode(el[1]);
            title.appendChild(titlecontent);
            node.appendChild(title);

            for (var i=0; i < el[2].length; i++) {
                var id = el[2][i][0];
                var name = el[2][i][1];
                var div = doc.createElement('div');
                var content = name + ': ' + properties[id];
                var text = doc.createTextNode(content);
                div.appendChild(text);
                node.appendChild(div);
            };
        };

        var currgenericel = this.getNearestGenericElement(selNode);
        if (currgenericel) {
            currgenericel.parentNode.replaceChild(node, currgenericel);
            var selection = this.editor.getSelection();
            selection.selectNodeContents(node);
            selection.collapse(true);
            this.editor.logMessage('Updated generic element');
        } else {
            this.editor.insertNodeAtSelection(node);
            this.editor.logMessage('Added generic element');
        };
    };

    this.deleteElement = function() {
        /* remove the element in which the cursor is currently located */
        var selNode = this.editor.getSelectedNode();
        var currgenericel = this.getNearestGenericElement(selNode);
        if (!currgenericel) {
            this.editor.logMessage('Not inside a generic element!', 1);
            return;
        };

        currgenericel.parentNode.removeChild(currgenericel);
        this.editor.logMessage('Generic element deleted');
    };

    // XXX because of some stupid bug in IE we have to pass the formholder
    // in as an argument, when we didn't IE wouldn't check any checkboxes
    // (seems IE can only check them if they're visible?!?)
    this.getForm = function(elid,values, formholder) {
        /* get the form for a specific type of element */
        if (!values) {
            values = {};
        };
        var form = document.createElement('form');
        formholder.appendChild(form);
        form.setAttribute('elementid', elid);
        var el = this.getElementById(elid);

        // add the title
        var title = document.createTextNode(el[1]);
        var h3 = document.createElement('h3');
        h3.setAttribute('className', 'genericelement-form-title');
        h3.appendChild(title);
        form.appendChild(h3);

        // add each seperate field
        for (var i=0; i < el[2].length; i++) {
            var field = el[2][i];
            var id = field[0];
            var title = field[1];
            var type = field[2];
            var defaultValue = values[id] ? values[id] : field[5];
            var items = field[6];
            
            // add the title of the field
            var titlediv = document.createElement('div');
            titlediv.setAttribute('className', 'genericelement-form-text');
            var titletext = document.createTextNode(title);
            titlediv.appendChild(titletext);
            form.appendChild(titlediv);

            // add the field itself
            var inputel = undefined;
            if (type == 'textarea') {
                inputel = document.createElement('textarea');
                var content = undefined;
                if (defaultValue) {
                    content = defaultValue;
                } else {
                    content = document.createTextNode('&#xa0;');
                };
                inputel.appendChild(content);
                inputel.setAttribute('className', 'genericelement-form-field');
                inputel.setAttribute('name', id);
                form.appendChild(inputel);
            } else if (type == 'checkbox' || type == 'radio') {
                for (var j=0; j < items.length; j++) {
                    var item = items[j];
                    var inputel = document.createElement('input');
                    inputel.setAttribute('type', type);
                    inputel.setAttribute('className', 'genericelement-form-field');
                    inputel.setAttribute('name', id);
                    inputel.setAttribute('value', item);
                    form.appendChild(inputel);
                    form.appendChild(document.createTextNode(item));
                    var inputtext = document.createElement(item);
                    form.appendChild(inputtext);
                    form.appendChild(document.createElement('br'));
                    if (defaultValue.contains(item)) {
                        inputel.setAttribute('checked', 'checked');
                    };
                };
            } else if (type == 'select') {
                var select = document.createElement('select');
                select.setAttribute('name', id);
                for (var j=0; j < items.length; j++) {
                    var item = items[j];
                    var option = document.createElement('option');
                    option.setAttribute('value', item);
                    option.appendChild(document.createTextNode(item));
                    if (item == defaultValue) {
                        option.setAttribute('selected', true);
                    };
                    select.appendChild(option);
                };
                form.appendChild(select);
            } else {
                inputel = document.createElement('input');
                inputel.setAttribute('type', type);
                if (defaultValue) {
                    inputel.value = defaultValue;
                };
                inputel.setAttribute('className', 'genericelement-form-field');
                inputel.setAttribute('name', id);
                form.appendChild(inputel);
            };
            form.appendChild(document.createElement('br'));
        };

        return form;
    };

    this.arePropertiesInvalid = function(el, properties) {
        /* validate the form properties for some type of element 
        
            properties should be a dict (object) with field ids as
            its keys and values as its values
            
        */
        var errors = new Array();
        for (id in properties) {
            var valtuple = this._getValidatorForField(el, id);
            var value = properties[id];
            if (!valtuple[1](value)) {
                var fieldtitle = this._getFieldTitle(el, id);
                var error = fieldtitle;
                var message = VALIDATORS[valtuple[0] + 'Error'];
                if (message) {
                    error += ' (' + message + ')';
                };
                errors.push(error);
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

    this.parseForm = function(form) {
        /* parse the form to a dict */
        return gatherFormData(form);
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
                      <default>[default value (optional, '||'-seperated list 
                                for checkbox or radio, single value for the
                                rest)]</default>
                      <items>[list of items (optional, only useful when type 
                                == checkbox, radio or select, '||'-seperated
                                list of values)
                                ]</items>
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
            var form = el.getElementsByTagName('formdef')[0];
            var fieldelements = form.getElementsByTagName('field');
            var formfields = new Array();
            for (var j=0; j < fieldelements.length; j++) {
                var field = fieldelements[j];
                if (field.nodeType != 1) {
                    continue;
                };

                var id = undefined;
                var title = undefined;
                var type = undefined;
                var valid = undefined;
                var validator = undefined;
                var defaultValue = undefined;
                var items = undefined;
                for (var k=0; k < field.childNodes.length; k++) {
                    var fieldchild = field.childNodes[k];
                    if (fieldchild.nodeType != 1) {
                        continue;
                    };
                    var nodeName = fieldchild.nodeName.toLowerCase();
                    if (nodeName == 'id') {
                        id = fieldchild.childNodes[0].nodeValue.strip();
                    } else if (nodeName == 'name') {
                        title = fieldchild.childNodes[0].nodeValue.strip();
                    } else if (nodeName == 'type') {
                        type = fieldchild.childNodes[0].nodeValue.strip();
                    } else if (nodeName == 'validator') {
                        valid = fieldchild.childNodes[0].nodeValue.strip();
                        validator = this._getValidator(valid);
                    } else if (nodeName == 'default') {
                        defaultValue = fieldchild.childNodes[0].nodeValue.strip();
                        if (type == 'radio' || type == 'checkbox') {
                            var chunks = defaultValue.split('||');
                            defaultValue = new Array();
                            for (var l=0; l < chunks.length; l++) {
                                defaultValue.push(chunks[l].strip());
                            };
                        };
                    } else if (nodeName == 'items') {
                        items = fieldchild.childNodes[0].nodeValue.strip();
                        if (type == 'radio' || type == 'checkbox' || type == 'select') {
                            var chunks = items.split('||');
                            items = new Array();
                            for (var l=0; l < chunks.length; l++) {
                                items.push(chunks[l].strip());
                            };
                        } else {
                            this.editor.logMessage('Unexpected element ' +
                                    '\'items\' in field element for ' + id, 1);
                        };
                    };
                };
                formfields.push(new Array(id, title, type, valid, validator, defaultValue, items));
            };
            eltuple.push(formfields);

            // now do the replacement element, also nested so also somewhat messier
            var replacementel = el.getElementsByTagName('replacement')[0];
            var repname = undefined;
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
                        var propname = undefined;
                        var propvalue = undefined;
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

    this._getValidatorForField = function(el, fieldid) {
        var validator;
        for (var i=0; i < el[2].length; i++) {
            var field = el[2][i];
            if (field[0] == fieldid) {
                return new Array(field[3], field[4]);
            };
        };
        return false;
    };

    this._getFieldTitle = function(el, fieldid) {
        var fields = el[2];
        for (var i=0; i < fields.length; i++) {
            var field = fields[i];
            if (field[0] == fieldid) {
                return field[1];
            };
        };
    };
};

GenericElementsTool.prototype = new KupuTool;

function gatherFormData(form) {
    /* walks through the form and creates a POST body */
    // first place all data into a dict, convert to a string later on
    var data = {};
    for (var i=0; i < form.childNodes.length; i++) {
        var child = form.childNodes[i];
        var elname = child.nodeName.toLowerCase();
        if (child.nodeType != 1 || (elname != 'input' && elname != 'textarea' && elname != 'select')) {
            continue;
        };
        if (elname == 'input') {
            var name = child.getAttribute('name');
            var type = child.getAttribute('type');
            if (!type || type == 'text' || type == 'hidden' || type == 'password') {
                data[name] = child.value;
            } else if (type == 'checkbox' || type == 'radio') {
                if (child.checked) {
                    if (data[name]) {
                        if (typeof data[name] == typeof('')) {
                            var value = new Array(data[name]);
                            value.push(child.value);
                            data[name] = value;
                        } else {
                            data[name].push(child.value);
                        };
                    } else {
                        data[name] = child.value;
                    };
                };
            };
        } else if (elname == 'textarea') {
            data[child.getAttribute('name')] = child.value;
        } else if (elname == 'select') {
            var name = child.getAttribute('name');
            var multiple = child.getAttribute('multiple');
            if (!multiple) {
                data[name] = child.options[child.selectedIndex].value;
            } else {
                var value = new Array();
                for (var i=0; i < child.options.length; i++) {
                    if (child.options[i].checked) {
                        value.push(options[i].value);
                    };
                    if (value.length > 1) {
                        data[name] = value;
                    } else if (value.length) {
                        data[name] = value[0];
                    };
                };
            };
        };
    };
    
    return data;
};

function GenericElementsToolBox(elselectid, formholderid, addbuttonid, deletebuttonid,
                                cancelbuttonid, toolboxid, plainclass, activeclass) {
    /* the UI counterpart of GenericTool */
    
    this.elselect = document.getElementById(elselectid);
    this.formholder = document.getElementById(formholderid);
    this.addbutton = document.getElementById(addbuttonid);
    this.delbutton = document.getElementById(deletebuttonid);
    this.cancelbutton = document.getElementById(cancelbuttonid);
    this.toolbox = document.getElementById(toolboxid);
    this.plainclass = plainclass;
    this.activeclass = activeclass;

    this.initialize = function(tool, editor) {
        this.tool = tool;
        this.editor = editor;
        this.form = undefined;
        this.state = 'new';
        
        addEventHandler(this.addbutton, 'click', this.addEl, this);
        addEventHandler(this.delbutton, 'click', this.deleteEl, this);
        addEventHandler(this.cancelbutton, 'click', this.reset, this);

        this.cancelbutton.style.display = 'none';
        this.delbutton.style.display = 'none';

        this._fillElSelect();
    };

    this.updateState = function(selNode) {
        var currentgenel = this.tool.getNearestGenericElement(selNode);
        if (currentgenel) {
            var elid = currentgenel.getAttribute('genericelement');
            selectSelectItem(this.elselect, elid);
            var values = this._getValuesFromElement(currentgenel);
            this.drawForm(values);
            this.addbutton.style.display = 'inline';
            this.cancelbutton.style.display = 'none';
            this.delbutton.style.display = 'inline';
            if (this.toolbox && this.activeclass) {
                this.toolbox.setAttribute('className', this.activeclass);
            };
        } else {
            this.reset();
        };
    };

    this.drawForm = function(values) {
        var elid = this.elselect.options[this.elselect.selectedIndex].value;
        this.reset();
        var form = this.tool.getForm(elid, values, this.formholder);
        this.form = form;
        //this.formholder.appendChild(form);
        this.elselect.style.display = 'none';
        this.state = 'form';
    };

    this.addEl = function() {
        if (this.state == 'new') {
            this.drawForm();
            this.addbutton.style.display = 'inline';
            this.cancelbutton.style.display = 'inline';
            this.delbutton.style.display = 'none';
            if (this.toolbox && this.activeclass) {
                this.toolbox.setAttribute('className', this.activeclass);
            };
            return;
        };
        var elid = this.form.getAttribute('elementid');
        var properties = this.tool.parseForm(this.formholder.firstChild);
        try {
            this.tool.addElement(elid, properties);
        } catch(e) {
            alert(e);
            // just return, which will leave the toolbox in 'form' state
            return;
        };
    };

    this.deleteEl = function() {
        this.tool.deleteElement();
        this.reset();
    };

    this.reset = function() {
        while (this.formholder.hasChildNodes()) {
            this.formholder.removeChild(this.formholder.firstChild);
        };
        this.elselect.selectedIndex = 0;
        this.elselect.style.display = 'block';
        this.addbutton.style.display = 'inline';
        this.cancelbutton.style.display = 'none';
        this.delbutton.style.display = 'none';
        this.state = 'new';
        this.form = undefined;
        if (this.toolbox && this.plainclass) {
            this.toolbox.setAttribute('className', this.plainclass);
        };
    };

    this._fillElSelect = function() {
        var eltuples = this.tool.getElementIdNameTuples();
        for (var i=0; i < eltuples.length; i++) {
            var eltuple = eltuples[i];
            var id = eltuple[0];
            var name = eltuple[1];
            var option = document.createElement('option');
            option.setAttribute('value', id);
            var content = document.createTextNode(name);
            option.appendChild(content);
            this.elselect.appendChild(option);
        };
        this.elselect.parentNode.replaceChild(this.elselect, this.elselect);
    };

    this._getValuesFromElement = function(el) {
        var values = {};
        for (var i=0; i < el.attributes.length; i++) {
            var attr = el.attributes[i];
            if (attr.name.indexOf('genelprop_') == 0) {
                var value = attr.value;
                if (value.indexOf('||') > -1) {
                    value = value.split('||');
                };
                values[attr.name.substr('genelprop_'.length)] = value;
            };
        };
        return values;
    };
};

GenericElementsToolBox.prototype = new KupuToolBox;
