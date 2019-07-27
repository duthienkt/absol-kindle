/********************************************************/


(function() {
    'use strict';
    var ObjectProto = Object.prototype,
        defineGetter = ObjectProto.__defineGetter__,
        defineSetter = ObjectProto.__defineSetter__,
        lookupGetter = ObjectProto.__lookupGetter__,
        lookupSetter = ObjectProto.__lookupSetter__,
        hasOwnProp = ObjectProto.hasOwnProperty;

    if (defineGetter && defineSetter && lookupGetter && lookupSetter) {
        var originObjetDefineProperty = Object.defineProperty;

        Object.defineProperty = function(obj, prop, descriptor) {
            if (typeof obj.nodeType === "number" && typeof obj.nodeName === "string") {
                if (arguments.length < 3) { // all arguments required
                    throw new TypeError("Arguments not optional");
                }

                prop += ""; // convert prop to string

                if (hasOwnProp.call(descriptor, "value")) {
                    if (!lookupGetter.call(obj, prop) && !lookupSetter.call(obj, prop)) {
                        // data property defined and no pre-existing accessors
                        obj[prop] = descriptor.value;
                    }

                    if ((hasOwnProp.call(descriptor, "get") ||
                            hasOwnProp.call(descriptor, "set"))) {
                        // descriptor has a value prop but accessor already exists
                        throw new TypeError("Cannot specify an accessor and a value");
                    }
                }

                // can't switch off these features in ECMAScript 3
                // so throw a TypeError if any are false
                // if (!(descriptor.writable && descriptor.enumerable &&
                //         descriptor.configurable)) {
                //     throw new TypeError(
                //         "This implementation of Object.defineProperty does not support" +
                //         " false for configurable, enumerable, or writable."
                //     );
                // }

                if (descriptor.get) {
                    defineGetter.call(obj, prop, descriptor.get);
                }
                if (descriptor.set) {
                    defineSetter.call(obj, prop, descriptor.set);
                }

                return obj;
            }
            else {
                return originObjetDefineProperty.call(this, obj, prop, descriptor);
            }
        };

        var originObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        Object.getOwnPropertyDescriptor = function(obj, prop) {
            if (typeof obj.nodeType === "number" && typeof obj.nodeName === "string") {
                if (arguments.length < 2) { // all arguments required
                    throw new TypeError("Arguments not optional.");
                }

                prop += ""; // convert prop to string

                var descriptor = {
                        configurable: true,
                        enumerable: true,
                        writable: true
                    },
                    getter = lookupGetter.call(obj, prop),
                    setter = lookupSetter.call(obj, prop);

                if (!hasOwnProp.call(obj, prop)) {
                    // property doesn't exist or is inherited
                    return descriptor;
                }
                if (!getter && !setter) { // not an accessor so return prop
                    descriptor.value = obj[prop];
                    return descriptor;
                }

                // there is an accessor, remove descriptor.writable;
                // populate descriptor.get and descriptor.set (IE's behavior)
                delete descriptor.writable;
                descriptor.get = descriptor.set = undefined;

                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }

                return descriptor;
            }
            else {
                return originObjectGetOwnPropertyDescriptor(obj, prop);
            }
        };

        Object.getOwnPropertyDescriptors = function(o) {
            var res = {};
            for (var key in o) {
                res[key] = Object.getOwnPropertyDescriptor(o, key);
            }
            return res;
        };

        // polifill is needed because it work on kindle
        Object.defineProperties = function(obj, props) {
            var prop;
            for (prop in props) {
                if (hasOwnProp.call(props, prop)) {
                    Object.defineProperty(obj, prop, props[prop]);
                }
            }
        };

    }


    if (typeof Object.assign != 'function') {
        Object.assign = function(target, varArgs) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                    for (var nextKey in nextSource) {

                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, param) {
            setTimeout(callback, 200, param);
        };
    }
    // Yes, it does work with `new funcA.bind(thisArg, args)`
    if (!Function.prototype.bind)(function() {
        var ArrayPrototypeSlice = Array.prototype.slice;
        Function.prototype.bind = function(otherThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var baseArgs = ArrayPrototypeSlice.call(arguments, 1),
                baseArgsLength = baseArgs.length,
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    baseArgs.length = baseArgsLength; // reset to default base arguments
                    baseArgs.push.apply(baseArgs, arguments);
                    return fToBind.apply(
                        fNOP.prototype.isPrototypeOf(this) ? this : otherThis, baseArgs
                    );
                };

            if (this.prototype) {
                // Function.prototype doesn't have a prototype property
                fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();

            return fBound;
        };
    })();
}());






/*********************************************/

/**
 * 
 * @param {Function} func 
 */
function getFunctionName(func) {
    var ret = func.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}

/***********************************************/

var OOP = {};

/**
 * @param {Object} object
 * @param {Sttring} key
 * @param {Function} method
 */
OOP.overideMethod = function(object, key, method) {
    if (object[key] === undefined) object[key] = method;
    else {
        var _superMethod = object[key];
        object[key] = (function(_superMethod, method) {
            return function() {
                var _super = this.super;
                this.super = _superMethod;
                var result = method.apply(this, arguments);
                this.super = _super;
                return result;
            };

        })(_superMethod, method);
    }
};


OOP.extends = function(object, prototype) {
    // do not use setter, getter
    for (var key in prototype) {
        if (key != 'constructor' && (typeof prototype[key] == 'function'))
            OOP.overideMethod(object, key, prototype[key]);
    }
};

