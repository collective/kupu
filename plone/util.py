# Utility functions used by Kupu tool
import os
from App.Common import package_home
from Products.CMFCore.utils import minimalpath
from Products.CMFCore.DirectoryView import createDirectoryView
from Products.MimetypesRegistry import MimeTypeItem
from Products.kupu import kupu_globals

from AccessControl import ModuleSecurityInfo
security = ModuleSecurityInfo('Products.kupu.plone.util')

kupu_package_dir = package_home(kupu_globals)

# trying to get rid of some deprecation warnings in a
# backwards compatible way
try:
    from zope.component import getUtility
    from zope.component.interfaces import ComponentLookupError
    HAVE_GET_UTILITY = True
except ImportError:
    HAVE_GET_UTILITY = False
from Products.CMFCore.utils import getToolByName as gtbn

if HAVE_GET_UTILITY:
    INTERFACEMAP = {
        'portal_catalog': ('Products.CMFCore.interfaces', 'ICatalogTool'),
        'portal_memberdata': ('Products.CMFCore.interfaces', 'IMemberDataTool'),
        'portal_membership': ('Products.CMFCore.interfaces', 'IMembershipTool'),
        'portal_types': ('Products.CMFCore.interfaces', 'ITypesTool'),
        'portal_url': ('Products.CMFCore.interfaces', 'IURLTool'),
        'portal_workflow': ('Products.CMFCore.interfaces', 'IWorkflowTool'),
        'plone_utils': ('Products.CMFPlone.interfaces', 'IPloneTool'),
        'portal_interface': ('Products.CMFPlone.interfaces', 'IInterfaceTool'),
        'portal_skins': ('Products.CMFPlone.interfaces', 'ISkinsContainer'),
        'content_type_registry': ('Products.CMFPlone.interfaces', 'IContentTypeRegistry'),
        'portal_quickinstaller': ('Products.CMFQuickInstallerTool.interfaces', 'IQuickInstallerTool'),
        'archetype_tool': ('Products.Archetypes.interfaces', 'IArchetypeTool'),
        'reference_catalog': ('Products.Archetypes.interfaces', 'IReferenceCatalog'),
        'uid_catalog': ('Products.Archetypes.interfaces', 'IUIDCatalog'),
        'mimetypes_registry': ('Products.MimetypesRegistry.interfaces', 'IMimetypesRegistryTool'),
        'portal_transforms': ('Products.PortalTransforms.interfaces', 'IPortalTransformsTool'),
        'kupu_library_tool': ('Products.kupu.plone.z3interfaces', 'IPloneKupuLibraryTool'),
        }
    iname_mapping = {}
    for id, (module, interface) in INTERFACEMAP.iteritems():
        mod = __import__(module, globals(), locals(), [interface])
        if hasattr(mod, interface):
            iname_mapping[id] = getattr(mod, interface)
    print iname_mapping

security.declarePublic('getToolByName')
def getToolByName(context, tool_name, default=None):
    if HAVE_GET_UTILITY:
        interface = iname_mapping.get(tool_name, None)
        if interface is not None:
            try:
                return getUtility(interface)
            except ComponentLookupError:
                # Behave in backward compatible way
                # fall through to old implementation
                pass
    return gtbn(context, tool_name, default)

def register_layer(self, relpath, name, out, add=True):
    """Register a file system directory as skin layer
    """
    print >>out, "register skin layers"
    skinstool = getToolByName(self, 'portal_skins')
    if name not in skinstool.objectIds():
        kupu_plone_skin_dir = minimalpath(os.path.join(kupu_package_dir, relpath))
        createDirectoryView(skinstool, kupu_plone_skin_dir, name)
        print >>out, "The layer '%s' was added to the skins tool" % name

    if not add:
        return

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

UID_TRANSFORM = 'html-to-captioned'
INVERSE_TRANSFORM = 'captioned-to-html'
MT_SAFE = 'text/x-html-safe'
MT_CAPTIONED = 'text/x-html-captioned'

def install_transform(self):
    """Install the uid transform and set up the policy chain to include it when going from html to safe html"""
    mimetypes_tool = getToolByName(self, 'mimetypes_registry')
    if not mimetypes_tool.lookup(MT_CAPTIONED):
        newtype = MimeTypeItem.MimeTypeItem('HTML with captioned images',
            (MT_CAPTIONED,), ('html-captioned',), 0)
        mimetypes_tool.register(newtype)

    transform_tool = getToolByName(self, 'portal_transforms')
    if not hasattr(transform_tool, UID_TRANSFORM):
        transform_tool.manage_addTransform(UID_TRANSFORM, 'Products.kupu.plone.html2captioned')

    if not hasattr(transform_tool, INVERSE_TRANSFORM):
        transform_tool.manage_addTransform(INVERSE_TRANSFORM, 'Products.PortalTransforms.transforms.identity')
    
    inverse = transform_tool[INVERSE_TRANSFORM]
    if inverse.get_parameter_value('inputs') != [MT_CAPTIONED] or inverse.get_parameter_value('output') != 'text/html':
        inverse.set_parameters(inputs=[MT_CAPTIONED], output='text/html')

    # Set policy
    policies = [ (mimetype, required) for (mimetype, required) in transform_tool.listPolicies()
         if mimetype==MT_SAFE ]
    required = [UID_TRANSFORM]
    if policies:
        if not UID_TRANSFORM in required:
            required.append(UID_TRANSFORM)

        transform_tool.manage_delPolicies([MT_SAFE])
    transform_tool.manage_addPolicy(MT_SAFE, required)

def remove_transform(self):
    """Disable the UID transform: remove the policy but leave everything else intact."""
    transform_tool = getToolByName(self, 'portal_transforms', None)
    if transform_tool is None:
        return
    policies = [ (mimetype, required) for (mimetype, required) in transform_tool.listPolicies() if mimetype==MT_SAFE ]
    if not policies:
        return
    required = list(policies[0][1])
    if UID_TRANSFORM in required:
        required.remove(UID_TRANSFORM)
        transform_tool.manage_delPolicies([MT_SAFE])
        if required:
            transform_tool.manage_addPolicy(MT_SAFE, required)
