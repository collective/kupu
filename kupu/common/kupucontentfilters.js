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


//----------------------------------------------------------------------------
// 
// ContentFilters
//
//  These are (or currently 'this is') filters for HTML cleanup and 
//  conversion. Kupu filters should be classes that should get registered to
//  the editor using the registerFilter method with 2 methods: 'initialize'
//  and 'filter'. The first will be called with the editor as its only
//  argument and the latter with a reference to the ownerdoc (always use 
//  that to create new nodes and such) and the root node of the HTML DOM as 
//  its arguments.
//
//----------------------------------------------------------------------------

function NonXHTMLTagFilter() {
    /* filter out non-XHTML tags*/
    
    // A mapping from element name to whether it should be left out of the 
    // document entirely. If you want an element to reappear in the resulting 
    // document *including* it's contents, add it to the mapping with a 1 value.
    // If you want an element not to appear but want to leave it's contents in 
    // tact, add it to the mapping with a 0 value. If you want an element and
    // it's contents to be removed from the document, don't add it.
    if (arguments.length) {
        // allow an optional filterdata argument
        this.filterdata = arguments[0];
    } else {
        // provide a default filterdata dict
        this.filterdata = {'html': 1,
                            'body': 1,
                            'head': 1,
                            'title': 1,
                            
                            'a': 1,
                            'abbr': 1,
                            'acronym': 1,
                            'address': 1,
                            'b': 1,
                            'base': 1,
                            'blockquote': 1,
                            'br': 1,
                            'caption': 1,
                            'cite': 1,
                            'code': 1,
                            'col': 1,
                            'colgroup': 1,
                            'dd': 1,
                            'dfn': 1,
                            'div': 1,
                            'dl': 1,
                            'dt': 1,
                            'em': 1,
                            'h1': 1,
                            'h2': 1,
                            'h3': 1,
                            'h4': 1,
                            'h5': 1,
                            'h6': 1,
                            'h7': 1,
                            'i': 1,
                            'img': 1,
                            'kbd': 1,
                            'li': 1,
                            'link': 1,
                            'meta': 1,
                            'ol': 1,
                            'p': 1,
                            'pre': 1,
                            'q': 1,
                            'samp': 1,
                            'script': 1,
                            'span': 1,
                            'strong': 1,
                            'style': 1,
                            'sub': 1,
                            'sup': 1,
                            'table': 1,
                            'tbody': 1,
                            'td': 1,
                            'tfoot': 1,
                            'th': 1,
                            'thead': 1,
                            'tr': 1,
                            'ul': 1,
                            'u': 1,
                            'var': 1,

                            // even though they're deprecated we should leave
                            // font tags as they are, since Kupu sometimes
                            // produces them itself.
                            'font': 1,
                            'center': 0
                            };
    };
                        
    this.initialize = function(editor) {
        /* init */
        this.editor = editor;
    };

    this.filter = function(ownerdoc, htmlnode) {
        return this._filterHelper(ownerdoc, htmlnode);
    };

    this._filterHelper = function(ownerdoc, node) {
        /* filter unwanted elements */
        if (node.nodeType == 3) {
            return ownerdoc.createTextNode(node.nodeValue);
        } else if (node.nodeType == 4) {
            return ownerdoc.createCDATASection(node.nodeValue);
        };
        // create a new node to place the result into
        // XXX this can be severely optimized by doing stuff inline rather 
        // than on creating new elements all the time!
        var newnode = ownerdoc.createElement(node.nodeName);
        // copy the attributes
        for (var i=0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            newnode.setAttribute(attr.nodeName, attr.nodeValue);
        };
        for (var i=0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            var nodeType = child.nodeType;
            var nodeName = child.nodeName.toLowerCase();
            if (nodeType == 3 || nodeType == 4) {
                newnode.appendChild(this._filterHelper(ownerdoc, child));
            };
            if (nodeName in this.filterdata && this.filterdata[nodeName]) {
                newnode.appendChild(this._filterHelper(ownerdoc, child));
            } else if (nodeName in this.filterdata) {
                for (var j=0; j < child.childNodes.length; j++) {
                    newnode.appendChild(this._filterHelper(ownerdoc, child.childNodes[j]));
                };
            };
        };
        return newnode;
    };
};

