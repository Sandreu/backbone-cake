Backbone.Paginator.View = Backbone.CakeView.extend({
	className: 'pagination pull-right',
	events: {
		'click a.servernext': 'nextResultPage',
		'click a.serverprevious': 'previousResultPage',
		'click a.orderUpdate': 'updateSortBy',
		'click a.serverlast': 'gotoLast',
		'click a.page': 'gotoPage',
		'click a.serverfirst': 'gotoFirst',
		'click a.serverpage': 'gotoPage',
		'click .serverhowmany a': 'changeCount'

	},


	initialize: function () {
		this.collection.on('reset', this.render, this);
		//this.collection.on('change', this.render, this);
	},

	// render: function () {
	// 	// var html = this.template(this.collection.info());
	// 	// this.$el.html(html);
	// },

	updateSortBy: function (e) {
		e.preventDefault();
		var currentSort = $('#sortByField').val();
		this.collection.updateOrder(currentSort);
	},

	nextResultPage: function (e) {
		e.preventDefault();
		this.collection.requestNextPage();
	},

	previousResultPage: function (e) {
		e.preventDefault();
		this.collection.requestPreviousPage();
	},

	gotoFirst: function (e) {
		e.preventDefault();
		this.collection.goTo(this.collection.information.firstPage);
	},

	gotoLast: function (e) {
		e.preventDefault();
		this.collection.goTo(this.collection.information.lastPage);
	},

	gotoPage: function (e) {
		e.preventDefault();
		var page = $(e.target).text();
		this.collection.goTo(page);
	},

	changeCount: function (e) {
		e.preventDefault();
		var per = $(e.target).text();
		this.collection.howManyPer(per);
	},
	render: function () {
		this.$el.empty();

		var $ul = $('<ul>').appendTo(this.$el);

		var ui = this.collection.info();
		
		$ul.append('<li><a href="#" class="serverprevious">«</a></li>');
		if (ui.currentPage <= ui.firstPage) {
			this.$('.serverprevious').parent().addClass('disabled');
		}
		
		_.each(ui.pageSet, function (p) {
			var $li = $('<li><a href="#" class="page">' + p + '</a></li>').appendTo($ul);
			if (p == ui.currentPage) $li.addClass('active');
		});

		$ul.append('<li><a href="#" class="servernext">»</a></li>');
		if (ui.currentPage >= ui.totalPages) {
			this.$('.servernext').parent().addClass('disabled');
		}

		return this;
	}
});

Backbone.CakeRow = Backbone.CakeView.extend({
	tagName: 'tr',
	className: 'entity',
	cols : false,
	buttons: false,
	parent: false,
	initialize: function (options) {
		this.parent = options.parent_view;

		this.cols = this.parent.cols;
		this.buttons = this.parent.buttons;
		this.model.on('saved', this.render, this);
		this.model.on('destroy', this.destroy, this);
	},
	render: function () {
		this.$el.empty();
		this.$el.attr('data-id', this.model.get('id'));

		_.each(this.cols, function (options, label) {
			if (_.isString(options)) options = {field: options};
			var $td = $('<td>').appendTo(this.$el);
			if (isset(options.view)) {
				var view_opts = {};
				view_opts[options.param] = this.model.get(options.field);
				var view = new options.view(view_opts);
				view.$el.appendTo($td);
				view.render();
			} else if (isset(options.content)) {
				if (_.isFunction(options.content)) {
					var content = options.content.call(this.parent, options, this.model);
					$td.append(content);
				} else if (_.isString(options.content)) {
					$td.append(options.content);
				}
			} else {
				$td.text(this.model.get(options.field));
			}
			if (isset(options.css)) $td.css(options.css);
		}, this);

		if (this.buttons.length > 0) {
			var width = this.buttons.length * 20 + 10;
			var $btns = $('<td class="actions">').css({
				width: width + 'px'
			});
			_.each(this.buttons, function (options) {
				var a = $('<a href="javascript:void(0);"></a>').appendTo($btns).attr({
					rel: 'tooltip',
					title: options.label,
					'class': options.className
				});
				a.html('<i class="icon-'+options.icon+'"></i>');
			}, this);
			$btns.appendTo(this.$el);
		}

		this.$('[rel=tooltip]').tooltip();
		return this;
	}
});

Backbone.CakeTable = Backbone.CakeView.extend({
	title : 'Titre',
	cols : {
		'Nom' : 'name'
	},
	buttons: [
		{
			icon : 'edit',
			className: 'edit',
			label : 'Modifier'
		},
		{
			icon : 'trash',
			className: 'delete',
			label : 'Supprimer'
		}
	],
	tagName: 'table',
	className: 'table table-condensed table-hover',
	events: {
		'click .edit' : 'row_edit',
		'click .new' : 'row_create',
		'click .delete' : 'row_delete'
	},
	modal: Backbone.ModalForm,
	initialize : function () {
		if (_.isFunction(this.cols)) this.cols = this.cols.call(this);

		if (this)
		this.modal = new this.modal({
			title: this.title
		});
		this.collection.on('saved', this.newRow, this);
		this.collection.on('reset', this.render, this);
	},
	row_create : function () {
		var model = new this.collection.model();
		this.collection.add(model);
		this.modal.model = model;
		this.modal.render();
	},
	row_edit : function (e) {
		var $target = $(e.currentTarget);
		var id = $target.parents('.entity').attr('data-id');

		this.modal.model = this.collection.get(id);
		this.modal.render();
	},
	row_delete: function (e) {
		var $target = $(e.currentTarget);
		var id = $target.parents('.entity').attr('data-id');

		this.collection.get(id).destroy();
	},
	el_head: function () {
		var $el = $('<thead>');
		var $tr = $('<tr>');
		$el.append($tr);
		_.each(this.cols, function (options, label) {
			if (_.isString(options)) options = {field: options};
			var $tag = $('<th>').appendTo($tr);
			if (!isset(options.no_title)) $tag.html(label);
		});
		if (this.buttons.length > 0) {
			var $th = $('<th>').appendTo($tr);
		}
		return $el;
	},
	el_body: function () {
		var $el = $('<tbody>');
		this.collection.forEach(function (model) {
			$el.append(this.el_row(model));
		}, this);
		return $el;
	},
	el_foot: function () {
		var $el = $('<tfoot>');
		var $tr = $('<tr>').appendTo($el);
		var $td = $('<td>').appendTo($tr).attr({
			colspan: _.keys(this.cols).length + (this.buttons.length === 0 ? 0 : 1)
		});
		var $a =  $('<a>').appendTo($td).attr({
			href: 'javascript:void(0);',
			'class': 'btn btn-primary new'
		});
		$a.append('<i class="icon-white icon-plus"></i> Nouveau');

		if (this.collection instanceof Backbone.Paginator.requestPager) {
			var view = new Backbone.Paginator.View({
				collection : this.collection
			});
			$td.append(view.$el);
			view.render();
		}

		return $el;
	},
	el_row: function (model) {
		var view = new Backbone.CakeRow({
			model: model,
			parent_view: this
		});
		view.render();
		return view.$el;
	},
	newRow: function (model) {
		if (this.$('[data-id='+model.get('id')+']').length === 0) {
			var $el = this.el_row(model);
			$el.appendTo(this.$('>tbody'));
		}
	},
	render : function () {
		this.$el.empty();

		this.$el.append(this.el_head());
		this.$el.append(this.el_body());
		this.$el.append(this.el_foot());

		return this;
	}
});