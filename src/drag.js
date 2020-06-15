function drap($ele, $wrap, callback) {
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

module.exports = drap;