//-----------------------------------------------------------------------------
//
// XHTML validation support
//
// This class is the XHTML 1.0 transitional DTD expressed as Javascript
// data structures.
// Some attributes are deliberately excluded: class needs special
// treatment (IE), style and xml: namespace are not currently supported
// (IE).
//
function XhtmlValidation() {
    // Support functions
    this.Set = function(ary) {
        if (ary instanceof String) ary = [ary];
        if (ary instanceof Array) {
            for (var i = 0; i < ary.length; i++) {
                this[ary[i]] = 1;
            }
        }
        else {
            for (var v in ary) { // already a set?
                this[v] = 1;
            }
        }
    }

    this._exclude = function(array, exceptions) {
        var ex;
        if (exceptions.split) {
            ex = exceptions.split("|");
        } else {
            ex = exceptions;
        }
        var exclude = new this.Set(ex);
        var res = [];
        for (var k=0; k < array.length;k++) {
            if (!exclude[array[k]]) res.push(array[k]);
        }
        return res;
    }
    this._excludeAttributes = function(badattrs) {
        // convert badattrs to a set
        var bad = new this.Set(badattrs);

        var tags = this.Attributes;
        for (var tag in tags) {
            var val = this.Attributes[tag];
            for (var i = val.length; i >= 0; i--) {
                if (bad[val[i]]==1) {
                    val.splice(i,1);
                }
            }
        }
    }
    this._excludeTags = function(badtags) {
        if (badtags instanceof String) badtags = [badtags];
        for (var i = 0; i < badtags.length; i++) {
            delete this.Attributes[badtags[i]];
        }
    }
    // Supporting declarations
    this.elements = new function() {
        // Core attributes
        this.coreattrs = ['id', 'title']; // 'style', 'class'
        this.i18n = ['lang', 'dir']; // 'xml:lang'
        this.events = [
                      'onclick', 'ondblclick', 'onmousedown',
                      'onmouseup', 'onmouseover', 'onmousemove',
                      'onmouseout', 'onkeypress', 'onkeydown',
                      'onkeyup'];

        this.focus = ['accesskey', 'tabindex', 'onfocus', 'onblur'];
        this.attrs = [].concat(this.coreattrs, this.i18n, this.events);

        // entities
        this.special_extra = ['object','applet','img','map','iframe'];
        this.special_basic=['br','span','bdo'];
        this.special = [].concat(this.special_basic, this.special_extra);
        this.fontstyle_extra = ['big','small','font','basefont'];
        this.fontstyle_basic = ['tt','i','b','u','s','strike'];
        this.fontstyle = [].concat(this.fontstyle_basic, this.fontstyle_extra);
        this.phrase_extra = ['sub','sup'];
        this.phrase_basic=[
                          'em','strong','dfn','code','q',
                          'samp','kbd','var', 'cite','abbr','acronym'];
        this.inline_forms = ['input','select','textarea','label','button'];
        this.misc_inline = ['ins','del'];
        this.misc = ['noscript'].concat(this.misc_inline);
        this.inline = ['a'].concat(this.special, this.fontstyle, this.phrase, this.inline_forms);

        this.Inline = ['#PCDATA'].concat(this.inline, this.misc_inline);

        this.heading = ['h1','h2','h3','h4','h5','h6'];
        this.lists = ['ul','ol','dl','menu','dir'];
        this.blocktext = ['pre','hr','blockquote','address','center','noframes'];
        this.block = ['p','div','isindex','fieldset','table'].concat(
                     this.heading, this.lists, this.blocktext);

        this.Flow = ['#PCDATA','form'].concat(this.block, this.inline);
    }();

    this._commonsetting = function(self, names, value) {
        for (var n = 0; n < names.length; n++) {
            self[names[n]] = value;
        }
    }
    // The Attributes class returns all valid attributes for a tag,
    // e.g. a = new Attributes(this)
    // a.head -> [ 'lang', 'xml:lang', 'dir', 'id', 'profile' ]
    this.Attributes = new function(el, validation) {
        this.html = el.i18n.concat('id','xmlns');
        this.head = el.i18n.concat('id', 'profile');
        this.title = el.i18n.concat('id');
        this.base = ['id', 'href', 'target'];
        this.meta =  el.i18n.concat('id','http-equiv','name','content', 'scheme');
        this.link = el.attrs.concat('charset','href','hreflang','type', 'rel','rev','media','target');
        this.style = el.i18n.concat('id','type','media','title', 'xml:space');
        this.script = ['id','charset','type','language','src','defer', 'xml:space'];
        this.iframe = [
                      'longdesc','name','src','frameborder','marginwidth',
                      'marginheight','scrolling','align','height','width'].concat(el.coreattrs);
        this.body = ['onload','onunload','background','bgcolor','text','link','vlink','alink'].concat(el.attrs);
        validation._commonsetting(this,
                                  ['p','div'].concat(el.heading),
                                  ['align'].concat(el.attrs));
        this.dl = this.dir = this.menu = el.attrs.concat('compact');
        this.ul = this.menu.concat('type');
        this.ol = this.ul.concat('start');
        this.li = el.attrs.concat('type','value');
        this.hr = el.attrs.concat('align','noshade','size','width');
        this.pre = el.attrs.concat('width','xml:space');
        this.blockquote = el.attrs.concat('cite');
        this.ins = this.del = this.blockquote.concat('datetime');
        this.a = el.attrs.concat(el.focus,'charset','type','name','href','hreflang','rel','rev','shape','coords','target');
        this.bdo = el.coreattrs.concat(el.events, 'lang','xml:lang','dir');
        this.br = el.coreattrs.concat('clear');
        validation._commonsetting(this,
                                  ['noscript','noframes','dt', 'dd', 'address','center','span','em', 'strong', 'dfb','code',
                                  'samp','kbd','var','cite','abbr','acronym','sub','sup','tt',
                                  'i','b','big','small','u','s','strike'],
                                  el.attrs);

        this.q = el.attrs.concat('cite');
        this.basefont = ['id','size','color','face'];
        this.font = el.coreattrs.concat(el.i18n, 'size','color','face');
        this.object = el.attrs.concat('declare','classid','codebase','data','type','codetype','archive','standby','height','width','usemap','name','tabindex','align','border','hspace','vspace');
        this.param = ['id','name','value','valuetype','type'];
        this.applet = el.coreattrs.concat('codebase','archive','code','object','alt','name','width','height','align','hspace','vspace');
        this.img = el.attrs.concat('src','alt','name','longdesc','height','width','usemap','ismap','align','border','hspace','vspace');
        this.map = el.i18n.concat('id','title','name', el.events); // 'style', 'class'
        this.area = el.attrs.concat('shape','coords','href','nohref','alt','target', el.focus);
        this.form = el.attrs.concat('action','method','name','enctype','onsubmit','onreset','accept','accept-charset','target');
        this.label = el.attrs.concat('for','accesskey','onfocus','onblur');
        this.input = el.attrs.concat('type','name','value','checked','disabled','readonly','size','maxlength','src','alt','usemap','onselect','onchange','accept','align', el.focus);
        this.select = el.attrs.concat('name','size','multiple','disabled','tabindex','onfocus','onblur','onchange');
        this.optgroup = el.attrs.concat('disabled','label');
        this.option = el.attrs.concat('selected','disabled','label','value');
        this.textarea = el.attrs.concat('name','rows','cols','disabled','readonly','onselect','onchange', el.focus);
        this.fieldset = el.attrs;
        this.legend = el.attrs.concat('accesskey','align');
        this.button = el.attrs.concat('name','value','type','disabled',el.focus);
        this.isindex = el.coreattrs.concat('prompt', el.i18n);
        this.table = el.attrs.concat('summary','width','border','frame','rules','cellspacing','cellpadding','align','bgcolor');
        this.caption = el.attrs.concat('align');
        this.colgroup = el.attrs.concat('span','width','halign','char','charoff','valign');
        this.col = this.colgroup;
        this.thead =  el.attrs.concat('halign','char','charoff','valign');
        this.tfoot = this.tbody = this.thead;
        this.tr = this.thead.concat('bgcolor');
        this.td = this.th = this.tr.concat('abbr','axis','headers','scope','rowspan','colspan','nowrap','width','height');
    }(this.elements, this);

    // State array. For each tag identifies what it can contain.
    // I'm not attempting to check the order or number of contained
    // tags (yet).
    this.States = new function(el, validation) {
        this.html = ['head','body'];
        this.head = ['title','base','script','meta','link','object','isindex']; // 'style'
        this.title = ['#PCDATA'];
        this.base = this.meta = this.link = [];
        this.style = ['#PCDATA'];
        this.script = ['#PCDATA'];
        this.noscript = el.Flow;
        this.iframe = el.Flow;
        this.noframes = el.Flow;
        this.body = el.Flow;
        this.div = el.Flow;
        this.p = el.Inline;
        var t = el.heading;
        for (var h = 0; h < t.length; h++) {
            this[t[h]] = el.Inline;
        }
        this.ul = ['li'];
        this.ol = this.menu = this.dir = this.ul;
        this.dl = ['dt','dd'];
        this.dt = el.Inline;
        this.dd = el.Flow;
        this.address = ['#PCDATA','p['].concat(el.inline, el.misc.inline);
        this.hr = [];
        this.pre = validation._exclude(el.Inline, "img|object|applet|big|small|sub|sup|font|basefont");
        this.blockquote = el.Flow;
        this.center = this.ins = this.del = el.Flow;
        this.a = validation._exclude(el.Inline, "a");
        this.span = this.bdo = el.Inline;
        this.br = this.basefont = [];
        var tags = [
                   'em', 'strong', 'dfb','code','samp','kbd','var',
                   'cite','abbr','acronym','q','sub','sup','tt','i',
                   'b','big','small','u','s','strike','font','label',
                   'legend'];
        for (var i = 0; i < tags.length; i++) {
            this[tags[i]] = el.Inline;
        }
        this.object = ['#PCDATA', 'param','form'].concat(el.block, el.inline, el.misc);
        this.param = [];
        this.applet = this.object;
        this.img = [];
        this.map = ['form', 'area'].concat(el.block, el.misc);
        this.area = [];
        this.form = validation._exclude(el.Flow, ['form']);
        this.input = [];
        this.select = ['optgroup','option'];
        this.optgroup = ['option'];
        this.option = ['#PCDATA'];
        this.textarea = this.option;
        this.fieldset = ['#PCDATA','legend','form'].concat(el.block,el.inline,el.misc);
        this.button = validation._exclude(el.Flow, ['a','form','iframe'].concat(el.inline_forms));
        this.isindex = [];
        this.table = ['caption','col','colgroup','thead','tfoot','tbody','tr'];
        this.caption = el.Inline;
        this.thead = this.tfoot = this.tbody = ['tr'];
        this.colgroup = ['col'];
        this.col = [];
        this.tr = ['th','td'];
        this.th = this.td = el.Flow;

        // We actually want all the states to be objects rather than
        // arrays
        for (var tag in this) {
            this[tag] = new validation.Set(this[tag]);
        }
    }(this.elements, this);
}

//xhtmlvalid = new XhtmlValidation();

