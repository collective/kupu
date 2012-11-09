##############################################################################
#
# Copyright (c) 2003-2005 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################
"""Kupu Plone interfaces
"""
from zope.interface import Interface


class ILibraryManager(Interface):
    """Provide an interface for managing and retrieving libraries for
    the Kupu editor.
    """

    def getLibraries(context):
        """Return an ordered sequence of libraries.

        Since libraries might be defined placefully, we look them up
        using a context. The return value is provided as a sequence of
        dictionaries with the following keys:

          id    - the computed id
          title - the computed title of the library
          uri   - the computed URI of the library
          src   - the computed source URI
          icon  - the computed icon URI
        """

    def addLibrary(id, title, uri, src, icon):
        """Add a library.
        """

    def deleteLibraries(indices):
        """Delete libraries
        """

    def updateLibraries(libraries):
        """Update libraries.

        Update libraries using the sequence of mapping objects
        provided in the 'libraries' parameter. Each mapping object
        needs to provide an 'index' key to indicate which library it
        is updating.
        """

    def moveUp(indices):
        """Reorder libraries by moving specified libraries up.
        """

    def moveDown(indices):
        """Reorder libraries by moving specified libraries down.
        """

class IResourceTypeMapper(Interface):
    """Map portal types to resource types"""

    def getPortalTypesForResourceType(resource_type):
        """Return a sequence of portal types for a specific resource type.

        Raises KeyError if resource_type is not found.
        """

    def queryPortalTypesForResourceType(resource_type, default=None):
        """Return a sequence of portal types for a specific resource type.

        Returns 'default' if resource_type is not found.
        """

    def addResourceType(resource_type, portal_types, mode='whitelist'):
        """Add a resource type pointing to a sequence of portal_types."""

    def updateResourceTypes(type_mapping):
        """Update resource types using the type mapping passed as argument."""

    def deleteResourceTypes(resource_types):
        """Delete the type mapping for the specififed resource types

        Raises KeyError if one of the resource_types is not found.
        """


class IKupuLibraryTool(ILibraryManager, IResourceTypeMapper):
    """Interface for the Kupu library tool"""


class IPloneKupuLibraryTool(Interface):

    def getLinkbyuid():
        """Returns 'is linking by UID enabled'?"""

    def getRefBrowser():
        """Returns True if kupu_references is in all skin layers"""

    def getCaptioning():
        """Returns True if captioning is enabled"""

    def getTableClassnames():
        """Return a list of classnames supported in tables"""

    def getParagraphStyles():
        """Return a list of classnames supported by paragraphs"""

    def getStyleList(field=None):
        """Return the styles for a field."""

    def filterToolbar(context, field=None):
        """Return a filter helper for toolbar elements.
        Attributes on the helper class are True if an element is enabled."""

    def getHtmlExclusions():
        """Returns the list of html exclusions"""

    def getStyleWhitelist():
        """Returns the style whitelist"""

    def getClassBlacklist():
        """Returns the class blacklist"""

    def getDefaultResource():
        """Returns the name of the default resource type (e.g. linkable)"""

    def installBeforeUnload():
        """Should kupu load its own unload handler? Default: False"""

    def getFiltersourceedit(self):
        """Should kupu clean up html in source editor? Default: True"""

    def isKupuEnabled(useragent='', allowAnonymous=False, REQUEST=None, context=None, fieldName=None):
        """Is kupu enabled for this combination of client browser, permissions, and field."""

    def getWysiwygmacros():
        """Find the appropriate template to use for the kupu widget"""

    def forcekupu_url(self, fieldName):
        """Generate the url used to force or suppress kupu"""

    def query_string(self, replace={}, original=None):
        """ Updates 'original' dictionary by the values in the 'replace'
            dictionary and returns the result as url quoted query string.

            The 'original' dictionary defaults to 'REQUEST.form' if no
            parameter is passed to it. Keys in the 'replace' dictionary
            with a value of 'None' (or _.None in DTML) will be deleted
            from 'original' dictionary before being quoted.

            The original 'REQUEST.form' will remain unchanged.
        """

    def url_plus_query(url, query=None):
        """Adds query segment to an existing URL.
        Existing query parameters are may be overridden by query,
        otherwise they are preserved.
        """

    def kupuUrl(url, query=None):
        """Generate a url which includes resource_type and instance"""
        
    def getCookedLibraries(context):
        """Return a list of libraries with our own parameters included"""

    def getPreviewForType(portal_type):
        """Get the preview url for a specific type"""

    def getNormalViewForType(portal_type):
        """Get the normal view url for a specific type"""

    def getScaleFieldForType(portal_type):
        """Get the name of the field containing a scalable image"""

    def getClassesForType(portal_type):
        """Get a sequence of classes that may be applied"""

    def getMediaForType(portal_type):
        """Gets the media type image/flash"""

    def configure_kupu(
        linkbyuid, table_classnames, html_exclusions, style_whitelist, class_blacklist,
        installBeforeUnload=None, parastyles=None, refbrowser=None,
        captioning=None,
        filterSourceEdit=None,
        REQUEST=None):
        """Modify kupu's configuration settings"""
