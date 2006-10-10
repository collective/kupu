# Portal transform for images with captions
#
# We want to be able to support captions in images.
# The easiest way to do this is to define a Portal Transform which is
# applied to the HTML body text on output.
#
# The transform finds all the embedded images, and replaces them with
# an appropriate chunk of HTML to include the caption.
#
from Products.CMFCore.utils import getToolByName
from Products.PortalTransforms.interfaces import itransform
from DocumentTemplate.DT_Util import html_quote
from DocumentTemplate.DT_Var import newline_to_br
import re
from cgi import escape
from urlparse import urlsplit, urljoin, urlunsplit

__revision__ = '$Id$'

# IMAGE_PATTERN matches an image tag on its own, or an image tag
# enclosed in a simple <p> or <div>. In the latter case we strip out
# the enclosing tag since we are going to insert our own.
PATIMG = '\\<img[^>]+class=[^=>]*captioned[^>]+\\>'
PATA = '(?:\\<a[^>]*\\>'+PATIMG+'\\</a\\>)' + '|' + PATIMG
PAT0 = '('+PATA+')'
PAT1 = '<(?:p|div)[^>]*>'+PAT0 + '</(?:p|div)>' + '|' + PAT0
IMAGE_PATTERN = re.compile(PAT1, re.IGNORECASE)

# Regex to match stupid IE attributes. In IE generated HTML an
# attribute may not be enclosed by quotes if it doesn't contain
# certain punctuation.
ATTR_VALUE = '=(?:"?)(?P<%s>(?<=")[^"]*|[^ \/>]*)'
ATTR_CLASS = ATTR_VALUE % 'class'
ATTR_WIDTH = ATTR_VALUE % 'width'

ATTR_PATTERN = re.compile('''
    (?P<tag>\<
     ( class%s
     | src="resolveuid/(?P<src>([^/"#? ]*))
     | width%s
     | .
     )*\>
    )''' % (ATTR_CLASS, ATTR_WIDTH), re.VERBOSE)

CLASS_PATTERN = re.compile('\s*class=("[^"]*captioned[^"]*"|[^" \/>]+)')
ALT_PATTERN = re.compile('\\balt=("[^"]*"|[^" \/>]+)')
END_TAG_PATTERN = re.compile('(<img[^>]*?)( */?>)')
IMAGE_TEMPLATE = '''\
<div class="%(class)s" style="width:%(width)spx;">
 <div style="width:%(width)spx;">
  %(tag)s
 </div>
 <div class="image-caption">
  %(caption)s
 </div>
</div>
'''

UID_PATTERN = re.compile('(?P<tag><(?:a|img) [^>]*(?:src|href)=")(?P<url>[^"]*resolveuid/(?P<uid>[^"#? ]*))')

class HTMLToCaptioned:
    """Transform which adds captions to images embedded in HTML"""
    __implements__ = itransform
    __name__ = "html_to_captioned"
    inputs = ('text/html',)
    output = "text/x-html-captioned"
    
    def __init__(self, name=None):
        self.config_metadata = {
            'inputs' : ('list', 'Inputs', 'Input(s) MIME type. Change with care.'),
            }
        if name:
            self.__name__ = name

    def name(self):
        return self.__name__

    def __getattr__(self, attr):
        if attr == 'inputs':
            return self.config['inputs']
        if attr == 'output':
            return self.config['output']
        raise AttributeError(attr)

    def convert(self, data, idata, filename=None, **kwargs):
        """convert the data, store the result in idata and return that
        optional argument filename may give the original file name of received data
        additional arguments given to engine's convert, convertTo or __call__ are
        passed back to the transform
        
        The object on which the translation was invoked is available as context
        (default: None)
        """
        context = kwargs.get('context', None)
        if context:
            at_tool = context.archetype_tool

        if context and at_tool:        
            def replaceImage(match):
                tag = match.group(1) or match.group(2)
                attrs = ATTR_PATTERN.match(tag)
                src = attrs.group('src')
                klass = attrs.group('class')
                width = attrs.group('width')
                if src:
                    d = attrs.groupdict()
                    target = at_tool.reference_catalog.lookupObject(src)
                    if target:
                        d['caption'] = newline_to_br(target.Description())
                        tag = CLASS_PATTERN.sub('', d['tag'])
                        tag = ALT_PATTERN.sub('', tag)
                        tag = END_TAG_PATTERN.sub('\\1 alt="%s"\\2' % escape(target.Title(),1), tag)
                        d['tag'] = tag
                        if not width:
                            width = target.getWidth()
                        if not width:
                            try:
                                width = target.getImage().getWidth()
                            except:
                                width = 150
                        d['width'] = width
                        return IMAGE_TEMPLATE % d
                return match.group(0) # No change

            html = IMAGE_PATTERN.sub(replaceImage, data)

            # Replace urls that use UIDs with human friendly urls.
            def replaceUids(match):
                tag = match.group('tag')
                uid = match.group('uid')
                target = at_tool.reference_catalog.lookupObject(uid)
                if target:
                    try:
                        url = target.getRemoteUrl()
                    except AttributeError:
                        url = target.absolute_url_path()
                    return tag + url
                return match.group(0)

            html = UID_PATTERN.sub(replaceUids, html)
            
            idata.setData(html)
            return idata

        # No context to use for replacements, so don't bother trying.
        idata.setData(data)
        return idata

