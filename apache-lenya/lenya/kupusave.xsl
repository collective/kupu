<?xml version="1.0" encoding="UTF-8" ?>

<!--
  Merges lenya:meta into xhtml send by kupu for save.
  We also remove some <link>s here i.e. for css and rel.
-->

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:lenya="http://apache.org/cocoon/lenya/page-envelope/1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
 >

<xsl:template match="edit-envelope">
  <!-- 
       FIXME: The _keepmes_ are needed for our incredible from(s) editor :) 
       I hope we can remove this someday. 
  -->
  <html dc:dummy="FIXME:keepNamespace" dcterms:dummy="FIXME:keepNamespace" lenya:dummy="FIXME:keepNamespace" xhtml:dummy="FIXME:keepNamespace">
    <xsl:copy-of select="original/xhtml:html/lenya:meta"/>
    <head>
      <xsl:apply-templates select="edited/xhtml:html/xhtml:head/xhtml:title"/>
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>    
    </head>
    <xsl:copy-of select="edited/xhtml:html/xhtml:body"/>
  </html>
</xsl:template>

<xsl:template match="xhtml:link"/>

<xsl:template match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()"/>
  </xsl:copy>
</xsl:template> 

</xsl:stylesheet>
