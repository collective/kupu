##############################################################################
#
# Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################

# $Id$

XSLTPROC = /usr/bin/xsltproc
XSL_DEBUG = --param debug true\(\)
XSLTPROC_PARAMS = --nonet --novalid --xinclude
XSL_FILE = make.xsl

kupu.html:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist.kupu > common/kupu.html

zope2macros:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist-zope2.kupu > common/kupumacros.html

kupuform.html:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist-form.kupu > common/kupuform.html

plonemacros:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist-plone.kupu > plone/kupu_plone_layer/wysiwyg_support.html

silvamacros:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist-silva.kupu > silva/kupumacros.html

all:
	kupu.html

clean:
	rm -f common/kupu.html
	rm -f common/kupumacros.html
	rm -f common/kupuform.html
	rm -f plone/kupu_plone_layer/wysiwyg_support.html
	rm -f silva/kupumacros.html

debug:
	$(XSLTPROC) $(XSL_DEBUG) $(XSLTPROC_PARAMS) $(XSL_FILE) dist.kupu > common/kupu.html
