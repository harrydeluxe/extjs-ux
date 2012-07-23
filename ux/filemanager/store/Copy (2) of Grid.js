/**
 * @class Ext.ux.filemanager.store.Grid
 * @extends Ext.data.Store
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.filemanager.store.Grid', {
	extend: 'Ext.data.Store',
	model: 'Ext.ux.filemanager.model.Grid',

	constructor: function(config)
	{
		var me = this;

		Ext.applyRecursive(config, {

			proxy: {
				type: 'ajax',
				url: config.filesUrl + "?action=get-files",
				reader: {
					type: 'json',
					successProperty: 'success',
					root: 'data',
					messageProperty: 'message'
				},
				listeners: {
					exception: function(proxy, response, operation)
					{
						Ext.MessageBox.show({
							title: 'REMOTE EXCEPTION',
							msg: operation.getError(),
							icon: Ext.MessageBox.ERROR,
							buttons: Ext.Msg.OK
						});
					}
				}
			}
		});
		
		me.callParent([config]);
	},

	sorters: [ {
		property: 'type',
		direction: 'ASC'
	}, {
		property: 'name',
		direction: 'ASC'
	} ]
});