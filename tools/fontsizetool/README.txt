===============
Kupu XMLDrawers
===============

What is it?
-----------

This Tool allows select Font-family and Font-size for the text. 
It is not the right idea for "clean" code, but it may be necessary 
sometimes.


Installation instructions
-------------------------

Code to add to kupuInit():

	var sui = new KupuStyleUI('kupu-font-styles','kupu-size-styles'); 
	kupu.registerTool('sui', sui); 
	
Code to add to your page: 
	  <select id="kupu-font-styles">
		<option value="" >Font</option>
		<option value="Times New Roman" >Times New Roman</option>
            </select>

            <select id="kupu-size-styles">
		<option value="" >Size</option>
		<option value="1" >1</option>
		<option value="9">9</option>
            </select>

Questions
=========

If you have questions or remarks, please send an email to
tomas.hnilica@webstep.net or visit the Kupu IRC channel or mailinglist.
