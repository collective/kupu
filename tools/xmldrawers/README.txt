===============
Kupu XMLDrawers
===============

What is it?
-----------

XMLDrawers are optional replacement of LibDrawers which have problems with XSLT
now. The Drawers allow you to request some XML and make DHTML tree of the data.  

Currently two drawers are done: 
    fxLinkIntDrawer - makes internal link from selected space 
    fxImageDrawer - inserts image 

On the server you create a script which returns an XML file describing some
directory (maybe documents or images). Example of XML is xmldata.xml. Then you
implement the drawers to allow users browse the directory and insert images and
links to documents. 

Installation instructions
-------------------------

TreeMenu.js must be included. 

"Tree" directory contains treemenu icons - should be in same directory as HTML
page - you can change the path - see the drawers source and find "new
TreeMenu". The first argument is icons URL prefix. 

Include content of drawers.html to your page. 
Include content od styles.css to your style sheet.


Code to add to kupuInit():

        // for link drawer (the linktool must exist; xmldata.xml is URL of data
        // - see attached file)
        var linkintdrawer = new fxLinkIntDrawer('kupu-linkintdrawer',
                                                linktool,'xmldata.xml'); 
        drawertool.registerDrawer('linkintdrawer', linkintdrawer); 
        var linkintdrawerbutton = new KupuButton('kupu-linkintdrawer-button',
                                                opendrawer('linkintdrawer'));
        kupu.registerTool('linkintdrawerbutton', linkintdrawerbutton);
	
        // for image drawer
        var imagedrawer = new fxImageDrawer('kupu-imagedrawer', imagetool,
                                                'xmldata.xml'); 
        drawertool.registerDrawer('imagedrawer', imagedrawer); 
        var imagedrawerbutton = new KupuButton('kupu-imagedrawer-button',
                                                opendrawer('imagedrawer'));
        kupu.registerTool('imagedrawerbutton', imagedrawerbutton);

Only one instance of the drawer can exist - there are some global variables,
see the source.  Specify the URL for XML data at drawer init, must be same
domain (browser security reasons). 

See xmldata.xml for structure, I think it is self-explained. 

Questions
=========

If you have questions or remarks, please send an email to
tomas.hnilica@webstep.net or visit the Kupu IRC channel or mailinglist.
