/* BeforeUnload form processing */
if (!window.beforeunload) {
    var BeforeUnloadHandler = function() {
        var self = this;

        this.message = "Your form has not been saved. All changes you have made will be lost";
        this.forms = [];
        this.chkId = [];
        this.chkType = new this.CheckType();
        this.handlers = [this.isAnyFormChanged];
        this.submitting = false;

        this.execute = function(event) {
            if (self.submitting) return;
            if (!event) event = window.event;

            for (var i = 0; i < self.handlers.length; i++) {
                var fn = self.handlers[i];
                var message = message || fn.apply(self);
            }
            if (message===true) message = self.message;
            if (message===false) message = undefined;
            if (event) event.returnValue = message;
            return message;
        }
        this.execute.tool = this;
    }
    var Class = BeforeUnloadHandler.prototype;

    // form checking code
    Class.isAnyFormChanged = function() {
        for (var i=0; i < this.forms.length; i++) {
            var form = this.forms[i];
            if (this.isElementChanged(form)) {
                return true;
            }
        }
        return false;
    }
    Class.addHandler = function(fn) {
        this.handlers.push(fn);
    }
    Class.onsubmit = function() {
        var tool = window.onbeforeunload && window.onbeforeunload.tool;
        tool.submitting = true;
    }
    Class.addForm = function(form) {
        for (var i = 0; i < this.forms.length; i++) {
            if (this.forms[i]==form) return;
        }
        this.forms.push(form);
        form.onsubmit = this.onsubmit;
    }
    Class.addForms = function() {
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (!element) continue;
            if (element.tagName=='FORM') {
                this.addForm(element);
            }
            else {
                var forms = element.getElementsByTagName('form');
                for (var j = 0; j < forms.length; j++) {
                    this.addForm(forms[j]);
                }
            }
        }
    }
    Class.removeForms = function() {
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (!element) continue;
            if (element.tagName=='FORM') {
                for (var j = 0; j < arguments.length; j++) {
                    if (this.forms[j] == element) {
                        this.forms.splice(j--, 1);
                        delete element.onsubmit;
                    }
                }
            } else {
                var forms = element.getElementsByTagName('form');
                for (var j = 0; j < forms.length; j++) {
                    this.removeForms(forms[j]);
                }
            }
        }
    }

    Class.CheckType = function() {};
    var c = Class.CheckType.prototype;
    c.checkbox = c.radio = function(ele) {
        return ele.checked != ele.defaultChecked;
    }
    c.password = c.textarea = c.text = function(ele) {
        return ele.value != ele.defaultValue;
    }
    // hidden: cannot tell on Mozilla

    c['select-one'] = function(ele) {
        for (var i=0 ; i < ele.length; i++) {
            var opt = ele.options[i];
            if ( opt.selected != opt.defaultSelected) {
                if (i===0 && opt.selected) continue; /* maybe no default */
                return true;
            }
        }
        return false;
    }

    c['select-multiple'] = function(ele) {
        for (var i=0 ; i < ele.length; i++) {
            var opt = ele.options[i];
            if ( opt.selected != opt.defaultSelected) {
                return true;
            }
        }
        return false;
    }

    Class.chk_form = function(form) {
        var elements = form.elements;
        for (var i=0; i < elements.length; i++ ) {
            var element = elements[i];
            if (this.isElementChanged(element)) {
                return true;
            }
        }
        return false;
    }

    Class.isElementChanged = function(ele) {
        var method = ele.id && this.chkId[ele.id];
        if (!method && ele.type)
            method = this.chkType[ele.type];
        if (!method && ele.tagName)
            method = this['chk_'+ele.tagName.toLowerCase()];

        return method? method.apply(this, [ele]) : false;
    }

    window.onbeforeunload = new BeforeUnloadHandler().execute;
}
