module.exports = function(fig) {
		
	var views = fig.views;


	views.IndexView = views.Template.extend({
		
		tpl: '/index.html'
	});


	views.HelloView = views.View.extend({
		
		'override render': function() {
			this._super();

			this.$$(this.el).html('html!');
		}
	});

	return views;
}