import os, sys
if __name__ == '__main__':
    execfile(os.path.join(sys.path[0], 'framework.py'))

from unittest  import TestCase, TestSuite, main, makeSuite
from Products.CMFPlone.tests import PloneTestCase
from os.path import join, abspath, dirname

from Products.PortalTransforms.tests.test_transforms import *
from Products.PortalTransforms.tests.utils import normalize_html
from Products.kupu import kupu_globals

PREFIX = abspath(dirname(__file__))

def input_file_path(file):
    return join(PREFIX, 'input', file)

def output_file_path(file):
    return join(PREFIX, 'output', file)

tests =(
('Products.kupu.plone.html2captioned', "minimal.in", "minimal.out", normalize_html, 0),
('Products.kupu.plone.html2captioned', "simple.in", "simple.out", normalize_html, 0),
('Products.kupu.plone.html2captioned', "baduid.in", "baduid.out", normalize_html, 0),
('Products.kupu.plone.html2captioned', "notquoted.in", "notquoted.out", normalize_html, 0),
('Products.kupu.plone.html2captioned', "notcaptioned.in", "notcaptioned.out", normalize_html, 0),
('Products.kupu.plone.html2captioned', "linked.in", "linked.out", normalize_html, 0),
    )

class MockImage:
    def __init__(self, uid, description):
        self.uid, self.description = uid, description
        if not uid.startswith('SUB:'):
            self.image_thumb = MockSubImage(self)

    def Title(self):
        return 'image '+self.uid
    def Description(self):
        return self.description
    def absolute_url(self):
        return '[url for %s]' % self.uid
    def absolute_url_path(self):
        return '[url for %s]' % self.uid
    def getWidth(self):
        return 600
    def tag(self, height="", width="", **kw):
        src = self.absolute_url_path()
        alt = self.Title()
        if not width:
            width = self.getWidth()
        return '<img height="%s" src="%s" width="%s" alt="%s"/>' % (height, src, width, alt)

class MockSubImage(MockImage):
    def __init__(self, parent):
        self.uid = parent.uid
        self.description = parent.description

    def getWidth(self):
        return 20
    def absolute_url_path(self):
        return '[url for %s]' % self.uid+'/image_thumb'

class MockCatalogTool:
    def lookupObject(self, uid):
        dummydata = {
            '104ede98d4c7c8eaeaa3b984f7395979': 'Test image caption'
        }
        if uid not in dummydata:
            return None
        image = MockImage(uid, dummydata[uid])
        return image

class MockArchetypeTool:
    reference_catalog = MockCatalogTool()

def mockPageTemplate(self, **kw):
    """Acquisition isn't set up correctly for us to use a real PageTemplateFile,
    so for the test we just use string formatting.
    """
    caption = kw.get('caption', '!caption!')
    image = kw.get('image', None)
    fullimage = kw.get('fullimage', None)
    Class=kw['class']
    width = kw['width']
    owidth = fullimage.getWidth()
    if width is None:
        kw['width'] = width = image.getWidth()
    href = fullimage.absolute_url_path()
    tag = image.tag(**kw)

    #if width==owidth:
    TEMPLATE = '''<dl class="%(Class)s">
    <dt>%(tag)s</dt>
    <dd class="image-caption" style="width:%(width)spx">%(caption)s</dd>
    </dl>'''
    #else:
    #    TEMPLATE = '''<dl class="%(Class)s">
    #    <dt><a rel="lightbox" href="%(href)s">%(tag)s</a></dt>
    #    <dd class="image-caption" style="width:%(width)spx">%(caption)s</dd>
    #    </dl>'''
        
    return TEMPLATE % dict(
        caption=caption, Class=Class, href=href, width=width, tag=tag)

class MockPortal:
    # Mock portal class: just enough to let me think I can lookup a
    # Description for an image from its UID.
    archetype_tool = MockArchetypeTool()

    # Also now needs access to the captioning template
    kupu_captioned_image = mockPageTemplate

class TransformTest(TestCase):
    portal = MockPortal()
    
    def do_convert(self, filename=None):
        if filename is None and exists(self.output + '.nofilename'):
            output = self.output + '.nofilename'
        else:
            output = self.output
        input = open(self.input)
        orig = input.read()
        input.close()
        data = datastream(self.transform.name())
        res_data = self.transform.convert(orig, data, filename=filename, context=self.portal)
        self.assert_(idatastream.isImplementedBy(res_data))
        got = res_data.getData()
        try:
            output = open(output)
        except IOError:
            import sys
            print >>sys.stderr, 'No output file found.'
            print >>sys.stderr, 'File %s created, check it !' % self.output
            output = open(output, 'w')
            output.write(got)
            output.close()
            self.assert_(0)
        expected = output.read()
        if self.normalize is not None:
            expected = self.normalize(expected)
            got = self.normalize(got)
        output.close()

        self.assertEquals(got, expected,
                          '[%s]\n\n!=\n\n[%s]\n\nIN %s(%s)' % (
            got, expected, self.transform.name(), self.input))
        self.assertEquals(self.subobjects, len(res_data.getSubObjects()),
                          '%s\n\n!=\n\n%s\n\nIN %s(%s)' % (
            self.subobjects, len(res_data.getSubObjects()), self.transform.name(), self.input))

    def testSame(self):
        self.do_convert(filename=self.input)

    def testSameNoFilename(self):
        self.do_convert()

    def __repr__(self):
        return self.transform.name()

TR_NAMES = None

def make_tests(test_descr):
    """generate tests classes from test info

    return the list of generated test classes
    """
    tests = []
    for _transform, tr_input, tr_output, _normalize, _subobjects in test_descr:
        # load transform if necessary
        if type(_transform) is type(''):
            try:
                _transform = load(_transform).register()
            except:
                import traceback
                traceback.print_exc()
                continue
        #
        if TR_NAMES is not None and not _transform.name() in TR_NAMES:
            print 'skip test for', _transform.name()
            continue

        class TransformTestSubclass(TransformTest):
            input = input_file_path(tr_input)
            output = output_file_path(tr_output)
            transform = _transform
            normalize = lambda x, y: _normalize(y)
            subobjects = _subobjects

        tests.append(TransformTestSubclass)

    return tests

def test_suite():
    t = [ (_transform,
        input_file_path(tr_input),
        output_file_path(tr_output),
        _normalize,
        _subobjects)
        for _transform, tr_input, tr_output, _normalize, _subobjects in tests ]
        
    return TestSuite([makeSuite(test) for test in make_tests(t)])

if __name__=='__main__': 
    main(defaultTest='test_suite') 
