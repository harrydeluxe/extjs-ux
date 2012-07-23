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

	proxy: {
    	type: 'direct',
    	directFn: Ext.php.Filemanager.getFiles,
        paramOrder: ['node'],
        reader: {
			type: 'json',
			successProperty: 'success',
			root: 'data',
			messageProperty: 'message'
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