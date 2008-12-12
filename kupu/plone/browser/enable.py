from AccessControl import getSecurityManager

from Products.CMFCore.utils import getToolByName
from Products.Five import BrowserView


def anonymous():
    user = getSecurityManager().getUser()
    if user is None or user.getUserName() == 'Anonymous User':
        return True
    return False


def numerics(s):
    '''Convert a string into a tuple of all digit sequences
    '''
    seq = ['']
    for c in s:
        if c.isdigit():
            seq[-1] = seq[-1] + c
        elif seq[-1]:
            seq.append('')
    return tuple([ int(val) for val in seq if val])


class KupuEnabled(BrowserView):

    def enabled(self):
        context = self.context

        # First check whether the user actually wants kupu
        pm = getToolByName(self, 'portal_membership')
        if anonymous():
            return False
        else:
            pm = getToolByName(context, 'portal_membership')
            user = pm.getAuthenticatedMember()
            editor = user.getProperty('wysiwyg_editor')
            if editor and editor.lower() != 'kupu':
                return False

        # Then check whether their browser supports it.
        useragent = self.request['HTTP_USER_AGENT']

        if 'BEOS' in useragent:
            return False

        def getver(s):
            """Extract a version number given the string which precedes it"""
            pos = useragent.find(s)
            if pos >= 0:
                tail = useragent[pos+len(s):].strip()
                verno = numerics(tail.split(' ')[0])
                return verno
            return None

        v = getver('Opera/')
        if not v:
            v = getver('Opera ')
        if v:
            return v >= (9,0)

        mozillaver = getver('Mozilla/')
        if mozillaver > (5,0):
            return True
        elif mozillaver == (5,0):
            verno = getver(' rv:')
            if verno:
                return verno >= (1,3,1)
            verno = getver(' AppleWebKit/')
            if verno:
                return verno >= (525,1)
                verno = getver(' Safari/')
                if verno:
                    return verno >= (522,12)

        verno = getver('MSIE')
        if verno:
            return verno >= (5,5)
        return False
