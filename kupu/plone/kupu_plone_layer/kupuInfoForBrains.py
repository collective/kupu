## Script (Python) "kupuInfoForBrains"
##title=Provide dictionaries with information about a list of catalog brains
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=values
from Products.CMFCore.utils import getToolByName
types_tool = getToolByName(context, 'portal_types')
kupu_tool = getToolByName(context, 'kupu_library_tool')

coll_types = kupu_tool.queryPortalTypesForResourceType('collection', ())
preview_action = 'kupupreview'

items = [{'id':          brain.getId,
          'url':         brain.getURL(),
          'portal_type': brain.portal_type,
          'collection':  brain.portal_type in coll_types,
          'icon':        context.portal_url() + '/' + brain.getIcon,
          'size':        None,
          'preview':     types_tool.getTypeInfo(brain.portal_type).getActionById(preview_action, None),
          'title':       brain.Title or brain.getId,
          'description': brain.Description} for brain in values]
return items
