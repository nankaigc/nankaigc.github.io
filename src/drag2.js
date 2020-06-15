function drap2($ele,$wrap,callback){
	if (!$wrap) $wrap = $ele;
    var  sPos,nPos;
	$ele.on('touchstart',function(e) {
		sPos = e.originalEvent.touches[0];
	});
	$ele.bind('touchmove',function(e){
		e.preventDefault();
		var nPos =  e.originalEvent.touches[0];
		$wrap.css({
            left: (nPos.pageX-40),
            top: (nPos.pageY-70),
            position: "fixed"
        });

	});
}
module.exports = drap2;