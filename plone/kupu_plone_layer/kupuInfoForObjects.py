## Script (Python) "kupuInfoForObjects"
##title=Provide dictionaries with information about a list of objects
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=values
from Products.CMFCore.utils import getToolByName
kupu_tool = getToolByName(context, 'kupu_library_tool')
coll_types = kupu_tool.queryPortalTypesForResourceType('collection', ())
linkbyuid = kupu_tool.getLinkbyuid()
preview_action = 'kupupreview'

def maybeGetAttr(obj, name):
    '''Get an attribute if it exists.
    Call it if callable
    '''
    if not hasattr(obj, name):
        return None
    val = getattr(obj, name)
    if callable(val):
        return val()
    return val

    if linkbyuid and not collection and hasattr(obj, 'UID'):
        url = 'resolveuid/%s' % obj.UID()
    else:
        url = obj.absolute_url()

    icon = "%s/%s" % (context.portal_url(), obj.getIcon())
    width = height = size = None
    preview = obj.getTypeInfo().getActionById(preview_action, None)

    if hasattr(obj, 'get_size'):
        size = context.getObjSize(obj)
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

return [info(obj) for obj in values]
