
Backbone.CakeView = Backbone.View.extend({
    setFromForm: function (form, model) {
        var data = form.serializeArray(),
            error = false;

        if (!isset(model)) model = this.model;

        $.each(data, function () {
            if (!model.set(this.name, this.value)) {
                fields.filter('[name='+this.name+']').parent().addClass('error');
                error = true;
            }
        });
        return !error;
    },
    fill: function () {
        this.$(':input').each($.proxy(function (i, elt) {
            var $elt = $(elt);
            if ($elt.attr('type')=='hidden') {
                if (this.$(':input[name='+$elt.attr('name')+'][type=checkbox]').length) return;
            }
            $elt.val(this.model.get($elt.attr('name')));
        }, this));
    },
    loading: function (btn) {
        this.$el.loading();
        if (!isset(btn)) btn = this.$('[type=submit]');
        if (isset(btn) && btn.hasClass('btn')) {
            if (!btn.data('loading-text')) btn.data('loading-text', 'En cours...');
            btn.button('loading');
        }
    },
    loaded: function (btn) {
        this.$el.loaded();
        if (!isset(btn)) btn = this.$('[type=submit]');
        if (isset(btn) && btn.hasClass('btn')) btn.button('reset');
    },
    save: function (e) {
        if (isset(e)) e.preventDefault();

        if (this.setFromForm(this.$('form'), this.model)) {
          this.simple_save();
        }
        return true;
    },
    simple_save: function () {
        var opts  = {};

        this.loading();
        opts.success = $.proxy(function () {
            if (isset(this.saved))  this.saved();
            this.loaded();
            //this.model.trigger('saved', this.model);
        }, this);
        opts.error = $.proxy(function () {
            this.loaded();
        }, this);
        
        this.model.save({}, opts);
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.trigger('beautifier');

        return this;
    },
    destroy : function () {
        this.$('[rel=tooltip]').trigger('mouseleave');
        this.remove();
        this.off();
        if (isset(this.model)) this.model.off(null, null, this);
        if (isset(this.collection)) this.collection.off(null, null, this);
    }
});