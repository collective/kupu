/*****************************************************************************
 *
 * Copyright (c) 2004 Tomas Hnilica, tomas.hnilica@webstep.net. 
 * All rights reserved.
 *
 * Drawers for KUPU - creating internal links and adding images. 
 * Accepts XML description of Directory and makes
 * DHTML Tree for selecting of that files. 
 * 
 * init: elementid: DIV included in the drawer, where the tree will be displayed
 *	 tool: the tool which will be user, now linktool and imagetool.
 *	 XMLurl: URL of XML that contains directory data
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/



/* This Drawer provides interface for local links creation.
	necessary files: 
		- TreeMenu.js 
		
	init:
	
	var linkintdrawer = new fxLinkIntDrawer('kupu-linkintdrawer', linktool,'xmdata.xml');
		//where xmldata.xml = XML file with data description
        drawertool.registerDrawer('linkintdrawer', linkintdrawer);
        var linkintdrawerbutton = new KupuButton('kupu-linkintdrawer-button',opendrawer('linkintdrawer'));
        kupu.registerTool('linkintdrawerbutton', linkintdrawerbutton);

*/
function fxLinkIntDrawer(elementid, tool, XMLurl) {
    /* Link drawer */
    this.element = document.getElementById(elementid);
    this.tool = tool;
    this.XMLurl = XMLurl;
    
    //initiate the Tree
    // the object must be global
    // last argument is ID of element where to draw the menu (DIV is good :)
    // could not be more than one instance of fxLinkIntDrawer because there are
    // global and fixed variables: glob_objTreeMenu, fxLinkIntDrawerMenu
    // first argument is relative path to tree icons
    glob_objTreeMenu = new TreeMenu("tree", "glob_objTreeMenu", "_self", "treeMenuDefault", true, false, "fxLinkIntDrawerMenu");
    
     // GET the XML file
     var xmlhttp = Sarissa.getXmlHttpRequest();
     xmlhttp.open("GET", XMLurl, false);
     xmlhttp.send(null);

     // and draw the Tree	
     glob_objTreeMenu.clearMenu();
     glob_objTreeMenu.createFromXML(xmlhttp.responseText);
     glob_objTreeMenu.drawMenu();
    

    this.createContent = function() {
        /* display the drawer */
        var currnode = this.editor.getSelectedNode();
        var linkel = this.editor.getNearestParentOfType(currnode, 'a');
        
        this.element.style.display = 'block';
    };

    this.reload = function(){
    	        // GET the XML file
	var xmlhttp = Sarissa.getXmlHttpRequest();
	xmlhttp.open("GET", this.XMLurl, false);
	xmlhttp.send(null);
	
	// and draw the Tree	
	glob_objTreeMenu.clearMenu();
	glob_objTreeMenu.createFromXML(xmlhttp.responseText);
	glob_objTreeMenu.drawMenu();
	    

    }
    
    this.save = function(lnk) {
        /* add or modify a link */
        var currnode = this.editor.getSelectedNode();
        var linkel = this.editor.getNearestParentOfType(currnode, 'a');
        if (linkel) {
            linkel.setAttribute('href', lnk);
        } else {
            this.tool.createLink(lnk);
        };
        this.drawertool.closeDrawer();
    };
};

fxLinkIntDrawer.prototype = new Drawer;



/*
This Drawer provides interface for local links creation.
It is similiar to fxLinkIntDrawer, only global variables are changed


	init:
	
    var imagedrawer = new fxImageDrawer('kupu-imagedrawer', imagetool,'xmldata.xml');
    drawertool.registerDrawer('imagedrawer', imagedrawer);
    var imagedrawerbutton = new KupuButton('kupu-imagedrawer-button',opendrawer('imagedrawer'));
    kupu.registerTool('imagedrawerbutton', imagedrawerbutton);
  
*/

function fxImageDrawer(elementid, tool, XMLurl) {
    /* Image drawer */
    this.element = document.getElementById(elementid);
    this.tool = tool;
    this.XMLurl = XMLurl;
    
    //initiate the Tree
    // the object must be global
    glob_imgobjTreeMenu = new TreeMenu("tree", "glob_imgobjTreeMenu", "_self", "treeMenuDefault", true, false, "fxImageDrawerMenu");
    
     // GET the XML file
     var xmlhttp = Sarissa.getXmlHttpRequest();
     xmlhttp.open("GET", XMLurl, false);
     xmlhttp.send(null);

     // and draw the Tree	
     glob_imgobjTreeMenu.clearMenu();
     glob_imgobjTreeMenu.createFromXML(xmlhttp.responseText);
     glob_imgobjTreeMenu.drawMenu();
    

    this.createContent = function() {
        /* display the drawer */
        var currnode = this.editor.getSelectedNode();
        var linkel = this.editor.getNearestParentOfType(currnode, 'a');
        
        this.element.style.display = 'block';
    };

    this.reload = function(){
    	        // GET the XML file
	var xmlhttp = Sarissa.getXmlHttpRequest();
	xmlhttp.open("GET", this.XMLurl, false);
	xmlhttp.send(null);
	
	// and draw the Tree	
	glob_imgobjTreeMenu.clearMenu();
	glob_imgobjTreeMenu.createFromXML(xmlhttp.responseText);
	glob_imgobjTreeMenu.drawMenu();
	    

    }
    
    this.save = function(lnk) {
        /* add or modify a link */
        
        this.tool.createImage(lnk);
        this.drawertool.closeDrawer();
    };
};

fxImageDrawer.prototype = new Drawer;
