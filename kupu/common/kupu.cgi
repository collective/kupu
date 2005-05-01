#!/usr/bin/python2.3

import os, sys
os.chdir(os.path.abspath(os.path.dirname(__file__)))
sys.path.append(os.path.abspath('../python'))

from nationalizer import Nationalizer

if __name__ == '__main__':
    print 'Content-Type: text/html'
    print
    i = Nationalizer('kupu.html', 'nl')
    print i.translate().encode('UTF-8')
