(function() {
    var core = new Dom();
    var _ = core._;
    var $ = core.$;

    var debugSpace = _({
        class: 'debug-space-holder',
        child: [{
            class: 'debug-space',

            child: [
                '.debug-space-trigger',
                '.debug-space-content'
            ]
        }]
    }).addTo(document.body);
    var isShow = false;
    var trigger = $('.debug-space-trigger', debugSpace)
        .on('click', function() {
            isShow = !isShow;
            if (isShow) {
                debugSpace.addClass('show');
            }
            else {
                debugSpace.removeClass('show');
            }
        });

    var content = $('.debug-space-content', debugSpace);

    function logObject(o) {
        if (o === undefined) return 'undefined';
        if (o === null) return 'null';
        if (typeof o === 'string') return o;
        if (typeof o === 'number') return o + '';
        if (Dom.isDomNode(o)) {
            return JSON.stringify({
                tagName: o.tagName,
                className: o.getAttribute && o.getAttribute('class'),
                style: o.getAttribute && o.getAttribute('style')
            });
        }
        else if (o instanceof Array) {
            return JSON.stringify(o);
        }
        else if (typeof x == 'function') {
            return x + '';
        }

        var x = Object({}, o);
        ['stack', 'name', 'message'].forEach(function(key) {
            if (o[key] !== undefined) x[key] = o[key]; //native property
        });
        return JSON.stringify(o);
    }

    function Log(tag) {

        var children = [{
            tag: 'strong',
            child: { text: tag }
        }];

        for (var i = 1; i < arguments.length; ++i) {
            children.push({
                tag: 'span',
                style: {
                    'margin-left': '1em'
                },
                child: { text: logObject(arguments[i]) }
            });
        }
        content.addChild(_({
            tag: 'p',
            child: children
        }));

        content.scrollTop = content.scrollHeight - content.clientHeight;

    }

    window.Log = Log;

    console.error = function() {
        var args = ['ERROR'].concat(Array.prototype.map.call(arguments, function(x) { return x; }));
        Log.apply(null, args);
    };

    console.log = function() {
        var args = ['LOG'].concat(Array.prototype.map.call(arguments, function(x) { return x; }));
        Log.apply(null, args);
    };

})();
