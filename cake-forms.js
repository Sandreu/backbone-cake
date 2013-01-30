
//TWITTER BOOTSTRAP TEMPLATES
//Requires Bootstrap 2.x
Backbone.Form.setTemplates({

    //HTML
    form: '\
        <form class="form-horizontal">{{fieldsets}}</form>\
    ',

    fieldset: '\
        <fieldset>\
        <legend>{{legend}}</legend>\
        {{fields}}\
        </fieldset>\
    ',

    field: '\
        <div class="control-group field-{{key}}">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
        {{editor}}\
        <div class="help-inline">{{error}}</div>\
        </div>\
        </div>\
    ',

    naked: '\
        <span class="field-{{key}}">\
        <label for="{{id}}">{{title}}</label>\
        {{editor}}\
        <div class="help-inline">{{error}}</div>\
        </span>\
    ',

    checkbox : '\
        <div class="control-group field-{{key}}">\
            <div class="controls">\
                <input type="hidden" name="{{key}}" value="0" />\
                <label class="checkbox" for="{{id}}">\
                {{editor}}\
                {{title}}\
                <div class="help-inline">{{error}}</div>\
                </label>\
            </div>\
        </div>\
    ',

    nestedField: '\
        <div class="field-{{key}}">\
            <div title="{{title}}" class="input-xlarge">{{editor}}\
                <div class="help-inline">{{error}}</div>\
            </div>\
        </div>\
    ',

    list: '\
        <div class="bbf-list">\
            <ul class="unstyled clearfix">{{items}}</ul>\
            <button class="btn bbf-add" data-action="add">Add</button>\
        </div>\
    ',

    listItem: '\
        <li class="clearfix">\
            <div class="pull-left">{{editor}}</div>\
            <button type="button" class="btn bbf-del" data-action="remove">&times;</button>\
        </li>\
    ',

    'list.Modal': '\
        <div class="bbf-list-modal">\
            {{summary}}\
        </div>\
    '
    }, {

    //CLASSNAMES
    error: 'error' //Set on the field tag when validation fails
});


/******************************************************************************
*
* Editor defs
* 
******************************************************************************/

Backbone.Form.editors.Date = Backbone.Form.editors.Text.extend({
    picker : 'date',
    render: function() {
        this.setValue(this.value);
        this.$el.attr('data-picker', this.picker);
        return this;
    }
});

Backbone.Form.editors.DateTime = Backbone.Form.editors.Date.extend({
    picker : 'datetime'
});

Backbone.Form.editors.Radio = Backbone.Form.editors.Radio.extend({
    tagName : 'div',
    events: {
        'change input[type=radio]:checked': function() {
        this.trigger('change', this);
    },
    'focus input[type=radio]': function() {
        if (this.hasFocus) return;
        this.trigger('focus', this);
    },
    'blur input[type=radio]': function() {
        if (!this.hasFocus) return;
        var self = this;
        setTimeout(function() {
            if (self.$('input[type=radio]:focus')[0]) return;
            self.trigger('blur', self);
        }, 0);
        }
    },
    _arrayToHtml: function(array) {
        var html = [];
        var self = this;

        //Generate HTML
        _.each(array, function(option, index) {
            if (!_.isObject(option)) {
                option = {
                    val: option,
                    label: option
                }
            }
            option.val = (option.val || option.val === 0) ? option.val : '';
            var item = '<label class="radio">';
            item += '<input type="radio" name="'+self.id+'" id="'+self.id+'-'+index+'" value="'+option.val+'">'
            item += '<span class="label-'+index+'">' + option.label + '</span>';
            item += '</label>';
            html.push(item);
        });

        return html.join('');
    }
});


