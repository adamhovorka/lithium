(function() {
        function $(x) { return document.getElementById(x); };

	var canvas = $("out");
	LI.init(canvas);
	//setInterval(function() { world.render(); }, 1000/30);

	$("in").onkeyup = function() { LI.test($("in").value); };
	LI.test($("in").value);
})();
