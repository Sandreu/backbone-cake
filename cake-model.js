
Backbone.CakeModel = Backbone.RelationalModel.extend({
    cakeModel: false,
    cakeController: false,
    rest : true,
    urlRoot: function () {
        if (_.isString(this.cakeController)) return app.root + this.cakeController + '/rest';
        return false;
    },
    sync: function () {
        var app = require('app');
        if (!this.rest) return true;
        return Backbone.sync.apply(this, arguments);
    },
    set: function( key, value, options ) {

        // Duplicate backbone's behavior to allow separate key/value parameters, instead of a single 'attributes' object
        var attributes;
        if (_.isObject( key ) || key == null) {
            attributes = key;
            options = value;
        }
        else {
            attributes = {};
            attributes[ key ] = value;
        }

        var new_attributes = {};
        if (this.cakeModel && isset(attributes[this.cakeModel])) { 
            _.each(attributes, function (val, key) { if (key != this.cakeModel) new_attributes[key] = val; }, this);
            _.extend(new_attributes, attributes[this.cakeModel]);
        } else {
            new_attributes = attributes;
        }
        return Backbone.RelationalModel.prototype.set.call(this, new_attributes, options);
    },
    save: function () {
      var ajax = Backbone.RelationalModel.prototype.save.apply(this, arguments);
      if (!ajax) return ajax;
      else return ajax.success($.proxy(function (data) { this.trigger('saved', this, data); }, this));
    },
    parse: function (response) {
      if (isset(response.data)) return response.data;
      else return response;
    }
});


if (!_.isUndefined(Backbone.Store)) {
    var _original = Backbone.Store.prototype.resolveIdForItem;

    Backbone.Store.prototype.resolveIdForItem = function( type, item ) {
        if (!_.isEmpty(type.prototype.cakeModel) && item) {
            if (!_.isEmpty(item[type.prototype.cakeModel])) return _original.call(this, type, item[type.prototype.cakeModel]);
        }
        return _original.apply(this, arguments);
    };
}