<?xml version="1.0" encoding="utf-8"?>
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

Generate an HTML template from Kupu distribution files

This XSLT is fed a Kupu distribution file (generally dist.kupu) which
contains:

  a) slot definitions,

  b) feature and part definitions,

  c) wiring that matches parts to slots,

  d) an order in which implementations are to be cascaded.

If the XSLT processor supports XInclude, the above stated items may of
course be located in different files and included later.

$Id$
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:kupu="http://kupu.oscom.org/namespaces/dist"
    version="1.0"
    >

  <xsl:output
    method="xml"
    indent="yes"
    omit-xml-declaration="yes"
    />


  <!-- ### Global parameters ### -->

  <!-- debug :: enables some debugging messages; by default false -->
  <xsl:param
    name="debug"
    select="false()"
    />

  <xsl:variable
    name="implementation_order"
    select="//kupu:implementationOrder/*/@name"
    />


  <!-- ### Templates ### -->

  <!-- document element -->
  <xsl:template match="/kupu:dist">
    <xsl:apply-templates />
  </xsl:template>

  <!-- Ignore kupu stuff outside expand -->
  <xsl:template match="//kupu:*" />


  <!-- ## Expand mode templates ## -->

  <!-- Anything in kupu:expand runs in expand mode. This is where the
       whole things starts. -->
  <xsl:template match="//kupu:expand">
    <xsl:apply-templates mode="expand" />
  </xsl:template>

  <xsl:template match="//kupu:define-slot" mode="expand">
    <xsl:variable
      name="slot"
      select="@name"
      />

    <!-- Debug -->
    <xsl:if test="$debug">
      <xsl:comment>
        Slot named '<xsl:value-of select="$slot" />' defined.
      </xsl:comment>
    </xsl:if>

    <!-- We'll try to find wirings that tell us what should go into
         our slot -->
    <xsl:for-each
      select="//kupu:wire[@append-slot=$slot]"
      >

      <xsl:variable
        name="feature"
        select="@feature"
        />

      <xsl:variable
        name="part"
        select="@part"
        />

      <!-- Debug -->
      <xsl:if test="$debug">
        <xsl:comment>
          Feature '<xsl:value-of select="$feature" />',
          part '<xsl:value-of select="$part" />'
          wants append to slot '<xsl:value-of select="$slot" />'.
        </xsl:comment>
      </xsl:if>

      <!-- test if the feature specified by the wiring is disabled; if
           so, don't continue -->
      <xsl:if
        test="not(//kupu:disableFeature[@name=$feature])"
        >
        <!-- look for the part in implementation order and insert it -->
        <xsl:call-template name="insert-part">
          <xsl:with-param name="feature" select="$feature" />
          <xsl:with-param name="part" select="$part" />
        </xsl:call-template>
      </xsl:if>

    </xsl:for-each>

  </xsl:template>


  <!-- This template recursively looks for feature/part
       implementations and inserts the first it finds -->
  <xsl:template name="insert-part">
    <xsl:param name="implno" select="1" />
    <xsl:param name="feature" />
    <xsl:param name="part" />

    <!-- The caller can provide us with a specific implementation
         name; if not provided, fall back to the implementation given
         in 'implno'. -->
    <xsl:param name="implementation" />

    <xsl:variable name="impl">
      <xsl:choose>
        <xsl:when test="$implementation">
          <xsl:value-of select="$implementation" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of
            select="//kupu:implementationOrder/kupu:implementation[$implno]/@name"
            />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable
      name="partnode"
      select="//kupu:feature[@name=$feature and @implementation=$impl]/kupu:part[@name=$part]"
      />

    <xsl:choose>
      <!-- if we've found a valid implementation, go for it -->
      <xsl:when test="$partnode">
        <!-- Debug -->
        <xsl:if test="$debug">
          <xsl:comment>
            Found feature '<xsl:value-of select="$feature" />',
            part '<xsl:value-of select="$part" />' at implementation no.
            <xsl:value-of select="$implno" />, '<xsl:value-of select="$impl" />'.
          </xsl:comment>
        </xsl:if>
        <xsl:apply-templates select="$partnode" mode="expand" />
      </xsl:when>
      <xsl:otherwise>
        <!-- Cascade onto the next implementation under two circumstances:
             a) A specific implementation wasn't request: not(@implementation)
             b) We're already in the last implementation -->
        <xsl:choose>          
        <xsl:when test="not($implementation) and $implno &lt;= count(//kupu:implementationOrder/kupu:implementation)">
         <xsl:call-template name="insert-part">
            <xsl:with-param name="implno" select="$implno+1" />
            <xsl:with-param name="feature" select="$feature" />
            <xsl:with-param name="part" select="$part" />
          </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
          <xsl:comment>
            Cannot find feature '<xsl:value-of select="$feature" />',
            part '<xsl:value-of select="$part" />'.
          </xsl:comment>
        </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Make sure that we stay in expand mdoe once we are in it -->
  <xsl:template match="//kupu:*" mode="expand">
    <xsl:apply-templates mode="expand"/>
  </xsl:template>

  <!-- Display other tags (XHTML) verbatim in expand mode -->
  <xsl:template match="*" mode="expand">
    <xsl:copy>
      <xsl:copy-of select="@*" />
      <xsl:apply-templates mode="expand" />
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>
