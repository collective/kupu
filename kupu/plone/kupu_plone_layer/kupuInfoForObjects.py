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

# A list comprehension might seem a little cryptic here (although it
# should be readable just fine). The reason we use it is that it is
# much faster instead of iterating and appending manually.
items = [{'id':          obj.getId(),
          'url':         obj.absolute_url(),
          'portal_type': obj.portal_type,
          'collection':  obj.portal_type in coll_types,
          'icon':        context.portal_url() + '/' + obj.getIcon(),
          'size':        hasattr(obj, 'get_size') and context.getObjSize(obj) or None,
          'width':       maybeGetAttr(obj, 'width'),
          'height':      maybeGetAttr(obj, 'height'),
          'preview':     obj.getTypeInfo().getActionById(preview_action, None),
          'title':       obj.Title() or obj.getId(),
          'description': obj.Description()} for obj in values]
return items
