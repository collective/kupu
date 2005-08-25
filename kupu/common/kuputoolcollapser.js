// turn this into a nice module-like namespace to avoid messing up the global
// (window) namespace
this.kuputoolcollapser = new function() {
    var ToolCollapser = function(toolboxesparentid) {
        this.parent = document.getElementById(toolboxesparentid);
    };

    // make the collapser available in the namespace
    this.Collapser = ToolCollapser;

    ToolCollapser.prototype.initialize = function() {
        for (var i=0; i < this.parent.childNodes.length; i++) {
            var child = this.parent.childNodes[i];
            if (child.className == 'kupu-toolbox') {
                var heading = child.getElementsByTagName('h1')[0];
                if (!heading) {
                    throw('heading not found by collapser for toolbox ' +
                            child.id);
                };
                // find the toolbox's body
                var body = null;
                var currchild = heading.nextSibling;
                while (currchild.nodeType != 1) {
                    currchild = currchild.nextSibling;
                    if (!currchild) {
                        throw('body not found by collapser for toolbox ' +
                                child.id);
                    };
                };
                body = currchild;
                // now set a handler that makes the body display and hide
                // on click, and register it to the heading
                // WAAAAAHHHH!!! since there's some weird shit happening when
                // I just use closures to refer to the body (somehow only the
                // *last* value body is set to in this loop is used?!?) I
                // used a reference to the body as 'this' in the handler
                var handler = function(heading) {
                    if (this.style.display == 'none') {
                        // assume we have a block-level element here...
                        this.style.display = 'block';
                        heading.className = 'kupu-toolbox-heading-opened';
                    } else {
                        this.style.display = 'none';
                        heading.className = 'kupu-toolbox-heading-closed';
                    };
                };
                var wrap_openhandler = function(body, heading) {
                    return function() {
                        body.style.display = 'block';
                        heading.className = 'kupu-toolbox-heading-closed';
                    };
                };
                addEventHandler(heading, 'click', handler, body, heading);
                body.style.display = 'none';
                // add a reference to the openhandler on the toolbox div
                // so any toolbox code can use that to open the toolbox if
                // it so desires
                child.open_handler = wrap_openhandler(body, heading);
            };
        };
    };
}();
