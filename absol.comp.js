/*global Dom*/

var core = new Dom();
var _ = core._;
var $ = core.$;



function BlinkButton() {
    return _('button.blink-btn').defineEvent('click')
    .on('mousedown', function(event) {
            this.addClass('active');
            setTimeout(function(){
                this.removeClass('active');
                this.emit('click', event, this);
            }.bind(this), 100);
        })
    ;
}

core.install('blinkbutton', BlinkButton);


function Modal() {
    var res = _({
        class: 'absol-modal',
        child: {
            class: 'absol-modal-hcenter',
            child: {
                class: 'absol-modal-vcenter',
                child: '.absol-modal-container'

            }
        }
    });

    res.$container = $('.absol-modal-container', res);

    return res;
}


Modal.prototype.addChild = function(child) {
    this.$container.addChild.apply(this.$container, arguments);
    return this;
};


Modal.property = {};
Modal.property.show = {
    set: function(value) {
        if (value)
            this.removeClass('absol-modal-hidden');
        else
            this.addClass('absol-modal-hidden');
    },
    get: function() {
        return !this.containsClass('absol-modal-hidden');
    }
};

core.install('modal', Modal);

function YesNoConfirm() {
    var res = _({
        tag: 'modal',
        extendEvent: ['pressyes', 'pressno'],
        child: {
            class: 'absol-yesno-confirm',
            child: [{
                    tag: 'p',
                    props: {
                        innerHTML: 'Bạn có muốn thoát game hay không'
                    }
                },
                {
                    tag: 'div',
                    class: 'buttons-ctn',
                    child: [{
                            tag: 'blinkbutton',
                            class: 'yes',
                            child: { text: 'Yes' }
                        },
                        {
                            tag: 'blinkbutton',
                            class: 'no',
                            child: { text: 'No' }
                        }
                    ]
                }
            ]
        }
    });

    res.$text = $('.absol-yesno-confirm p', res);
    res.$yesBtn = $('blinkbutton.yes', res).on('click', function(event) {
        res.emit('pressyes', event, res);
    });
    res.$noBtn = $('blinkbutton.no', res).on('click', function(event) {
        res.emit('pressno', event, res);
    });
    return res;
}

YesNoConfirm.property = {};

YesNoConfirm.property.text = {
    set: function(value) {
        this.$text.innerHTML = value + '';
    },
    get: function() {
        return this.$text.innerHTML;
    }
};

core.install('yesnoconfirm', YesNoConfirm);

YesNoConfirm.mInstance = _('yesnoconfirm');



YesNoConfirm.show = function(text) {
    YesNoConfirm.mInstance.addTo(document.body);
    YesNoConfirm.mInstance.text = text;
    return new Promise(function(rs) {
        function onYes() {
            finish(true);
        }

        function onNo() {
            finish(false);
        }

        function finish(result) {
            YesNoConfirm.mInstance.off('pressyes', onYes);
            YesNoConfirm.mInstance.off('pressno', onNo);
            YesNoConfirm.mInstance.remove();
            rs(result);
        }
        YesNoConfirm.mInstance.on('pressyes', onYes);
        YesNoConfirm.mInstance.on('pressno', onNo);
    });
};


function LoadingIcon() {
    var res = _('<svg class="lds-spinner"xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">\
    <g style="display:none"  transform="rotate(0 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
    </rect>\
</g><g style="display:none"  transform="rotate(30 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
    </rect>\
</g><g  style="display:none" transform="rotate(60 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
    </rect>\
</g><g  style="display:none" transform="rotate(90 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
    </rect>\
</g><g  style="display:none" transform="rotate(120 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
    </rect>\
</g><g  style="display:none" transform="rotate(150 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g><g style="display:none"  transform="rotate(180 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g><g  style="display:none" transform="rotate(210 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g><g style="display:none"  transform="rotate(240 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g><g  style="display:none" transform="rotate(270 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g><g  style="display:none" transform="rotate(300 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g><g  style="display:none" transform="rotate(330 50 50)">\
  <rect x="46.5" y="6" rx="11.625" ry="1.5" width="7" height="28" fill="#303030">\
  </rect>\
</g></svg>');
    res.$groups = [];
    $('g', res, function(e) {
        res.$groups.push(e);
    });
    res._itv = -1;
    res._id = 0;
    return res;
}

LoadingIcon.prototype.tick = function() {
    this.$groups[this._id].style.display = 'none';
    this._id = (this._id + 1) % this.$groups.length;
    this.$groups[this._id].style.display = null;
};
LoadingIcon.prototype.start = function() {
    if (this._itv >= 0) return;
    this._itv = setInterval(this.tick.bind(this), 100);

};

LoadingIcon.prototype.stop = function() {
    if (this._itv < 0) return;
    clearInterval(this._itv);
    this._itv = -1;
};



core.install('loadingicon', LoadingIcon);

function LoadingModal() {
    var res = _({
        tag: 'modal',
        child: {
            class: ['absol-modal-box', 'absol-loading-box'],
            child: 'loadingicon'
        }
    });
    res.$icon = $('loadingicon', res);
    return res;
}

core.install('loadingmodal', LoadingModal);

LoadingModal.mInstance = _('loadingmodal');

LoadingModal.show = function() {
    LoadingModal.cToken = Math.random() * 1000 >> 0;
    LoadingModal.mInstance.addTo(document.body);
    LoadingModal.mInstance.$icon.start();
    return LoadingModal.cToken;
};

LoadingModal.close = function(token) {
    if (LoadingModal.cToken == token || token === true) {
        LoadingModal.mInstance.$icon.stop();
        LoadingModal.mInstance.remove();
    }
};

// LoadingModal.show();