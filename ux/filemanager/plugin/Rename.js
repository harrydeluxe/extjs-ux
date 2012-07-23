/**
 * @class Ext.ux.filemanager.plugin.Rename
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define("Ext.ux.filemanager.plugin.Rename", {
	extend: "Ext.AbstractPlugin",
	alias: "plugin.filemanager.rename",

	/**
	 * @cfg {String} renameFileUrl The URL to rename files Takes precedence over
	 *      dataUrl
	 */

	/**
	 * @cfg {String} renameFolderUrl The URL to rename folders Takes precedence
	 *      over dataUrl
	 */
	//disabled: true,
	
	init: function(cmp)
	{
		/**
		 * Additional VType(s)to use
		 */
		Ext.apply(Ext.form.VTypes, {
			/**
			 * Validation type for filenames allows only alphanumeric, underscore, hypen
			 * and dot Checks for extension between 2 and 4 karakters
			 */
			filenameVal: /[a-z0-9_\-\.]+\.([a-z0-9]{2,4})$/i,
			filenameMask: /[a-z0-9_\-\.]/i,
			filenameText: 'Filename is invalid or contains illegal characters',
			filename: function(val, field)
			{
				return Ext.form.VTypes.filenameVal.test(val);
			}
		});
		
		
		var me = this, filemanager = cmp;

		this.filemanager = filemanager;

		cmp.actions.rename = Ext.create('Ext.Action', {
			text: filemanager.il8n.renameText,
			iconCls: 'ux-filemanager-icon-rename',
			//cls: 'x-btn-text-icon',
			cmd: 'rename',
			toolbar: true,
			disabled: true,
			canToggle: true,
			singleFile: true,
			readOnly: true, // wird gebraucht, damit im readonly mode diese action ausgeschaltet bleibt
			handler: function(widget, event)
			{
				var row = filemanager.grid.getView().getSelectionModel().getSelection()[0];

				if(row.data.type != 'folder')
					me.renameFileDialog(filemanager, row);
				else
					me.renameFolderDialog(filemanager, row, true);
			},
			scope: this
		});

		cmp.registerToolbarItem('rename', cmp.actions.rename);
		
		cmp.gtb.unshift(cmp.actions.rename);	// toolbar
		
		//cmp.gcm.unshift(cmp.actions.rename);	// grid context menu
		me.cmp.registerGridContextMenu(me.cmp.actions.rename);

		
		
		cmp.actionsTree.rename = Ext.create('Ext.Action', {
			text: filemanager.il8n.renameText,
			iconCls: 'ux-filemanager-icon-renamefolder',
			cls: 'x-btn-text-icon',
			cmd: 'rename',
			toolbar: true,
			disabled: true,
			canToggle: true,
			singleFile: true,
			handler: function(widget, event)
			{
				var row = filemanager.tree.getView().getSelectionModel().getSelection()[0];
				//console.log(row);
				me.renameFolderDialog(filemanager, row, false);
			},
			scope: this
		});
		
		//cmp.tcm.unshift(cmp.actionsTree.rename);	// tree context menu
		
		cmp.registerTreeContextMenu(cmp.actionsTree.rename);
		
		cmp.addEvents(

		/**
		 * @event beforerenamefile Fires before file will be renamed on the
		 *        server, return false to cancel the event
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Ext.data.Record} record The record representing the file that
		 *            will be renamed
		 * @param {String} newName The new file name
		 * @param {String} oldName The old file name
		 */
		'beforerenamefile',

		/**
		 * @event renamefile Fires when file was successfully renamed
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'renamefile',

		/**
		 * @event renamefilefailed Fires when renaming file failed
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'renamefilefailed',
		
		/**
		 * @event beforerenamefolder Fires before folder will be renamed on the
		 *        server, return false to cancel the event
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Ext.tree.TreeNode} node The node representing the folder that
		 *            will be renamed
		 * @param {String} newName The new folder name
		 * @param {String} oldName The old folder name
		 */
		'beforerenamefolder',	
		
		/**
		 * @event renamefolder Fires when folder was successfully renamed
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'renamefolder',
		
		/**
		 * @event renamefolderfailed Fires when renaming folder failed
		 * 
		 * @param {Ext.ux.filemanagerPanel} this
		 * @param {Object} opts The options that were used for the original
		 *            request
		 * @param {Object} o Decoded response body from the server
		 */
		'renamefolderfailed'
		
		
		);
	},

	renameFileDialog: function(filemanager, row)
	{
		var me = this;
		
		Ext.Msg.rename('Datei umbennen', 'Geben Sie einen neuen Namen an:', row.data.name, function(dialog)
				{
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
				function(btn, text, dialog)
				{
					if(btn == 'ok')
					{
						if(text != row.data.name)
						{
							if(filemanager.grid.store.findRecord('name', text))
							{
								Ext.defer(function()
								{
									dialog.textField.focus();
									dialog.textField.markInvalid('Dateiname existiert bereits in diesem Ordner!');
								}, 200);
	
								return false;
							}
							else
							{
								me.renameFile(row, text, row.data.name);
							}
						}
					}
				}, this);
	},
	
	renameFolderDialog: function(filemanager, row, fromGrid)
	{
		var me = this,
			name = fromGrid ? row.data.name : row.data.text;
		//console.log(row);
		Ext.Msg.rename('Ordner umbennen', 'Geben Sie einen neuen Namen an:', name, function(dialog)
				{
					dialog.textField.allowBlank = false;
					dialog.on('show', function(dialog)
					{						
						dialog.textField.focus(true);
					});

					dialog.textField.on('validitychange', function(textField, isValid)
					{
						dialog.msgButtons.ok.setDisabled(!isValid);
					});
				},
				function(btn, text, dialog)
				{
					if(btn == 'ok')
					{
						if(text != name)
						{
							me.renameFolder(row, text, name);							
						}
					}
				}, this);
	},
	
	
	/**
	 * Renames file on the server
	 * 
	 * @private
	 * @param {Ext.data.Record} record Record representing the file that is
	 *            beiing renamed
	 * @param {String} newName New filename
	 * @param {String} oldName Old filname
	 * @returns {Void}
	 */
	renameFile: function(record, newName, oldName)
	{
		var me = this, filemanager = this.filemanager;

		if(filemanager.eventsSuspended !== true && filemanager.fireEvent('beforerenamefile', filemanager, record, newName, oldName) === false)
		{
			return;
		}

		// send request to server
		Ext.Ajax.request({
			url: me.renameFileUrl || filemanager.dataUrl,
			record: record,
			newName: newName,
			oldName: oldName,
			callback: me.actionCallback,
			scope: filemanager,
			params: {
				action: 'rename-file',
				path: filemanager.path,
				newName: newName,
				oldName: oldName
			}
		});
	},
	
	
	renameFolder: function(record, newName, oldName)
	{
		var me = this,
			filemanager = me.filemanager;

		if(filemanager.eventsSuspended !== true && filemanager.fireEvent('beforerenamefolder', filemanager, record, newName, oldName) === false)
		{
			return;
		}
		
		//var p = record.parentNode.getRealPath();
		//console.log(record, newName, oldName);return;

		// send request to server
		Ext.Ajax.request({
			url: me.renameFolderUrl || filemanager.dataUrl,
			record: record,
			newName: newName,
			oldName: oldName,
			callback: me.actionCallback,
			//scope: filemanager,
			scope: me,
			params: {
				action: 'rename-folder',
				//path: filemanager.path,
				path: record.parentNode.getRealPath('ids'),
				newName: newName,
				oldName: oldName
			}
		});
	},
	
	/**
	 * Renames a given folder on the server
	 * 
	 * @private
	 * @param {Ext.tree.TreeNode} node The treenode that needs to be renamed
	 * @param {String} newName The old foldername
	 * @param {String} oldName The new foldername
	 * @returns {Void}
	 */
	renameFolder2: function(node, newName, oldName)
	{
		var me = this,
			filemanager = this.filemanager;
		
		
		if(filemanager.eventsSuspended !== true && filemanager.fireEvent('beforerenamefolder', filemanager, node, newName, oldName) === false)
		{
			return;
		}

		// send request to server
		Ext.Ajax.request({
			url: me.renameFolderUrl || filemanager.dataUrl,
			node: node,
			newName: newName,
			oldName: oldName,
			callback: function(opts, success, response)
			{
				var o = {}, store, record;				
				//o = Ext.decode(response.responseText);
				
				try
				{
					o = Ext.decode(response.responseText);
					
				} catch(e)
				{
					//console.log(e);
					Ext.Msg.alert(filemanager.il8n.actionResponseFailureTitleText,
							filemanager.il8n.actionResponseFailureMsgText);
				}
				
				
				if(o.success === true)
				{						
					if(filemanager.eventsSuspended !== true)
					{
						filemanager.fireEvent('renamefolder', filemanager, opts, o);
					}

					if((o.serverName !== null) && Ext.isString(o.serverName))
					{
						var store = filemanager.tree.getStore(),
							view = filemanager.tree.getView(),
							record = opts.node;
						
						var pos = record.data.id.lastIndexOf(record.data.text);
						record.beginEdit();
						record.set('text', o.serverName);
						record.set('id', record.data.id.substring(0, pos) + o.serverName);
						record.endEdit();
						record.commit();
						//view.refresh(); 
						
						filemanager.path = record.getPath();	// neuen pfad setzen
						
						
						// Remove all current children if clear on load not set 
						if (!store.clearOnLoad) { 
						    record.removeAll(); 
						} 

						// Call load, refreshing our view when done... 
						var viewRefresher = function() { 
						    view.refresh(); 
						}; 

						store.load({ 
						    node: record, 
						    callback: viewRefresher 
						});
					}

				}
				else
				{
					if(filemanager.eventsSuspended !== true)
					{
						filemanager.fireEvent('renamefolderfailed', filemanager, opts, o);
					}

					// reset name
					//opts.node.setText(opts.oldName);
				}
			},
			scope: me,
			params: {
				action: 'rename-folder',
				//path: node.parentNode.data.id,	
				//path: node.parentNode.getPath(),
				path: filemanager.path,
				newName: newName,
				oldName: oldName
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
				case 'rename-file':
					
					if(me.eventsSuspended !== true)
					{
						me.fireEvent('renamefile', me, opts, o);// fire renamefile event
					}

					// change name of the record if it was changed
					// on the server
					if((null !== o.serverName) && Ext.isString(o.serverName))
					{
						opts.record.set('name', o.serverName);
					}

					// commit the change in the record
					opts.record.commit();
					break;
				
				case 'rename-folder':
					
					if(me.eventsSuspended !== true)
					{
						//me.fireEvent('renamefolder', me, opts, o);// fire renamefolder event
					}
					
					// change name of the record if it was changed
					// on the server
					if((null !== o.serverName) && Ext.isString(o.serverName))
					{
						//console.log(o.serverName);
						opts.record.set('text', o.serverName);
						opts.record.set('id', o.serverName);
					}

					// commit the change in the record
					opts.record.commit();
					me.cmp.tree.reloadNode(opts.record);
					break;
					
				default:
					break;
				}
		}
		else
		{
			switch(opts.params.action)
				{

				case 'rename-file':
					
					if(me.eventsSuspended !== true)
					{
						me.fireEvent('renamefilefailed', me, opts, o);
					}
					
					Ext.Msg.alert('Error', o.message);
					
					/*
					console.log(o);
					Ext.Msg.show({
						title: me.il8n.actionResponseFailureTitleText,
						msg: o.message,
						//buttons: Ext.Msg.OK,
						icon: Ext.Msg.ERROR,
						closable: true
					});
*/
					// reject the change in the record
					opts.record.reject();
					break;

				

				default:
					break;
				}
		}

	}
});

