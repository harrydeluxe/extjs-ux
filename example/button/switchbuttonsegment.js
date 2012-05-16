Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux.container': '../../ux/container'
	}
});

Ext.require([ 'Ext.ux.container.SwitchButtonSegment' ]);

Ext.onReady(function()
{
	Ext.create('Ext.ux.container.SwitchButtonSegment', {
		renderTo: Ext.getBody(),
		style: 'margin-top:15px',
		items: [ {
			text: 'Lorem'
		}, {
			text: 'Ipsum'
		}, {
			text: 'dolor'
		} ]
	});

	Ext.create('Ext.ux.container.SwitchButtonSegment', {
		renderTo: Ext.getBody(),
		style: 'margin-top:15px',
		activeItem: 1,
		defaults: {
			scale: 'medium'
		},
		items: [ {
			text: 'Lorem'
		}, {
			text: 'Ipsum'
		}, {
			text: 'dolor'
		} ],
		listeners:
		{
			change: function(btn, item)
			{
				alert(btn.text);		
			},
			scope: this
		}
	});

});