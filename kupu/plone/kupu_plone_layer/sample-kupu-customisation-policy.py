## Script (Python) "kupu-customisation-policy"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=
##title=Kupu Customisation Policy
##

# Make a copy of this script called 'kupu-customisation-policy'
# in any skin folder on your site and edit it to set up your own
# preferred kupu configuration.


LINKABLE = ('MyObjectType',
            'AnotherObjectType',)

MEDIAOBJECT = ('MyImage',
               'Image',)

COLLECTION = ('Folder',
              'ATFolder',
              'Large Plone Folder')

EXCLUDED_HTML = [
  {'tags': ('center','span','tt','big','small','u','s','strike','basefont','font',),
   'attributes':(),
   'keep': 1 },
  
  {'tags':(),
  'attributes': ('dir','lang','valign','halign','border','frame',
      'rules','cellspacing','cellpadding','align','bgcolor','style'),
   'keep': 1},

  {'tags': ('table','th','td'),
   'attributes': ('width','height'),
   'keep': 1},

   {'tags': '', 'attributes': '' } # Must be dummy entry at end.
]

STYLE_WHITELIST = ['text-align', 'list-style-type']
CLASS_BLACKLIST = ['MsoNormal', 'MsoTitle', 'MsoHeader', 'MsoFootnoteText',
        'Bullet1', 'Bullet2']

tool = context.kupu_library_tool

print "add resources"
tool.addResourceType('linkable', LINKABLE)
tool.addResourceType('mediaobject', MEDIAOBJECT)
tool.addResourceType('collection', COLLECTION)

print "configure kupu"
tool.configure_kupu(linkbyuid=True,
    table_classnames = ('plain', 'listing', 'grid', 'data'),
    html_exclusions = EXCLUDED_HTML,
    style_whitelist = STYLE_WHITELIST,
    class_blacklist = CLASS_BLACKLIST)

return printed
