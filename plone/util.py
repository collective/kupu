# Utility functions used by Kupu tool
import os
from App.Common import package_home
from Products.CMFCore.utils import getToolByName, minimalpath
from Products.CMFCore.DirectoryView import createDirectoryView
from Products.kupu import kupu_globals

kupu_package_dir = package_home(kupu_globals)

def register_layer(self, relpath, name, out):
    """Register a file system directory as skin layer
    """
    print >>out, "register skin layers"
    skinstool = getToolByName(self, 'portal_skins')
    if name not in skinstool.objectIds():
        kupu_plone_skin_dir = minimalpath(os.path.join(kupu_package_dir, relpath))
        createDirectoryView(skinstool, kupu_plone_skin_dir, name)
        print >>out, "The layer '%s' was added to the skins tool" % name

    # put this layer into all known skins
    for skinName in skinstool.getSkinSelections():
        path = skinstool.getSkinPath(skinName) 
        path = [i.strip() for i in path.split(',')]
        try:
            if name not in path:
                path.insert(path.index('custom')+1, name)
        except ValueError:
            if name not in path:
                path.append(name)

        path = ','.join(path)
        skinstool.addSkinSelection(skinName, path)

def unregister_layers(self, names, out):
    """Remove a directory from the skins"""
    skinstool = getToolByName(self, 'portal_skins')

    # remove this layer from all known skins
    for skinName in skinstool.getSkinSelections():
        path = skinstool.getSkinPath(skinName) 
        path = [i.strip() for i in path.split(',')]

        opath = list(path)
        for name in names:
            if name in path:
                path.remove(name)

        if opath != path:
            path = ','.join(path)
            skinstool.addSkinSelection(skinName, path)

            print >>out, "removed layers '%s' from '%s'" % (', '.join(names), skinName)
    self.changeSkin(None)


def layer_installed(self, name):
    skinstool = getToolByName(self, 'portal_skins')

    # remove this layer from all known skins
    for skinName in skinstool.getSkinSelections():
        path = skinstool.getSkinPath(skinName) 
        path = [i.strip() for i in path.split(',')]

        if name not in path:
            return False
    return True