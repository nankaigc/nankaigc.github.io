var drag = require('./drag');
var drag2 = require('./drag2');
var $ = require('jquery');
const TULING_ALL = 0;
const TULING_JOKE = 1;
const TULING_STORY = 2;
const TALK_TYPE = 1;
const NOTALK_TYPE = 0;

const MIN_INTERVAL = 36;

$.fn.will = function(callback, type) {
    return this.queue(type || "fx", function(next) {
        callback.call(this);
        next();
    });
};

class Chuncai {
    constructor(option) {
        this.opt = option;
        this.init();
    }

    init() {
        this.fill();
        this.posttuling(TULING_ALL);
        drag(this.ele.children(".chuncai-face"), this.ele, this.savePos.bind(this)); //pc端绑定拖拽
        drag2(this.ele.children(".chuncai-face"), this.ele, this.savePos.bind(this)); //移动端绑定拖拽
        this.bindMenuEvents(); //菜单事件绑定
        this.bindTalkEvents();
        this.show();
    }

    posttuling(type) {
        var self = this;
        if (type === TULING_ALL) {
            $.post("http://www.tuling123.com/openapi/api", {
                    key: self.opt.tuling.key,
                    info: "讲个笑话吧",
                    userid: self.opt.tuling.userid
                },
                function(data, status) {
                    if (status == 'success') {
                        self.opt.words.push(data.text);
                        self.opt.jokepos = self.opt.words.length - 1;
                    }
                }
            );
            $.post("http://www.tuling123.com/openapi/api", {
                    key: self.opt.tuling.key,
                    info: "讲个故事吧",
                    userid: self.opt.tuling.userid
                },
                function(data, status) {
                    if (status == 'success') {
                        self.opt.words.push(data.text);
                        self.opt.storypos = self.opt.words.length - 1;
                    }
                }
            );
        } else if (type == TULING_JOKE) {
            $.post("http://www.tuling123.com/openapi/api", {
                    key: self.opt.tuling.key,
                    info: "讲个笑话吧",
                    userid: self.opt.tuling.userid
                },
                function(data, status) {
                    if (status == 'success') {
                        self.opt.words[self.opt.jokepos] = data.text;
                    }
                }
            );
        } else if (type == TULING_STORY) {
            $.post("http://www.tuling123.com/openapi/api", {
                    key: self.opt.tuling.key,
                    info: "讲个故事吧",
                    userid: self.opt.tuling.userid
                },
                function(data, status) {
                    if (status == 'success') {
                        self.opt.words[self.opt.storypos] = data.text;
                    }
                }
            );
        }
    }

    fill() { //填充dom元素
        $('<a class="chuncai-zhaohuan" href="javascript:;">召唤春菜</a>').appendTo($("body"));


        var content = `
            <div class="chuncai-main">
                <div class="chuncai-face chuncai-face-00">
                    <div class="chuncai-face-eye"></div>
                </div>
                <div class="chuncai-input">
                    <input class="chuncai-talk" type="text" value="" />
                    <input class="chuncai-talkto" type="button" value=" "/>
                </div>
                <div class="chuncai-chat">
                    <div class="chuncai-word"></div>
                    <div class="chuncai-menu"></div>
                    <div class="chuncai-menu-btn">menu</div>
                </div>
            </div>`;

        this.ele = $(content);
        $("body").append(this.ele); //添加元素          
    }

    show() {
        if (sessionStorage["chuncai"]) { //从storage中获取位置
            var pos = JSON.parse(sessionStorage["chuncai"]);
            this.ele.css({
                left: pos.x,
                top: pos.y
            });
        }
        var self = this;
        self.ele.find(".chuncai-word").empty();
        this.ele.fadeIn().will(function() {
            self.freeSay(1); //开始说闲话                
        });
        $(".chuncai-zhaohuan").hide();
    }

    hide() {
        this.dynamicSay("记得叫我出来哦~");
        this.ele.delay(1000).fadeOut().will(function() {
            $(".chuncai-zhaohuan").show();
        });
    }

