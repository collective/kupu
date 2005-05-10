#!/usr/bin/python

"""SpellChecker for Kupu, CGI wrapper"""

import os, sys
os.chdir(os.path.abspath(os.path.dirname(__file__)))
sys.path.append(os.path.abspath('../python'))

from spellcheck import SpellChecker

def format_result(result):
    """convert the result dict to XML"""
    buf = ['<?xml version="1.0" encoding="UTF-8" ?>\n<spellcheck_result>']
    for key, value in result.items():
        buf.append('<incorrect><word>')
        buf.append(key)
        buf.append('</word><replacements>')
        buf.append(' '.join(value))
        buf.append('</replacements></incorrect>')
    buf.append('</spellcheck_result>')
    return ''.join(buf)

if __name__ == '__main__':
    import cgi, cgitb
    #cgitb.enable()
    #result = repr(sys.stdin.read())
    data = cgi.FieldStorage()
    data = data['text'].value
    c = SpellChecker()
    result = c.check(data)
    if result == None:
        result = ''
    else:
        result = format_result(result)
    print 'Content-Type: text/xml,charset=UTF-8'
    print 'Content-Length: %s' % len(result)
    print
    print result
