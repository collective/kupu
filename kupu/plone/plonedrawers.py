##############################################################################
#
# Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
"""Plone Kupu library tool

This module defines a mixin class for the kupu tool which contains
support code for drawers. Much of this code was formerly in separate
Python scripts, but has been moved here to make it easier to maintain.

"""
import re
from Products.CMFCore.utils import getToolByName
from AccessControl import Unauthorized, ClassSecurityInfo, getSecurityManager
from Globals import InitializeClass
from Products.Archetypes.public import *
from Products.Archetypes.interfaces.referenceable import IReferenceable
from Products.PythonScripts.standard import html_quote, newline_to_br
from Products.kupu.plone.librarytool import KupuError

try:
    from PIL import Image
except ImportError:
    HAS_PIL = False
else:
    HAS_PIL = True

UIDURL = re.compile(".*\\bresolveuid/([^/?#]+)")

class ResourceType:
    '''Resource types are wrapped into a class so we can easily
    access attributes which may, or may not be present.
    '''
    def __init__(self, tool, name):
        self.name = name
        self._tool = tool
        parts = name.split('.', 1)

        if len(parts)==1:
            self._portal_types = tool.queryPortalTypesForResourceType(name, ())
            self._field = self._widget = None
        else:
            # Must be portal_type.fieldname
            typename, fieldname = parts
            __traceback_info__ = (typename, fieldname)
            archetype_tool = getToolByName(tool, 'archetype_tool', None)
            types = archetype_tool.listRegisteredTypes()
            typeinfo = [t for t in types if t['portal_type']==typename]

            if len(typeinfo)==0:
                raise KupuError("Unrecognised portal type for resource %s" % name)

            schema = typeinfo[0]['schema']
            self.klass = typeinfo[0]['klass']
            try:
                self._field = schema[fieldname]
            except KeyError:
                raise KupuError("Unrecognised fieldname for resource %s" % name)
                
            self._widget = self._field.widget

    def get_portal_types(self):
        if not hasattr(self, '_portal_types'):
            field = self._field
            allowed_types = getattr(field, 'allowed_types', ())
            allow_method = getattr(field, 'allowed_types_method', None)
            if allow_method is not None:
                instance = self._instanceFromRequest()
                if instance:
                    meth = getattr(instance, allow_method)
                    allowed_types = meth()
            self._portal_types = allowed_types

        return self._portal_types
    portal_types = property(get_portal_types)

    def getQuery(self):
        query = {'portal_type': self.portal_types }
        
        if self._field is not None:
            field = self._field
            widget = field.widget
            base_query = getattr(widget, 'base_query', None)
            if base_query and isinstance(base_query, basestring):
                # We need the actual object containing the field to be
                # able to call a dynamic base_query
                instance = self._instanceFromRequest()
                if instance:
                    base_query = getattr(instance, base_query, None)
                    if base_query:
                       base_query = base_query()
                       
            if base_query:
                query.update(base_query)

        return query

    def _instanceFromRequest(self):
        """Get instance object from UID in request.
        Throws an error if there isn't a UID.
        """
        if not hasattr(self, '_instance'):
            # XXX TODO: this needs to handle the case where the object is
            # being created through portal_factory and hasn't yet been
            # saved. The UID won't be in the catalog so we need to create
            # a dummy object instead.
            tool = self._tool
            UID = tool.REQUEST.instance
            reference_tool = getToolByName(tool, 'reference_catalog')
            self._instance = reference_tool.lookupObject(UID)

        return self._instance

    def _allow_browse(self):
        return getattr(self._widget, 'allow_browse', True)
    allow_browse = property(_allow_browse)

    def _startup_directory(self):
        return getattr(self._widget, 'startup_directory', '')
    startup_directory = property(_startup_directory)

