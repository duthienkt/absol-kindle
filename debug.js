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


    function Log(tag, message) {
        if (typeof message == 'object') {
            message = JSON.stringify(message);
        }
        content.addChild(_({
            tag: 'p',
            child: [{
                    tag: 'strong',
                    child: { text: tag + ' ' }
                },
                {
                    tag: 'span',
                    child: { text: message+'' }
                }
            ]
        }));
        
        content.scrollTop = content.scrollHeight - content.clientHeight;

    }

    console.error = function(obj) {
        Log('error', obj);
    };
    window.Log = Log;

})();
