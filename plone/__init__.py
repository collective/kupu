##############################################################################
#
# Cocommpyright (c) 2003-2005 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
"""Kupu Plone integration

This package is a python package and contains a filesystem-based skin
layer containing the necessary UI customization to integrate Kupu as a
wysiwyg editor in Plone.

$Id$
"""
from App.Common import package_home
from Products.CMFCore.DirectoryView import registerDirectory
from Products.CMFCore import utils
from Products.kupu.plone.plonelibrarytool import PloneKupuLibraryTool
from Products.kupu import kupu_globals

kupu_package_dir = package_home(kupu_globals)
registerDirectory('plone/kupu_plone_layer', kupu_package_dir)
registerDirectory('plone/kupu_references', kupu_package_dir)
registerDirectory('tests', kupu_package_dir)

def initialize(context):
    try:
        init = utils.ToolInit("kupu Library Tool",
                       tools=(PloneKupuLibraryTool,),
                       icon="kupu_icon.gif",
                       )
    except TypeError:
        # Try backward compatible form of the initialisation call
        init = utils.ToolInit("kupu Library Tool",
                       tools=(PloneKupuLibraryTool,),
                       product_name='kupu',
                       icon="kupu_icon.gif",
                       )
    init.initialize(context)
