Ext.define('Ext.ux.filemanager.ComboBoxTree', {
	extend: 'Ext.form.field.Picker',

	requires: ['Ext.data.SortTypes',
	           'Ext.ux.filemanager.view.Tree',
	           'Ext.ux.filemanager.model.Tree',
	           'Ext.ux.filemanager.store.Tree'],
	           
	initComponent: function()
	{
		var me = this;
		/*
		Ext.apply(me, {
			fieldLabel: me.fieldLabel,
			labelWidth: me.labelWidth
		// pickerAlign : "tl"
		});
		*/
		me.callParent();
	},
	
	
	createPicker: function()
	{
		var me = this,
			store = Ext.create('Ext.ux.filemanager.store.Tree', {
			autoLoad: false,
			foldersUrl: me.foldersUrl,
			rootPath: me.rootPath,
			rootNode: me.rootNode
		});
		
		me.picker = Ext.create('Ext.ux.filemanager.view.Tree', {
			height: 250,
			autoScroll: true,
			floating: true,
			focusOnToFront: false,
			// shadow : true,
			ownerCt: me.ownerCt,
			useArrows: true,
			store: store,
			rootVisible: false,
			// autoLoad: true,
			viewConfig: {
				loadMask: false,
				singleSelect: true
			},
			
			rootNode: me.rootNode,
			rootPath: me.rootPath,
			path: me.value,
			
			
			listeners: {
				
				changeSelection: {
					fn: function(tree, view, node)
					{
						console.log(tree, view, node);
						var id = node.getRealPath('ids');
						if(me.value != id)
						{
							me.setValue(id);
						}
					},
					scope: me
				}
			}
		});
		
		me.picker.on({
			beforehide: function(p)
			{
				var record = me.picker.getView().getSelectionModel().getSelection()[0];
				if(record)
				{
					var id = record.getRealPath('ids');
					var value = record.get('text');
					me.setValue(id);
				}
				p.setVisible(true);
			},
			
			show: function(p)
			{
				//console.log('show', me.value);
				if(me.value)
					me.picker.selectPath(me.value, 'ids');
			}
		});
		
		return me.picker;
	},
	
	
	getDisplayValue: function()
	{
		return 'Harald';
	},
	
	
	alignPicker: function()
	{
		// override the original method because otherwise the height of
		// the treepanel would be always 0
		var me = this, picker, isAbove, aboveSfx = '-above';
		if(this.isExpanded)
		{
			picker = me.getPicker();
			if(me.matchFieldWidth)
			{
				// Auto the height (it will be constrained by min and
				// max width) unless there are no records to display.
				picker.setWidth(me.bodyEl.getWidth());
			}
			if(picker.isFloating())
			{
				picker.alignTo(me.inputEl, "", me.pickerOffset);// ""->tl
				// add the {openCls}-above class if the picker was
				// aligned above
				// the field due to hitting the bottom of the viewport
				isAbove = picker.el.getY() < me.inputEl.getY();
				me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
				picker.el[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
			}
		}
	}
});