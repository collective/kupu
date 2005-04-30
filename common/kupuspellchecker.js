function KupuSpellChecker(buttonid, scripturl, spanstyle, 
                            winwidth, winheight, skip_tags) {
    this.button = document.getElementById(buttonid);
    this.scripturl = scripturl;
    this.spanstyle = spanstyle || 'color: red; text-decoration: underline;';
    this.winwidth = winwidth || '600';
    this.winheight = winheight || '400';
    this.skip_tags = skip_tags || ['head', 'script'];
};

KupuSpellChecker.prototype = new KupuTool;

KupuSpellChecker.prototype.initialize = function(editor) {
    this.editor = editor;
    addEventHandler(this.button, 'click', this.check, this);
};

KupuSpellChecker.prototype.check = function() {
    var request = Sarissa.getXmlHttpRequest();
    request.open('POST', this.scripturl, true);
    request.setRequestHeader('Content-Type', 
                                'application/x-www-form-urlencoded');
    request.onreadystatechange = new ContextFixer(
                                    this.stateChangeHandler,
                                    this,
                                    request).execute;
    var result = this.getCurrentContents();
    result = escape(result.strip().replace('\n', ' ').reduceWhitespace());
    request.send('text=' + result);
};

KupuSpellChecker.prototype.stateChangeHandler = function(request) {
    if (request.readyState == 4) {
        var result = request.responseText;
        if (!result) {
            alert('There were no errors.');
        } else {
            this.displayUnrecognized(result);
        };
    };
};

KupuSpellChecker.prototype.getCurrentContents = function() {
    var doc = this.editor.getInnerDocument().documentElement;
    var iterator = new NodeIterator(doc);
    var bits = [];
    while (true) {
        var node = iterator.next();
        if (!node) {
            break;
        };
        while (this.skip_tags.contains(node.nodeName.toLowerCase())) {
            node = node.nextSibling;
            iterator.setCurrent(node);
        };
        if (node.nodeType == 3) {
            bits.push(node.nodeValue);
        };
    };
    return bits.join(' ');
};

KupuSpellChecker.prototype.displayUnrecognized = function(words) {
    // copy the current editable document into a new window
    var doc = this.editor.getInnerDocument().documentElement;
    var win = window.open('kupublank.html', 'spellchecker', 
                            'width=' + this.winwidth + ',' +
                            'height=' + this.winheight + ',toolbar=no,' +
                            'menubar=no,scrollbars=yes');
    var html = doc.innerHTML;
    win.document.write('<html>' + doc.innerHTML + '</html>');
    win.document.close();
    addEventHandler(win, 'load', this.continueDisplay, this, win, words);
};

KupuSpellChecker.prototype.continueDisplay = function(win, words) {
    words = words.split(' ').removeDoubles();

    // walk through all elements of the body, colouring the text nodes
    var body = win.document.getElementsByTagName('body')[0];
    var iterator = new NodeIterator(body);
    var node = iterator.next();
    while (true) {
        if (!node) {
            break;
        };
        var next = iterator.next();
        if (node.nodeType == 3) {
            var span = win.document.createElement('span');
            var before = node.nodeValue;
            var after = this.colourText(before, words);
            if (before != after) {
                span.innerHTML = after;
                var last = span.lastChild;
                var parent = node.parentNode;
                parent.replaceChild(last, node);
                while (span.hasChildNodes()) {
                    parent.insertBefore(span.firstChild, last);
                };
            };
            node = span;
        };
        node = next;
    };
};

KupuSpellChecker.prototype.colourText = function(text, words) {
    var currtext = text;
    var newtext = '';
    for (var i=0; i < words.length; i++) {
        var reg = new RegExp('([^\w])(' + words[i] + ')([^\w])');
        while (true) {
            var match = reg.exec(currtext);
            if (!match) {
                newtext += currtext;
                currtext = newtext;
                newtext = '';
                break;
            };
            var m = match[0];
            newtext += currtext.substr(0, currtext.indexOf(m));
            newtext += match[1] +
                        '<span style="' + this.spanstyle + '">' +
                        match[2] +
                        '</span>' +
                        match[3];
            currtext = currtext.substr(currtext.indexOf(m) + m.length);
        };
    };
    return currtext;
};