Ext.onReady(function()
		{	

	
	Ext.apply(Ext.Msg, {    
        
		rename: function(cfg, msg, value, fnbeforerender, fn, scope)
		{
			var me = this;
			me.rendered = false;
			
			if(Ext.isString(cfg))
			{
				cfg = {
					prompt: true,
					title: cfg,
					minWidth: me.minPromptWidth,
					width: 400,
					msg: msg,
					buttons: me.OKCANCEL,
					callback: fn,
					scope: scope,
					beforerender: fnbeforerender,
					multiline: false,
					value: value
				};
			}		
			
			if(cfg.beforerender)
			{
				me.on('beforerender', function(dialog){
					cfg.beforerender(me, dialog);				
				});
			}
			//me.textField.focus();
			//me.defaultFocus = me.textField;
			me.msgButtons.ok.handler = function(btn)
			{
		        var me = this,
		            value,
		            field;

		        if (me.cfg.prompt || me.cfg.multiline)
		        {
		        	field = (me.cfg.multiline) ? me.textArea : me.textField;
		            value = field.getValue();
		            //field.reset();
		        }

		        if(me.userCallback(btn.itemId, value, me) !== false)
		        {
		        	if (me.cfg.prompt || me.cfg.multiline)
		        		field.reset();
		        	
		        	btn.blur();
		        	me.hide();
		        }
		    };
			
			return me.show(cfg);
		},
	    
	    
		btnCallback: function(btn)
		{
	        var me = this,
	            value,
	            field;

	        if (me.cfg.prompt || me.cfg.multiline) {
	            if (me.cfg.multiline) {
	                field = me.textArea;
	            } else {
	                field = me.textField;
	            }
	            value = field.getValue();
	            //field.reset();
	        }

	        if(me.userCallback(btn.itemId, value, me) !== false)
	        {
	        	if (me.cfg.prompt || me.cfg.multiline)
	        		field.reset();
	        	
	        	btn.blur();
	        	me.hide();
	        }
	    }
		
	});
});