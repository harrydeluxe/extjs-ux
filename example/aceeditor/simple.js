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
			// sourceCode: 'huhu',
			url: 'simple.js',
			parser: 'javascript'
		} ]
	});
});