OOP.inherit = function(child, parent) {
    // do not use setter, getter

    Object.keys(parent).forEach(function(key) {
        if (key != 'constructor' && (typeof parent[key] == 'function')) {
            var superMethod = parent[key];
            var currentMethod = child[key];
            if (!currentMethod) child[key] = superMethod;
            else {
                child[key] = function() {
                    var _super = this.super;
                    this.super = superMethod;
                    var result = currentMethod.apply(this, arguments);
                    this.super = _super;
                    return result;
                };
            }
        }
    });
};





OOP.drillProperty = function(topObject, botObject, keyTop, keyBot) {
    if (typeof(keyTop) == 'string') {
        keyBot = keyBot || keyTop;
        Object.defineProperty(topObject, keyTop, {
            set: function(value) {
                botObject[keyBot] = value;
            },
            get: function() {
                return botObject[keyBot];
            }
        });
    }
    else {
        if (keyTop instanceof Array) {
            for (var i = 0; i < keyTop.length; ++i) {
                OOP.drillProperty(topObject, botObject, keyTop[i], keyTop[i]);
            }
        }
        else {
            for (var key in keyTop) {
                OOP.drillProperty(topObject, botObject, key, keyTop[key]);
            }
        }
    }
};

OOP.bindFunctions = function(_this, handlers) {
    var res = {};
    for (var key in handlers) {
        res[key] = handlers[key].bind(_this);
    }
    return res;
};




OOP.inheritCreator = function(parent, child) {
    if (child.property) {
        if (parent.property) {
            for (i in parent.property) {
                if (!child.property[i]) child.property[i] = parent.property[i];
            }
        }
    }
    for (var i in parent.prototype) {
        if (!child.prototype[i]) {
            child.prototype[i] = parent.prototype[i];
        }
        else {
            child.prototype[i] = (function(superFunction, childFunction) {
                return function() {
                    var _super = this.super;
                    this.super = superFunction;
                    var result = childFunction.apply(this, arguments);
                    this.super = _super;
                    return result;
                }
            })(parent.prototype[i], child.prototype[i]);
        }
    }
};

/**********************************************************************/

function JSPath(props) {
    this.path = props.path;
}


/** 
 * 
 * @param {Element} element 
 * @returns {Boolean}
 */
JSPath.prototype.match = function(element, query) {
    if (query.id) {
        if (!element.getAttribute || element.getAttribute('id') != query.id) return false;
    }
    if (query.tagName) {
        var matchTag = false;
        if (element._azar_extendTags && element._azar_extendTags[query.tagName]) matchTag = true;
        matchTag = matchTag || ((element.tagName || '').toUpperCase() == query.tagName.toUpperCase());
        if (!matchTag) return false;
    }
    if (query.classList)
        for (var i = 0; i < query.classList.length; ++i) {
            if (!element.classList || !element.classList.contains(query.classList[i])) return false;
        }
    if (query.attributes) {
        for (var key in query.attributes) {
            var value;
            if (element.attr) {
                value = element.attr(key);
                if (value != query.attributes[key]) return false;
            }
            else if (element.getAttribute) {
                value = element.getAttribute(key);
                if (value != query.attributes[key]) return false;
            }
        }
    }
    return true;
}

/**
 * Warning : still fail in some testcase
 */
JSPath.prototype.findFirst = function(root, onFound) {
    var queue = [{ e: root, i: 0 }];
    var current;

    while (queue.length > 0) {
        current = queue.shift();
        var isMathed = false;
        var currentElt = current.e;
        var currentI = current.i;
        if (this.match(currentElt, this.path[currentI])) {
            if (this.path[currentI].childCombinate) {
                var trackI = currentI;
                var trackElement = currentElt;
                var isTrackMatch = true;
                while (isTrackMatch && trackI > 0 && this.path[trackI].childCombinate) {
                    if (!trackElement.parentNode || !this.match(trackElement.parentNode, this.path[trackI - 1])) {
                        isTrackMatch = false;
                    }
                    else {
                        trackElement = trackElement.parentNode;
                        trackI--;
                    }
                }
                if (isTrackMatch) isMathed = true;
            }
            else {
                isMathed = true;
            }
        }


        if (isMathed && currentI + 1 == this.path.length) {
            if (!onFound || (onFound && onFound(currentElt)))
                return currentElt;
        }

        if (currentElt.childNodes) {
            var l = currentElt.childNodes.length;
            for (var i = 0; i < l; ++i) {
                if (currentElt.childNodes[i].tagName)
                    queue.push({
                        e: currentElt.childNodes[i],
                        i: currentI + (isMathed && currentI + 1 < this.path.length ? 1 : 0)
                    });
            }
        }
    }
    return undefined;
};


JSPath.prototype.findAll = function(root, onFound) {
    var res = [];
    var queue = [{ e: root, i: 0 }];
    var current;

    while (queue.length > 0) {
        current = queue.shift();
        var isMathed = false;
        var currentElt = current.e;
        var currentI = current.i;
        if (this.match(currentElt, this.path[currentI])) {
            if (this.path[currentI].childCombinate) {
                var trackI = currentI;
                var trackElement = currentElt;
                var isTrackMatch = true;
                while (isTrackMatch && trackI > 0 && this.path[trackI].childCombinate) {
                    if (!trackElement.parentNode || !this.match(trackElement.parentNode, this.path[trackI - 1])) {
                        isTrackMatch = false;
                    }
                    else {
                        trackElement = trackElement.parentNode;
                        trackI--;
                    }
                }
                if (isTrackMatch) isMathed = true;
            }
            else {
                isMathed = true;
            }
        }

        if (isMathed && currentI + 1 == this.path.length) {
            if (!onFound || (onFound && onFound(currentElt)))
                res.push(currentElt);
        }

        if (currentElt.childNodes) {
            var l = currentElt.childNodes.length;
            for (var i = 0; i < l; ++i) {
                if (currentElt.childNodes[i].tagName)
                    queue.push({
                        e: currentElt.childNodes[i],
                        i: currentI + (isMathed && currentI + 1 < this.path.length ? 1 : 0)
                    });
            }
        }
    }
    return res;
};



