/**
 * @class Ext.ux.form.field.Grid
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.form.field.Grid', {

	mixins: {
		// labelable: 'Ext.form.Labelable',
		field: 'Ext.form.field.Field'
	},

	setValue: function(value)
	{
		var me = this;

		me.store.loadData(value);
		me.value = value;

		me.checkChange();
		return me;
	},

	getSubmitData: function()
	{
		var me = this, data = null;
		if(!me.disabled && me.submitValue && !me.isFileUpload())
		{
			data = {};
			data[me.getName()] = '' + Ext.encode(me.getValue());
		}
		return data;
	},

	getValue: function()
	{
		var me = this;
		return me.getData();
	},

	getData: function()
	{
		var me = this, data = [], i, r, key;

		for(i = 0; i < me.store.data.items.length; i++)
		{
			r = me.store.data.items[i].data;

			data[i] = {};

			for(key in r)
			{
				data[i][key] = r[key];
			}
		}
		return data;
	},

	reset: function()
	{
		var me = this;

		me.store.removeAll();

		//me.setValue(me.originalValue);
		me.clearInvalid();
		// delete here so we reset back to the original state
		delete me.wasValid;
	}
});