    freeSay(ifFirst) { //开启说闲话模式
        var self = this;
        clearInterval(this.freeSayTimer);
        if (ifFirst) {
            self.dynamicSay(self.opt.syswords[0]);
            self.ele.find(".chuncai-face").attr("class", "chuncai-face chuncai-face-0" + Math.floor(Math.random() * 3));
        }
        this.freeSayTimer = setInterval(function() {
            if (self.allowswitchword) {
                self.ele.find(".chuncai-menu").slideUp();
                var pos = Math.floor(Math.random() * self.opt.words.length);
                self.dynamicSay(self.opt.words[pos]);
                if (pos == self.opt.jokepos) {
                    self.posttuling(TULING_JOKE);
                } else if (pos == self.opt.storypos) {
                    self.posttuling(TULING_STORY);
                }
                self.ele.find(".chuncai-face").attr("class", "chuncai-face chuncai-face-0" + Math.floor(Math.random() * 3));
            }
        }, 10000);
    }

    bindMenuEvents() { //菜单事件
        var self = this,
            opt = this.opt,
            menu = self.ele.find(".chuncai-menu");
        self.ele.find(".chuncai-menu-btn").click(function() {
            var btn = $(this),
                ifOn = !!self.menuOn; //是否已开启菜单
            self.menuOn = !ifOn;
            if (ifOn) self.closeMenu(1);
            else {
                self.fillMenu(opt.menu);
                menu.slideDown();
            }
            self.ele.find(".chuncai-input").slideUp(); //关闭对话框
        });
        $(".chuncai-zhaohuan").click(function() {
            self.show();
        });
    }

    bindTalkEvents() {
        var self = this;
        var talk = this.ele.find(".chuncai-talk");
        talk.keypress(function(event) {
            if (event.keyCode == 13) {
                self.ele.find(".chuncai-talkto").click();
            }
        });
        this.ele.find(".chuncai-talkto").click(function() {
            self.menuOn && self.closeMenu(NOTALK_TYPE);
            $.post("http://www.tuling123.com/openapi/api", {
                    key: self.opt.tuling.key,
                    info: talk.val(),
                    userid: self.opt.tuling.userid
                },
                function(data, status) {
                    if (status == 'success') {
                        self.dynamicSay(data.text);
                    }
                    talk.val("");
                }
            );
        });
    }

    closeMenu(first, obj) { //关闭菜单 
        this.ele.find(".chuncai-menu").slideUp();
        this.menuOn = false;
        if (obj === TALK_TYPE) {
            this.dynamicSay(this.opt.syswords[2]);
        } else if (obj === NOTALK_TYPE) {

        } else {
            this.freeSay(first);
        }

    }

    fillMenu(obj) { //填充菜单
        clearInterval(this.freeSayTimer); //停止说闲话
        clearTimeout(this.menuTimer); //闲置统计时
        var self = this;
        this.menuTimer = setTimeout(function() {
            self.menuOn && self.closeMenu(1, obj);
        }, 10000);

        var type = $.type(obj);

        var dict = {
            "number": function() {
                if (obj == TALK_TYPE) {
                    this.dynamicSay(this.opt.syswords[1]);
                    this.ele.find(".chuncai-input").slideDown();
                }
            },
            "string": function() { //直接输出文字
                this.dynamicSay(obj);
                this.closeMenu();
            },
            "function": function() { //执行函数
                obj.call(this);
                this.closeMenu();
            },
            "object": function() { //填充
                var menu = this.ele.find(".chuncai-menu"),
                    self = this;
                menu.slideUp().will(function() {
                    menu.empty();
                    $.each(obj, function(k, v) {
                        if (k == "key") {
                            self.dynamicSay(v);
                            return true;
                        }
                        var item = $(`<a>${k}</a>`).click(function() {
                            self.fillMenu(v); //递归填充菜单
                        });
                        menu.append(item);
                    });
                }).slideDown();
            }
        };
        dict[type] && dict[type].call(this);
    }

    dynamicSay(word) { //动态输入文字
        this.allowswitchword = false;
        this.ele.stop(true, false);
        var wordBox = this.ele.find(".chuncai-word"),
            self = this;
        var input = this.ele.find(".chuncai-input");

        for (let i = 0, len = word.length; i < len; i++) {
            self.ele.will(function() {
                wordBox.html(word.substr(0, i + 1));

                // var bottom = wordBox.outerHeight() + wordBox.offset().top;
                // var top = input.offset().top;

                if (i == len - 1) { self.allowswitchword = true; }
            }).delay(100);
        }
    }

    savePos(x, y) { //函数节流保存位置
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(function() {
            sessionStorage["chuncai"] = JSON.stringify({ x: x, y: y });
        }, 2000);
    }
}

module.exports = Chuncai;