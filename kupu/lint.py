##############################################################################
#
# Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
# Run jslint over modified javascript files
import os, sys, glob, time
import cPickle

COMPILE_COMMAND = "java org.mozilla.javascript.tools.shell.Main %(lint)s %(file)s"

def lint(name):
    cmd = COMPILE_COMMAND % dict(lint=LINT, file=name)
    ret = os.system(cmd)
    if ret != 0:
        sys.exit(ret)

def scriptrelative(relative):
    """Find absolute path of file relative to this script"""
    base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, relative)

LINT = scriptrelative('jslint.js')
STATUSFILE = scriptrelative('lint.record')

def filelist(*patterns):
    for p in patterns:
        names = glob.glob(scriptrelative(p))
        for n in names:
            yield os.path.normpath(n)

def newfiles(status, *patterns):
    for n in filelist(*patterns):
        mtime = os.stat(n).st_mtime
        if n in status and status[n] == mtime:
            continue
        status[n] = mtime
        yield n

def basetime(marker):
    try:
        mtime = os.stat(marker).st_mtime
    except (IOError, WindowsError):
        mtime = 0.0
    return mtime

def loadstatus(name):
    try:
        f = open(name, 'rb')
    except (IOError, WindowsError):
        return {}
    data = cPickle.load(f)
    f.close()
    return data

def savestatus(name, status):
    f = open(name, 'wb')
    cPickle.dump(status, f)
    f.close()

if __name__=='__main__':
    status = loadstatus(STATUSFILE)
    for n in newfiles(status, 'common/*.js', 'plone/kupu_plone_layer/*.js'):
        lint(n)
        savestatus(STATUSFILE, status)
