# $Id: Makefile 224545 2010-10-05 12:52:15Z mihxil $


KUPU_HOME=..
XSLTPROC = /usr/bin/env xsltproc

XSL_DEBUG = --param debug true\(\)
XSLTPROC_PARAMS = --nonet --novalid --xinclude
XSL_FILE=$(KUPU_HOME)/make.xsl
XSLJSPX_FILE=$(KUPU_HOME)/make-jspx.xsl
I18N=$(KUPU_HOME)/kupu-i18n.jar

LANGS=nl de fr it eo

VERSIONEXTRA=$(shell U=`svn info | grep URL | grep trunk`; if [ "$${U:0:3}" == "URL" ] ; then echo -SNAPSHOT ; fi )
VERSION=`cat ../version.txt | awk '{print $$2}'`$(VERSIONEXTRA)
REPO=$(shell if [ "$(VERSIONEXTRA)" == "-SNAPSHOT" ] ; then echo snapshots ; else echo maven2 ; fi)
REPOID=$(shell if [ "$(VERSIONEXTRA)" == "-SNAPSHOT" ] ; then echo mmbase-snapshots ; else echo mmbase ; fi)

DEPLOY=scp://mmbase.org/home/tomcat/downloads/

#type in i18n: msginit -l <locale> -i messages.po


.PHONY: messages deploy.jars deploy test

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


test:
	@echo $(VERSION)
	@echo $(REPO)
	@echo $(REPOID)

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

webapp: all deploy.jars
	mkdir -p build/mmbase/kupu/mmbase
	cp -pr *.jspx *.js *.css *.png build/mmbase/kupu/mmbase
	cp -rpf tools build/mmbase/kupu/mmbase
	cp -rpf drawers build/mmbase/kupu/mmbase
	cp -rpf icons build/mmbase/kupu/mmbase
	cp -rpf ../common build/mmbase/kupu
	mkdir -p build/WEB-INF/lib
	cp $(HOME)/.m2/repository/org/oscom/kupu-i18n/$(VERSION)/kupu-i18n-$(VERSION).jar build/WEB-INF/lib
	cp $(HOME)/.m2/repository/org/oscom/mmbase-kupu-i18n/$(VERSION)/mmbase-kupu-i18n-$(VERSION).jar build/WEB-INF/lib


mmbase-kupu.war: webapp
	( cd build ; find . -regex '.*/\.svn.*' -o -type f -print | xargs jar cf ../mmbase-kupu.war  )



deploy.jars: $(I18N) mmbase-kupu-i18n.jar
	mvn install:install-file -DgeneratePom.description='Resource bundle with translations of kupu-generic texts' -DgroupId=org.oscom -DartifactId=kupu-i18n       -Dversion=$(VERSION) -Dpackaging=jar -Dfile=$(I18N)
	mvn install:install-file -DgeneratePom.description='Resource bundle with translations specific to kupu/mmbase' -DgroupId=org.oscom -DartifactId=mmbase-kupu-i18n -Dversion=$(VERSION) -Dpackaging=jar -Dfile=mmbase-kupu-i18n.jar
	mvn deploy:deploy-file -DgeneratePom.description='Resource bundle with translations of kupu-generic texts' -DgroupId=org.oscom -DartifactId=kupu-i18n      -Dversion=$(VERSION) -Dpackaging=jar -Dfile=$(I18N) -Durl=$(DEPLOY)$(REPO) -DrepositoryId=$(REPOID) -DuniqueVersion=false
	mvn deploy:deploy-file -DgeneratePom.description='Resource bundle with translations specific to kupu/mmbase' -DgroupId=org.oscom -DartifactId=mmbase-kupu-i18n -Dversion=$(VERSION) -Dpackaging=jar -Dfile=mmbase-kupu-i18n.jar -Durl=$(DEPLOY)$(REPO) -DrepositoryId=$(REPOID) -DuniqueVersion=false


deploy: mmbase-kupu.war
	mvn deploy:deploy-file -DgeneratePom.description='WAR-overlay containing all necessary files to use kupu with MMBase. The mmbase-richtext component depends on this.' -DgroupId=org.oscom -DartifactId=mmbase-kupu      -Dversion=$(VERSION) -Dpackaging=war -Dfile=mmbase-kupu.war -Durl=$(DEPLOY)$(REPO) -DrepositoryId=$(REPOID) -DuniqueVersion=false


clean:
	rm -f index.jspx
	rm -f body.jspx	head.jspx
	rm -f mmbase-kupu-i18n.jar
	rm -f mmbase-kupu.war
	rm -rf resourcebundle
	rm -rf build
	@$(MAKE) -C $(KUPU_HOME) clean
