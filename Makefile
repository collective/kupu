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
XSL_PARAMS = --param debug true\(\)
XSLTPROC_PARAMS = $(XSL_PARAMS) --novalid --xinclude
XSL_FILE = make.xsl
DIST_FILE = dist.kupu

kupu.html:
	$(XSLTPROC) $(XSLTPROC_PARAMS) $(XSL_FILE) $(DIST_FILE) > kupu.html

all:
	kupu.html

clean:
	rm kupu.html
