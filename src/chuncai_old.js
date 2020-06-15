;(function ($, document) {
    var Drag = function ($ele, $wrap, callback) {
        if (!$wrap) $wrap = $ele;
        var canDrag, sPos;
        $ele.mousedown(function (e) {
            canDrag = true;
            sPos = mousePos(e);
        });
        $(document).mouseup(function () {
            canDrag = false;
        }).mousemove(function (e) {
            if (!canDrag) return;
            var nPos = mousePos(e),  //当前位置
                offsetPos = { x: nPos.x - sPos.x, y: nPos.y - sPos.y }; //偏移量
            sPos = nPos;
            $wrap.css({
                left: ("+=" + offsetPos.x + "px").replace("+=-", "-="),
                top: ("+=" + offsetPos.y + "px").replace("+=-", "-="),
                position: "fixed"
            });
            callback && callback($wrap.css("left"), $wrap.css("top"));
        });
    };

    function mousePos(event) {
        var e = event || window.event;
        return { x: e.clientX, y: e.clientY };
    }
    $.drag = Drag;

})(jQuery, document);
$.fn.will = function (callback, type) {
    return this.queue(type || "fx", function (next) {
        callback.call(this);
        next();
    });
};
(function ($) {
    if (!$.drag) return;

    $.chuncai = function (option) {
        var defaults = {
            menu: {
                "key": "你想要做什么呢？",
                "显示公告": function () {
                    this.dynamicSay(this.opt.words[0]);
                },
                "存活时间": function () {
                    this.dynamicSay("咱已经和主人共同度过了 " + Math.floor((+new Date - 1456998485780) / (1000 * 60 * 60 * 24)) + "天 的人生了哦~   我是不是很棒呢~");
                },
                "拍打喂食": {
                    "key": "要来点什么呢？",
                    "小饼干": "嗷呜~ 多谢款待  >ω<",
                    "胡萝卜": "人家又不是小兔子 QwQ",
                    "秋刀鱼": "大哥哥这是什么？呀！好长！诶？！好滑哦(๑• . •๑)！阿呜～",
                    "胖次": "哇~ 好可爱的胖次~~~",
                    "淡定红茶": "喝完了，ˊ_>ˋ和我签订契约成为淡定少女吧！"
                },
                "传送门": {
                    "博客园": function () {
                        window.open("http://www.cnblogs.com");
                    },
                    "My博客园主页": function () {
                        window.open("http://www.cnblogs.com/lianmin");
                    },
                    "个人博客": function () {
                        window.open("http://www.wqnmlgbd.net");
                    }
                },
                "隐藏春菜": function () {
                    this.hide();
                }
            },
            words: ["为了我们和大家的持续发展，请不要对本站进行任何和谐行为(灬ºωº灬)",
                "咦你想做什么 oAo",
                "「不要啊」你以为我会这么说么噗噗~",
                "一起组团烧烤秋刀鱼",
                "白日依山尽，黄河入海流，欲穷千里目，更上 .. .. 一层楼?",
                "啊啦今天想吃点什么呢~",
                "据说点赞的都找到女朋友了~"]
        };
        option && $.extend(defaults.menu, option.more);
        return new Chuncai($.extend({}, defaults, option));
    };

    function Chuncai(option) {
        this.opt = option;
        this.inIt();
    }

    Chuncai.prototype = {
        inIt: function () {
            this.fill();
            $.drag(this.ele.children(".chuncai-face"), this.ele, this.savePos);  //可移动  
           
            this.bindMenuEvents(); //菜单事件绑定
            this.show();
        },
        fill: function () {   //填充dom元素
            $('<a class="chuncai-zhaohuan" href="javascript:;">召唤春菜</a>').appendTo($("body"));


            var content =
                '<div class="chuncai-main">' +
                '<div class="chuncai-face chuncai-face-00">' +
                '<div class="chuncai-face-eye"></div>' +
                '</div>' +
                '<div class="chuncai-chat">' +
                '<div class="chuncai-word"></div>' +
                '<div class="chuncai-menu"></div>' +
                '<div class="chuncai-menu-btn">menu</div>' +
                '</div>' +
                '</div>';
            this.ele = $(content);
            $("body").append(this.ele);   //添加元素          
        },
        show: function () {
            if (sessionStorage["chuncai"]) {   //从storage中获取位置
                var pos = JSON.parse(sessionStorage["chuncai"]);
                this.ele.css({
                    left: pos.x,
                    top: pos.y
                });
            }
            var self = this;
            self.ele.find(".chuncai-word").empty();
            this.ele.fadeIn().will(function () {
                self.freeSay(1); //开始说闲话                
            });
            $(".chuncai-zhaohuan").hide();
        },
        hide: function () {
            this.dynamicSay("记得叫我出来哦~");
            this.ele.delay(1000).fadeOut().will(function () {
                $(".chuncai-zhaohuan").show();
            });
        },
        freeSay: function (ifFirst) {   //开启说闲话模式
            var self = this;
            clearInterval(this.freeSayTimer);
            if (ifFirst) {
                self.dynamicSay(self.opt.words[Math.floor(Math.random() * self.opt.words.length)]);
                self.ele.find(".chuncai-face").attr("class", "chuncai-face chuncai-face-0" + Math.floor(Math.random() * 3));
            }
            this.freeSayTimer = setInterval(function () {
                self.ele.find(".chuncai-menu").slideUp();
                self.dynamicSay(self.opt.words[Math.floor(Math.random() * self.opt.words.length)]);
                self.ele.find(".chuncai-face").attr("class", "chuncai-face chuncai-face-0" + Math.floor(Math.random() * 3));
            }, 10000);
        },
        bindMenuEvents: function () {  //菜单事件
            var self = this, opt = this.opt, menu = self.ele.find(".chuncai-menu");
            self.ele.find(".chuncai-menu-btn").click(function () {
                var btn = $(this),
                    ifOn = !!self.menuOn; //是否已开启菜单
                self.menuOn = !ifOn;
                if (ifOn) self.closeMenu(1);
                else {
                    self.fillMenu(opt.menu);
                    menu.slideDown();
                }
            });
            $(".chuncai-zhaohuan").click(function () {
                self.show();
            });
        },
        closeMenu: function (first) {           //关闭菜单 
            this.ele.find(".chuncai-menu").slideUp();
            this.menuOn = false;
            this.freeSay(first);
        },
        fillMenu: function (obj) {        //填充菜单
            clearInterval(this.freeSayTimer);   //停止说闲话
            clearTimeout(this.menuTimer);    //闲置统计时
            var self = this;
            this.menuTimer = setTimeout(function () {
                self.menuOn && self.closeMenu(1);
            }, 10000);

            var type = $.type(obj);

            var dict = {
                "string": function () {   //直接输出文字
                    this.dynamicSay(obj);
                    this.closeMenu();
                },
                "function": function () {  //执行函数
                    obj.call(this);
                    this.closeMenu();
                },
                "object": function () {  //填充
                    var menu = this.ele.find(".chuncai-menu"), self = this;
                    menu.slideUp().will(function () {
                        menu.empty();
                        $.each(obj, function (k, v) {
                            if (k == "key") {
                                self.dynamicSay(v);
                                return true;
                            }
                            var item = $('<a>' + k + '</a>').click(function () {
                                self.fillMenu(v);  //递归填充菜单
                            });
                            menu.append(item);
                        });
                    }).slideDown();
                }
            };
            dict[type] && dict[type].call(this);
        },
        dynamicSay: function (word) {   //动态输入文字
            this.ele.stop(true, false);
            var wordBox = this.ele.find(".chuncai-word"), self = this;
            for (var i = 0, len = word.length; i < len; i++) {
                (function (index) {
                    self.ele.will(function () {
                        wordBox.html(word.substr(0, index + 1));
                    }).delay(100);
                })(i);
            }
        },
        savePos: function (x, y) {   //函数节流保存位置
            clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(function () {
                sessionStorage["chuncai"] = JSON.stringify({ x: x, y: y });
            }, 500);
        }
    };
})(jQuery);
