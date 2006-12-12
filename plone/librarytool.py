##############################################################################
#
# Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
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
        """Now a misnomer: actually updates preview, normal, and scaling data"""
        action_map = {}

        for a in preview_actions:
            portal_type = a.get('portal_type', '')
            preview = a.get('expression', '')
            normal = a.get('normal', None)
            if normal:
                normal = Expression(normal)
            scalefield = a.get('scalefield', 'image')
            if not portal_type:
                continue
            action_map[portal_type] = {
                'expression': Expression(preview),
                'normal': normal,
                'scalefield': scalefield, }
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

    def getNormalUrl(self, portal_type, url):
        action_map = getattr(self, '_preview_actions', {})
        if portal_type in action_map:
            expr = action_map[portal_type].get('normal', None)
            if expr:
                data = {
                    'object_url':   url,
                    'portal_type':  portal_type,
                    'modules':      SecureModuleImporter,
                }
                context = getEngine().getContext(data)
                return expr(context)
        return url

    def _setToolbarFilters(self, filters, globalfilter):
        """Set the toolbar filtering
        filter is a list of records with: id, visible, override"""
        clean = {}
        for f in filters:
            id = f.id
            visible = bool(getattr(f, 'visible', False))
            expr = getattr(f, 'override', None)

            if not id:
                continue

            if expr:
                expr = Expression(expr)
            else:
                expr = None
            clean[id] = dict(id=id, visible=visible, override=expr)

        self._toolbar_filters = clean
        if globalfilter:
            self._global_toolbar_filter = Expression(globalfilter)
        else:
            self._global_toolbar_filter = None

    def getToolbarFilters(self, context, field=None):
        expr_context = self._getExpressionContext(context)
        expr_context.setGlobal('field', field)
        filters = getattr(self, '_toolbar_filters', {})
        gfilter = getattr(self, '_global_toolbar_filter', None)
        if gfilter:
            gvisible = gfilter(expr_context)
        else:
            gvisible = None

        visible = {}
        for k in filters:
            f = filters[k]
            override = f.get('override', None)
            if override:
                visible[k] = bool(override(expr_context))
            else:
                visible[k] = f['visible']
        return visible, gvisible

    def _getToolbarFilterOptions(self):
        return getattr(self, '_toolbar_filters', {})
