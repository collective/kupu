# $Id: Makefile,v 1.8 2005/09/08 08:30:31 michiel Exp $


KUPU_HOME=..
XSLTPROC = /usr/bin/env xsltproc

XSL_DEBUG = --param debug true\(\)
XSLTPROC_PARAMS = --nonet --novalid --xinclude
XSL_FILE=$(KUPU_HOME)/make.xsl
XSLJSPX_FILE=$(KUPU_HOME)/make-jspx.xsl
I18N=$(KUPU_HOME)/kupu-i18n.jar

LANGS=nl de fr it eo

VERSION=`cat ../version.txt | awk '{print $$2}'`
#type in i18n: msginit -l <locale> -i messages.po


all: index.jspx body.jspx head.jspx mmbase-kupu-i18n.jar i18n.js/i18n.js


index.jspx: *.kupu  Makefile $(XSLJSPX_FILE)
	$(XSLTPROC) $(XSLTPROC_PARAMS) -o $@  $(XSLJSPX_FILE) dist-mmbase.kupu

body.jspx: *.kupu  Makefile $(XSLJSPX_FILE)
	$(XSLTPROC) $(XSLTPROC_PARAMS) -o $@  $(XSLJSPX_FILE) body-mmbase.kupu

head.jspx: *.kupu  Makefile $(XSLJSPX_FILE)
	$(XSLTPROC) $(XSLTPROC_PARAMS) -o $@  $(XSLJSPX_FILE) head-mmbase.kupu

$(I18N):
	@$(MAKE) -C $(KUPU_HOME) kupu-i18n.jar

i18n.js/i18n.js:
	wget http://johnnydebris.net/javascript/.files/i18n.js-0.1.tar.gz
	tar zxf i18n.js-0.1.tar.gz

.PHONY:
messages: *.js clean
	rm -f phony.js
	grep -r "fmt:message" *.jspx *.kupu | sed 's/.*key="\(.*\)".*/_("\1");/g' | uniq > phony.js
	mkdir -p i18n
	xgettext --from-code=UTF-8 -L java -k_ -p i18n -j *.js -o en.po
	for LOCALE in $(LANGS) ; do \
	   msgmerge --update --backup=off i18n/$${LOCALE}.po i18n/en.po; \
	done

mmbase-kupu-i18n.jar: i18n/*.po
	mkdir -p resourcebundle
	for LOCALE in $(LANGS) en ; do \
	    msgfmt --java2  -D . -d resourcebundle -r org.mmbase.kupu.Messages -l $${LOCALE} i18n/$${LOCALE}.po; \
	done
	jar cf $@ -C resourcebundle org

webapp: all $(I18N) mmbase-kupu-i18n.jar
	mkdir -p build/mmbase/kupu/mmbase
	cp -pr *.jspx *.js *.css build/mmbase/kupu/mmbase
	cp -rpf tools build/mmbase/kupu/mmbase
	cp -rpf drawers build/mmbase/kupu/mmbase
	cp -rpf icons build/mmbase/kupu/mmbase
	cp -rpf ../common build/mmbase/kupu
	mkdir -p build/WEB-INF/lib
	cp $(I18N) build/WEB-INF/lib
	cp mmbase-kupu-i18n.jar build/WEB-INF/lib


mmbase-kupu.war: webapp
	jar cf mmbase-kupu.war -C build .
	cp mmbase-kupu.war mmbase-kupu-$(VERSION).war

.PHONY:
deploy.jars: $(I18N) mmbase-kupu-i18n.jar
	mvn deploy:deploy-file -DgroupId=org.oscom -DartifactId=kupu-i18n        -Dversion=$(VERSION) -Dpackaging=jar -Dfile=$(I18N) -Durl=scp://mmbase.org/home/mmweb/web/maven2 -DrepositoryId=mmbase
	mvn deploy:deploy-file -DgroupId=org.oscom -DartifactId=mmbase-kupu-i18n -Dversion=$(VERSION) -Dpackaging=jar -Dfile=mmbase-kupu-i18n.jar -Durl=scp://mmbase.org/home/mmweb/web/maven2 -DrepositoryId=mmbase

.PHONY:
deploy: mmbase-kupu.war
	mvn deploy:deploy-file -DgroupId=org.oscom -DartifactId=mmbase-kupu      -Dversion=$(VERSION) -Dpackaging=war -Dfile=mmbase-kupu-$(VERSION).war -Durl=scp://mmbase.org/home/mmweb/web/maven2 -DrepositoryId=mmbase


clean:
	rm -f index.jspx
	rm -f body.jspx	head.jspx
	rm -f mmbase-kupu-i18n.jar
	rm -rf resourcebundle
	rm -rf build
	@$(MAKE) -C $(KUPU_HOME) clean