def register():
    return HTMLToCaptioned()

def initialize():
    engine = getToolByName(portal, 'portal_transforms')
    engine.registerTransform(register())

ATTR_HREF = ATTR_VALUE % 'href'
LINK_PATTERN = re.compile(
    r'(?P<prefix>\<(?:img\s[^>]*src|a\s[^>]*href)=(?:"?))(?P<href>(?<=")[^"]*|[^ \/>]*)',
    re.IGNORECASE)

class Migration:
    FIELDS = ('portal_type', 'typename', 'fieldname',
        'fieldlabel', 'position', 'action', 'dryrun',
        'image_tails'
    )

    def __init__(self, tool):
        self.tool = tool
        self.url_tool = getToolByName(tool, 'portal_url')
        self.portal = self.url_tool.getPortalObject()
        self.portal_base = self.url_tool.getPortalPath()
        self.portal_base_url = self.portal.absolute_url()
        self.prefix_length = len(self.portal_base)+1
        self.uid_catalog = getToolByName(tool, 'uid_catalog')
        self.reference_tool = getToolByName(tool, 'reference_catalog')
        self.portal_catalog = getToolByName(tool, 'portal_catalog')
        self._continue = True

    def initFromRequest(self):
        self.image_tails = self.tool._getImageSizes()
        request = self.tool.REQUEST
        fields = [f for f in request.form.get('fields',()) if f.get('selected',0)]
        if fields:
            f = fields[0]
            self.portal_type = f.portal_type
            self.typename = f.type
            self.fieldname = f.name
            self.fieldlabel = f.label
        else:
            self.portal_type = None
            self.fieldname = None
            self.fieldlabel = None

        self.position = 0
        self.action = request.form.get('button', None)
        self.dryrun = request.form.get('dryrun', '') != 'I agree'

    def saveState(self):
        SESSION = self.tool.REQUEST.SESSION
        SESSION['kupu_migrator'] = dict([(f, getattr(self, f, None)) for f in self.FIELDS])

    def restoreState(self):
        SESSION = self.tool.REQUEST.SESSION
        state = SESSION['kupu_migrator']
        for f in self.FIELDS:
            setattr(self, f, state[f])

    def clearState(self):
        SESSION = self.tool.REQUEST.SESSION
        if SESSION.has_key('kupu_migrator'):
            del SESSION['kupu_migrator']

    def status(self):
        s = [ '%s=%s' % (f,getattr(self, f, 'unset')) for f in
            self.FIELDS ]
        return '\n'.join(s)

    def getInfo(self):
        info = {}
        if self._continue:
            info['nexturi'] = self.tool.absolute_url_path()+'/kupu_migration.xml?button=continue'
        if hasattr(self, '_total'):
            info['total'] = self._total
            info['position'] = self.position
            if self._total==0:
                info['percent'] = '100%'
            else:
                info['percent'] = '%d%%' % ((100.*self.position)/self._total)
            info['objects'] = getattr(self, '_objects', [])
        action = getattr(self, 'action', '')
        if action:
            headings = { 'check': 'Bad links',
                'touid': 'Links converted to resolveuid form',
                'topath': 'Links converted to relative path',
                }
            heading = headings[action]
            if self.typename:
                heading += ' for %s (%s)' % (self.typename, self.fieldlabel)
            info['heading'] = heading

        if not self.action=='check':
            if self.dryrun:
                dryrun = 'Dryrun only, no changes are being made to your data'
            else:
                dryrun = '''Content is being updated
                (actually that's a lie: until the code is more tested I'm not updating anything)'''
            info['dryrun'] = dryrun

        return info

    def docontinue(self):
        """Scan selected documents looking for convertible links"""
        brains = self.portal_catalog.searchResults(portal_type=self.portal_type)
        pos = self.position
        self._total = total = len(brains)
        brains = brains[pos:pos+10]
        self.position = pos + len(brains)
        if not brains:
            self._continue = False
            return False # Done

        self._objects = res = []
        for b in brains:
            braininfo = self.brain_check(b)
            if braininfo:
                res.append(braininfo)

        self._continue = True
        return True

    def brain_check(self, brain):
        """Check the relative links within this object."""
        def checklink(match):
            matched = match.group(0)
            newlink = link = match.group('href')
            classification, uid, relpath, tail = self.classifyLink(link, base)

            if self.action=='check':
                if classification=='bad':
                    info.append(link)
            elif self.action=='touid':
                if classification=='internal':
                    if uid and uid==objuid:
                        newlink = tail
                    elif uid:
                        newlink = 'resolveuid/%s%s' % (uid, tail)
                    else:
                        newlink = relpath+tail

            elif self.action=='topath':
                if classification=='internal':
                    newlink = relpath+tail

            if newlink != link:
                prefix = match.group('prefix')
                changes.append((match.start()+len(prefix), match.end(), newlink))
                return prefix + newlink
            return matched

        info = []
        changes = []
        object = brain.getObject()
        objuid = getattr(object.aq_base, 'UID', None)
        if objuid:
            objuid = objuid

        base = object.absolute_url()
        if getattr(object.aq_explicit, 'isPrincipiaFolderish', 0):
            base += '/'
        field = object.getField(self.fieldname)
        data = field.getRaw(object)
        newdata = LINK_PATTERN.sub(checklink, data)

        if info or changes:
            title = brain.Title
            if not title:
                title = getattr(brain, 'getId')
            if not title:
                title = '<object>'
            if data != newdata:
                diffs = htmlchanges(data, changes)
            else:
                diffs = None
            return dict(title=title, info=info, url=object.absolute_url_path(),
                diffs=diffs)
        return None

    def UIDfromURL(self, url):
        """Convert an absolute URL to a UID"""
        if not url.startswith(self.portal_base_url):
            return None
        path = url[len(self.portal_base_url)+1:]
        if not path:
            return None
        try:
            metadata = self.uid_catalog.getMetadataForUID(path)
        except KeyError:
            return None
        return metadata.get('UID', None)

    def brainfromurl(self, url):
        """convert a url to a catalog brain"""
        if not url.startswith(self.portal_base_url):
            return None
        url = self.portal_base + url[len(self.portal_base_url):]
        brains = self.portal_catalog.searchResults(path=url)
        if len(brains) != 1:
            # Happens on Plone 2.0 :(
            for b in brains:
                if b.getPath()==url:
                    return b
            return None
        return brains[0]

    def resolveToPath(self, absurl):
        if 'resolveuid/' in absurl:
            bits = absurl.split('resolveuid/', 1)
            bits = bits[1].split('/',1)
            uid = bits[0]
            if len(bits)==1:
                tail = ''
            else:
                tail = '/' + bits[1]

            # TODO: should be able to convert uid to brain without
            # touching the actual object.
            obj = self.reference_tool.lookupObject(uid)
            if obj is not None:
                newurl = obj.absolute_url()
                return uid, newurl, tail
        return None, None, None

    def classifyLink(self, url, base, first=True):
        """Classify a link as:
        internal, external, bad

        Returns a tuple:
        (classification, uid, relpath, tail)
        giving potential urls: resolveuid/<uid><tail>
        or: <relpath><table>
        """
        if url.startswith('portal_factory'):
            url = url[14:]
        absurl = urljoin(base, url)
        if not absurl.startswith(self.portal_base_url):
            return 'external', None, url, ''
        absurl = absurl.strip('/')

        scheme, netloc, path, query, fragment = urlsplit(absurl)
        tail = urlunsplit(('','','',query,fragment))
        absurl = urlunsplit((scheme,netloc,path,'',''))

        if 'resolveuid/' in absurl:
            UID, newurl, ntail = self.resolveToPath(absurl)
            if UID is None:
                return 'bad', None, url, ''
            absurl = newurl
            tail = ntail + tail
        else:
            UID = self.UIDfromURL(absurl)

        brain = self.brainfromurl(absurl)
        if not brain:
            if first:
                # Allow image size modifiers on the end of urls.
                p = absurl.split('/')
                absurl = '/'.join(p[:-1])
                if p[-1] in self.image_tails:
                    tail = '/'+p[-1]+tail
                    c, uid, url, _ = self.classifyLink(absurl, base, first=False)
                    return c, uid, url, tail
            return 'bad', None, url, ''

        relative, _ = makeUrlRelative(absurl, base)
        # Don't convert page-internal links to uids.
        # Also fix up spurious portal_factory references
        if not relative:
            return 'internal', None, '', tail
        return 'internal', UID, relative, tail

