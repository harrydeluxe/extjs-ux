/**
 * @class Ext.ux.filemanager.plugin.Create
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define("Ext.ux.filemanager.plugin.Create", {
	extend: "Ext.AbstractPlugin",
	alias: "plugin.filemanager.create",

	
	/**
	 * @cfg {String} createFolderUrl
	 * The URL to create a folder Takes precedence over dataUrl
	 */
	
	
	init: function(cmp)
	{
		var me = this;
		//console.log(me);
		//me.filemanager = cmp;

		me.cmp.actions.create = Ext.create('Ext.Action', {
			text: me.cmp.il8n.newFolderText,
			iconCls: 'ux-filemanager-icon-newfolder',
			cls: 'x-btn-text-icon',
			cmd: 'create',
			toolbar: true,
			disabled: false,
			canToggle: false,
			handler: function(widget, event)
			{
				//var rows = filemanager.grid.getView().getSelectionModel().getSelection();
				//me.deleteFile(rows);
				me.createFolderDialog(me.cmp, null, false);
			},
			scope: me.cmp
		});
		
		
		//me.cmp.registerAction();
		cmp.registerToolbarItem('create', cmp.actions.create);
		me.cmp.gtb.unshift(me.cmp.actions.create);
		//me.cmp.gcm.unshift(me.cmp.actions.create); // context menu
		
		me.cmp.registerGridContextMenu(me.cmp.actions.create);
		
		me.cmp.addEvents(
				/**
				 * @event beforecreatefolder Fires before a new folder is created on the
				 *        server, return false to cancel the event
				 * 
				 * @param {Ext.ux.filemanager} this
				 * @param {Ext.tree.TreeNode} node The node representing the folder to
				 *            be created
				 */
				'beforecreatefolder',
				
				/**
				 * @event createfolder Fires when folder was successfully created
				 * 
				 * @param {Ext.ux.filemanager} this
				 * @param {Object} opts The options that were used for the original
				 *            request
				 * @param {Object} o Decoded response body from the server
				 */
				'createfolder',			
		
				/**
				 * @event createfolderfailed Fires when creation of folder failed
				 * 
				 * @param {Ext.ux.filemanager} this
				 * @param {Object} opts The options that were used for the original
				 *            request
				 * @param {Object} o Decoded response body from the server
				 */
				'createfolderfailed'		
		);
	},

	
	createFolderDialog22: function(filemanager, row)
	{
		var me = this;
	},
	
	
	createFolderDialog: function(filemanager, row)
	{
		var me = this;
		/*
		var cfg = {
				prompt: true,
				title: 'Neuer Ordner',
				//minWidth: me.minPromptWidth,
				width: 400,
				msg: 'Geben Sie den Ordnernamen an:',
				//buttons: me.OKCANCEL,
				//callback: fn,
				//scope: scope,
				beforerender: function(dialog)
				{
					console.log(dialog);
					dialog.on('show', function(dialog)
					{
						var pos = dialog.textField.value.lastIndexOf(".");
						if(pos != -1)
							dialog.textField.selectText(0, pos);
					});
					
					dialog.textField.allowBlank = false;
	
					dialog.textField.on('validitychange', function(textField, isValid)
					{
						dialog.msgButtons.ok.setDisabled(!isValid);
					});
				},
				multiline: false,
				value: 'Ordnername'
			};
		Ext.Msg.prompt(cfg).on('beforerender', function(dialog){
			cfg.beforerender(me, dialog);				
		});
		return;
		*/
		Ext.Msg.prompt('Neuer Ordner',
				'Geben Sie den Ordnernamen an:',
				function(btn, text)
				{
					//console.log(btn, text, me.cmp);
					if(btn == 'ok' && text != '')
						me.createFolder(me.cmp.path + '/' + text);
				},
				false);
	},
	
	/**
	 * Create a new folder on the server
	 * 
	 * @private
	 * @param {Ext.tree.TreeNode} node The node representing the folder to
	 *            create
	 * @returns {Void}
	 */
	createFolder: function(node)
	{
		var me = this;

		if(me.cmp.eventsSuspended !== true && me.cmp.fireEvent('beforecreatefolder', me.cmp, node) === false)
		{
			return;
		}

		// send request to server
		Ext.Ajax.request({
			url: me.createFolderUrl || me.cmp.dataUrl,
			//url: me.renameFolderUrl || filemanager.dataUrl,
			node: node,
			callback: me.actionCallback,
			scope: me,
			params: {
				action: 'create-folder',
				path: node
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
				case 'create-folder':
					
					if(me.cmp.eventsSuspended !== true)
					{
						me.cmp.fireEvent('createfolder', me, opts, o);// fire createfolder event
					}

					/*
					// change name of the node if it was changed on
					// the server
					if((null !== o.serverName) && Ext.isString(o.serverName))
					{
						opts.node.setText(o.serverName);
					}

					// remove flag
					delete opts.node.attributes.isNew;
					*/
					break;

				default:
					break;
				}
		}
		else
		{
			switch(opts.params.action)
				{

				case 'create-folder':
					
					if(me.eventsSuspended !== true)
					{
						me.fireEvent('createfolderfailed', me, opts, o);// fire createfolderfailed event
					}

					// remove the node
					opts.node.remove();
					break;

				default:
					break;
				}
		}

	}
});