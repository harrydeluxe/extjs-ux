/**
 * @class Ext.ux.filemanager.plugin.Delete
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define("Ext.ux.filemanager.plugin.Delete", {
	extend: "Ext.AbstractPlugin",
	alias: "plugin.filemanager.delete",

	/**
	 * @cfg {String} deleteFileUrl The URL to delete files Takes precedence over
	 *      dataUrl
	 */

	/**
	 * @cfg {String} deleteFolderUrl The URL to delete folders Takes precedence
	 *      over dataUrl
	 */

	init: function(cmp)
	{
		var me = this;
		
		me.cmp.actions.remove = Ext.create('Ext.Action', {
			text: me.cmp.il8n.deleteText,
			iconCls: 'ux-filemanager-icon-delete',
			cls: 'x-btn-text-icon',
			cmd: 'delete',
			toolbar: true,
			disabled: true,
			canToggle: true,
			handler: function(widget, event)
			{
				var rows = me.cmp.grid.getView().getSelectionModel().getSelection();
				me.deleteFile(rows);
			},
			scope: me.cmp
		});

		me.cmp.registerToolbarItem('remove', me.cmp.actions.remove);
		
		
		
		me.cmp.gtb.unshift(cmp.actions.remove);
		//me.cmp.gcm.unshift(me.cmp.actions.remove); // context menu
		me.cmp.registerGridContextMenu(me.cmp.actions.remove);

		me.cmp.addEvents(

		/**
		 * @event beforedeletefile Fires before file will be deleted from the
		 *        server, return false to cancel the event
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Ext.data.Record} record The record representing the file that
		 *            will be deleted
		 */
		'beforedeletefile',

		/**
		 * @event deletefile Fires when file(s) was/were successfully deleted
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'deletefile',

		/**
		 * @event deletefilefailed Fires when deleting file(s) failed
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'deletefilefailed',

		/**
		 * @event beforedeletefolder Fires before folder will be deleted on the
		 *        server, return false to cancel the event
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Ext.tree.TreeNode} node The node representing the folder that
		 *            will be deleted
		 */
		'beforedeletefolder',

		/**
		 * @event deletefolder Fires when folder was successfully deleted
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'deletefolder',

		/**
		 * @event deletefolderfailed Fires when deleting folder failed
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'deletefolderfailed');


		me.cmp.on("afterrender", me.onAfterLayout, me, {
			single: true
		});
	},

	onAfterLayout: function()
	{
		var me = this;

		var map = Ext.create('Ext.util.KeyMap', me.cmp.el, [ {
			key: Ext.EventObject.DELETE, // del
			fn: function(keycode, e)
			{
				console.log('del', e);
				e.stopEvent();
				var view = me.cmp.grid.getView().getSelectionModel();
				if(view.selected && view.selected.length >= 1)
					me.deleteFile(view.getSelection());
			}
		}

		]);
	},

	/**
	 * Deletes file from the server
	 * 
	 * @private
	 * @param {Array} files Array of Ext.data.Record objects representing the
	 *            files that need to be deleted
	 * @returns {Void}
	 */
	deleteFile: function(files)
	{
		var me = this,
			filemanager = me.cmp,
			params,
			folder,
			dialogTitle,
			dialogMsg;

		// fire beforedeletefile event
		if(filemanager.eventsSuspended !== true && filemanager.fireEvent('beforedeletefile', this, files) === false)
		{
			return;
		}

		// set request parameters
		params = {
			action: 'delete-file'
		};

		folder = filemanager.path + '/';
		Ext.each(files, function(item, index, allItems)
		{
			params['files[' + item.id + ']'] = folder + item.get('name');
		});

		// prepare confirmation texts depending on amount of
		// files
		dialogTitle = filemanager.il8n.confirmDeleteSingleFileTitleText;
		dialogMsg = Ext.String.format(filemanager.il8n.confirmDeleteSingleFileMsgText, files[0].get('name'));

		if(files.length > 1)
		{
			dialogTitle = filemanager.il8n.confirmDeleteMultipleFileTitleText;
			dialogMsg = Ext.String.format(filemanager.il8n.confirmDeleteMultipleFileMsgText, files.length);
		}

		// confirm removal
		// Ext.MessageBox.confirm(dialogTitle, dialogMsg, function(btn)
		Ext.Msg.confirm(dialogTitle, dialogMsg, function(btn)
		{
			if(btn == 'yes')
			{
				// @todo loadmask fuer grid einschalten!!! harry
				// send request to server
				Ext.Ajax.request({
					url: me.deleteFileUrl || filemanager.dataUrl,
					callback: me.actionCallback,
					scope: filemanager,
					params: params
				});
			}

			me.cmp.grid.focus();
			
		}, me);

	},

	/**
	 * Deletes folder from the server
	 * 
	 * @private
	 * @param {Ext.tree.TreeNode} node The treenode that needs to be deleted
	 * @returns {Void}
	 */
	deleteFolder: function(node)
	{
		// fire beforedeletefolder event
		if(true !== this.eventsSuspended && false === this.fireEvent('beforedeletefolder', this, node))
		{
			return;
		}

		// confirm removal
		Ext.Msg.show({
			title: this.il8n.confirmDeleteFolderTitleText,
			msg: String.format(this.il8n.confirmDeleteFolderMsgText, node.text),
			buttons: Ext.Msg.YESNO,
			icon: Ext.Msg.QUESTION,
			closable: false,
			scope: this,
			fn: function(buttonId)
			{
				if(buttonId === 'yes')
				{
					// send request to server
					Ext.Ajax.request({
						url: this.deleteFolderUrl || this.dataUrl,
						node: node,
						callback: this.actionCallback,
						scope: this,
						params: {
							action: 'delete-folder',
							path: node.getPath('text')
						}
					});
				}
				me.cmp.grid.focus();
			}
		});

	},

	/**
	 * Callback that handles all actions performed on the server (rename, move
	 * etc.) Called when Ajax request finishes, regardless if this was a success
	 * or not
	 * 
	 * @private
	 * @param {Object} opts The options that were used for the original request
	 * @param {Boolean} success If the request succeded
	 * @param {Object} response The XMLHttpRequest object containing the
	 *            response data
	 * @returns {Void}
	 */
	actionCallback: function(opts, success, response)
	{
		var me = this, o = {}, store, record;

		// check if request was successful
		if(success !== true)
		{
			Ext.Msg.show({
				title: me.il8n.actionRequestFailureTitleText,
				msg: me.il8n.actionRequestFailureMsgText,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR,
				closable: false
			});
			return;
		}

		try
		{
			o = Ext.decode(response.responseText);

		} catch(e)
		{
			Ext.Msg.show({
				title: me.il8n.actionResponseFailureTitleText,
				msg: me.il8n.actionResponseFailureMsgText,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR,
				closable: false
			});
		}

		// check if server reports all went well
		// handle success/failure accordingly
		if(true === o.success)
		{
			switch(opts.params.action)
				{
					case 'delete-folder':
						
						if(me.eventsSuspended !== true)
						{
							me.fireEvent('deletefolder', me, opts, o);// fire deletefolder event
						}

						// remove node
						opts.node.parentNode.select();
						opts.node.remove();
						break;

					case 'delete-file':
						
						if(me.eventsSuspended !== true)
						{
							me.fireEvent('deletefile', me, opts, o);// fire deletefile event
						}

						// delete record(s) from the grid
						store = me.grid.getStore();

						Ext.each(o.data.successful, function(item, index, allItems)
						{
							// record = store.getById(item.recordId);
							record = store.data.findBy(function(record)
							{
								return record.id === item.recordId;
							});
							store.remove(record);
						});
						
						me.grid.focus();
						
						break;

					default:
						break;
				}
		}
		else
		{
			switch(opts.params.action)
				{
					case 'delete-folder':
						
						if(me.eventsSuspended !== true)
						{
							me.fireEvent('deletefolderfailed', me, opts, o);	// fire deletefolderfailed event
						}

						// reload the node
						opts.node.getOwnerTree().getLoader().load(opts.node);
						break;

					case 'delete-file':
						
						if(me.eventsSuspended !== true)
						{
							me.fireEvent('deletefilefailed', me, opts, o); // fire deletefilefailed event
						}

						// delete successfully moved record(s) from the
						// grid
						store = me.grid.getStore();
						Ext.each(o.data.successful, function(item, index, allItems)
						{
							record = store.getById(item.recordId);
							store.remove(record);
						});
						break;

					default:
						break;
				}
		}

	}

});