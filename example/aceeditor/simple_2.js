Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux.aceeditor': '../../ux/aceeditor'
	}
});

Ext.require([ 'Ext.ux.aceeditor.Panel' ]);

Ext.onReady(function()
{
	new Ext.Viewport({
		layout: 'border',
		items: [ {
			region: 'center',
			xtype: 'AceEditor',
			unstyled: true,
			theme: 'twilight',
			fontSize: '13px',
			sourceEl: 'pre_1',
			parser: 'liquid'
		} ]
	});
});
