Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux.aceeditor': '../../ux/aceeditor'
	}
});

Ext.require([ 'Ext.ux.aceeditor.Panel' ]);

Ext.onReady(function()
{

	Ext.define('Editor.Panel.WithToolbar', {
		extend: 'Ext.ux.aceeditor.Panel',
		alias: 'widget.AceEditor.WithToolbar',

		initComponent: function()
		{
			var me = this,
				toolbar = [ {
				text: 'Save',
				handler: function()
				{
					alert(me.editor.getSession().getValue());
				},
				scope: me
			}, {
				text: 'Undo',
				handler: me.undo,
				scope: me
			}, {
				text: 'Redo',
				handler: me.redo,
				scope: me
			} ];

			Ext.apply(me, {
				tbar: toolbar
			});

			me.callParent(arguments);
		}
	});


	Ext.create('Ext.Window', {
		title: 'ACE Editor Example',
		layout: 'fit',
		maximizable: true,
		border: false,
		width: 700,
		height: 400,
		items: [ {
			xtype: 'tabpanel',
			id: 'cont-tabpanel',
			items: [ {
				xtype: 'AceEditor.WithToolbar',
				title: 'Javascript',
				contentEl: 'pre_1',
				theme: 'twilight',
				parser: 'javascript',
				showInvisible: true,
				printMargin: true
			}, {
				xtype: 'AceEditor',
				title: 'PHP',
				sourceCode: '<?php phpinfo(); ?>',
				parser: 'php'
			}, {
				xtype: 'AceEditor.WithToolbar',
				title: 'HTML',
				fontSize: '14px',
				theme: 'crimson_editor',
				url: 'aceeditor.html',
				parser: 'html',
				printMargin: true
			} ]
		} ]

	}).show();

});