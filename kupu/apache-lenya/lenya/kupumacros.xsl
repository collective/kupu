<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:xhtml="http://www.w3.org/1999/xhtml" 
  xmlns:i18n="http://apache.org/cocoon/i18n/2.1" 
  exclude-result-prefixes="xhtml i18n" >
  
  <xsl:param name="document-path"/>
  <xsl:param name="contentfile"/>
  <xsl:param name="save-destination"/>
  <xsl:param name="reload-after-save" select="'1'"/>
  <xsl:param name="use-css" select="'1'"/>
  <xsl:param name="context-prefix" select="/"/>
  <xsl:param name="kupu-common-dir" 
    select="concat($context-prefix,'/kupu/common/')"/>
  <xsl:param name="lenya-kupu-style" 
    select="concat($context-prefix,'/kupu/apache-lenya/kupu/kupustyles.css')"/>
  <xsl:param name="kupu-logo" 
    select="concat($kupu-common-dir, 'kupuimages/kupu_icon.gif')"/>
  <xsl:param name="lenya-logo" 
    select="concat($context-prefix, '/lenya/images/project-logo-small.png')"/>
    
  <!--
    Kupu head (i.e. CSS overriden by Lenya)
  -->
  <xsl:template match="xhtml:head">
    <head>
      <xsl:apply-templates/>
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$lenya-kupu-style"/>
        </xsl:attribute>
      </link>
    </head>
  </xsl:template>
  
  <!--
    Kupu config
  -->
  <xsl:template match="xhtml:kupuconfig/xhtml:dst">
    <dst>
      <xsl:value-of select="$save-destination"/>
    </dst>
  </xsl:template>
  
  <xsl:template match="xhtml:kupuconfig/xhtml:reload_after_save">
    <reload_after_save>
      <xsl:value-of select="$reload-after-save"/>
    </reload_after_save>
  </xsl:template>
  
  <xsl:template match="xhtml:kupuconfig/xhtml:use_css">
    <use_css>
      <xsl:value-of select="$use-css"/>
    </use_css>
  </xsl:template>
  
  <!-- 
    Use default tables classes from xmlconfig.kupu.
    Override if appropriate.
  -->
  <xsl:template match="xhtml:kupuconfig/xhtml:table_classes">
    <xsl:copy-of select="."/>
  </xsl:template>
  
    <xsl:template match="//xhtml:*[@id='kupu-editor']/@src">
    <xsl:attribute name="src">
      <xsl:value-of select="$contentfile"/>
    </xsl:attribute>
  </xsl:template>
  
  <!--
    Link rewriting.
    TODO: Take care of Lenya's link rewriting machanism.
  -->
  <xsl:template match="xhtml:link/@href">
    <xsl:attribute name="href">
      <xsl:value-of select="concat($kupu-common-dir, .)"/>
    </xsl:attribute>
  </xsl:template>
  
  <xsl:template match="xhtml:script/@src">
    <xsl:attribute name="src">
      <xsl:value-of select="concat($kupu-common-dir, .)"/>
    </xsl:attribute>
  </xsl:template>
  
  <!--
    Content stuff.
  -->
  <xsl:template match="xhtml:title">
    <title>Edit <xsl:value-of select="$document-path"/> - Apache Lenya</title>
  </xsl:template>
  <xsl:template match="xhtml:h1[1]">
    <h1 style="float:left; width: 200px;">lenya.kupu.edit.title</h1>
    <div style="display: inline; float: right;">
      <a href="http://cocoon.apache.org/lenya/" target="_blank">
        <img src="{$lenya-logo}" 
          alt="Lenya project logo" style="border: 0;"/>
      </a>
      <a href="http://kupu.oscom.org/" target="_blank">
        <img src="{$kupu-logo}" style="vertical-align: top; border: 0;" 
          alt="Kupu logo"/>
      </a>
    </div>
    <br clear="all"/>    
  </xsl:template>
  
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>
