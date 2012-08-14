/**
 * @class Ext.ux.form.field.Grid
 *
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.form.field.Grid', {

    mixins: {
        field: 'Ext.form.field.Field'
    },

    initField: function() {
        var me = this;

        me.addEvents(
            /**
             * @event change Fires when a user-initiated change is detected in the
             *        value of the field.
             * @param {Ext.form.field.Field} this
             * @param {Object} newValue The new value
             * @param {Object} oldValue The original value
             */
            'change',
            /**
             * @event validitychange Fires when a change in the field's validity is
             *        detected.
             * @param {Ext.form.field.Field} this
             * @param {Boolean} isValid Whether or not the field is now valid
             */
            'validitychange',
            /**
             * @event dirtychange Fires when a change in the field's
             *        {@link #isDirty} state is detected.
             * @param {Ext.form.field.Field} this
             * @param {Boolean} isDirty Whether or not the field is now dirty
             */
            'dirtychange');

        me.initValue();

        me.store.addListener('add', me.checkDirty, me);
        me.store.addListener('update', me.checkDirty, me);
        me.store.addListener('remove', me.checkDirty, me);
    },

    isDirty: function() {
        var me = this;
        return !me.disabled && !me.isEqual(Ext.encode(me.getValue()), Ext.encode(me.originalValue));
    },

    setValue: function(value) {
        var me = this;

        if (value === null || value === undefined) {
            value = [];
        }

        me.store.loadData(value);
        me.value = value;
        me.checkChange();
        return me;
    },

    getSubmitData: function() {
        var me = this, data = null;
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            data = {};
            data[me.getName()] = '' + Ext.encode(me.getValue());
        }
        return data;
    },

    getValue: function() {
        var me = this;
        return me.getData();
    },

    getData: function() {
        var me = this,
            data = [], i, r, key;

        for (i = 0; i < me.store.data.items.length; i++) {
            r = me.store.data.items[i].data;

            data[i] = {};

            for (key in r) {
                data[i][key] = r[key];
            }
        }
        return data;
    },

    reset: function() {
        var me = this;

        me.store.removeAll();

        me.setValue(me.originalValue);
        me.clearInvalid();
        // delete here so we reset back to the original state
        delete me.wasValid;
    }
});