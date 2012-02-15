
var beanpoll = require('beanpoll'),
router       = beanpoll.router(),
fig          = require('fig');

fig.views.IndexView = fig.views.Template.extend({
	
	tpl: '/index.html'

});

fig.views.TestView = fig.views.View.extend({

	el: '#page',
	
	'override render': function() {
		this._super();

		this.$$(this.el).html('You are home!');
	}
});



router.on({
	
	/** 
	 */

	'pull -method=GET view -> home OR /': function(req, res) {
		console.log("HOME")
		req.addView(new fig.views.IndexView());

		if(!this.next()) {
			req.display();
		}
	},

	/**
	 */

	'pull -method=GET home -> view -> contact': function(req, res) {
		console.log("CONTACT")
		req.addView(new fig.views.TestView());
	},

	/**
	 */

	'push fig': function(fig) {
		
	}
});





function onReady() {
	router.push('init');
}

if(typeof $ != 'undefined') {
	$(document).ready(onReady);
} else {
	onReady();
}
