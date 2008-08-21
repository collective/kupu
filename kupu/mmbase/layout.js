
function Layouter() {
}

Layouter.prototype.winOnLoad = function() {
    var ele = document.getElementById('mmbase-extra');
    if (ele && xDef(ele.style, ele.offsetHeight)) { // another compatibility check
	this.adjust();
	addEventHandler(window, 'resize', this.winOnResize, window);
    }
}
Layouter.prototype.winOnResize = function() {
    this.adjust();
}

Layouter.prototype.maxHeight = function() {
    return xClientHeight() - 20;
}
Layouter.prototype.leftWidth = function () {
    return 270;
}

Layouter.prototype.maxWidth = function () {
    return xClientWidth() - this.leftWidth() - 4;
}

Layouter.prototype.rePosition = function(id) {
    // This seems to be only necessary in Mozilla.
    var el = document.getElementById(id);
    el.style.position = "absolute";
    el.style.left = (xClientWidth() - 202) + "px";
}

Layouter.prototype.adjustToolBoxes = function() {
    var toolbox = 40;
    var spacing = 5;
    var toolboxRight = 2;
    xTop("kupu-toolbox-links", toolbox);
    this.rePosition("kupu-toolbox-links");
    toolbox += xHeight("kupu-toolbox-links") + spacing;
    xTop("kupu-toolbox-images", toolbox);
    this.rePosition("kupu-toolbox-images");
    toolbox += xHeight("kupu-toolbox-images") + spacing;
    xTop("kupu-toolbox-tables", toolbox);
    this.rePosition("kupu-toolbox-tables");
    toolbox += xHeight("kupu-toolbox-tables") + spacing;
    xTop("kupu-toolbox-divs", toolbox);
    this.rePosition("kupu-toolbox-divs");
    toolbox += xHeight("kupu-toolbox-divs") + spacing;
    xTop("kupu-toolbox-debug", toolbox);
    this.rePosition("kupu-toolbox-debug");

}
Layouter.prototype.adjustMMBaseExtra = function() {
    var maxHeight = this.maxHeight();
    var leftWidth = this.leftWidth();
    xHeight('mmbase-extra', maxHeight - 3);
    var pattern = new RegExp("\\bmm_validate\\b");
    var a = document.getElementById('mmbase-extra').getElementsByTagName('input');
    for (i = 0; i < a.length; i++) {
        if (pattern.test(a[i].className)) {
            xWidth(a[i], leftWidth - 6);
        }
    }
    a = document.getElementById('mmbase-extra').getElementsByTagName('textarea');
    for (i=0; i < a.length; i++) {
        if (pattern.test(a[i].className)) {
            xWidth(a[i], leftWidth - 6);
        }
    }
}
Layouter.prototype.adjustMMBaseTools = function() {
    var maxHeight = this.maxHeight();
    var nodeHeight = xHeight('nodefields');
    var toolsHeight =  maxHeight - nodeHeight - 1;
    if (toolsHeight < 100) {
        toolsHeight = 100;
        xHeight("nodefields", maxHeight - 100 - 1);
    }
    xHeight("mmbase-tools", toolsHeight);

}
Layouter.prototype.adjustKupu = function () {
    var maxHeight     = this.maxHeight();
    var maxHeightArea = maxHeight - 27;
    var maxWidth      = this.maxWidth();

    a = xGetElementsByClassName('kupu-editorframe');
    for (i = 0; i < a.length; i++) {
        xHeight(a[i], maxHeightArea);
        xWidth(a[i], maxWidth);
    }
    xHeight("toolboxes", maxHeight);
    xHeight("kupu-editor", maxHeightArea - 3);
    xWidth("kupu-editor", maxWidth - 201);
}

Layouter.prototype.adjust = function() {
    var zoomTool = kupu.getTool("zoomtool");
    if (zoomTool && zoomTool.zoomed) return;

    var maxHeight = this.maxHeight();
    var maxWidth  = this.maxWidth();

    // Assign maximum height to all columns
    xHeight('centerColumn', maxHeight);
    xWidth('centerColumn',   maxWidth);

    this.adjustMMBaseExtra();
    this.adjustKupu();

    this.adjustMMBaseTools();
    this.adjustToolBoxes();
}

