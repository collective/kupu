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
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist.kupu > default/kupu.html

wysiwyg_support.html:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) dist-plone.kupu > plone/kupu_plone_layer/wysiwyg_support.html

all:
	kupu.html

clean:
	rm default/kupu.html
	rm plone/kupu_plone_layer/wysiwyg_support.html

debug:
	$(XSLTPROC) $(XSL_DEBUG) $(XSLTPROC_PARAMS) $(XSL_FILE) dist.kupu > default/kupu.html
