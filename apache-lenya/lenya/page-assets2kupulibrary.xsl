<?xml version="1.0" encoding="UTF-8" ?>

<!--
  Transform lenya info assets about a pages resources
  to Kupu's library format.
  
  @version $Id$
-->

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:li="http://apache.org/cocoon/lenya/info/1.0"
 >

<xsl:template match="/">
  <collection>
    <uri>FIXME URI</uri>
    <icon></icon>
    <title>Page Library</title>
    <description>FIXME Description</description>
    <items>
      <xsl:apply-templates select="//li:asset"/>
    </items>
  </collection>
</xsl:template>

<xsl:template match="li:asset">
  <resource id="pageres">
    <title>Exit</title>
    <uri>/kupu/apache-lenya/kupu/images/exit.gif</uri>
    <icon>/kupu/apache-lenya/kupu/images/right_arrow.png</icon>
    <description>page Demo Resource two</description>
    <preview>/kupu/apache-lenya/kupu/images/exit.gif</preview>
    <size><xsl:value-of select="dc:extent"/>&#160;kb</size>
  </resource>
</xsl:template>

<xsl:template match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()"/>
  </xsl:copy>
</xsl:template> 

</xsl:stylesheet>
