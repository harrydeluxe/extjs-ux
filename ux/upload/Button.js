/**
 * @class Ext.ux.upload.Button
 * @extends Ext.button.Button
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.upload.Button', {
	extend: 'Ext.button.Button',
	alias: 'widget.uploadbutton',

	require: [ 'Ext.ux.upload.Basic' ],

	disabled: true,

	constructor: function(config)
	{
		var me = this;

		config = config || {};

		Ext.applyIf(config.uploader, {
			browse_button: config.id || Ext.id(me)
		});

        me.callParent([ config ]);   
	},

	
	initComponent: function()
	{
		var me = this;
		
		me.callParent();
		
		me.uploader = me.createUploader();
		
		me.listeners =
		{
			afterRender: {
				fn: function(){
					me.uploader.initialize();
				},
				single: true,
				scope: me
			}
		};	
		
		me.relayEvents(me.uploader, [
             'beforestart',
             'uploadready',
             'uploadstarted',
             'uploadcomplete',
             'uploaderror',
             'filesadded',
             'beforeupload',
             'fileuploaded',
			 'updateprogress',
			 'storeempty'
         ]);
	},
	
    /**
     * @private
     */
    createUploader: function()
    {
    	return Ext.create('Ext.ux.upload.Basic', this, Ext.applyIf({listeners: {}}, this.initialConfig));
    }
});