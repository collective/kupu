## Script (Python) "kupuInfoForObjects"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=values
##title=Provide dictionaries with information about a list of objects
##
from Products.CMFCore.utils import getToolByName
import AccessControl
from AccessControl import Unauthorized

kupu_tool = getToolByName(context, 'kupu_library_tool')
coll_types = kupu_tool.queryPortalTypesForResourceType('collection', ())
linkbyuid = kupu_tool.getLinkbyuid()
preview_action = 'kupupreview'

# The redirecting url must be absolute otherwise it won't work for
# preview when the page is using portal_factory
# The absolute to relative conversion when the document is saved
# should strip the url right back down to resolveuid/whatever.
base = context.absolute_url()

security = AccessControl.getSecurityManager()

def info(obj):
    if not security.checkPermission('View', obj):
        return None

    try:
        id = obj.getId()
        portal_type = obj.portal_type
        collection = portal_type in coll_types

        if linkbyuid and not collection and hasattr(obj, 'UID'):
            url = base+'/resolveuid/%s' % obj.UID()
        else:
            url = obj.absolute_url()

        icon = "%s/%s" % (context.portal_url(), obj.getIcon())
        width = height = size = None
        preview = obj.getTypeInfo().getActionById(preview_action, None)

        try:
                size = context.getObjSize(obj)
        except:
            size = None

        width = getattr(obj, 'width', None)
        height = getattr(obj, 'height', None)
        if callable(width): width = width()
        if callable(height): height = height()

        title = obj.Title() or obj.getId()
        description = obj.Description()

        return {'id': id, 'url': url, 'portal_type': portal_type,
              'collection':  collection, 'icon': icon, 'size': size,
              'width': width, 'height': height,
              'preview': preview, 'title': title, 'description': description,
              }
    except Unauthorized:
        return None

res = []
for obj in values:
    data = info(obj)
    if data:
        res.append(data)
return res
