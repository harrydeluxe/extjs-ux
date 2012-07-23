/**
 * @class Ext.ux.filebrowser.store.Grid
 * @extends Ext.data.Store
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.filebrowser.store.Grid', {
	extend: 'Ext.data.Store',
	model: 'Ext.ux.filebrowser.model.Grid',

	constructor: function(config)
	{
		var me = this;

		//me.proxy.api.read = config.dataUrl + "?action=get-files";
		me.proxy.url = config.dataUrl + "?action=get-files";

		me.callParent([ config ]);
	},

	proxy: {
		type: 'ajax',

		/*
		api: {
			// read: this.getFilesUrl || this.dataUrl + "?action=get-files",
			// read: 'filebrowserpanelMongo.php?action=get-files',
			create: undefined,
			update: undefined,
			destroy: undefined
		},
		*/
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
	},

	sorters: [ {
		property: 'type',
		direction: 'ASC'
	}, {
		property: 'name',
		direction: 'ASC'
	} ]
});