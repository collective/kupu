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

XSL transformation from Kupu Library XML to HTML for the library
drawer.

$Id$
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:variable name="titlelength" select="20"/>
    <xsl:template match="/">
        <html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>Imagedrawer</title>
                <link type="text/css" rel="stylesheet" href="../kupudrawerstyles.css"/>
            </head>
            <body>
                <div style="width: 500px; border: solid black 1px">
                    <div id="kupu-librarydrawer">
                        <div id="kupu-drawerheader">
                            <form onsubmit="return false;">
                                <input id="kupu-searchbox" name="searchbox" value="search"
                                    style="font-style: italic"
                                    onclick="if (this.value == 'search') this.value = ''; this.style.fontStyle='normal';" onkeyup="if (event.keyCode == 13 ) drawertool.current_drawer.search();"/>
                            </form>
                        </div>
                        <div id="kupu-panels">
                            <table width="95%">
                                <tr class="kupu-panelsrow">
                                    <td id="kupu-librariespanel" width="30%">
                                        <div id="kupu-librariesitems" class="overflow">
                                            <xsl:apply-templates select="/libraries/library"/>
                                        </div>
                                    </td>
                                    <td id="kupu-resourcespanel" width="30%">
                                        <div id="kupu-resourceitems" class="overflow">
                                            <xsl:apply-templates select="/libraries/*[@selected]" mode="currentpanel"/>
                                        </div>
                                    </td>
                                    <td id="kupu-propertiespanel">
                                        <div id="kupu-properties" class="overflow">
                                            <xsl:apply-templates select="//resource[@selected]" mode="properties"/>
                                        </div>
                                    </td>
                                </tr>
</table>

                        </div>
                        <div id="kupu-dialogbuttons">
                            <!--
                            <button type="button"
                                onclick="drawertool.current_drawer.reloadCurrent();">Reload current</button>
-->
                            <button type="button" onclick="drawertool.closeDrawer();">Cancel</button>
                            <button type="button" onclick="drawertool.current_drawer.save();">Ok</button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="library">
        <div onclick="drawertool.current_drawer.selectLibrary('{@id}');" xxxalign="center"
            class="kupu-libsource" title="{title}" 
            style="text-align: center; padding-top: 0.2em; padding-bottom: 0.6em">
            <xsl:attribute name="id">
                <xsl:value-of select="@id"/>
            </xsl:attribute>
            <xsl:if test="icon">
                <img src="{icon}" title="{title}" alt="{title}"/>
            </xsl:if>
            <br/>
            <xsl:apply-templates select="title"/>
        </div>
    </xsl:template>
    <xsl:template match="library|collection" mode="currentpanel">
        <xsl:apply-templates select="items/collection|items/resource"/>
    </xsl:template>
    <xsl:template match="resource|collection">
        <div id="{@id}" class="kupu-libsource" title="{title}">
            <xsl:attribute name="onclick">
                <xsl:choose>
                    <xsl:when test="local-name()='collection'">drawer
                            tool.current_drawer.selectCollection('<xsl:value-of select="@id"/>');</xsl:when>
                    <xsl:otherwise>drawertool.current_drawer.selectItem('<xsl:value-of select="@id"/>')</xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:if test="icon">
                <img src="{icon}" alt="{title}" height="16" width="16"/>
            </xsl:if>
            <xsl:apply-templates select="title"/>
        </div>
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
    <xsl:template match="resource|collection" mode="properties">
        <!-- Override this template for your custom library drawer -->
    </xsl:template>
</xsl:stylesheet>
