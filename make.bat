@echo off
REM There is a number of things that you would probably need to adjust:
REM - the path to xsltproc (here C:\libxslt)
REM - the distribution file to be used (here dist.kupu)
REM - the output file (here default/kupu.html)
C:\libxslt\xsltproc.exe --nonet --novalid --xinclude make.xsl dist.kupu > default/kupu.html
