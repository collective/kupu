# Portal transform for images with captions
#
# Transforming a non-standard field type to html on output is
# probably a better way to do things than the original transform
# which converts html to a non-standard field type.
#
# The transform is the same as the one done by html2captioned, but
# this version expects to work on text/x-html-raw

try:
    from Products.PortalTransforms.z3.interfaces import ITransform
except ImportError:
    ITransform = None
from Products.PortalTransforms.interfaces import itransform

from Products.kupu.plone import html2captioned
from Products.CMFCore.utils import getToolByName
from zope.interface import implements

class KupuOutputTransform(html2captioned.HTMLToCaptioned):
    """Transform which adds captions to images embedded in HTML"""
    if ITransform is not None:
        implements(ITransform)
    __implements__ = itransform
    __name__ = "kupu_raw_to_html"
    inputs = ('text/x-html-raw',)
    output = "text/html"

def register():
    return KupuOutputTransform()

def initialize():
    engine = getToolByName(portal, 'portal_transforms')
    engine.registerTransform(register())
