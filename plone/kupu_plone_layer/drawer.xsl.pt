<?xml version="1.0" encoding="UTF-8" ?>
<!--
##############################################################################
#
# Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
#
# This software is distributed under the terms of the Kupu
# License. See LICENSE.txt for license text. For a list of Kupu
# Contributors see CREDITS.txt.
#
##############################################################################

XSL transformation from Kupu Library XML to HTML for the image library
drawer.

$Id: imagedrawer.xsl 4105 2004-04-21 23:56:13Z guido $
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns="http://www.w3.org/1999/xhtml">
    <xsl:param name="drawertype">image</xsl:param>
    <xsl:param name="drawertitle">Image Drawer</xsl:param>
    <xsl:variable name="titlelength" select="20"/>
    <xsl:template match="/">
        <html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>
                    <xsl:value-of select="$drawertitle"/>
                </title>
                <link type="text/css" rel="stylesheet">
                    <xsl:attribute name="href">kupudrawerstyles.css </xsl:attribute>
                </link>
            </head>
            <body>
                <div style="width: 500px; border: solid black 1px; width: 100px">
                    <div id="kupu-librarydrawer">
                        <!--                    
<style>

img {
    vertical-align: middle;
    border: none;
}

label {
    display: block;
    font-weight: bold;
    margin-top: 0.2em;
}

.kupudrawer {
    background-color: #eeeeee;
    padding: 0.5em;
    width: 43em;
}

.kupudrawer-search {
    float: right;
    margin: 1em;
}


/* Favorites section */
.kupudrawer-favorites {
    padding: 0.5em;
    background-color: white;
    height: 15em;
    width: 6em;
    margin: 0.2em;
    float: left;
    text-align: center;
    border: 1px solid Black;
}

.kupudrawer-favorites a {
    text-decoration: none;
    display: block;
    color: Black;
    overflow: auto;
}

.kupudrawer-favorites a:hover {
    background-color: #cccccc;
}


.kupudrawer-favorites img {
    display:block;
    margin: auto;
}

/* The listing */
.kupudrawer-listing {
    padding: 0.5em;
    background-color: white;
    height: 15em;
    width: 12em;
    margin: 0.2em;
    float: left;
    overflow: auto;
    border: 1px solid Black;
}

.kupudrawer-listing a {
    display: block;
    text-decoration: none;
    color: Black;
}

.kupudrawer-listing a.selected {
    background-color: #cccccc;
}

.kupudrawer-listing a:hover {
    background-color: #cccccc;
}

/* The detail view */
.kupudrawer-details {
    padding: 0.5em;
    height: 15.7em;
    width: 18em;
    margin: 0.2em;
    margin-top: -0.5em;
    float: left;
    overflow: auto;
    border: 1px solid Black;
}

.kupudrawer-controls {
    float: right;
    margin-right: 1em;
}

.visualClear {
    clear: both;
}


</style>
                        <div class="kupudrawer">
                            <input type="text" class="kupudrawer-search" value="search"/>
                            <h1>
                                <xsl:value-of select="/libraries/title"/>
                            </h1>
                            <div class="kupudrawer-favorites">
                                <a href="#">
                                    <img src="folder.gif"/> Favorite 1 </a>
                                <a href="#">
                                    <img src="folder.gif"/> Favorite 2 </a>
                            </div>
                            <div class="kupudrawer-listing">
                                <a href="#">
                                    <img src="document_icon.gif"/> Document 1 </a>
                                <a href="#">
                                    <img src="image_icon.gif"/> Image 1 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Newsletter 1 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Report 1 </a>
                                <a href="#">
                                    <img src="document_icon.gif"/> Document 2 </a>
                                <a href="#">
                                    <img src="image_icon.gif"/> Image 2 </a>
                                <a href="#" class="selected">
                                    <img src="newsitem_icon.gif"/> Newsletter 2 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Report 2 </a>
                                <a href="#">
                                    <img src="document_icon.gif"/> Document 3 </a>
                                <a href="#">
                                    <img src="image_icon.gif"/> Image 3 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Newsletter 3 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Report 3 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Newsletter 4 </a>
                                <a href="#">
                                    <img src="newsitem_icon.gif"/> Report 4 </a>
                            </div>
                            <fieldset class="kupudrawer-details">
                                <legend>Details</legend>
                                <img src="newsletter.png"/> Newsletter 2 <label>Title</label>
                                <input type="Text" size="30" value="That was the year that was" title="You can change the title of the tooltip for the link here. Default is the item's title."/>
                                <label>Description</label> This is a short summary of what happened
                                in the past year. </fieldset>
                            <div class="visualClear"/>
                            <div class="kupudrawer-controls">
                                <input type="submit" value="Cancel"/>
                                <input type="submit" value="OK"/>
                            </div>
                            <div class="visualClear"/>
                        </div>
                        -->
                        
                        
                        
                        
                        <h1 style="padding: 0;float: left;">
                            <xsl:value-of select="$drawertitle"/>
                        </h1>
                        <div id="kupu-searchbox" style="text-align: right">
                            <form onsubmit="return false;">
                                <input id="kupu-searchbox-input" name="searchbox" value="search"
                                    style="font-style: italic"
                                    onclick="if (this.value == 'search') this.value = ''; this.style.fontStyle='normal';" onkeyup="if (event.keyCode == 13 ) drawertool.current_drawer.search();"/>
                            </form>
                        </div>
                        <div class="kupu-panels">
                            <table>
                                <tr class="kupu-panelsrow">
                                    <td id="kupu-librariespanel" class="panel">
                                        <div id="kupu-librariesitems" class="overflow">
                                            <xsl:apply-templates select="/libraries/library"/>
                                        </div>
                                    </td>
                                    <td id="kupu-resourcespanel" class="panel">
                                        <div id="kupu-resourceitems" class="overflow">
                                            <xsl:apply-templates select="/libraries/*[@selected]/items"/>
                                        </div>
                                    </td>
                                    <td id="kupu-propertiespanel" class="panel">
                                        <div id="kupu-properties" class="overflow">
                                            <xsl:choose>
                                                <xsl:when test="$drawertype='image'">
                                                  <xsl:apply-templates
                                                  select="/libraries/*[@selected]//resource[@selected]" mode="image-properties"/>
                                                </xsl:when>
                                                <xsl:when test="$drawertype='link'">
                                                  <xsl:apply-templates
                                                  select="/libraries/*[@selected]//resource[@selected]" mode="link-properties"/>
                                                </xsl:when>
                                            </xsl:choose>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class="kupu-dialogbuttons">
                            <!--
                            <button type="button"
                                onclick="drawertool.current_drawer.reloadCurrent();">Reload current</button>
