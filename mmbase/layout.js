/**
 * @author Michiel Meeuwissen
 * @version $Id: layout.js 220232 2010-04-02 10:03:12Z mihxil $
 */

function Layouter() {
}

Layouter.prototype.winOnLoad = function() {
    var ele = document.getElementById('mmbase-extra');
    if (ele && xDef(ele.style, ele.offsetHeight)) { // another compatibility check
	this.adjust();
	var self = this;
	addEventHandler(window, 'resize', function() {self.winOnResize();}, window);
    }
};
Layouter.prototype.winOnResize = function() {
    this.adjust();
};

Layouter.prototype.maxHeight = function() {
    return xClientHeight() - 20;
};
Layouter.prototype.leftWidth = function () {
    return 270;
};
Layouter.prototype.rightWidth = function () {
    return 201;
};

Layouter.prototype.maxWidth = function () {
    return xClientWidth() - this.leftWidth() -  this.rightWidth() - 4;
};

Layouter.prototype.rePosition = function(id) {
    // This seems to be only necessary in Mozilla.
    var el = document.getElementById(id);
    el.style.position = "absolute";
    el.style.left = (xClientWidth() - 202) + "px";
};

Layouter.prototype.adjustToolBoxes = function() {
    var toolbox = 40;
    var spacing = 5;
    var toolboxRight = 2;
    if (document.getElementById('kupu-toolbox-links')) {
        xTop("kupu-toolbox-links", toolbox);
        this.rePosition("kupu-toolbox-links");
        toolbox += xHeight("kupu-toolbox-links") + spacing;
    }

    if (document.getElementById('kupu-toolbox-images')) {
        xTop("kupu-toolbox-images", toolbox);
        this.rePosition("kupu-toolbox-images");
        toolbox += xHeight("kupu-toolbox-images") + spacing;
    }

    if (document.getElementById('kupu-toolbox-tables')) {
        xTop("kupu-toolbox-tables", toolbox);
        this.rePosition("kupu-toolbox-tables");
        toolbox += xHeight("kupu-toolbox-tables") + spacing;
    }

    if (document.getElementById('kupu-toolbox-divs')) {
        xTop("kupu-toolbox-divs", toolbox);
        this.rePosition("kupu-toolbox-divs");
        toolbox += xHeight("kupu-toolbox-divs") + spacing;
    }

    if (document.getElementById('kupu-toolbox-flash')) {
        xTop("kupu-toolbox-flash", toolbox);
        this.rePosition("kupu-toolbox-flash");
        toolbox += xHeight("kupu-toolbox-flash") + spacing;
    }

    if (document.getElementById('kupu-toolbox-debug')) {
        xTop("kupu-toolbox-debug", toolbox);
        this.rePosition("kupu-toolbox-debug");
    }

};

Layouter.prototype.topHeight = function() {
    return 27;
};

Layouter.prototype.adjustMMBaseExtra = function() {
    var maxHeight = this.maxHeight();
    xHeight('mmbase-extra', maxHeight - 3);
    this.adjustMMBaseExtraElements();
};

Layouter.prototype.mmbaseExtraWidth = function() {
    return this.leftWidth() - 6;
};
Layouter.prototype.adjustMMBaseExtraElements = function() {
    var width = this.mmbaseExtraWidth();
    var pattern = new RegExp("\\bmm_validate\\b");
    var a = document.getElementById('mmbase-extra').getElementsByTagName('input');
    for (i = 0; i < a.length; i++) {
        if (pattern.test(a[i].className)) {
            xWidth(a[i], width);
        }
    }
    a = document.getElementById('mmbase-extra').getElementsByTagName('textarea');
    for (i=0; i < a.length; i++) {
        if (pattern.test(a[i].className)) {
            xWidth(a[i], width);
        }
    }
};

Layouter.prototype.adjustMMBaseTools = function() {
    var maxHeight = this.maxHeight();
    var nodeHeight = xHeight('nodefields');
    var toolsHeight =  maxHeight - nodeHeight - 1;
    if (toolsHeight < 100) {
        toolsHeight = 100;
        xHeight("nodefields", maxHeight - 100 - 1);
    }
    xHeight("mmbase-tools", toolsHeight);

};
Layouter.prototype.adjustKupu = function () {
    var maxHeight     = this.maxHeight();
    var maxHeightArea = maxHeight - this.topHeight();
    var maxWidth      = this.maxWidth();

    a = xGetElementsByClassName('kupu-editorframe');
    for (i = 0; i < a.length; i++) {
        xHeight(a[i], maxHeightArea);
        xWidth(a[i], maxWidth);
    }
    xHeight("toolboxes", maxHeight);
    xHeight("kupu-editor", maxHeightArea - 3);
    xWidth("kupu-editor", maxWidth);
};

Layouter.prototype.adjustZoomed = function() {
};
Layouter.prototype.adjustUnzoomed = function() {
};

Layouter.prototype.adjust = function(zoom) {
    if (zoom) {
	    this.adjustZoomed();
	    return;
    }

    this.adjustUnzoomed();
    var maxHeight = this.maxHeight();
    var maxWidth  = this.maxWidth();

    // Assign maximum height to all columns
    xHeight('centerColumn', maxHeight);
    xWidth('centerColumn',   maxWidth);

    this.adjustMMBaseExtra();
    this.adjustKupu();

    this.adjustMMBaseTools();
    this.adjustToolBoxes();
};

