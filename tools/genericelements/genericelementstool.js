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

var SPECIAL_FUNCTIONS = {
    /* an object that contains functions to produce content for 'special' elements */
    'createCheckBoxList': function(doc, editor, tool, formvalues, elementstruct) {
        // this method is created according to a previous implementation made by James of
        // Codename Future, not sure whether it's behaving as it should but if not it's
        // probably a useful example...

        // assume the question is the value of the first form field, like in the previous
        // version
        var question = formvalues[elementstruct[2][0][0]];
        var div = doc.createElement('div');
        var title = doc.createTextNode(question);
        div.appendChild(title);
        // XXX I think we want a break here but it wasn't in the original so 
        // let's comment it out for now...
        // div.appendChild(doc.createElement('br'));
        // now generate checkboxes according to the 'checkbox_choices' field in the
        // formvalues
        var choices = formvalues['checkbox_choices'].split(';');
        for (var i=0; i < choices.length; i++) {
            var choice = choices[i].strip();
            var span = doc.createElement('span');
            var nbsp = doc.createTextNode('\xa0');
            span.appendChild(nbsp);
            
            var input = doc.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('disabled', 'disabled');
            if (choice == question) {
                input.setAttribute('checked', 'checked');
            };
            span.appendChild(input);
            var text = doc.createTextNode(choice);
            span.appendChild(text);

            div.appendChild(span);
        };
        return div;
    }
};

var getNodeText = function(node) {
    /* returns all text content of a node (recursively) */
    var text = '';
    if (node.nodeType == 3) {
        text = node.nodeValue;
    } else {
        for (var i=0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeType == 1) {
                text += getNodeText(child);
            } else if (child.nodeType == 3) {
                text += child.nodeValue;
            };
        };
    };
    return text;
};

// a list of elements that are likely to get used as a placeholder and 
// that must get content in XHTML, they will get an &nbsp; as content
var NON_SINGLE = new Array('div', 'span', 'p', 'textarea');

