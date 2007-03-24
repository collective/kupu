##############################################################################
#
# Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
"""Tests for the link checking and migration code"""

import os, sys
if __name__ == '__main__':
    execfile(os.path.join(sys.path[0], 'framework.py'))

from Products.PloneTestCase import PloneTestCase
from Products.PloneTestCase.ptc import portal_owner

PloneTestCase.setupPloneSite(products=['kupu'])

from AccessControl.SecurityManagement import newSecurityManager
try:
    from Products.ATContentTypes.lib import constraintypes
except:
    constraintypes = None

from Products.kupu.plone.html2captioned import Migration

RESOURCES = dict(
    linkable = ('Document', 'Image', 'File', 'Folder'),
    mediaobject = ('Image',),
    collection = ('Folder',),
    containsanchors = ('Document',),
    )

# Type names vary according to the version of Plone and/or
# ATContentTypes. Map the new names to the old ones here, and
# turn it into an identity mapping later if we can.
TypeMapping = {
    'Document': 'ATDocument',
    'Image': 'ATImage',
    'Link': 'ATLink',
    'Folder': 'ATFolder',
    'File': 'ATFile',
    'News Item': 'ATNewsItem',
    'Event': 'ATEvent',
}
def MapType(typename):
    return TypeMapping[typename]

class TestLinkCode(PloneTestCase.PloneTestCase):
    """Test the link checking code"""

    def afterSetUp(self):
        portal = self.portal
        self.setRoles(['Manager',])
        self.kupu = portal.kupu_library_tool
        typestool = self.portal.portal_types
        if not hasattr(typestool, 'ATDocument'):
            # Use the type names without the AT prefix
            for k in TypeMapping:
                TypeMapping[k] = k

    def loginPortalOwner(self):
        '''Use if you need to manipulate the portal itself.'''
        uf = self.app.acl_users
        user = uf.getUserById(portal_owner).__of__(uf)
        newSecurityManager(None, user)

    def create(self, id, metatype='ATDocument', folder=None, **kwds):
        '''Create an object in the cms portal'''
        if folder is None:
            folder = self.portal

        folder.invokeFactory(MapType(metatype), id)
        obj = getattr(folder, id)

        if metatype=='Folder' and constraintypes:
            obj.setConstrainTypesMode(constraintypes.DISABLED)

        if metatype=='Document':
            obj.setTitle('Simple document')
            obj.setText('Sample document text')
            for k, v in kwds.items():
                field = obj.getField(k)
                mutator = field.getMutator(obj)(v)

            obj.reindexObject()
        return obj

    def setup_content(self):
        self.setRoles(['Manager',])
        self.loginPortalOwner()
        f = self.create('folder', 'Folder')

        for id in ('alpha', 'beta'):
            self.create(id, 'Document', f, subject=['aspidistra'])
        self.create('gamma', 'Image', f)

        sub1 = self.create('sub1', 'Folder', f)
        sub1.setSubject(['aspidistra'])
        sub1.reindexObject()
        sub2 = self.create('sub2', 'Folder', f)
        self.create('delta', 'Folder', sub2)

        portal = self.portal
        tool = self.portal.kupu_library_tool
        types = tool.zmi_get_resourcetypes()
        #tool.deleteResource([ t.name for t in types])
        for k,v in RESOURCES.items():
            tool.addResourceType(k, [MapType(t) for t in v])

    def test_relative(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.sub2.delta.absolute_url()
        path = '../alpha'
        expected = ('internal', portal.folder.alpha.UID(), path, '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_external(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.sub2.delta.absolute_url()
        path = 'mailto:me@nowhere'
        expected = ('external', None, path, '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_localexternal(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.sub2.delta.absolute_url()
        path = 'http://nohost/plone/folder/alpha'
        expected = ('internal', portal.folder.alpha.UID(), '../alpha', '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_abspath(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = '/plone/folder/beta'
        expected = ('internal', portal.folder.beta.UID(), 'beta', '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_anchor(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = '#fred'
        expected = ('internal', None, '', path)
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_redundant(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'alpha#fred'
        expected = ('internal', None, '', '#fred')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_bad_portal_factory(self):
        # Some version of kupu wrongly inserted jumplinks to
        # portal_factory. Check these get cleaned.
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'portal_factory#fred'
        expected = ('internal', None, '', '#fred')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_dot(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = '.'
        expected = ('internal', portal.folder.UID(), path, '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_resolveuid(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'resolveuid/' + portal.folder.beta.UID()
        expected = ('internal', portal.folder.beta.UID(), 'beta', '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_resolveuidEmbedded(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'wibble/resolveuid/' + portal.folder.beta.UID() + '#fragment'
        expected = ('internal', portal.folder.beta.UID(), 'beta', '#fragment')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_badlink(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'wibble'
        expected = ('bad', None, path, '')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_image(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        migrator.initImageSizes()
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'gamma/image_thumb'
        expected = ('internal', portal.folder.gamma.UID(), 'gamma', '/image_thumb')
        self.assertEquals(expected, migrator.classifyLink(path, base))

    def test_image2(self):
        self.setup_content()
        migrator = Migration(self.kupu)
        portal = self.portal
        base = portal.folder.alpha.absolute_url()
        path = 'resolveuid/'+portal.folder.gamma.UID()+'/image_icon'
        expected = ('internal', portal.folder.gamma.UID(), 'gamma', '/image_icon')
        self.assertEquals(expected, migrator.classifyLink(path, base))

        
if __name__ == '__main__':
    framework()
else:
    # While framework.py provides its own test_suite()
    # method the testrunner utility does not.
    from unittest import TestSuite, makeSuite
    def test_suite():
        suite = TestSuite()
        suite.addTest(makeSuite(TestLinkCode))
        return suite