-->
                            <button type="button" onclick="drawertool.current_drawer.save();">Ok</button>
                            <button type="button" onclick="drawertool.closeDrawer();">Cancel</button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="library">
        <div onclick="drawertool.current_drawer.selectLibrary('{@id}');" class="kupu-libsource"
            title="{title}" style="">
            <xsl:attribute name="id">
                <xsl:value-of select="@id"/>
            </xsl:attribute>
            <div>
                <xsl:apply-templates select="icon"/>
            </div>
            <span class="drawer-item-title">
                <xsl:value-of select="title"/>
            </span>
        </div>
    </xsl:template>
    <xsl:template match="items">
        <xsl:apply-templates select="collection|resource" mode="currentpanel"/>
    </xsl:template>
    <xsl:template match="resource|collection" mode="currentpanel">
        <div id="{@id}" class="kupu-{local-name()}" title="{description}">
            <xsl:attribute name="onclick">
                <xsl:choose>
                    <xsl:when
                            test="local-name()='collection'">drawertool.current_drawer.selectCollection('<xsl:value-of select="@id"/>');</xsl:when>
                    <xsl:otherwise>drawertool.current_drawer.selectItem('<xsl:value-of select="@id"/>')</xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:apply-templates select="icon"/>
            <xsl:apply-templates select="title"/>
        </div>
    </xsl:template>
    <xsl:template match="icon">
        <img src="{.}" alt="{../title}">
            <xsl:attribute name="class">library-icon-<xsl:value-of select="local-name(..)"/>
            </xsl:attribute>
        </img>
    </xsl:template>
    <xsl:template match="title">
        <span class="drawer-item-title">
            <xsl:if test="../@selected">
                <xsl:attribute name="style">background-color: #C0C0C0</xsl:attribute>
            </xsl:if>
            <xsl:choose>
                <xsl:when test="string-length() &gt; $titlelength">
                    <xsl:value-of select="substring(., 0, $titlelength)"/>... </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="."/>
                </xsl:otherwise>
            </xsl:choose>
        </span>
    </xsl:template>
    <xsl:template match="resource|collection" mode="image-properties">
        <xsl:if test="preview">
            <div>
                <strong>Preview</strong>
            </div>
            <div id="epd-imgpreview">
                <img src="{preview}" title="{title}" alt="{title}"/>
            </div>
        </xsl:if>
        <table>
            <tr>
                <td>
                    <strong>Title</strong>
                    <br/>
                    <xsl:value-of select="title"/>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Size</strong>
                    <br/>
                    <xsl:value-of select="size"/>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Description</strong>
                    <br/>
                    <xsl:value-of select="description"/>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>ALT-text</strong>
                    <br/>
                    <form onsubmit="return false;">
                        <input type="text" id="image_alt" size="10"/>
                    </form>
                </td>
            </tr>
        </table>
    </xsl:template>
    <xsl:template match="resource|collection" mode="link-properties">
        <form onsubmit="return false;">
            <table>
                <tr class="kupu-linkdrawer-title-row">
                    <td>
                        <strong>Title</strong>
                        <br/>
                        <xsl:value-of select="title"/>
                    </td>
                </tr>
                <tr class="kupu-linkdrawer-description-row">
                    <td>
                        <strong>Description</strong>
                        <br/>
                        <xsl:value-of select="description"/>
                    </td>
                </tr>
                <tr class="kupu-linkdrawer-name-row">
                    <td>
                        <strong>Name</strong>
                        <br/>
                        <input type="text" id="link_name" size="10"/>
                    </td>
                </tr>
                <tr class="kupu-linkdrawer-target-row">
                    <td>
                        <strong>Target</strong>
                        <br/>
                        <input type="text" id="link_target" value="_self" size="10"/>
                    </td>
                </tr>
            </table>
        </form>
    </xsl:template>
</xsl:stylesheet>
