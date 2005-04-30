#!/usr/bin/python

"""SpellChecker for Kupu"""

COMMAND = 'aspell -l'

import popen2, re

class SpellChecker:
    """Simple spell checker, uses ispell (or aspell) with pipes"""

    reg_split = re.compile("[^\w']+", re.UNICODE)

    def __init__(self, text):
        self.chout, self.chin = popen2.popen2(COMMAND)
        self.text = text
        self.result = None

    def check(self):
        """checks a line of text
        
            returns None if spelling was okay, and an HTML string with words 
            that weren't recognized marked (with a span class="wrong_spelling")
        """
        if self.result is None:
            # send it to the child app
            self.chin.write(self.text)
            self.chin.flush()
            # close in (this makes the app spew out the result)
            self.chin.close()
            
            # read the result
            result = self.chout.read()
            result = ' '.join(result.split())
            if not result:
                result = None

            # close out
            self.chout.close()
            
            self.result = result
        return self.result

def is_cgi():
    import os
    if os.environ.has_key('GATEWAY_INTERFACE'):
        return True
    return False

if is_cgi():
    import cgi, cgitb
    #cgitb.enable()
    #result = repr(sys.stdin.read())
    data = cgi.FieldStorage()
    data = data['text'].value
    c = SpellChecker(data)
    result = c.check()
    if result == None:
        result = ''
    print 'Content-Type: text/plain'
    print 'Content-Length: %s' % len(result)
    print
    print result
elif __name__ == '__main__':
    while 1:
        line = raw_input('Enter text to check: ')
        if line == 'q':
            break
        c = SpellChecker(line)
        ret = c.check()
        if ret is None:
            print 'okay'
        else:
            print ret
