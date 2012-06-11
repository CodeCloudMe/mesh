var tq = require("tq");


module.exports = {
	"def for": {
		"params": {
			"each": true,
			"run": true
		},
		"run": run
	}
};


function run(target, next) {

	var each = target.data.each,
	run      = target.data.run,
	key      = target.data.key || "key",
	value    = target.data.value || "value",
	parser   = target.parser,
	queue    = tq.queue();

	function onValue(k, v) {

		var tg = target.clone();
		tg.data[key] = k;
		tg.data[value] = v;

		queue.push(function() {
			parser.run(run, tg, this);
		});
	}	


	if(each instanceof Array) {
		for(var i = 0, n = each.length; i < n; i++) {
			onValue(i, each[i]);
		}
	} else {
		for(var k in each) {
			onValue(k, each[k]);
		}
	}

	queue.push(next);
	queue.start();
}