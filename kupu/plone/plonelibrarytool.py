##############################################################################
#
# Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
"""Plone Kupu library tool

This module contains the Plone specific version of the Kupu library
tool.

$Id$
"""
from ZODB.PersistentList import PersistentList
from ZODB.PersistentMapping import PersistentMapping
from AccessControl import ClassSecurityInfo
from OFS.SimpleItem import SimpleItem
from Globals import InitializeClass

from Products.PageTemplates.PageTemplateFile import PageTemplateFile
from Products.CMFCore.utils import UniqueObject

from Products.kupu.plone.librarytool import KupuLibraryTool
from Products.kupu.plone import permissions

_default_libraries = (
    dict(id="string:portal_root",
         title="string:Home",
         uri="string:${portal_url}",
         src="string:${portal_url}/kupucollection.xml",
         icon="string:${portal_url}/kupuimages/kupulibrary.png"),
    dict(id="string:${folder_url}",
         title="string:Current folder",
         uri="string:${folder_url}",
         src="string:${folder_url}/kupucollection.xml",
         icon="string:${portal_url}/kupuimages/kupulibrary.png"),
    dict(id="myitems",
         title="string:My items",
         uri="string:${portal_url}/kupumyitems.xml",
         src="string:${portal_url}/kupumyitems.xml",
         icon="string:${portal_url}/kupuimages/kupusearch_icon.gif"),
    dict(id="recentitems",
         title="string:Recent items",
         uri="string:${portal_url}/kupurecentitems.xml",
         src="string:${portal_url}/kupurecentitems.xml",
         icon="string:${portal_url}/kupuimages/kupusearch_icon.gif")
    )

_default_resource_types = {
    'collection': ('Plone Site', 'Folder', 'Large Plone Folder'),
    'mediaobject': ('Image',),
    'linkable': ('Document', 'Image', 'File', 'News Item', 'Event')
    }

class PloneKupuLibraryTool(UniqueObject, SimpleItem, KupuLibraryTool):
    """Plone specific version of the kupu library tool"""

    id = "kupu_library_tool"
    meta_type = "Kupu Library Tool"
    title = "Kupu WYSIWYG editor configuration"
    security = ClassSecurityInfo()

    # protect methods provided by super class KupuLibraryTool
    security.declareProtected(permissions.QueryLibraries, "getLibraries",
                              "getPortalTypesForResourceType")
    security.declareProtected(permissions.ManageLibraries, "addLibrary",
                              "deleteLibraries", "updateLibraries",
                              "moveUp", "moveDown")
    security.declareProtected(permissions.ManageLibraries, "addResourceType",
                              "updateResourceTypes", "deleteResourceTypes")

    def __init__(self):
        self._libraries = PersistentList()
        self._res_types = PersistentMapping()
        self.linkbyuid = True

    def manage_afterAdd(self, item, container):
        # We load default values here, so __init__ can still be used
        # in unit tests. Plus, it only makes sense to load these if
        # we're being added to a Plone site anyway
        for lib in _default_libraries:
            self.addLibrary(**lib)
        self._res_types.update(_default_resource_types)

    security.declareProtected('View', "getLinkbyuid")
    def getLinkbyuid(self):
        """Returns 'is linking by UID enabled'?"""
        try:
            return self.linkbyuid
        except AttributeError:
            return 1

    security.declareProtected('View', "getTableClasses")
    def getTableClassnames(self):
        """Return a list of classnames supported in tables"""
        try:
            return self.table_classnames
        except AttributeError:
            return ('plain', 'listing', 'grid', 'data')

    # ZMI views
    manage_options = (SimpleItem.manage_options[1:] + (
         dict(label='Config', action='kupu_config'),
         dict(label='Libraries', action='zmi_libraries'),
         dict(label='Resource types', action='zmi_resource_types'),))

    security.declareProtected(permissions.ManageLibraries, "kupu_config")
    kupu_config = PageTemplateFile("kupu_config.pt", globals())
    kupu_config.title = 'kupu configuration'

    security.declareProtected(permissions.ManageLibraries, "zmi_libraries")
    zmi_libraries = PageTemplateFile("libraries.pt", globals())
    zmi_libraries.title = 'kupu configuration'

    security.declareProtected(permissions.ManageLibraries, "zmi_resource_types")
    zmi_resource_types = PageTemplateFile("resource_types.pt", globals())
    zmi_resource_types.title = 'kupu configuration'

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_get_libraries")
    def zmi_get_libraries(self):
        """Return the libraries sequence for the ZMI view"""
        #return ()
        return [dict([(key, value.text) for key, value in lib.items()])
                for lib in self._libraries]

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_add_library")
    def zmi_add_library(self, id, title, uri, src, icon, REQUEST):
        """Add a library through the ZMI"""
        self.addLibrary(id, title, uri, src, icon)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_libraries')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_update_libraries")
    def zmi_update_libraries(self, libraries, REQUEST):
        """Update libraries through the ZMI"""
        self.updateLibraries(libraries)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_libraries')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_delete_libraries")
    def zmi_delete_libraries(self, indices, REQUEST):
        """Delete libraries through the ZMI"""
        self.deleteLibraries(indices)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_libraries')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_move_up")
    def zmi_move_up(self, indices, REQUEST):
        """Move libraries up through the ZMI"""
        self.moveUp(indices)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_libraries')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_move_down")
    def zmi_move_down(self, indices, REQUEST):
        """Move libraries down through the ZMI"""
        self.moveDown(indices)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_libraries')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_get_type_mapping")
    def zmi_get_type_mapping(self):
        """Return the type mapping for the ZMI view"""
        return [(res_type, tuple(portal_type)) for res_type, portal_type
                in self._res_types.items()]

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_add_resource_type")
    def zmi_add_resource_type(self, resource_type, portal_types, REQUEST):
        """Add resource type through the ZMI"""
        self.addResourceType(resource_type, portal_types)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_resource_types')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_update_resource_types")
    def zmi_update_resource_types(self, type_info, REQUEST):
        """Update resource types through the ZMI"""
        self.updateResourceTypes(type_info)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_resource_types')

    security.declareProtected(permissions.ManageLibraries,
                              "zmi_delete_resource_types")
    def zmi_delete_resource_types(self, resource_types, REQUEST):
        """Delete resource types through the ZMI"""
        self.deleteResourceTypes(resource_types)
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/zmi_resource_types')

    security.declareProtected(permissions.ManageLibraries,
                              "configure_kupu")
    def configure_kupu(self, linkbyuid, table_classnames, REQUEST=None):
        """Delete resource types through the ZMI"""
        self.linkbyuid = int(linkbyuid)
        self.table_classnames = table_classnames
        REQUEST.RESPONSE.redirect(self.absolute_url() + '/kupu_config')

InitializeClass(PloneKupuLibraryTool)
