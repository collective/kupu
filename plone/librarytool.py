##############################################################################
#
# Copyright (c) 2003-2008 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
"""Kupu library tool

This module contains Kupu's library tool to support drawers.

$Id$
"""
import Acquisition
from Acquisition import aq_parent, aq_inner, aq_base
from Products.CMFCore.Expression import Expression, createExprContext
from Products.PageTemplates.Expressions import getEngine, SecureModuleImporter
from Products.kupu.plone.interfaces import IKupuLibraryTool
from Products.CMFCore.utils import getToolByName

class KupuError(Exception): pass

class Resource:
    """Class to hold resources"""
    
class KupuLibraryTool(Acquisition.Implicit):
    """A tool to aid Kupu libraries"""

    __implements__ = IKupuLibraryTool

    def __init__(self):
        self._libraries = []
        self._res_types = {}

    def _getExpressionContext(self, object):
        portal = aq_parent(aq_inner(self))
        if object is None or not hasattr(object, 'aq_base'):
            folder = portal
        else:
            folder = object
            # Search up the containment hierarchy until we find an
            # object that claims it's a folder.
            while folder is not None:
                if getattr(aq_base(folder), 'isPrincipiaFolderish', 0):
                    # found it.
                    break
                else:
                    folder = aq_parent(aq_inner(folder))
        ec = createExprContext(folder, portal, object)
        return ec

    def addLibrary(self, id, title, uri, src, icon):
        """See ILibraryManager"""
        lib = dict(id=id, title=title, uri=uri, src=src, icon=icon)
        for key, value in lib.items():
            if key=='id':
                lib[key] = value
            else:
                if not(value.startswith('string:') or value.startswith('python:')):
                    value = 'string:' + value
                lib[key] = Expression(value)
        self._libraries.append(lib)

    def getLibraries(self, context):
        """See ILibraryManager"""
        expr_context = self._getExpressionContext(context)
        libraries = []
        for library in self._libraries:
            lib = {}
            for key in library.keys():
                if isinstance(library[key], str):
                    lib[key] = library[key]
                else:
                    # Automatic migration from old version.
                    if key=='id':
                        lib[key] = library[key] = library[key].text
                    else:
                        lib[key] = library[key](expr_context)
            libraries.append(lib)
        return tuple(libraries)

    def deleteLibraries(self, indices):
        """See ILibraryManager"""
        indices.sort()
        indices.reverse()
        for index in indices:
            del self._libraries[index]

    def updateLibraries(self, libraries):
        """See ILibraryManager"""
        for index, lib in enumerate(self._libraries):
            dic = libraries[index]
            for key in lib.keys():
                if dic.has_key(key):
                    value = dic[key]
                    if key=='id':
                        lib[key] = value
                    else:
                        if not(value.startswith('string:') or
                               value.startswith('python:')):
                            value = 'string:' + value
                        lib[key] = Expression(value)
            self._libraries[index] = lib

    def moveUp(self, indices):
        """See ILibraryManager"""
        indices.sort()
        libraries = self._libraries[:]
        for index in indices:
            new_index = index - 1
            libraries[index], libraries[new_index] = \
                              libraries[new_index], libraries[index]
        self._libraries = libraries

    def moveDown(self, indices):
        """See ILibraryManager"""
        indices.sort()
        indices.reverse()
        libraries = self._libraries[:]
        for index in indices:
            new_index = index + 1
            if new_index >= len(libraries):
                new_index = 0
                #new_index = ((index + 1) % len(libraries)) - 1
            libraries[index], libraries[new_index] = \
                              libraries[new_index], libraries[index]
        self._libraries = libraries

    def getPortalTypesForResourceType(self, resource_type):
        """See IResourceTypeMapper"""
        return self._res_types[resource_type][:]

    def queryPortalTypesForResourceType(self, resource_type, default=None):
        """See IResourceTypeMapper"""
        if not self._res_types.has_key(resource_type):
            return default
        return self._res_types[resource_type][:]

    def _validate_portal_types(self, resource_type, portal_types):
        typetool = getToolByName(self, 'portal_types')
        all_portal_types = dict([ (t.id, 1) for t in typetool.listTypeInfo()])

        portal_types = [ptype.strip() for ptype in portal_types if ptype]
        for p in portal_types:
            if p not in all_portal_types:
                raise KupuError, "Resource type: %s, invalid type: %s" % (resource_type, p)
        return portal_types

    def addResourceType(self, resource_type, portal_types):
        """See IResourceTypeMapper"""
        portal_types = self._validate_portal_types(resource_type, portal_types)
        self._res_types[resource_type] = tuple(portal_types)

    def updateResourceTypes(self, type_info):
        """See IResourceTypeMapper"""
        type_map = self._res_types
        for type in type_info:
            resource_type = type['resource_type']
            if not resource_type:
                continue
            portal_types = self._validate_portal_types(resource_type, type.get('portal_types', ()))
            old_type = type.get('old_type', None)
            if old_type:
                del type_map[old_type]
            type_map[resource_type] = tuple(portal_types)

    def updatePreviewActions(self, preview_actions):
        action_map = {}

        for a in preview_actions:
            portal_type = a.get('portal_type', '')
            expr = a.get('expression', '')
            if not portal_type:
                continue
            action_map[portal_type] = { 'expression': Expression(expr), }

        self._preview_actions = action_map

    def deleteResourceTypes(self, resource_types):
        """See IResourceTypeMapper"""
        existing = self._res_types
        for type in resource_types:
            if existing.has_key(type):
                del existing[type]

    def deletePreviewActions(self, preview_types):
        """See IResourceTypeMapper"""
        action_map = getattr(self, '_preview_actions', {})
        for type in preview_types:
            del action_map[type]
        self._preview_actions = action_map

    def getPreviewUrl(self, portal_type, url):
        action_map = getattr(self, '_preview_actions', {})
        if portal_type in action_map:
            expr = action_map[portal_type]['expression']
            if expr:
                data = {
                    'object_url':   url,
                    'portal_type':  portal_type,
                    'modules':      SecureModuleImporter,
                }
                context = getEngine().getContext(data)
                return expr(context)
        return None

