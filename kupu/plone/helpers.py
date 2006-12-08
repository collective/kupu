##############################################################################
#
# Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
# Helper classes
FILTERS = [
    ('bg-basicmarkup', 'Bold/Italic group', True),
    ('bold-button', 'Bold button', True),
    ('italic-button', 'Italic button', True),
    ('bg-subsuper', 'Subscript/Superscript group', True),
    ('subscript-button', 'Subscript button', True),
    ('superscript-button', 'Superscript button', True),
    ('bg-justify', 'Justify group', True),
    ('justifyleft-button', 'Justify left button', True),
    ('justifycenter-button', 'Justify center button', True),
    ('justifyright-button', 'Justify right button', True),
    ('bg-list', 'List group', True),
    ('list-ol-addbutton', 'Add ordered list button', True),
    ('list-ul-addbutton', 'Add unordered list button', True),
    ('definitionlist', 'Definition list', True),
    ('bg-indent', 'Indent group', True),
    ('outdent-button', 'Outdent button', True),
    ('indent-button', 'Indent button', True),
    ('bg-drawers', 'Drawers group', True),
    ('imagelibdrawer-button', 'Image drawer button', True),
    ('linklibdrawer-button', 'Link drawer button', True),
    ('linkdrawer-button', 'External link drawer button', True),
    ('anchors-button', 'Anchor drawer button', True),
    ('tabledrawer-button', 'Table drawer button', True),
    ('bg-remove', 'Remove group', True),
    ('removeimage-button', 'Remove image button', True),
    ('removelink-button', 'Remove link button', True),
    ('bg-undo', 'Undo group', True),
    ('undo-button', 'Undo button', True),
    ('redo-button', 'Redo button', True),
    ('spellchecker', 'Spellchecker', False),
    ('source', 'Source', True),
    ('styles', 'Styles pulldown', True),
    ('ulstyles', 'Unordered list style pulldown', True),
    ('olstyles', 'Ordered list style pulldown', True),
    ('zoom', 'Zoom button', True),
]
FILTERDICT = dict([(k,v) for (k,title,v) in FILTERS])

class ButtonFilter:
    """Helper class to control visibility of buttons.
    Works from both a whitelist and a blacklist in the widget.
    XXX Add expressions to the configlet so that a button may be hidden conditionally.
    """
    __allow_access_to_unprotected_subobjects__ = 1

    def __init__(self, tool, context, field=None):
        self.tool = tool
        self.field = field
        widget = getattr(field, 'widget', None)
        self.filter_buttons = getattr(widget, 'filter_buttons', None)
        self.allow_buttons = getattr(widget, 'allow_buttons', None)
        self.visible_buttons = tool.getToolbarFilters(context, field)
        print "visible=", self.visible_buttons

    def isButtonAllowed(self, name):
        visible = self.visible_buttons.get(name, True)
        if self.allow_buttons is not None:
            return visible and name in self.allow_buttons
        if self.filter_buttons is not None:
           return visible and name not in self.filter_buttons
        return visible

    def __getattr__(self, name):
        """name should be an id of a button or a button group in the kupu toolbar."""
        if name[0]=='_':
            raise AttributeError("'%s' object has no attribute '%s'" % (self.__class__.__name__, name))
        allowed = self.isButtonAllowed(name)
        print "ButtonFilter",name,"->",allowed
        return allowed
