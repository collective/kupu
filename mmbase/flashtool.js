
/**
 * This tool is to create 'flash'
 * $Id: $
 */

function FlashTool() {
    /* tool to add 'divs' */

}
FlashTool.prototype = new KupuTool;

FlashTool.prototype.initialize = function(editor) {
    /* attach the event handlers */
    this.editor = editor;
    this.editor.logMessage(_("Flash tool initialized"));
};

FlashTool.prototype.setObjectClass = function(divclass) {
    var currnode = this.editor.getSelectedNode();
    var currdiv = this.editor.getNearestParentOfType(currnode, 'img');
    if (currdiv) {
        currdiv.className = divclass;
    };
};



function FlashToolBox(classselectid, toolboxid, plainclass, activeclass) {
    this.classselect  = getFromSelector(classselectid);
    this.toolboxel    = getFromSelector(toolboxid);
    this.plainclass   = plainclass;
    this.activeclass  = activeclass;
}

/**
 * This regular expression recognized the URL as flash. Which is only a place holder showing the flash icon.
 * Inline editing of the actual flash movie does not work very well, at least not in FF:
 * - height/width not workin
 * - not working at all in designMode (does work in contentEditable)
 */

FlashToolBox.srcRe = new RegExp('.*/mmbase/kupu/mmbase/icons/flash\\.png\\?o=([0-9]+)', 'i');



FlashToolBox.prototype.initialize = function(tool, editor) {
    this.tool = tool;
    this.editor = editor;
    addEventHandler(this.classselect, "change", this.setObjectClass, this);
};

FlashToolBox.prototype.updateState = function(selNode, event) {
    /* update the state of the toolbox element */
    var flashel = this.editor.getNearestParentOfType(selNode, 'img');
    var result = flashel && FlashToolBox.srcRe.exec(flashel.src);
    if (result) {
        this.toolboxel.className = this.activeclass;
        $(this.toolboxel).find(".flashobject").load("flash.jspx?o=" + result[1]);

    } else {
        this.toolboxel.className = this.plainclass;
        $(this.toolboxel).find(".flashobject").empty();

    };
};


FlashToolBox.prototype.setObjectClass = function() {
    var sel_class = this.classselect.options[this.classselect.selectedIndex].value;
    this.tool.setObjectClass(sel_class);
    this.editor.focusDocument();
};


// Switch  of support for flash in image tool, since we have a flash tool now.

ImageToolBox.prototype.originalUpdateState = ImageToolBox.prototype.updateState;

ImageToolBox.prototype.updateState = function(selNode, event) {
    /* update the state of the toolbox element */
    var imageel = this.editor.getNearestParentOfType(selNode, 'img');
    if (imageel && ! FlashToolBox.srcRe.test(imageel.src)) {
        return this.originalUpdateState(selNode, event);
    }  else {
        this.toolboxel.className = this.plainclass;
    };
};

ImageTool.prototype.create_flash = function(url, alttext, className, width, height) {
    var img = this.createImage(url, alttext, className);
    img.height = height;
    img.width = width;
    return img;
};
