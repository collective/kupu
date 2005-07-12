@echo off
setlocal
set PLONEHOME=%1
set PLONEHOME=%PLONEHOME:"=%
if "%PLONEHOME%"=="" set PLONEHOME=c:\Plone20
set PYTHONPATH=%PLONEHOME%\Zope\lib\python
set PRODUCTS_PATH=%PLONEHOME%\Zope\lib\python\Products;%PLONEHOME%\Data\Products;%~D0%~P0..\..\..
set INSTANCE_HOME=%PLONEHOME%\Data
set SOFTWARE_HOME=%PLONEHOME%\Zope\lib\python
"%PLONEHOME%\Python\python.exe" %~D0%~P0test_browserSupportsKupu.py
"%PLONEHOME%\Python\python.exe" %~D0%~P0test_librarymanager.py
rem "%PLONEHOME%\Python\python.exe" %~D0%~P0test_resourcetypemapper.py
rem "%PLONEHOME%\Python\python.exe" %~D0%~P0runalltests.py
endlocal
