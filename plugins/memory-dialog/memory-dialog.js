(function() {

    var factory = function (exports) {

        var $ = jQuery; // if using module loader(Require.js/Sea.js).
        var pluginName = "memory-dialog";

        var langs = {
            "zh-cn" : {
                toolbar : {
                    memory : "历史记录 （Alt + H）"
                },
                dialog : {
                    memory : {
                        title : "历史记录"
                    }
                }
            },
            "zh-tw" : {
                toolbar : {
                    memory : "歷史記錄 （Alt + H）"
                },
                dialog : {
                    memory : {
                        title : "歷史記錄"
                    }
                }
            },
            "en" : {
                toolbar : {
                    memory : "History memory （Alt + H）"
                },
                dialog : {
                    memory : {
                        title : "History memory"
                    }
                }
            }
        };

        exports.fn.memoryDialog = function() {
            var _this       = this;
            var cm          = this.cm;
            var settings    = _this.settings;

            if (!settings.memory)
            {
                alert("settings.memory == false");
                return ;
            }

            $.extend(true, this.lang, langs[this.lang.name]);

            var classPrefix = this.classPrefix;
            var className   = classPrefix + 'memory';
            var prefix      = className + '-';
            var lang        = this.lang;
            var dialog;
            var dialogName  = classPrefix + pluginName;
            var dialogLang  = lang.dialog.memory;
            var proto       = this.__proto__;
            var localMemory = proto.localGet(settings.memoryLocalKey);
            var data;
            var dataLength;

            if (localMemory) {
                data = localMemory.data;
                dataLength = data.length;
            }

            function loadData() {
                var dialogHTML = initHtml = '<div class="'+ className +' text-center">暂无历史记录</div>';

                if (localMemory && dataLength > 0) {
                    dialogHTML = '<div class="'+ className +'"><ul class="'+ prefix +'list">';
                    for (var i = 0; i < dataLength; i++) {
                        dialogHTML += '<li class="'+ prefix +'item">\
                            <pre class="'+ prefix +'content">'+ _this.html2Escape(data[i].content) +'</pre>\
                            <span class="'+ prefix +'operate" data-key="'+ i +'">\
                                <button class="editormd-btn restore"><i class="fa fa-arrow-left"></i></button>\
                                <button class="editormd-btn delete"><i class="fa fa-trash-o"></i></button>\
                            </span>\
                            <span class="'+ prefix +'time">'+ data[i].time.date +'<br>'+ data[i].time.time +'</span>\
                        </li>';
                    }
                    dialogHTML += '</ul></div>';
                }

                return dialogHTML;
            }

            function operate(e) {
                var target = e.target;
                if (target.localName === 'i' && target.parentNode.localName === 'button') {
                    target = target.parentNode;
                }
                var cName = target.className;
                var parentEle = target.parentNode;

                if (parentEle.className.indexOf(prefix + 'operate') !== -1) {
                    var key = parentEle.getAttribute('data-key');

                    if (cName.indexOf('restore') !== -1) {
                        $.proxy(proto.restoreMemory, _this)(data[key]);
                        dialog.hidden();
                    } else if (cName.indexOf('delete') !== -1) {
                        if (confirm('是否确定删除？')) {
                            localMemory.data.splice(key, 1);

                            proto.localSave(localMemory, settings.memoryLocalKey);

                            $('.'+ className).remove();
                            dialog.find('.'+ classPrefix +'dialog-container').prepend(loadData());

                            $('.'+ className).bind(exports.mouseOrTouch("click", "touchend"), operate);
                        }
                    }
                }
            }

            dialog = this.createDialog({
                name       : dialogName,
                title      : dialogLang.title,
                content    : loadData(),
                height     : 'auto',
                mask       : settings.dialogShowMask,
                drag       : settings.dialogDraggable,
                lockScreen : settings.dialogLockScreen,
                maskStyle  : {
                    opacity         : settings.dialogMaskOpacity,
                    backgroundColor : settings.dialogMaskBgColor
                },
                buttons    : {
                    enter  : [lang.buttons.enter, function() {

                        return false;
                    }],

                    cancel : [lang.buttons.cancel, function() {

                        return false;
                    }]
                }
            });

            $('.' + prefix + 'item').each(function (index, item) {
                var domName = '.' + prefix + 'content';
                var domEle = $(this).find(domName).first();
                var domText = domEle.text();
                domEle.text('');
                editormd.markdownToHTML(domEle, {
                    markdown: domText,
                });
            });

            $('.'+ className).bind(exports.mouseOrTouch("click", "touchend"), operate);
        };

    };
    
    // CommonJS/Node.js
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    { 
        module.exports = factory;
    }
    else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
        if (define.amd) { // for Require.js

            define(["editormd"], function(editormd) {
                factory(editormd);
            });

        } else { // for Sea.js
            define(function(require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
        }
    } 
    else
    {
        factory(window.editormd);
    }

})();