function GenericElementsTool(xmlid, popupprops) {
    /* a tool to add placeholders for generic elements to the document

        the placeholders can later on be replaced by their real counterparts
        on the server (or in some contentfilter), that way it's possible to
        use Kupu to add arbitrary elements (e.g. form elements or non-HTML
        elements) to a document

    */
    
    this.xmlid = xmlid;
    this.popupprops = popupprops ? popupprops : 'height=200,width=400,notoolbar';
    
    this.initialize = function(editor) {
        this.editor = editor;
        var dom = document.getElementById(this.xmlid);
        this.elements = this._parseXML(dom);
        this._insideElement = false;
        this._clipboard = null;
        addEventHandler(editor.getInnerDocument(), 'keypress', this.handleKeyPress, this);

        // keep a list of unique ids and generate a new one for every
        // element added
        // XXX this is a requirement for CNF, other people may want to remove
        // it by overriding the 'getUniqueIds()' and 'generateUniqueId()'
        // methods
        // XXX this should browse *all* documents in a multi-document setup
        this._unique_ids = this.getUniqueIds(this.editor.getInnerDocument());
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
        /* make sure the element is not editable
        
            does nothing on most key presses, creates a new <p> when
            enter is pressed
        */
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
        /* return the nearest generic element parent (or selNode itself) */
        var currnode = selNode;
        while (currnode && currnode.nodeType != 9) {
            if (currnode.nodeType == 3) {
                currnode = currnode.parentNode;
            };
            if (currnode.getAttribute('genericelement_id')) {
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
        
        // handle the replacement
        var nodeName = el[3][0][0];
        var nodeProps = el[3][0][1];
        var nodeChildren = el[3][0][2];
        var node = this._createReplacementElement(nodeName, elid, nodeProps, nodeChildren, properties, el);

        // set the properties on the element
        for (var id in properties) {
            var value = properties[id];
           
            if (typeof(value) != typeof('')) {
                value = value.join('||');
            };
            node.setAttribute('genelprop_' + id, value);
        };

        // add or replace the replacement element
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

    this.copyElement = function() {
        /* copy the current selected element to the clipboard */
        var selNode = this.editor.getSelectedNode();
        var currgenel = this.getNearestGenericElement(selNode).cloneNode(1);
        if (!currgenel) {
            this.editor.logMessage('Not inside a generic element!');
            return;
        };
        this._clipboard = currgenel;
    };

    this.pasteElement = function() {
        /* paste the current clipboard element (if there is one) */
        if (!this._clipboard) {
            this.editor.logMessage('Nothing to paste!', 1);
        };
        var selNode = this.editor.getSelectedNode();
        var currgenel = this.getNearestGenericElement(selNode);
        if (currgenel) {
            this.editor.logMessage('Can\'t nest generic elements!');
            return;
        };
        var copy = this._clipboard.cloneNode(1);
        this.editor.insertNodeAtSelection(copy);
    };

    this.clipboard = function() {
        /* returns the clipboard
        
            can be used to check if the clipboard contains an element
        */
        return this._clipboard;
    };

    // XXX because of some stupid bug in IE we have to pass the formholder
    // in as an argument, when we didn't IE wouldn't check any checkboxes
    // (seems IE can only check them if they're visible?!?)
    this.getForm = function(elid, values, formholder) {
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
            var value = values[id] ? values[id] : field[5];
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
                if (value) {
                    content = value;
                } else {
                    content = document.createTextNode('&#xa0;');
                };
                inputel.appendChild(content);
                inputel.setAttribute('className', 'genericelement-form-field');
                inputel.setAttribute('name', id);
                inputel.setAttribute('id', 'genelfield_' + id);
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
                    if (value.contains(item)) {
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
                    if (item == value) {
                        option.setAttribute('selected', true);
                    };
                    select.appendChild(option);
                };
                form.appendChild(select);
            } else if (type == 'button_field') {
                var button = document.createElement('input');
                button.setAttribute('type', 'button');
                button.setAttribute('value', title);
                button.setAttribute('id', id + '-button');
                addEventHandler(button, 'click', 
                                    function() {
                                        window.open(value, 'popup', this.popupprops);
                                    }, this);
                form.appendChild(button);
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('id', id + '-input');
                input.setAttribute('name', id);
                input.setAttribute('disabled', 'disabled');
                form.appendChild(input);
            } else {
                inputel = document.createElement('input');
                inputel.setAttribute('type', type);
                if (value) {
                    inputel.value = value;
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
        /* retrieve an element by its id */
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

    this.createUniqueId = function() {
        /* create a unique id for a new element */
        // just use the current time, in msecs, as the unique id
        // may be a bit simple, but quite effective...
        var id = (new Date()).getTime();
        while (1) {
            if (!this._unique_ids.contains(id)) {
                break;
            };
            id++;
        };
        return id;
    };

    this.getUniqueIds = function(doc) {
        /* browse the full document to find GenericElement ids */
        var body = doc.getElementsByTagName('body')[0];
        var ids = new Array();
        var iterator = new NodeIterator(body);
        var currnode;
        while (currnode = iterator.next()) {
            if (currnode.nodeType != 1) {
                continue;
            };
            var unique_id = currnode.getAttribute('genericelements_uniqueid');
            if (unique_id) {
                if (ids.contains(unique_id)) {
                    // in some cases an id can be used twice, once for the
                    // actual element and once for some copied version of the
                    // element on the bottom of the page
                    continue;
                };
                ids.push(unique_id);
            };
        };
        return ids;
    };

    this._parseXML = function(dom) {
        /* parses the XML into a (more?) handy list
        
            format of the XML:

              <elements>
                <genericelement>
                  <id>[id]</id>
                  <name>[element name]</name>
                  <formdef>
                    <field>
                      <id>[id]</id>
                      <title>[title]</title>
                      <type>[fieldtype]</type>
                      <validator>[validator id]</validator>
                      <value>[default value (optional, '||'-seperated list 
                                for checkbox or radio, single value for the
                                rest) *or* (in case of type="button_field")
                                a URL]</value>
                      <items>[list of items (optional, only useful when type 
                                == checkbox, radio or select, '||'-seperated
                                list of values)
                                ]</items>
                    </field>
                    ...
                  </formdef>
                  <replacement>
                    <!-- note that <replacement> is only allowed to have 1 child -->
                    <element name="name of element" value="value of element">
                      <property name="name of property">value of property</property>
                      ...
                      <children>
                        <!-- child element node -->
                        <element name="...">
                          <property name="...">...</property>
                          <children>
                            ...
                          </children>
                        </element>
                        <!-- child text node -->
                        text
                        <!-- special element node, can be used to insert a node from a function -->
                        <element name="special">
                          <!-- this type of element should only have 1 property and no children!! -->
                          <property name="function">[name of function to call]</property>
                        </element>
                        ...
                      </children>
                    </element>
                  </replacement>
                </genericelement>
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
                    [
                        [<replacement_name>,
                            [
                                [<replacement_property_name>,
                                    <replacement_property_value>,
                                    ],
                                ...
                            ],
                            [ // children
                                [<name>, [<props>], [<children>]],
                                <text>,
                                ...
                            ]
                        ],
                        ...
                    ]
                ]

            (so essentially it's a list of tuples 
            (id, name, form, replacement))

        */
        var elements = dom.getElementsByTagName('genericelement');
        var elementlist = new Array();
        for (var i=0; i < elements.length; i++) {
            // handle each element
            // get each property from the XML one by one
            var el = elements[i];
            var eltuple = new Array();
            
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
                var value = undefined;
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
                    } else if (nodeName == 'value') {
                        value = fieldchild.childNodes[0].nodeValue.strip();
                        if (type == 'radio' || type == 'checkbox') {
                            var chunks = value.split('||');
                            value = new Array();
                            for (var l=0; l < chunks.length; l++) {
                                value.push(chunks[l].strip());
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
                formfields.push(new Array(id, title, type, valid, validator, value, items));
            };
            eltuple.push(formfields);

            // now do the replacement element, also nested so also somewhat 
            // messier
            var replacementel = el.getElementsByTagName('replacement')[0];
            var replacements = this._getReplacementElements(replacementel);
            eltuple.push(replacements);
            
            elementlist.push(eltuple);
        };
        return elementlist;
    };

    this._getReplacementElements = function(repel) {
        /* return a nested array of replacement content
        
            see the _parseXML method's docstring for more details about the 
            return value
        */
        var repels = new Array();
        for (var i=0; i < repel.childNodes.length; i++) {
            var repchild = repel.childNodes[i];
            if (repchild.nodeType != 1 || 
                    repchild.nodeName.toLowerCase() != 'element') {
                continue;
            };
            repels.push(this._getReplacementElementHelper(repchild));
        };
        return repels;
    };

    this._getReplacementElementHelper = function(repchild) {
        var repname = repchild.getAttribute('name');
        var repprops = new Array(); // will contain [key, value] pairs
        var children = new Array(); // will contain nested content
        for (var i=0; i < repchild.childNodes.length; i++) {
            var child = repchild.childNodes[i];
            if (child.nodeType != 1) {
                continue;
            };
            var nodeName = child.nodeName.toLowerCase();
            if (nodeName == 'property') {
                var propname = child.getAttribute('name');
                var propvalue = getNodeText(child);
                repprops.push(new Array(propname, propvalue));
            } else if (nodeName == 'children') {
                for (var j=0; j < child.childNodes.length; j++) {
                    var childchild = child.childNodes[j];
                    if (childchild.nodeType == 1) {
                        var rettuple = this._getReplacementElementHelper(childchild);
                        children.push(rettuple);
                    } else if (childchild.nodeType == 3) {
                        var nodeValue = getNodeText(childchild).strip();
                        if (nodeValue == '') {
                            continue;
                        };
                        children.push(nodeValue);
                    };
                };
            };
        };
        return (new Array(repname, repprops, children));
    };    

    this._getValidator = function(id) {
        return VALIDATORS[id];
    };

    this._createReplacementElement = function(nodeName, elid, props, children, formvalues, fullelstruct) {
        /* create the HTML for the replacement element */
        var node = this._createReplacementElementHelper(nodeName, props, children, formvalues, fullelstruct);
        node.setAttribute('genericelement_id', elid);
        node.setAttribute('genericelement_uniqueid', this.createUniqueId());
        return node;
    };

    this._createReplacementElementHelper = function(nodeName, props, children, formvalues, fullelstruct) {
        var doc = this.editor.getInnerDocument();
        if (nodeName == 'special') {
            return this._createSpecialNode(props, children, formvalues);
        };
        var node = doc.createElement(nodeName);
        for (var i=0; i < props.length; i++) {
            var proptuple = props[i];
            node.setAttribute(proptuple[0], this._interpolateValues(proptuple[1], formvalues));
        };
        for (var i=0; i < children.length; i++) {
            var child = children[i];
            if (typeof(child) == 'string') {
                var nodeValue = this._interpolateValues(child, formvalues);
                node.appendChild(doc.createTextNode(nodeValue));
            } else {
                var childname = child[0];
                var props = child[1];
                var childchildren = child[2];
                if (childname == 'special') {
                    var func = '';
                    for (var j=0; j < props.length; j++) {
                        var proptuple = props[j];
                        if (proptuple[0] == 'function') {
                            func = proptuple[1];
                        };
                    };
                    if (func == '') {
                        throw('No function property available for special element inside ' + nodeName);
                    };
                    node.appendChild(this._callSpecialElementFunction(func, formvalues, fullelstruct));
                } else {
                    node.appendChild(
                        this._createReplacementElementHelper(
                            childname, props, childchildren, formvalues, fullelstruct
                        )
                    );
                };
            };
        };

        return node;
    };

    this._interpolateValues = function(data, values) {
        /* interpolate keys for values from the values mapping
        
            syntax: {{<key>}} (so e.g. {{foo}} will be replaced
            by the value of foo from the mapping)
        */
        for (var name in values) {
            var reg = new RegExp('\\\{\\\{' + name + '\\\}\\\}', 'g');
            var value = values[name];
            if (typeof(value) != 'string') {
                value = ';'.join(value);
            };
            data = data.replace(reg, value);
        };
        data = data.replace(/\\\{/g, '{');
        return data;
    };

    this._callSpecialElementFunction = function(funcname, formvalues, elementstruct) {
        /* call a special function, see _parseXML for an explanation of those 
        
            should return a single node
        */
        var doc = this.editor.getInnerDocument();
        var editor = this.editor;
        var tool = this;
        return SPECIAL_FUNCTIONS[funcname](doc, editor, tool, formvalues, elementstruct);
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
                                copybuttonid, pastebuttonid, cancelbuttonid, toolboxid, 
                                plainclass, activeclass) {
    /* the UI counterpart of GenericTool */
    
    this.elselect = document.getElementById(elselectid);
    this.formholder = document.getElementById(formholderid);
    this.addbutton = document.getElementById(addbuttonid);
    this.delbutton = document.getElementById(deletebuttonid);
    this.copybutton = document.getElementById(copybuttonid);
    this.pastebutton = document.getElementById(pastebuttonid);
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
        addEventHandler(this.copybutton, 'click', this.copyEl, this);
        addEventHandler(this.pastebutton, 'click', this.pasteEl, this);
        addEventHandler(this.cancelbutton, 'click', this.reset, this);

        this.copybutton.style.display = 'none';
        this.pastebutton.style.display = 'none';
        this.cancelbutton.style.display = 'none';
        this.delbutton.style.display = 'none';

        this._fillElSelect();
    };

    this.updateState = function(selNode) {
        var currentgenel = this.tool.getNearestGenericElement(selNode);
        if (currentgenel) {
            var elid = currentgenel.getAttribute('genericelement_id');
            selectSelectItem(this.elselect, elid);
            var values = this._getValuesFromElement(currentgenel);
            this.drawForm(values);
            this.addbutton.style.display = 'inline';
            this.cancelbutton.style.display = 'none';
            this.delbutton.style.display = 'inline';
            this.copybutton.style.display = 'inline';
            this.pastebutton.style.display = 'none';
            if (this.toolbox && this.activeclass) {
                this.toolbox.setAttribute('className', this.activeclass);
            };
        } else {
            this.reset();
            if (this.tool.clipboard()) {
                this.pastebutton.style.display = 'inline';
            } else {
                this.pastebutton.style.display = 'none';
            };
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
        this.copybutton.style.display = 'none';
        this.state = 'new';
        this.form = undefined;
        if (this.toolbox && this.plainclass) {
            this.toolbox.setAttribute('className', this.plainclass);
        };
    };

    this.copyEl = function() {
        this.tool.copyElement();
    };

    this.pasteEl = function() {
        this.tool.pasteElement();
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
