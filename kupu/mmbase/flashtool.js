
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



function FlashToolBox(insertbuttonid, classselectid, toolboxid, plainclass, activeclass) {
    this.insertbutton = getFromSelector(insertbuttonid);
    this.classselect  = getFromSelector(classselectid);
    this.toolboxel    = getFromSelector(toolboxid);
    this.plainclass   = plainclass;
    this.activeclass  = activeclass;
}

FlashToolBox.srcRe = new RegExp('.*/mmbase/kupu/mmbase/icons/flash\\.png\\?o=([0-9]+)', 'i');



FlashToolBox.prototype.initialize = function(tool, editor) {
    this.tool = tool;
    this.editor = editor;
    addEventHandler(this.classselect, "change", this.setDivClass, this);
    addEventHandler(this.insertbutton, "click", this.addDiv, this);
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


FlashToolBox.prototype.setDivClass = function() {
    var sel_class = this.classselect.options[this.classselect.selectedIndex].value;
    this.tool.setDivClass(sel_class);
    this.editor.focusDocument();
};



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
