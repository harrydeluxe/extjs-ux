/**
 * @author Harald Hanek
 * @copyright Copyright (c) 2011 Harald Hanek
 * @license http://www.opensource.org/licenses/mit-license.php
 * 
 * @class Ext.ux.container.SwitchButtonSegment
 * @extends Ext.ux.container.ButtonSegment
 * 
 */

Ext.define('Ext.ux.container.SwitchButtonSegment', {
	extend: 'Ext.ux.container.ButtonSegment',
	alias: 'widget.switchbuttonsegment',

	activeItem: 0,

	constructor: function(config)
	{
		var me = this, gId = Ext.id();

		me.internalDefaults = {
			xtype: 'button',
			toggleGroup: gId,
			clickEvent: 'mousedown',
			enableToggle: true,
			allowDepress: false
		};
		me.callParent([ config ]);
	},

	initComponent: function()
	{
		var me = this;
		me.addEvents('change');
		me.callParent();
	},

	onRender: function()
	{
		var me = this;
		me.callParent(arguments);

		me.activeItem = (me.activeItem + 1 > me.items.length) ? 0 : me.activeItem;

		me.items.each(function(el, c)
		{
			// aktiv setzen
			if(me.activeItem == c)
				el.pressed = true;

			me.mon(el, {
				toggle: me.onToggle,
				scope: me
			});

			el.toggleCount = c;
			el.scope = me;

		}, me);

	},

	getActiveItem: function()
	{
		return this.activeItem;
	},

	setActiveItem: function(item)
	{
		if(typeof (item) === 'number')
			item = this.items.getAt(item);

		item.toggle(true);
	},

	onToggle: function(btn, state)
	{
		var me = this;
		if(state == true)
		{
			me.activeItem = btn.toggleCount;
			me.fireEvent('change', btn);
		}
	}
});