@echo off
if cmdextversion 2 goto :cmdok
echo Sorry, this batch file requires a more recent version of Windows.
goto :eof

:cmdok
setlocal
setlocal enabledelayedexpansion

call :searchpath xsltproc.exe
if errorlevel 1 goto :eof
set XSLTPROC=%RES%

set NOOP=
if /I "%1" EQU "/n" set NOOP=1 && shift /1
if /I "%1" EQU "-n" set NOOP=1 && shift /1
if DEFINED NOOP (
  SET X=echo+
  SET REDIR=^^^>
) ELSE (
  SET X=
  SET REDIR=^>
)

set XSL_DEBUG=--param debug true^(^)
set XSLTPROC_PARAMS=--nonet --novalid --xinclude
set XSL_FILE=make.xsl

set TARGET_OK=
set TARGETS=
for /F "delims=:_ tokens=1,2" %%L in (%~sf0) DO (
    if "%%L" EQU "target" (
        set TARGETS=!TARGETS! %%M
        if /I "%%M" EQU "%1" set TARGET_OK=yes
    )
)
if "%TARGET_OK%"=="" goto :usage
goto :target_%1
:usage
echo Usage: make [-n] target
echo where target is one of %TARGETS%
goto :eof

:target_kupu.html
    %X%%XSLTPROC% %XSLTPROC_PARAMS% %XSL_FILE% dist.kupu %REDIR%common\kupu.html
    goto :eof

:target_kupuform.html:
    %X%%XSLTPROC% %XSLTPROC_PARAMS% %XSL_FILE% dist-form.kupu %REDIR%common\kupuform.html
    goto :eof

:target_zope2macros
    %X%%XSLTPROC% %XSLTPROC_PARAMS% %XSL_FILE% dist-zope2.kupu %REDIR%common\kupumacros.html
    goto :eof

:target_plonemacros
    %X%%XSLTPROC% %XSLTPROC_PARAMS% %XSL_FILE% dist-plone.kupu %REDIR%plone\kupu_plone_layer\wysiwyg_support.html
    goto :eof

:target_silvamacros
    %X%%XSLTPROC% %XSLTPROC_PARAMS% %XSL_FILE% dist-silva.kupu %REDIR%silva\kupumacros.html
    goto :eof

:target_
:target_all
    call :target_kupu.html
    call :target_kupuform.html
    call :target_zope2macros
    call :target_plonemacros
    call :target_silvamacros
    goto :eof

:target_debug
    %X%%XSLTPROC% %XSL_DEBUG% %XSLTPROC_PARAMS% %XSL_FILE% dist.kupu %REDIR%common\kupu.html
    goto :eof

:target_clean
    SET FILES=common\kupumacros.html common\kupu.html common\kupuform.html
    SET FILES=%FILES% plone\kupu_plone_layer\wysiwyg_support.html silva\kupumacros.html
    for %%F in (%FILES%) DO (
        IF EXIST %%F ( %X%echo del %%F && %X%del %%F )
    )
    goto :eof

:searchpath
    REM Search the path for the specified file. Also, for added
    REM friendliness, we extend the path with a few other 'potential'
    REM directories.
    SET PATHX=%PATH%;C:\libxslt;c:\Program Files\libxml\util
    set RES=%~s$PATHX:1
    if not errorlevel 1 goto :eof
    echo File %1 was not found in the PATH environment
    goto :eof
