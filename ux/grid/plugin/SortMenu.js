/**
 * @class Ext.ux.grid.plugin.SortMenu
 * @extends Ext.button.Button
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.grid.plugin.SortMenu', {
	extend: 'Ext.button.Button',
	uses: [ 'Ext.menu.Menu' ],
	alias: 'plugin.ux.sortmenu',
	
	sortAscText: null,
	sortDescText: null,
	
	tplText: 'Sort by {0}',
	sortState: "ASC",
	sortBtn: null,
	changed: true,
	
	initComponent: function()
	{
		var me = this;
		
		me.groupid = Ext.id(me);		
		me.sortmenu = Ext.create('Ext.menu.Menu', {items: [{text: ''}]});
		me.sortmenu.on('beforeshow', me.createMenu, me);
		
		Ext.apply(me, {
			menu: me.sortmenu
		});
		
		me.callParent(arguments);
	},	
	
	init: function(grid)
	{
		var me = this;
		me.grid = grid;
		me.grid.on('afterlayout', me.onGridRender, me, {single: true});
	},   
	
	changeState: function(headerCt, column)
	{
		var me = this;
		
		me.changed = true;
		
		if(column.sortState !== null && column.text != me.text)
			me.setText(Ext.String.format(me.tplText, column.text || ''));
	},	
	
	onGridRender: function(grid)
	{
		var me = this;
		
		me.mon(me.grid.view.headerCt, 'columnmove', me.changeState, me);
		me.mon(me.grid.view.headerCt, 'sortchange', me.changeState, me);
		
		me.grid.view.headerCt.items.each(function(column)
				{
					if(column.sortable && column.getSortParam())
					{
						if(column.sortState !== null)
						{  						
							me.sortBtn = column;
							me.setText(Ext.String.format(me.tplText, column.text || ''));
						}   					
					}
					
				}, me);
	},	
	
	createMenu: function()
	{
		var me = this;
		
		if(!me.changed)
			return true;
		
		me.sortmenu.removeAll();
		me.grid.view.headerCt.items.each(function(column)
		{
			if(column.sortable && column.getSortParam())
			{
				if(column.sortState !== null)
				{
					me.sortBtn = column;
					me.sortState = column.sortState;
					me.setText(Ext.String.format(me.tplText, column.text));
				}
				
				me.sortmenu.add({
					text: column.text,
					group: 'sortproperty_' + me.groupid,
					handler: function(){
						me.sortBtn = column;
						column.setSortState(me.sortState);
					},
					checked: (column.sortState !== null),
					scope: me
				});
				
			}
	
		}, me);
		
		me.sortmenu.add([{
					xtype: 'menuseparator'
				},
				{
					text: me.sortAscText || me.grid.view.headerCt.sortAscText,
					checked: (me.sortState == "ASC") ? true : false,
					group: 'sortdirection_' + me.groupid,
					handler: me.setSortDirection,
					scope: me,
					sortDirection: "ASC"
				},
				{
					text: me.sortDescText || me.grid.view.headerCt.sortDescText,
					checked: (me.sortState == "DESC") ? true : false,
					group: 'sortdirection_' + me.groupid,
					handler: me.setSortDirection,
					scope: me,
					sortDirection: "DESC"
				}]);
		
		me.changed = false;
	},
	
	setSortDirection: function(btn)
	{
		var me = this;
	
		me.sortState = btn.sortDirection;
		me.sortBtn.setSortState(me.sortState);
	}

});