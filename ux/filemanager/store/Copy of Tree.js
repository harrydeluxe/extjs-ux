/**
 * @class Ext.ux.filemanager.store.Tree
 * @extends Ext.data.TreeStore
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.filemanager.store.Tree', {
	extend: 'Ext.data.TreeStore',
	model: 'Ext.ux.filemanager.model.Tree',

	clearOnLoad: true,
	//fields: [ 'text', 'type', 'ids', 'leaf' ],

	autoLoad: false,
	folderSort: true,

	data: {},

	sorters: [ {
		property: 'text',
		direction: 'ASC'
	} ],

	constructor: function(config)
	{
		var me = this;

		Ext.applyRecursive(config, {

			proxy: {
				type: 'ajax',
				extraParams: {
					action: "get-folders"
				},
				reader: {
					type: 'json'
				},
				url: config.foldersUrl
			},

			autoLoad: false,

			root: {
				text: config.rootNode || 'Root',
				id: config.rootPath,
				ids: (!config.rootPath || config.rootPath == '' || config.rootPath == '/') ? '' : config.rootPath
			},

			listeners: {

				beforeload: {
					fn: function(store, operation)
					{
						operation.params.node = operation.node.getRealPath('ids');
					}
				}
			}
		});

		me.callParent([ config ]);
	}
});