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
from urllib import unquote_plus
from Acquisition import aq_base
from htmlentitydefs import name2codepoint

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
FRAGMENT_TYPE = 'CompositePack Fragments'
NAVIGATION_PAGE = 'Navigation Page'

SUMMARY_PATTERN = re.compile(r'(\<a[^>]*>.*?</a>)|(\<img[^>]*\>)', re.IGNORECASE|re.DOTALL)

class Migration:
    FIELDS = ('portal_type', 'typename', 'fieldname',
        'fieldlabel', 'position', 'action', 'commit_changes',
        'image_tails', 'paths', 'pathuids', 'uids', 'found',
        'batch_size',
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
        self._firstoutput = False
        self.commit_changes = False
        self._objects = []

    def initFromRequest(self):
        self.image_tails = self.tool._getImageSizes()
        self.uids = None
        self.found = 0
        request = self.tool.REQUEST
        rfg = request.form.get
        fields = [f for f in rfg('fields',()) if f.get('selected',0)]
        if fields:
            f = fields[0]
            self.portal_type = f.portal_type
            self.typename = f.type
            self.fieldname = f.name
            self.fieldlabel = f.label
        else:
            self.portal_type = rfg('portal_type', None)
            self.fieldname = None
            self.fieldlabel = None
            self.typename = None

        self.position = 0
        self.action = rfg('button', None)
        self.commit_changes = rfg('commit', False)
        self.batch_size = 10
        if self.commit_changes:
            self.uids = rfg('uids', [])

        pathuids = rfg('folderpaths', [])
        self.paths = self.tool.convertUidsToPaths(pathuids)
        self.pathuids = pathuids

    def initCommit(self):
        """Reset counters for a commit pass"""
        self.restoreState()
        request = self.tool.REQUEST
        rfg = request.form.get
        self.commit_changes = True
        self._firstoutput = True
        self.found = 0
        self.position = 0
        self.batch_size = 1
        self.uids = rfg('uids')

    def saveState(self):
        SESSION = self.tool.REQUEST.SESSION
        SESSION['kupu_migrator'] = dict([(f, getattr(self, f, None)) for f in self.FIELDS])

    def restoreState(self):
        SESSION = self.tool.REQUEST.SESSION
        state = SESSION['kupu_migrator']
        for f in self.FIELDS:
            setattr(self, f, state[f])

#     def clearState(self):
#         return
#         SESSION = self.tool.REQUEST.SESSION
#         if SESSION.has_key('kupu_migrator'):
#             del SESSION['kupu_migrator']

    def status(self):
        s = [ '%s=%s' % (f,getattr(self, f, 'unset')) for f in
            self.FIELDS ]
        return '\n'.join(s)

    def mkQuery(self):
        query = {}
        if self.portal_type:
            query['portal_type'] = sanitize_portal_type(self.portal_type)
        if self.paths:
            query['path'] = self.paths
        query['Language'] = 'all'
        return query

    def getInfo(self, saveState=True):
        info = {}
        if self._continue:
            info['nexturi'] = self.tool.absolute_url_path()+'/kupu_migration.xml?button=continue'
        else:
            info['nexturi'] = None

        info['firstoutput'] = self._firstoutput

        if hasattr(self, '_total'):
            info['total'] = self._total
            info['position'] = self.position
            if self._total==0:
                info['percent'] = '100%'
            else:
                info['percent'] = '%d%%' % ((100.*self.position)/self._total)

        info['objects'] = self._objects
        info['action'] = action = self.action
        info['action_check'] = action=='check'
        info['action_touid'] = action=='touid'
        info['action_topath'] = action=='topath'
        info['typename'] = self.typename
        info['fieldlabel'] = self.fieldlabel
        info['checkboxes'] = action != 'check' and not self.commit_changes
        info['commit_changes'] = self.commit_changes
        info['dryrun'] = not (self.action == 'check' or self.commit_changes)
        info['found'] = self.found

        if saveState:
            self.saveState()
        return info

    def docontinue(self):
        """Scan selected documents looking for convertible links"""
        uids = self.uids
        if uids is None:
            self.uids = uids = []
            brains = self.portal_catalog.searchResults(self.mkQuery())
            for b in brains:
                uid = self.UIDfromBrain(b)
                if uid:
                    uids.append(uid)
            self._firstoutput = True
            self._continue = True
            return True

        pos = self.position
        self._total = total = len(uids)

        uids = uids[pos:pos+self.batch_size]
        self.position = pos + len(uids)
        if not uids:
            self._continue = False
            return False # Done
            
        self._objects = res = []
        for uid in uids:
            obj = self.reference_tool.lookupObject(uid)
            if self.portal_type==FRAGMENT_TYPE:
                try:
                    fldr = obj.cp_container.titles
                except:
                    continue
                else:
                    for o in fldr.objectValues([FRAGMENT_TYPE]):
                        objinfo = self.object_check(o)
                        if objinfo:
                            res.append(objinfo)
            else:
                objinfo = self.object_check(obj)
                if objinfo:
                    res.append(objinfo)

        self._continue = True
        return True

    def brain_check(self, brain):
        object = brain.getObject()
        return self.object_check(object)

    def link_summary(self, data, start, link):
        """Summary information for a link"""
        m = SUMMARY_PATTERN.match(data, start)
        if m:
            text = m.group(0)
        else:
            text = data[start:start+200]
        bits = text.split(link, 1)
        if len(bits)==1:
            bits.append('')
        return bits

    def object_check(self, object):
        """Check the relative links within this object."""
        def checklink(match):
            matched = match.group(0)
            newlink = link = decodeEntities(match.group('href'))
            classification, uid, relpath, tail = self.classifyLink(link, base)

            if self.action=='check':
                if classification=='bad':
                    abslink = urljoin(base, link)
                    before, after = self.link_summary(data, match.start(), link)
                    summary = {'text':link, 'url':abslink,
                        'before': before,
                        'after': after, }
                    info.append(summary)
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
                return prefix + html_quote(newlink)
            return matched

        info = []
        changes = []
        try:
            objuid = aq_base(object).UID
        except:
            return None  # only archetypes objects

        baseobj = object
        if object.portal_type==FRAGMENT_TYPE:
            baseobj = object.aq_parent.aq_parent.aq_parent
        base = baseobj.absolute_url()
        if getattr(baseobj.aq_explicit, 'isPrincipiaFolderish', 0):
            base += '/'

        field = object.getField(self.fieldname)
        if field is None:
            return None

        content_type = field.getContentType(object)
        if content_type != 'text/html':
            # Don't attempt to modify non-html
            return None
            
        data = field.getEditAccessor(object)()
        __traceback_info__ = (object, data)
        newdata = LINK_PATTERN.sub(checklink, data)
        if data != newdata and self.commit_changes:
            mutator = field.getMutator(object)
            if mutator:
                mutator(newdata, mimetype='text/html')

        if info or changes:
            self.found += 1
            title = object.Title()
            if not title:
                title = object.getId()
            if not title:
                title = '<object>'
            if object.portal_type == FRAGMENT_TYPE:
                title = "%s (%s)" % (baseobj.title_or_id(), title)
            if data != newdata:
                diffs = htmlchanges(data, changes)
            else:
                diffs = None
            return dict(title=title, uid = objuid, info=info, url=baseobj.absolute_url_path(),
                diffs=diffs)
        return None

    def UIDfromBrain(self, brain):
        """Convert a brain to a UID without hitting the object"""
        path = brain.getPath()
        if not path.startswith(self.portal_base):
            return None
        try:
            metadata = self.uid_catalog.getMetadataForUID(path[self.prefix_length:])
        except KeyError:
            return None
        return metadata.get('UID', None)

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
        url = unquote_plus(url)
        url = self.portal_base + url[len(self.portal_base_url):]
        if isinstance(url, unicode):
            url = url.encode('utf8') # ExtendedPathIndex can't cope with unicode paths
        brains = self.portal_catalog.searchResults(path=url, Language='all')
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

        scheme, netloc, path, query, fragment = urlsplit(absurl)
        path = path.strip('/')
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

def sanitize_portal_type(pt):
    """Performs portal type mapping prior to database query.
    Needed for CompositePack pages"""
    if pt==FRAGMENT_TYPE:
        return NAVIGATION_PAGE
    return pt

EntityPattern = re.compile('&(?:#(\d+)|([a-zA-Z]+));')
def decodeEntities(s, encoding='utf-8'):
    def unescape(match):
	code = match.group(1)
        if code:
            return unichr(int(code, 10))
        else:
            code = match.group(2)
            return unichr(name2codepoint[code])

    return EntityPattern.sub(unescape, s)