class InfoAdaptor:
    """Convert either an object or a brain into an information dictionary."""
    def __init__(self, tool, resource_type='mediaobject'):
        self.url_tool = getToolByName(tool, 'portal_url')
        self.uid_catalog = getToolByName(tool, 'uid_catalog', None)
        self.portal_interface = getToolByName(tool, 'portal_interface')
        self.workflow_tool = getToolByName(tool, 'portal_workflow')
        self.workflow_states = self.wfTitles()
        self.linkbyuid = tool.getLinkbyuid()
        self.coll_types = tool.getResourceType('collection').portal_types
        self.anchor_types =  tool.getResourceType('containsanchors').portal_types
        portal_base = self.url_tool.getPortalPath()
        self.prefix_length = len(portal_base)+1
        self.resource_type = tool.getResourceType(resource_type)
        
        instance = tool.REQUEST.get('instance', '')
        if instance:
            instance = 'instance=%s&' % tool.REQUEST.instance

        self.srctail = 'kupucollection.xml?'+instance+'resource_type=' + resource_type.name
        self.showimagesize = resource_type=='mediaobject'

        # The redirecting url must be absolute otherwise it won't work for
        # preview when the page is using portal_factory
        # The absolute to relative conversion when the document is saved
        # should strip the url right back down to resolveuid/whatever.
        self.base = self.url_tool()
        self.security = getSecurityManager()
        self.portal_url = tool.portal_url()
        self.tool = tool

    def wfTitles(self):
        wt = self.workflow_tool
        try:
            states = wt.listWFStatesByTitle()
        except AttributeError:
            # Older Plone versions
            states = {}
            for wf in wt.objectValues():
                state_folder = getattr(wf, 'states', None)
                if state_folder is not None:
                    for s in state_folder.objectValues():
                        title, id = s.title, s.getId()
                        if title:
                            states[id] = title
            return states

        return dict([(id,title) for (title,id) in states])

    def icon(self, icon):
        return "%s/%s" % (self.portal_url, icon)

    def sizes(self, obj):
        """Returns size, width, height"""
        if not self.showimagesize:
            return None, None, None
        if not callable(obj.getId):
            obj = obj.getObject() # Must be a brain
        try:
            size = self.tool.getObjSize(obj)
        except:
            size = None

        width = getattr(obj, 'width', None)
        height = getattr(obj, 'height', None)
        if callable(width): width = width()
        if callable(height): height = height()
        return size, width, height

    def getState(self, review_state):
        if review_state:
            className = 'state-'+review_state
            review_state = self.workflow_states.get(review_state, review_state)
        else:
            className = None
        return review_state, className

    def info_object(self, obj, allowLink=True):
        '''Get information from a content object'''

        # Parent folder might not be accessible if we came here from a
        # search.
        if not self.security.checkPermission('View', obj):
            return None

        __traceback_info__ = (obj, allowLink)
        id = None
        UID = None
        try:
            if self.portal_interface.objectImplements(obj,
                'Products.Archetypes.interfaces.referenceable.IReferenceable'):
                UID = getattr(obj.aq_explicit, 'UID', None)
                if UID:
                    UID = UID()
                    id = UID

            if not id:
                id = obj.absolute_url(relative=1)

            portal_type = getattr(obj, 'portal_type','')
            collection = portal_type in self.coll_types
            url = obj.absolute_url()
            preview = self.tool.getPreviewUrl(portal_type, url)

            if collection and self.resource_type.allow_browse:
                src = obj.absolute_url()
                if not src.endswith('/'): src += '/'
                src += self.srctail
            else:
                src = None

            if UID and self.linkbyuid:
                url = self.base+'/resolveuid/%s' % UID


            icon = self.icon(obj.getIcon(1))
            size, width, height = self.sizes(obj)

            title = obj.Title() or obj.getId()
            description = newline_to_br(html_quote(obj.Description()))

            linkable = None
            if allowLink:
                linkable = True
                collection = False

            anchor = portal_type in self.anchor_types
            review_state, className = self.getState(self.workflow_tool.getInfoFor(obj, 'review_state', None))

            return {
                'id': id,
                'url': url,
                'portal_type': portal_type,
                'collection':  collection,
                'icon': icon,
                'size': size,
                'width': width,
                'height': height,
                'preview': preview,
                'title': title,
                'description': description,
                'linkable': linkable,
                'src': src,
                'anchor': anchor,
                'state': review_state,
                'class': className,
                }
        except Unauthorized:
            return None

    def info(self, brain, allowLink=True):
        '''Get information from a brain'''
        __traceback_info__ = (brain, allowLink)
        id = brain.getId
        url = brain.getURL()
        portal_type = brain.portal_type
        collection = portal_type in self.coll_types
        preview = self.tool.getPreviewUrl(portal_type, url)

        # Path for the uid catalog doesn't have the leading '/'
        path = brain.getPath()
        UID = None
        if path and self.uid_catalog:
            try:
                metadata = self.uid_catalog.getMetadataForUID(path[self.prefix_length:])
            except KeyError:
                metadata = None
            if metadata:
                UID = metadata.get('UID', None)

        if UID:
            id = UID

        if collection and self.resource_type.allow_browse:
            src = brain.getURL()
            if not src.endswith('/'): src += '/'
            src += self.srctail
        else:
            src = None

        if UID and self.linkbyuid:
            url = self.base+'/resolveuid/%s' % UID

        icon = self.icon(brain.getIcon)
        size, width, height = self.sizes(brain)

        title = brain.Title or brain.getId
        description = newline_to_br(html_quote(brain.Description))
        linkable = None
        if allowLink:
            linkable = True
            collection = False

        anchor = portal_type in self.anchor_types
        review_state, className = self.getState(brain.review_state)

        return {
            'id': id,
            'url': url,
            'portal_type': portal_type,
            'collection':  collection,
            'icon': icon,
            'size': size,
            'width': width,
            'height': height,
            'preview': preview,
            'title': title,
            'description': description,
            'linkable': linkable,
            'src': src,
            'anchor': anchor,
            'state': review_state,
            'class': className,
            }


