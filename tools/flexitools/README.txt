===============
Kupu FlexiTools
===============

What is it?
-----------

If wxWritable (currently the only tool in the package) is installed, Kupu will
only allow editing certain elements in a document. An editable region is
created by setting an attribute called 'editable' on the element to 'yes'. If
an element doesn't have this attribute, all keystrokes will be refused, making
it very hard to change the element's content (note that it is still possible
to e.g. paste content in the element).

Installation instructions
-------------------------

Read CUSTOMIZING.txt in the 'doc' directory for more elaborate instructions,
but basically it comes down to adding a <script> tag to your template (or
.kupu file if you're using the templating system) that points to the
flexitools.js package, add a couple of lines of code to the kupuInit()
function that instantiate the tool and register it to Kupu (example below) and
set 'editable="yes"' on some elements in the document.

Code to add to kupuInit():

var fxWritable = new fxWritable();
kupu.registerTool('fxWritable', fxWritable);

Questions
=========

If you have questions or remarks, please send an email to
tomas.hnilica@webstep.net or visit the Kupu IRC channel or mailinglist.
