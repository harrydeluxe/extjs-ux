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
			theme: 'ambiance',
			printMargin: true,
			fontSize: '13px',
			url: 'simple.js',
			parser: 'javascript'
		} ]
	});
});