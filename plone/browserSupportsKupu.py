## Script (Python) "browserSupportsKupu"
##title=Allow graceful degradation is browser isn't supported
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=id=''

useragent = context.REQUEST['HTTP_USER_AGENT']

if 'Opera' in useragent:
    return False

if not useragent.startswith('Mozilla/'):
    return False

try:
    mozillaver = float(useragent[len('Mozilla/'):].split(' ')[0])
    if mozillaver >= 5.0:
        rv = useragent.find(' rv:')
        if rv >= 0:
            verno = float(useragent[rv+4:].split(')')[0])
            return verno >= 1.5

    MSIE = useragent.find('MSIE')
    if MSIE >= 0:
        verno = float(useragent[MSIE+4:].split(';')[0])
        return verno >= 5.5
except:
    # In case some weird browser makes the test code blow up.
    pass
return False