def makeUrlRelative(url, base):
    """Make a link relative to base.
    This method assumes we have already checked that url and base have a common prefix.
    """
    sheme, netloc, path, query, fragment = urlsplit(url)
    _, _, basepath, _, _ = urlsplit(base)

    baseparts = basepath.split('/')
    pathparts = path.split('/')

    basetail = baseparts.pop(-1)

    # Remove common elements
    while pathparts and baseparts and baseparts[0]==pathparts[0]:
        baseparts.pop(0)
        pathparts.pop(0)

    for i in range(len(baseparts)):
        pathparts.insert(0, '..')

    if not pathparts:
        pathparts.insert(0, '.')
    elif pathparts==[basetail]:
        pathparts.pop(0)
    

    return '/'.join(pathparts), urlunsplit(('','','',query,fragment))

def htmlchanges(data, changes):
    out = []
    prev = 0
    lastend = 0
    for s,e,new in changes:
        start = max(prev, s-10)
        if start != prev:
            if start-10 > prev:
                out.append(html_quote(data[prev:prev+10]))
                out.append('...')
            else:
                out.append(html_quote(data[prev:start]))
        out.append(html_quote(data[start:s]))
        out.append('<del>%s</del>' % html_quote(data[s:e]))
        out.append('<ins>%s</ins>' % html_quote(new))
        prev = e
    if prev:
        out.append(html_quote(data[prev:prev+10]))
        if prev+10 < len(data):
            out.append('...')
    return ''.join(out)
