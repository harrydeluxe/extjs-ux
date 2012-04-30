/**
 * @class Ext.ux.grid.plugin.RowEditing
 * @extends Ext.grid.plugin.RowEditing
 * 
 * The Initial Developer of the Original Code is tz (atian25@qq.com)
 * @see http://www.sencha.com/forum/showthread.php?131482-Ext.ux.RowEditing-add-some-usefull-features
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.grid.plugin.RowEditing', {
	extend: 'Ext.grid.plugin.RowEditing',
	alias: 'plugin.ux.rowediting',

	removePhantomsOnCancel: true,

	init: function(grid)
	{
		var me = this;
		me.addEvents('canceledit');
		me.callParent(arguments);
		grid.addEvents('canceledit');
		grid.relayEvents(me, [ 'canceledit' ]);

		me.on('edit', function(editor, context)
		{
			delete context.record._blank;
		});
	},

	/**
	 * add a record and start edit it
	 * 
	 * @param {Object} data Data to initialize the Model's fields with
	 * @param {Number} position The position where the record will added. -1
	 *            will be added record at last position.
	 */
	startAdd: function(data, position)
	{
		var me = this;

		var record = me.grid.store.model.create(data);
		record._blank = true;
		
		position = (position && position != -1 && parseInt(position + 1) <= parseInt(me.grid.store.getCount())) ? position
				: (position == -1) ? parseInt(me.grid.store.getCount()) : 0;

		var autoSync = me.grid.store.autoSync;
		me.grid.store.autoSync = false;
		me.grid.store.insert(position, record);
		me.grid.store.autoSync = autoSync;
		me.startEdit(position, 0);
		
        if (me.editor.floatingButtons && me.editor.form.isValid())
		{
            me.editor.floatingButtons.child('#update').setDisabled(false);
        }
	},

	startEditByClick: function()
	{
		var me = this;
		
		if(!me.editing || me.clicksToMoveEditor === me.clicksToEdit)
		{
			if(me.context && me.context.record._blank)
				me.cancelEdit();

			me.callParent(arguments);
		}
	},
	
	moveEditorByClick: function()
	{
        var me = this;
        if(me.editing)
        {
        	if(me.context && me.context.record._blank)
        		me.cancelEdit();

        	me.editing = false;
			me.superclass.onCellClick.apply(me, arguments);
        }
    },

	cancelEdit: function()
	{
		var me = this;
		if(me.editing)
		{
			me.getEditor().cancelEdit();
			me.callParent(arguments);
			me.fireEvent('canceledit', me.context);

			if(me.removePhantomsOnCancel)
			{
				if(me.context.record._blank && me.context.record.store)
				{
					me.context.store.remove(me.context.record);
				}
				else
				{
					me.context.record.reject();
				}
			}
		}
	}
});