class PloneDrawers:
    security = ClassSecurityInfo()

    security.declareProtected("View", "getPreviewable")
    def getPreviewable(self):
        """Returns previewable types and a possible preview path"""
        if HAS_PIL:
            def best_preview(field):
                sizes = getattr(field, 'sizes', None)
                if not sizes:
                    return field.getName()

                preview = None
                previewsize = (0,0)
                for k in sizes:
                    if previewsize < sizes[k] <= (128,128):
                        preview = k
                        previewsize = sizes[k]
                if not preview:
                    smallest = min(sizes.values())
                    for k in sizes:
                        if sizes[k]==smallest:
                            preview = k
                            break
                return "%s_%s" % (field.getName(), preview)

        else:
            def best_preview(field):
                return field.getName()

        result = []
        typestool = getToolByName(self, 'portal_types')
        archetype_tool = getToolByName(self, 'archetype_tool', None)
        if archetype_tool is None:
            return result
        valid = dict.fromkeys([t.getId() for t in typestool.listTypeInfo()])
        types = archetype_tool.listRegisteredTypes()
        for t in types:
            name = t['portal_type']
            if not name in valid:
                continue
            schema = t['schema']
            for field in schema.fields():
                if not isinstance(field, ImageField):
                    continue
                result.append((name, best_preview(field)))
                break
        return result
        
    security.declarePublic("getResourceType")
    def getResourceType(self, resource_type=None):
        """Convert resource type string to instance"""
        if isinstance(resource_type, ResourceType):
            return resource_type

        if not resource_type:
            resource_type = self.REQUEST.get('resource_type', 'mediaobject')

        return ResourceType(self, resource_type)

    security.declarePublic("getFolderItems")
    def getFolderItems(self, context, resource_type=None):
        """List the contents of a folder"""
        # XXX TODO: This should handle folders separately from other
        # content. Any collection types which are not in portal_type
        # should form the basis of a separate query which is free
        # from the main query restrictions. That way even if the
        # query says we only want items modified today we'll still
        # see the folders.
        #
        # Obviously any folder which is linkable should not be
        # included in the separate folder-only list.
        resource_type = self.getResourceType(resource_type)
        collection_type = self.getResourceType('collection')
        coll_types = collection_type.portal_types
        link_types = resource_type.portal_types
        allow_browse = resource_type.allow_browse

        query = resource_type.getQuery()
        content =  context.getFolderContents(contentFilter=query)
        linkable = dict([(o.id,1) for o in content ])

        if allow_browse and coll_types:
            # Do an extended query which includes collections whether
            # or not they were matched by the first query,
            # and which also, unfortunately may include content which
            # doesn't match the original query.
            query2 = {}
            if link_types:
                query2['portal_type'] = link_types + coll_types
            else:
                query2['portal_type'] = ()

            if 'sort_on' in query:
                query2['sort_on'] = query['sort_on']

            allcontent = context.getFolderContents(contentFilter=query2)
            content = [c for c in allcontent
                if c.portal_type in coll_types or c.id in linkable ]
        
        url_tool = getToolByName(self, 'portal_url')
        portal = url_tool.getPortalObject()

        link_types = query['portal_type']
        items = self.infoForBrains(content, resource_type, linkids=linkable)

        if allow_browse and context is not portal:
            parent = context.aq_parent
            if parent.portal_type in collection_type.portal_types:
                data = self.getSingleObjectInfo(parent, resource_type)
                data['label'] = '.. (Parent folder)'
                items.insert(0, data)
        return items

    security.declarePublic("getSingleObjectInfo")
    def getSingleObjectInfo(self, context, resource_type=None):
        """Return info for a single object"""
        if not resource_type: resource_type = self.getResourceType()
        return self.infoForBrains([context], resource_type)[0]

    security.declarePublic("getBreadCrumbs")
    def getBreadCrumbs(self, context):
        """Return breadcrumbs for drawer"""
        resource_type = self.getResourceType()
        if not resource_type.allow_browse:
            return None

        putils = getToolByName(self, 'plone_utils')
        home = [{
            'Title': "Home",
            'absolute_url': getToolByName(self, 'portal_url')()
        }]

        try:
            return home + putils.createBreadCrumbs(context)
        except AttributeError:
            return home + [ {'Title': b[0], 'absolute_url': b[1]}
                for b in self.breadcrumbs(context)[1:-1]]

    
    def _getCurrentObject(self):
        '''Returns object information for a selected object'''
        request = self.REQUEST
        url_tool = getToolByName(self, 'portal_url')
        reference_tool = getToolByName(self, 'reference_catalog')
        portal = url_tool.getPortalObject()
        rt = self.getResourceType()
        portal_types = rt.portal_types
        src = request.get('src')
        if request.get('instance',None):
            src = src.split(' ') # src is a list of uids.
            objects = [ reference_tool.lookupObject(uid) for uid in src ]
            objects = [ o for o in objects if o is not None ]
            return objects

        # Remove any spurious query string or fragment
        for c in '#?':
            if c in src:
                src = src.split(c, 1)[0]

        match = UIDURL.match(src)
        if match:
            uid = match.group(1)
            reference_tool = getToolByName(self, 'reference_catalog')
            obj = reference_tool.lookupObject(uid)
        elif src:
            base = portal.absolute_url()
            if src.startswith(base):
                src = src[len(base):].lstrip('/')
            obj = portal.restrictedTraverse(src)
            if portal_types:
                while obj.portal_type not in portal_types:
                    obj = obj.aq_parent
                    if obj is portal:
                        return []
        return [obj]

    security.declarePublic("getCurrentParent")
    def getCurrentParent(self):
        objects = self._getCurrentObject()
        parent = None
        for obj in objects:
            if parent is not None and parent is not obj.aq_parent:
                return None
            parent = obj.aq_parent
        return parent

    security.declarePublic("getCurrentSelection")
    def getCurrentSelection(self):
        '''Returns object information for a selected object'''
        objects = self._getCurrentObject()
        return self.infoForBrains(objects, self.getResourceType())

    security.declarePublic("getMyItems")
    def getMyItems(self):
        request = self.REQUEST
        response = request.RESPONSE
        response.setHeader('Cache-Control', 'no-cache')

        member_tool = getToolByName(self, 'portal_membership')
        member = member_tool.getAuthenticatedMember()

        # the default resource type is mediaobject
        search_params = {}
        search_params['sort_on'] = 'modified'
        search_params['sort_order'] = 'reverse'
        search_params['limit'] = 20
        search_params['Creator'] = member.getMemberId()

        return self.infoForQuery(search_params)

    security.declarePublic("getRecentItems")
    def getRecentItems(self):
        search_params = {}
        search_params['sort_on'] = 'modified'
        search_params['sort_order'] = 'reverse'
        search_params['limit'] = 20
        search_params['review_state'] = 'visible', 'published'

        return self.infoForQuery(search_params)

    security.declarePublic("kupuSearch")
    def kupuSearch(self):
        request = self.REQUEST
        search_params = {}
        search_params.update(request.form)

        # Get the maximum number of results with 500 being the default and
        # absolute maximum.
        abs_max = 500
        search_params['limit'] = min(request.get('max_results', abs_max), abs_max)

        return self.infoForQuery(search_params)

    security.declareProtected("View", "infoForQuery")
    def infoForQuery(self, query, resource_type=None):
        resource_type = self.getResourceType()
        baseQuery = resource_type.getQuery()
        query.update(baseQuery)
        
        limit = query.get('limit', None)
        pt = query['portal_type']
        if not pt:
            del query['portal_type']
        catalog = getToolByName(self, 'portal_catalog')
        values = catalog.searchResults(query)
        if limit:
            values = values[:limit]
        return self.infoForBrains(values, resource_type)

    security.declareProtected("View", "infoForBrains")
    def infoForBrains(self, values, resource_type, linkids=None):
        request = self.REQUEST
        response = request.RESPONSE
        response.setHeader('Cache-Control', 'no-cache')
        linktypes=resource_type.portal_types

        adaptor = InfoAdaptor(self, resource_type)
        
        # For Plone 2.0.5 compatability, if getId is callable we assume
        # we have an object rather than a brains.
        if values and callable(values[0].getId):
            info = adaptor.info_object
        else:
            info = adaptor.info

        res = []

        for obj in values:
            portal_type = getattr(obj, 'portal_type', '')

            if linkids is not None:
                linkable = obj.id in linkids
            elif len(linktypes)==0:
                linkable = True
            else:
                linkable = portal_type in linktypes

            data = info(obj, linkable)
            if data:
                res.append(data)
        return res

    security.declareProtected("View", "canCaption")
    def canCaption(self, field):
        return (getattr(field, 'default_output_type', None) in
            ('text/x-html-safe', 'text/x-html-captioned'))
        
    def _getKupuFields(self):
        """Yield all fields which are editable using kupu"""
        archetype_tool = getToolByName(self, 'archetype_tool', None)
        types = archetype_tool.listRegisteredTypes()
        for t in types:
            schema = t.get('schema')
            if schema:
                typename = getattr(t['klass'], 'archetype_name', t['portal_type'])
                for f in schema.fields():
                    w = f.widget
                    if isinstance(w, (RichWidget, VisualWidget)):
                        yield typename, f

    security.declareProtected("View", "supportedCaptioning")
    def supportedCaptioning(self):
        """Returns a list of document/fields which have support for captioning"""
        supported = [t+'/'+f.widget.label for (t,f) in self._getKupuFields() if self.canCaption(f) ]
        return str.join(', ', supported)

    security.declareProtected("View", "unsupportedCaptioning")
    def unsupportedCaptioning(self):
        """Returns a list of document/fields which do not have support for captioning"""
        unsupp = [t+'/'+f.widget.label for (t,f) in self._getKupuFields() if not self.canCaption(f) ]
        return str.join(', ', unsupp)

    def transformIsEnabled(self):
        """Test whether the output transform is enabled for x-html-safe"""
        archetype_tool = getToolByName(self, 'archetype_tool', None)
        portal_transforms = getToolByName(self, 'portal_transforms', None)
        if not archetype_tool or not portal_transforms:
            return False
        content = archetype_tool.Content()
        if not content:
            return False

        uid = content[0].UID # Get an arbitrary used UID.
        test = '<a href="resolveuid/%s"></a>' % uid
        txfrm = portal_transforms.convertTo('text/x-html-safe', test, mimetype='text/html', context=self)
        if hasattr(txfrm, 'getData'):
            txfrm = txfrm.getData()
        return txfrm and not uid in txfrm

    security.declareProtected("View", "isUploadSupported")
    def isUploadSupported(self, context):
        """Returns True if we can upload the the current folder."""
        resource_type = self.getResourceType()
        if resource_type.name != 'mediaobject':
            return False

        allowedContent = context.getAllowedTypes()
        allowed = dict.fromkeys([a.getId() for a in allowedContent])
        for t in resource_type.portal_types:
            if t in allowed:
                return True
        return False

    security.declareProtected("View", "getBaseUrl")
    def getBaseUrl(self, context, include_factory=False, resource_type=None):
        base = context.absolute_url()

        if resource_type:
            rt = self.getResourceType(resource_type);
            sd = rt.startup_directory
            if sd:
                base = sd

        posfactory = base.find('/portal_factory/')
        if posfactory>0:
            if include_factory:
                base = base[:posfactory+15]
            else:
                base = base[:posfactory]
        return base

InitializeClass(PloneDrawers)
