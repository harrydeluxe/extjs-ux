/**
 * @class Ext.ux.filemanager.store.Tree
 * @extends Ext.data.TreeStore
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.filemanager.store.Tree', {
	extend: 'Ext.data.TreeStore',

	clearOnLoad: true,
	//fields: [ 'text', 'type', 'ids', 'leaf' ],

	autoLoad: false,
	
	folderSort: true,

	data: {},

	sorters: [ {
		property: 'text',
		direction: 'ASC'
	} ],
	
	proxy: {
    	type: 'direct',
        directFn: Ext.php.Filemanager.getFolders,
        paramOrder: ['node']
    },

	constructor: function(config)
	{
		var me = this;

		config = config || {};

        config.model = 'Ext.ux.filemanager.model.Tree';
        config.root = {
				text: config.rootNode || 'Root',
				id: config.rootPath,
				ids: (!config.rootPath || config.rootPath == '' || config.rootPath == '/') ? '' : config.rootPath
			};
        
        config.listeners = {

			beforeload: {
				fn: function(store, operation)
				{
					operation.params.node = operation.node.getRealPath('ids');
				}
			}
		};

		me.callParent([ config ]);
	}
});