Backbone.Form.editors.RadioBtns = Backbone.Form.editors.Select.extend({
    tagName : 'div',

    events: {
        'change input': function(event) {
            this.trigger('change', this);
        },
        'focus button':  function(event) {
            this.trigger('focus', this);
        },
        'blur button':   function(event) {
            this.trigger('blur', this);
        }
    },

    initialize: function(options) {
        Backbone.Form.editors.Select.prototype.initialize.call(this, options);

        this.$el.removeAttr('name');
        //this.$el.removeAttr('id');
    },

    getValue: function() {
        return this.$('input').val();
    },

    setValue: function(value) {
        var $input = this.$('input');
        $input.val(value);
        $input.trigger('change');
        return $input;
    },

    focus: function() {
        if (this.hasFocus) return;

        this.$('button:first').focus();
    },

    blur: function() {
        if (!this.hasFocus) return;

        this.$('button:focus').blur();
    },

    _arrayToHtml: function(array) {
        var html = ['<input type="hidden" name="'+this.getName()+'" id="'+this.id+'-f">'];
        var self = this;

        html.push('<div class="btn-group" data-toggle="buttons-radio" data-target="#'+this.id+'-f">');
        //Generate HTML
        _.each(array, function(option, index) {
            if (!_.isObject(option)) {
                option = {
                    val: option,
                    label: option
                }
            }
            option.val = (option.val || option.val === 0) ? option.val : '';
            var item = '<button id="'+self.id+'-'+index+'" class="btn label-'+index+'" data-value="'+option.val+'" type="button">'+option.label+'</button>';
            html.push(item);
        });

        html.push('</div>');

        return html.join('');
    }
});


/******************************************************************************
*
* Modal Form
* 
******************************************************************************/
Backbone.ModalForm = Backbone.CakeView.extend({
    title : 'Titre',
    okText : 'Sauvegarder',
    cancelText : 'Retour',
    extraButtons : {},
    _modal : false,
    _form : false,
    manage: false,
    originalDatas : {},
    loadModal : function () {
        var modal = new Backbone.BootstrapModal({
            title : this.title,
            okText : this.okText,
            cancelText: this.cancelText,
            content:this._form
        });
        modal.render();

        if (!_.isEmpty(this.extraButtons)) {
          var tmpl = _.template('<a href="javascript:void(0);" class="btn btn-{{type}}">{{title}}</a>'),
            self = this;
          _.each(this.extraButtons, function (props) {
            var btn = $(tmpl(props));
            btn.on('click', $.proxy(self[props.click], self));
            if (isset(props.pos) && props.pos == 'after') modal.$('.modal-footer').append(btn);
            else if (isset(props.pos) && props.pos == 'between') modal.$('.ok').before(btn);
            else modal.$('.modal-footer').prepend(btn);
          });
        }

        modal.on('shown', this.setFocus, this);
        modal.on('cancel', this.canceled, this);
        modal.on('ok', this.commit, this);

        this._modal = modal;
    },
    setFocus : function () {
        var input = this.$('input').first();
        input.focus();
        if (this.model.isNew()) input.select();
    },
    initialize : function (options) {
        if (isset(options.title)) this.title = options.title;

        this.loadModal();
        this.$el = this._modal.$el;

        this.$el.on('submit', 'form', $.proxy(this.commit, this));

        this._modal.on('hidden', this.onHidden, this);
        _.bindAll(this);
    },
    onHidden : function () {
        this.model.off(null, null, this);
        this._form.off(null, null, this);
    },
    loadForm : function () {
        var form = new Backbone.Form({
            model : this.model
        });
        form.render();

        this.$('.modal-body').html(form.$el);

        this._form = form;
    },
    render : function () {
        this.originalDatas = this.model.toJSON();
        this.model.on('destroy', this.destroyed, this);

        if (this._form) {
            this._form.off();
            this._form.remove();
            delete this._form;
        }
        this.loadForm();

        this.$el.appendTo('body');
        this._form.$el.trigger('beautifier');

        this.initForm();

        this._modal.open();

        return this;
    },
    initForm : function () {},
    commit : function (e) {
        if (isset(e)) e.preventDefault();
        var a = this._form.commit(),
            self = this;
        if (!isset(a)) {
            this.model.save({}, {
                success : function () { self._modal.close(); },
                error : function (model, xhr) {
                    var data = eval('(' + xhr.responseText + ')');
                    if (isset(data)) {
                        if (isset(data.val_errors)) {
                            var msg_errors = '';
                            _.each(data.val_errors, function (val, key) {
                                if (isset(self._form.fields[key])) self._form.fields[key].setError(val[0]);
                                else msg_errors += val[0] + '<br />';
                            });
                            if (msg_errors!=='') message('error', 'Erreur lors de la sauvegarde');
                        }
                    } else {
                        message('error', 'Erreur lors de la requette')
                    }
                }
            });
        }
    },
    canceled : function () {
        if (this.model.isNew()) {
            this.model.destroy();
        } else {
            this.model.set(this.originalDatas);
        }
    },
    destroyed : function () {
        this._modal.close();
    }
});