JSPath.__tagRegex = /((([^\s\>\(])|(\([^\)]*\)))+)|(\>)/g;
JSPath.__tagNameRegex = /^[a-zA-Z0-9\-\_]+/i;
JSPath.__classRegex = /\.[a-zA-Z0-9\-\_]+/g;
JSPath.__idRegex = /\#[a-zA-Z0-9\-\_]+/i;

JSPath.__attrRegex = /\[\s*([a-zA-Z-0-9\-]+)\s*\=\"\s*(((\\.)|([^\"]))+)\"\s*\]/g;
JSPath.__attrParseRegex = /\[\s*([a-zA-Z-0-9\-]+)\s*\=\"\s*(((\\.)|([^\"]))+)\"\s*\]/i;


JSPath.parseQuery = function(s) {
    var tag = {};
    var classList = s.match(this.__classRegex);
    var idList = s.match(this.__idRegex);
    var tagList = s.match(this.__tagNameRegex);
    var attributeList = s.match(this.__attrRegex);
    if (idList && idList.length > 0) {
        tag.id = idList[0].substring(1);
    }
    if (tagList && tagList.length > 0) {
        tag.tagName = tagList[0].trim();
    }
    if (classList && classList.length > 0) {
        tag.classList = classList.map(function(s) { return s.substring(1) });
    }
    var attrParseRegex = this.__attrParseRegex;
    if (attributeList && attributeList.length > 0) {
        tag.attributes = attributeList.reduce(function(ac, s) {
            var tokens = s.match(attrParseRegex);
            var key = tokens[1];
            var value = tokens[2];
            ac[key] = value;
            return ac;
        }, {});
    }
    return tag;
};

/**
 * @param {String} text
 * @returns {JSPath}
 */
JSPath.compileJSPath = function(text) {
    var tagTexts = text.match(this.__tagRegex) || [''];
    var path = [];
    var childCombinate = false;
    for (var i = 0; i < tagTexts.length; ++i) {
        var s = tagTexts[i];
        if (s == '>') {
            childCombinate = true;
        }
        else {
            var tag = this.parseQuery(s);
            tag.childCombinate = childCombinate;
            path.push(tag);
            childCombinate = false;
        }
    }
    return new JSPath({
        path: path
    });
};

function EventEmitter() {
    this._azar_extendEvents = this._azar_extendEvents || { supported: {}, prioritize: {}, nonprioritize: {} };
    this.__azar_force = !(typeof Node === "object" ? this instanceof Node : this && typeof this === "object" && typeof this.nodeType === "number" && typeof this.nodeName === "string");

}



EventEmitter.prototype.defineEvent = function(name) {
    if (name instanceof Array) {
        for (var i = 0; i < name.length; ++i)
            this._azar_extendEvents.supported[name[i]] = true;
    }
    else
        this._azar_extendEvents.supported[name] = true;
    return this;
};

EventEmitter.prototype.isSupportedEvent = function(name) {
    return this.__azar_force || !!this._azar_extendEvents.supported[name];
};


EventEmitter.prototype.emit = function(eventName, data) {
    this.fire.apply(this, arguments);
};

EventEmitter.prototype.fire = function(eventName, data) {
    var others = Array.prototype.slice.call(arguments, 1);
    if (this.isSupportedEvent(eventName)) {
        var listenerList;
        if (this._azar_extendEvents.prioritize[eventName]) {
            listenerList = this._azar_extendEvents.prioritize[eventName].slice();
            for (var i = 0; i < listenerList.length; ++i) {
                try {
                    listenerList[i].wrappedCallback.apply(this, others);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }

        if (this._azar_extendEvents.nonprioritize[eventName]) {
            listenerList = this._azar_extendEvents.nonprioritize[eventName].slice();
            for (var i = 0; i < listenerList.length; ++i) {
                try {
                    listenerList[i].wrappedCallback.apply(this, others);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }
    else {
        if (this.dispatchEvent) {
            var event = new Event(eventName);
            data && Object.assign(event, data);
            this.dispatchEvent(event);
        }
        else
            throw new Error("Not support event " + eventName);
    }
    return this;
};



EventEmitter.prototype.eventEmittorOnWithTime = function(isOnce, arg0, arg1, arg2) {
    if (typeof arg0 == 'object') {
        for (var key in arg0) {
            this.eventEmittorOnWithTime(isOnce, key, arg0[key]);
        }
        return this;
    }
    else {
        if (typeof arg1 == 'object') {
            return this.eventEmittorOnWithTime(isOnce, arg0, arg1.callback, arg1.cap);
        }
        else {
            var eventArr = this._azar_extendEvents[arg2 ? 'prioritize' : 'nonprioritize'][arg0] || [];
            var eventIndex = -1;
            for (var i = 0; i < eventArr.length; ++i) {
                if (eventArr[i].wrappedCallback == arg1) {
                    eventIndex = i;
                    break;
                }
            }
            if (eventIndex < 0) {
                var event = { isOnce: isOnce, eventName: arg0, callback: arg1, cap: !!arg2 };
                //wrappedCallback will be call
                if (isOnce) {
                    event.wrappedCallback = function(data) {
                        event.callback.call(this, data);
                        this.off(event.eventName, event.wrappedCallback, event.cap);
                    };
                }
                else {
                    event.wrappedCallback = event.callback;
                }

                if (!this.isSupportedEvent(arg0)) {
                    if (this.addEventListener) {
                        this.addEventListener(arg0, event.wrappedCallback, !!arg2);
                    }
                    else {
                        this.attachEvent('on' + arg0, arg1, !!arg2);
                    }
                }

                eventArr.push(event);
                this._azar_extendEvents[arg2 ? 'prioritize' : 'nonprioritize'][arg0] = eventArr;
            }
            else {
                console.warn("dupplicate event");
            }

        }
        return this;
    }
};



EventEmitter.prototype.on = function(arg0, arg1, arg2) {
    this.eventEmittorOnWithTime(false, arg0, arg1, arg2);
    return this;
};


EventEmitter.prototype.once = function(arg0, arg1, arg2) {
    this.eventEmittorOnWithTime(true, arg0, arg1, arg2);
    return this;
};

EventEmitter.prototype.off = function(arg0, arg1, arg2) {
    if (typeof arg0 == 'object') {
        for (var key in arg0) {
            this.off(key, arg0[key]);
        }
        return this;
    }
    else {
        if (typeof arg1 == 'object') {
            return this.off(arg0, arg1.callback, arg1.cap);
        }
        else {
            var eventArr = this._azar_extendEvents[arg2 ? 'prioritize' : 'nonprioritize'][arg0] || [];
            var newEventArray = [];
            for (var i = 0; i < eventArr.length; ++i) {
                var event = eventArr[i];
                if (event.wrappedCallback == arg1) {
                    //Dont add to newEventArray
                    if (this.isSupportedEvent(arg0)) {}
                    else {
                        if (this.removeEventListener) {
                            this.removeEventListener(event.eventName, event.wrappedCallback, !!event.call);
                        }
                        else {
                            this.detachEvent('on' + event.eventName, event.wrappedCallback, !!event.call);
                        }
                    }
                }
                else {
                    newEventArray.push(event);
                }
            }
            this._azar_extendEvents[arg2 ? 'prioritize' : 'nonprioritize'][arg0] = newEventArray;
            return this;
        }
    }

};



EventEmitter.isMouseRight = function(event) {
    var isRightMB = false;
    if ("which" in event) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = event.which == 3;
    else if ("button" in event) // IE, Opera 
        isRightMB = event.button == 2;
    return isRightMB;
};

EventEmitter.hitElement = function(element, event) {
    var current = event.target;
    while (current) {
        if (current == element) return true;
        current = current.parentElement;
    }
    return false;
};

EventEmitter.copyEvent = function(event, props) {
    var result = {};
    Object.assign(result, event);
    for (var key in result) {
        if (typeof result[key] == 'function') {
            result[key] = result[key].bind(event);
        }
    };

    if (props)
        Object.assign(result, props);
    return result;
};


EventEmitter.eventProperties = ["altKey", "bubbles", "button", "buttons", "cancelBubble", "cancelable", "clientX", "clientY", "composed",
    "ctrlKey", "currentTarget", "defaultPrevented", "deltaMode", "deltaX", "deltaY", "deltaZ", "detail", "eventPhase",
    "explicitOriginalTarget", "isTrusted", "layerX", "layerY", "metaKey", "movementX", "movementY", "mozInputSource",
    "mozPressure", "offsetX", "offsetY", "originalTarget", "pageX", "pageY", "rangeOffset", "rangeParent", "region",
    "relatedTarget", "returnValue", "screenX", "screenY", "shiftKey", "srcElement", "target", "timeStamp", "type",
    "deltaMode", "deltaX", "deltaY", "deltaZ"
];


function Element() {
    EventEmitter.call(this);
    this._azar_extendAttributes = this._azar_extendAttributes || {};
}

Object.defineProperties(Element.prototype, Object.getOwnPropertyDescriptors(EventEmitter.prototype));
Element.prototype.init = function(props) {
    Object.assign(this, props || {});
};

/**
 * @typedef {Object} AttributeDefiner
 * @property {Function} set
 * @property {Function} get
 * @property {Function} remove
 * 
 * @param {String} key
 * @param {AttributeDefiner} def
 */
Element.prototype.defineAttribute = function(key, def) {
    this._azar_extendAttributes[key] = def;
};


Element.prototype.defineAttributes = function(defs) {
    for (var key in defs) {
        this.defineAttribute(key, defs[key]);
    }
};

Element.prototype.attr = function() {
    if (arguments.length == 1) {
        if (typeof(arguments[0]) == 'string') {
            if (this._azar_extendAttributes[arguments[0]]) {
                return this._azar_extendAttributes[arguments[0]].get.call(this);
            }
            else
                return this.getAttribute(arguments[0]);
        }
        else {
            for (var key in arguments[0]) {

                this.attr(key, arguments[0][key]);
            }
        }
    }
    else {
        if (arguments.length == 2) {
            if (arguments[1] === null || arguments[1] === undefined) {
                if (this._azar_extendAttributes[arguments[0]]) {
                    this._azar_extendAttributes[arguments[0]].remove.call(this, arguments[1]);
                }
                else
                    this.removeAttribute(arguments[0]);
            }
            else {
                if (this._azar_extendAttributes[arguments[0]]) {
                    this._azar_extendAttributes[arguments[0]].set.call(this, arguments[1]);
                }
                else {

                    this.setAttribute(arguments[0], arguments[1]);
                }
            }
        }
    }
    return this;
};


Element.prototype._azar_styleIndex = function(string) {
    return string.replace(/\-(.)/g, function(full, c) {
        return c.toUpperCase();
    })
};


Element.prototype.addStyle = function(arg0, arg1) {
    if (typeof arg0 == 'string')
        this.style[this._azar_styleIndex(arg0)] = arg1;
    else {
        for (var key in arg0)
            this.addStyle(key, arg0[key]);
    }
    return this;
};

Element.prototype.removeStyle = function(arg0) {
    if (typeof arg0 == 'string') {
        var key = this._azar_styleIndex(arg0);
        this.style[key] = null;
        delete this.style[key];
    }
    else {
        if (typeof arg0 instanceof Array) {
            for (var i = 0; i < arg0.length; ++i)
                this.removeStyle(arg0[i]);
        }
        else {
            for (var key in arg0)
                this.removeStyle(key);
        }
    }
    return this;
};



Element.prototype.addChild = function(child) {
    if (child instanceof Array) {
        for (var i = 0; i < child.length; ++i)
            this.appendChild(child[i]);
    }
    else
        this.appendChild(child);
    return this;
};


Element.prototype.addTo = function(parent) {
    if (parent && parent.appendChild) {
        if (parent.addChild)
            parent.addChild(this);
        else
            parent.appendChild(this);
    }
    else throw Error("Can not append to " + parent + "!");
    return this;
};


Element.prototype.selfRemove = function() {
    if (this.parentElement)
        this.parentElement.removeChild(this);
    return this;
};



Element.prototype.selfReplace = function(newNode) {
    if (this.parentElement)
        this.parentElement.replaceChild(newNode, this);
    return this;
};

Element.prototype.clearChild = function() {
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
    return this;
};

/**
 * 
 * @param {string} className 
 * @returns {Boolean}
 */
Element.prototype.containsClass = function(className) {
    if (className instanceof Array) {
        for (var i = 0; i < className.length; ++i)
            if (!this.classList.containsClass(className[i])) return false;
        return true;
    }
    else
        return this.classList.contains(className);
};

/**
 * 
 * @param {string} className 
 * @returns {Element}
 */
Element.prototype.addClass = function(className) {
    if (className instanceof Array) {
        for (var i = 0; i < className.length; ++i)
            this.classList.add(className[i]);
    }
    else
        this.classList.add(className);
    return this;
};

/**
 * 
 * @param {string} className 
 * @returns {Element}
 */
Element.prototype.removeClass = function(className) {
    if (className instanceof Array) {
        for (var i = 0; i < className.length; ++i)
            this.classList.remove(className[i]);
    }
    else
        this.classList.remove(className);
    return this;
};



Element.prototype.getComputedStyleValue = function(key) {
    return window.getComputedStyle(this).getPropertyValue(key);

};

Element.prototype.getFontSize = function() {
    return parseFloat(this.getComputedStyleValue('font-size').replace('px', ''));
};


Element.prototype.findChildAfter = function(obj) {
    var r = 0;
    for (var i = 0; i < this.childNodes.length; ++i) {
        if (obj == this.childNodes[i]) {
            r = i + 1;
            break;
        }
    }
    if (this.childNodes[r]) return this.childNodes[r];
    return undefined;
};

Element.prototype.findChildBefore = function(obj) {
    var r = 0;
    for (var i = 0; i < this.childNodes.length; ++i) {
        if (obj == this.childNodes[i]) {
            r = i - 1;
            break;
        }
    }
    if (this.childNodes[r]) return this.childNodes[r];
    return undefined;
};

Element.prototype.addChildBefore = function(newItem, bf) {
    this.insertBefore(newItem, bf);
    return this;
};

Element.prototype.addChildAfter = function(newItem, at) {
    var bf = this.findChildAfter(at);
    if (bf) return this.addChildBefore(newItem, bf);
    return this.addChild(newItem);
};

/**
 * @returns {DOMRect}
 */
Element.prototype.getBoundingRecursiveRect = function(depth) {
    if (depth === undefined) depth = 10000;

    var current, next;
    var oo = 1000000;
    var ac = { left: oo, right: -oo, top: oo, bottom: -oo, width: 0, height: 0 };
    var stacks = [{ e: this, d: 0 }];
    while (stacks.length > 0) {
        current = stacks.pop();

        if (current.e.getBoundingClientRect) {
            var cRect = current.e.getBoundingClientRect();
            if (!cRect || cRect.width * cRect.height == 0) continue;
            ac.left = Math.min(ac.left, cRect.left);
            ac.top = Math.min(ac.top, cRect.top);
            ac.bottom = Math.max(ac.bottom, cRect.bottom);
            ac.right = Math.max(ac.right, cRect.right);
            ac.height = ac.bottom - ac.top;
            ac.width = ac.right - ac.left;
            var childNodes = current.e.childNodes;
            if (childNodes && childNodes.length > 0 && current.d < depth) {
                for (var i = 0; i < childNodes.length; ++i) {
                    next = { e: childNodes[i], d: current.d + 1 };
                    stacks.push(next);
                }
            }
        }
    }

    return ac;
};


Element.prototype.isDescendantOf = function(parent) {
    var child = this;
    while (child) {
        if (child == parent) return true;
        child = child.parentNode;
    }
    return false;
};


/*************************** **********************/
Element.prototype.getCSSRules = function() {
    var sheets = document.styleSheets;
    var ret = [];
    this.matches = this.matches || this.webkitMatchesSelector || this.mozMatchesSelector ||
        this.msMatchesSelector || this.oMatchesSelector;
    for (var i in sheets) {
        if (sheets[i].href) continue; //because can not access
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            if (this.matches(rules[r].selectorText)) {
                ret.push(rules[r]);
            }
        }
    }
    return ret;
};



/***
 * WARNING: this function may be unsafe
 */
Element.prototype.afterAttached = function(frameTimeOut) {
    if (!frameTimeOut) frameTimeOut = 25;
    // var tracer = new Error();
    var current = this;
    return new Promise(function(resolve, reject) {
        var delayTime = 0;

        function trace() {
            if (frameTimeOut < 0) {
                // reject(tracer);
                // if (absol.BUILD && absol.BUILD.version == "DEBUG")
                //     console.warn("Element not attached", trace);
            }
            else {
                frameTimeOut--;
                while (true) {
                    if (current == document.body) {
                        resolve();
                        return;
                    }
                    else {
                        if (current.parentNode) {
                            current = current.parentNode;
                        }
                        else {
                            if (delayTime < 25)
                                delayTime += 1;
                            else if (delayTime < 100) {
                                delayTime += 5;
                            }
                            else
                            if (delayTime < 1000) {
                                delayTime += 10;
                            }

                            setTimeout(trace, delayTime);
                            return;
                        }
                    }
                }
            }
        };
        setTimeout(trace, 0);
    });
};



/***
 * WARNING: this function may be unsafe
 */
Element.prototype.afterDisplayed = function(requestTimesOut) {
    if (!requestTimesOut) requestTimesOut = 24 * 3600 * 33;
    // var tracer = new Error();
    var current = this;
    return new Promise(function(resolve, reject) {
        function trace() {
            if (requestTimesOut < 0) {
                // reject(tracer);
                // if (absol.BUILD && absol.BUILD.version == "DEBUG")
                //     console.warn("Element not displayed", trace);
            }
            else {
                requestTimesOut--;
                var bound = current.getBoundingClientRect();
                if (bound.width > 0 || bound.height > 0) {
                    resolve();
                }
                else {
                    setTimeout(trace, 33);
                    return;
                }
            }
        };
        trace();
    });
};

function ElementNS() {
    Element.call(this);
};

Object.defineProperties(ElementNS.prototype, Object.getOwnPropertyDescriptors(Element.prototype));

ElementNS.prototype.attr = function () {      
    if (arguments.length == 1) {
        if (typeof (arguments[0]) == 'string') {
            if (this._azar_extendAttributes[arguments[0]]) {
                return this._azar_extendAttributes[arguments[0]].get.call(this);
            }
            else
                return this.getAttributeNS(null,arguments[0]);
        }
        else {
            for (var key in arguments[0]) {
            
                this.attr(key, arguments[0][key]);
            }
        }
    }
    else {
        if (arguments.length == 2) {
            if (arguments[1] === null || arguments[1] === undefined) {
                if (this._azar_extendAttributes[arguments[0]]) {
                    this._azar_extendAttributes[arguments[0]].remove.call(this, arguments[1]);
                }
                else
                    this.removeAttributeNS(null,arguments[0]);
            }
            else {
                if (this._azar_extendAttributes[arguments[0]]) {
                    this._azar_extendAttributes[arguments[0]].set.call(this, arguments[1]);
                }
                else{
                    this.setAttributeNS(null,arguments[0], arguments[1]);
                }
            }
        }
    }
    return this;
};


function Dom(option) {
    option = option || {};
    this.creator = option.creator || {};


    this.creator.__svg__ = function() {
        var temp = document.createElement('div');
        temp.innerHTML = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>';
        var element = temp.childNodes[0];
        var prototypes = Object.getOwnPropertyDescriptors(Element.prototype);
        Object.defineProperties(element, prototypes);
        Element.call(element);
        return element;
    };

    Object.defineProperty(this.creator, 'svg', {
        set: function() {
            console.error(new Error());
        },
        get: function() {
            return this.__svg__;
        }
    });

    this.$ = this.selectAttacth.bind(this);
    this._ = this.create.bind(this);
    this.buildDom = this._;
    this.defaultTag = 'div';
}


Dom.prototype.fromCode = function(code) {
    code = code.trim().replace(/>\s+</gm, '><');
    var temTag = 'div';
    if (code.startsWith('<td')) temTag = 'tr';
    if (code.startsWith('<tr')) temTag = 'tbody';
    var tempDiv = document.createElement(temTag);
    tempDiv.innerHTML = code;
    var element = tempDiv.childNodes[0];
    var prototypes = Object.getOwnPropertyDescriptors(Element.prototype);
    Object.defineProperties(element, prototypes);
    Element.call(element);
    return element;
};


/**
 * DFS
 * @param {string} query 
 * @param {Element} root 
 * @param {function} onFound - return true to stop find 
 */
Dom.prototype.selectAttacth = function(query, root, onFound) {
    var res;
    if (Dom.isDomNode(query)) res = query;
    else
        res = this.select(query, root, onFound);
    if (res) this.attach(res);
    return res;
};


/**
 * DFS
 * @param {string} query 
 * @param {Element} root 
 * @param {function} onFound - return true to stop find 
 */
Dom.prototype.select = function(query, root, onFound) {
    root = root || document.documentElement;
    var matcher = JSPath.compileJSPath(query);
    return matcher.findFirst(root, onFound);
};

/**
 * 
 * @param {Element} element 
 */
Dom.prototype.attach = function(element) {
    if (typeof element.attr == 'function') return;
    var prototypes = Object.getOwnPropertyDescriptors(Element.prototype);
    Object.defineProperties(element, prototypes);
    Element.call(element);
};


Dom.prototype.makeNewElement = function(tagName) {
    return document.createElement(tagName);
};

Dom.prototype.makeNewTextNode = function(data) {
    return document.createTextNode(data);
};



/**
 * 
 * @param {Object} option
 * @returns {Element} 
 */
Dom.prototype.create = function(option, isInherited) {
    var res;
    var prototype;
    var property;
    var attribute;
    if (Dom.isDomNode(option)) {
        res = option;
        option = {};
        isInherited = true;
    }
    else if (typeof option == 'string') {

        option = option.trim();
        if (option[0] == '<') {

            option = option.trim();
            res = this.fromCode(option);
            option = {};
        }
        else {
            var queryObj = JSPath.parseQuery(option);
            option = {};
            option.tag = queryObj.tagName || this.defaultTag;
            if (queryObj.classList && queryObj.classList.length > 0)
                option.class = queryObj.classList;
            if (queryObj.id) option.id = queryObj.id;
            if (queryObj.attributes) option.attr = queryObj.attributes;

            if (!this.creator[option.tag]) {
                res = this.makeNewElement(option.tag);
                option.data && Object.assign(res, option.data);
            }
            else {
                res = this.creator[option.tag](option.data);
                res._azar_extendTags = res._azar_extendTags || {};
                res._azar_extendTags[option.tag] = true;
                prototype = this.creator[option.tag].prototype;
                property = this.creator[option.tag].property;
                attribute = this.creator[option.tag].attribute;

            }
        }
    }
    else {
        option = option || {};
        if (typeof(option.text) == 'string') { //is textNode
            return this.makeNewTextNode(option.text);
        }
        else {
            option.tag = option.tag || this.defaultTag;
            if (!this.creator[option.tag]) {
                res = this.makeNewElement(option.tag);
                option.data && Object.assign(res, option.data);
            }
            else {
                res = this.creator[option.tag](option.data);
                res._azar_extendTags = res._azar_extendTags || {};
                res._azar_extendTags[option.tag] = true;
                prototype = this.creator[option.tag].prototype;
                property = this.creator[option.tag].property;
                attribute = this.creator[option.tag].attribute;
            }
        }
    }

    this.attach(res);


    if (property) {
        Object.defineProperties(res, property);
    }
    if (prototype) {
        OOP.extends(res, prototype);
    }
    if (attribute) {
        res.defineAttributes(attribute);
    }
    option.attr && res.attr(option.attr);
    option.extendEvent && res.defineEvent(option.extendEvent);
    option.on && res.on(option.on);
    option.once && res.once(option.once);
    option.class && res.addClass(option.class);
    option.style && res.addStyle(option.style);
    option.id && res.attr('id', option.id);
    if (!isInherited) res.init(option.props);
    //todo:attach option
    if (option.child) {
        option.child = option.child instanceof Array ? option.child : [option.child];
        for (var i = 0; i < option.child.length; ++i) {
            res.addChild(this.create(option.child[i]));
        }
    }

    return res;
};


Dom.prototype.install = function(arg0, arg1) {
    var _this = this;
    if (arguments.length == 1) {
        if (arg0.creator && arg0.create && arg0.select) {
            // is a dom core
            var creator = arg0.creator;
            Object.keys(creator).forEach(function(key) {
                if (key.startsWith('_') || key.startsWith('$')) return;
                var func = creator[key];
                if (typeof(func) == 'function')
                    if (_this.creator[key] != func)
                        _this.creator[key] = func;
            })
        }
        else if (typeof(arg0) == 'function') {
            var name = getFunctionName(arg0) || arg0.name;
            if (name) {
                this.creator[name.toLowerCase()] = arg0;
            }
            else {
                console.error('No ident name of creator function', arg0)
            }
        }
        else if (typeof arg0 == 'object') {
            Object.keys(arg0).forEach(function(key) {
                if (key.startsWith('_') || key.startsWith('$')) return;
                var func = arg0[key];
                if (typeof(func) == 'function')
                    if (_this.creator[key] != func)
                        _this.creator[key] = func;
            })
        }
        else if (arg0 instanceof Array) {
            arg0.forEach(function(func) {
                var name = getFunctionName(func) || func.name;
                if (name) {
                    _this.creator[name.toLowerCase()] = func;
                }
            });
        }
        else {
            console.error('Unknow data', arg0);
        }
    }
    else if (arguments.length == 2) {
        if (arg0 instanceof Array) {
            arg0.forEach(function(key) {
                if (key.match(arg0)) {
                    var func = arg1[key];
                    if (typeof(func) == 'function')
                        if (_this.create[key] != func)
                            _this.create[key] = func;
                }
            });
        }
        else if (arg0 instanceof RegExp) {
            Object.keys(arg1).forEach(function(key) {
                if (key.match(arg0)) {
                    var func = arg1[key];
                    if (typeof(func) == 'function')
                        if (_this.create[key] != func)
                            _this.create[key] = func;
                }
            });
        }
        else if (typeof(arg0) == 'string' && arg0.length > 0) {
            if (typeof(arg1) == 'function') {
                this.creator[arg0] = arg1;
            }
            else {
                console.error('arg1 is not a function');
            }
        }
    }
    else {
        console.error('Invalid param');
    }

    return this;
};


/**
 * 
 * @param {*} o 
 * @returns {Boolean}
 */
Dom.isDomNode = function(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
};


function Svg(option) {
    Dom.call(this, option);
    this.defaultTag = 'g';
    this.svgNS = "http://www.w3.org/2000/svg";


    delete this.buidDom;
    this.buildSvg = this.create.bind(this);
}


Object.defineProperties(Svg.prototype, Object.getOwnPropertyDescriptors(Dom.prototype));

Svg.prototype.fromCode = function (code) {
    code = code.trim();
    var receptacle = document.createElement('div');
    var element;
    if (code.startsWith('<svg')) {
        receptacle.innerHTML = code;
        element = receptacle.childNodes[0];
        var prototypes = Object.getOwnPropertyDescriptors(Element.prototype);
        Object.defineProperties(element, prototypes);
        Element.call(element);
    }
    else {
        var svgfragment = '<svg  version="1.1" xmlns="http://www.w3.org/2000/svg">' + code + '</svg>';
        receptacle.innerHTML = '' + svgfragment;
        element = receptacle.childNodes[0].childNodes[0];
        var prototypes = Object.getOwnPropertyDescriptors(ElementNS.prototype);
        Object.defineProperties(element, prototypes);
        ElementNS.call(element);
    }
    return element;
};


Svg.prototype.makeNewElement = function (tagName) {
    return document.createElementNS(this.svgNS, tagName);
};

/**
 * 
 * @param {Element} element 
 */
Svg.prototype.attach = function (element) {
    if (typeof element.attr == 'function') return;
    var prototypes = Object.getOwnPropertyDescriptors(ElementNS.prototype);
    Object.defineProperties(element, prototypes);
    ElementNS.call(element);
};



/**
 * @param {HTMLElement} element
 * @returns {ClientRect}
 */
Dom.traceOutBoundingClientRect = function(current) {
    var screenSize = Dom.getScreenSize();
    var left = 0;
    var right = screenSize.width;
    var top = 0;
    var bottom = screenSize.height;
    while (current) {

        var ox = Element.prototype.getComputedStyleValue.call(current, 'overflow-x') != "visible";
        var oy = Element.prototype.getComputedStyleValue.call(current, 'overflow-y') != "visible";
        var isHtml = current.tagName.toLowerCase() == 'html';
        if (ox || oy || isHtml) {
            var bound = current.getBoundingClientRect();
            if (ox || isHtml) {
                left = Math.max(left, bound.left);
                right = Math.min(right, bound.right);
            }
            if (oy || isHtml) {
                top = Math.max(top, bound.top);
                bottom = Math.min(bottom, bound.bottom);
            }
        }

        if (isHtml) break;
        current = current.parentElement;
    }
    return { left: left, right: right, top: top, bottom: bottom, width: right - left, height: bottom - top };
};


Dom.fontFaceIsLoaded = function(fontFace, timeout) {
    timeout = timeout || 0;

    var element = this.ShareInstance._({
        tag: 'span',
        style: {
            visibility: 'hidden',
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
            'font-size': '256px'

        },
        props: {
            innerHTML: "Test string long long long"
        }
    });
    element.addTo(document.body);
    return element.afterAttached().then(function() {
        var lastOffsetWidth = element.getBoundingClientRect().width;
        element.addStyle('font-family', fontFace);
        return new Promise(function(resolve, reject) {
            function check(remainTime) {
                if (remainTime < 0) {
                    resolve(false);
                    element.selfRemove();
                }
                else
                    requestAnimationFrame(function() {
                        var currentOffsetWidth = element.getBoundingClientRect().width;
                        if (currentOffsetWidth != lastOffsetWidth) {
                            resolve(true);
                            element.selfRemove();
                        }
                        else
                            check(remainTime - 10);
                    }, 10);
            }
            check(timeout);
        });
    });
};


Dom.getScreenSize = function() {
    var width = window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

    var height = window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;

    return { WIDTH: width, HEIGHT: height, width: width, height: height };
};


function Svg(option) {
    Dom.call(this, option);
    this.defaultTag = 'g';
    this.svgNS = "http://www.w3.org/2000/svg";


    delete this.buidDom;
    this.buildSvg = this.create.bind(this);
}


Object.defineProperties(Svg.prototype, Object.getOwnPropertyDescriptors(Dom.prototype));

Svg.prototype.fromCode = function (code) {
    code = code.trim();
    var receptacle = document.createElement('div');
    var element;
    var prototypes;
    if (code.startsWith('<svg')) {
        receptacle.innerHTML = code;
        element = receptacle.childNodes[0];
         prototypes = Object.getOwnPropertyDescriptors(Element.prototype);
        Object.defineProperties(element, prototypes);
        Element.call(element);
    }
    else {
        var svgfragment = '<svg  version="1.1" xmlns="http://www.w3.org/2000/svg">' + code + '</svg>';
        receptacle.innerHTML = '' + svgfragment;
        element = receptacle.childNodes[0].childNodes[0];
         prototypes = Object.getOwnPropertyDescriptors(ElementNS.prototype);
        Object.defineProperties(element, prototypes);
        ElementNS.call(element);
    }
    return element;
};


Svg.prototype.makeNewElement = function (tagName) {
    return document.createElementNS(this.svgNS, tagName);
};

/**
 * 
 * @param {Element} element 
 */
Svg.prototype.attach = function (element) {
    if (typeof element.attr == 'function') return;
    var prototypes = Object.getOwnPropertyDescriptors(ElementNS.prototype);
    Object.defineProperties(element, prototypes);
    ElementNS.call(element);
};
