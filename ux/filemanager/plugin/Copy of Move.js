/**
 * @class CustomGridDragDrop
 * @extends Ext.grid.plugin.DragDrop
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('CustomGridDragDrop', {
	extend: 'Ext.grid.plugin.DragDrop',

	alias: 'plugin.customgridviewdragdrop',
    
    
	onViewRender: function()
	{
		this.callParent(arguments);

		var dz = this.dropZone;

		if(dz)
		{
			dz.onNodeOver = function(node, dragZone, e, data)
			{
				var me = this;
				//tip.disable(true);
				//console.log(me);
				me.overRecord = me.view.getRecord(node);
				//console.log(me.overRecord);
				me.valid = (!Ext.Array.contains(data.records, me.overRecord) && me.overRecord && me.overRecord.data && me.overRecord.data.type == 'folder') ? true : false;
				//me.valid = !Ext.Array.contains(data.records, me.overRecord);

				return me.valid ? me.dropAllowed : me.dropNotAllowed;
			};

			dz.onContainerOver = function()
			{
				//console.log('1');
				this.valid = false;
				return false;
			};

			dz.handleNodeDrop = function(data, record, position)
			{
				var droppedRecords = data.records;

				console.log(droppedRecords.length + ' records dropped');
				console.log('First record: ' + droppedRecords[0].get('name'));
				console.log('Drop target: ' + record.get('name'));
			};
		}
	}
});



Ext.define('CustomTreeViewDragDrop', {
	extend: 'Ext.tree.plugin.TreeViewDragDrop',

	alias: 'plugin.customtreeviewdragdrop',
   
    
	onViewRender: function(view)
	{
		var me = this,
			cmp = me.cmp;
		//console.log(me);
		me.callParent(arguments);

		if(me.dropZone)
		{
			me.dropZone.onNodeOver = function(node, dragZone, e, data)
			{
				//var me = this,
					//overRecord = me.view.getRecord(node);
				
				
				var position = this.getPosition(e, node),
	            returnCls = this.dropNotAllowed,
	            view = this.view,
	            targetNode = view.getRecord(node),
	            indicator = this.getIndicator(),
	            indicatorX = 0,
	            indicatorY = 0;

	        // auto node expand check
	        this.cancelExpand();
	        if (position == 'append' && !this.expandProcId && !Ext.Array.contains(data.records, targetNode) && !targetNode.isLeaf() && !targetNode.isExpanded()) {
	            this.queueExpand(targetNode);
	        }
	        
	        /*
	        if(!node || !data.item)
	        {
	            return false;
	        }
	        */
	        var tp = '/Root' + targetNode.getPath();
	        var sp = me.cmp.panel.path;
	        
	        if(tp != sp)
	        {	        
	        	this.valid = true;
	        	this.currentPosition = position;
	            this.overRecord = targetNode;
	            
	        	returnCls = Ext.baseCSSPrefix + 'tree-drop-ok-append';
	        	// @TODO: set a class on the parent folder node to be able to style it
	        	indicator.hide();
	        } else {
	            this.valid = false;
	        }
	 
	        this.currentCls = returnCls;
	        return returnCls;
				//me.callParent([node, dragZone, e, data]);
				
				//console.log(dragZone, data, me, cmp);
				//return false;
				//tip.disable(true);
				//console.log(me, node, dragZone, e, data);
				//console.log(me, me.view.getRecord(node));
				
				//me.overRecord = me.view.getRecord(node);
				//console.log(me.overRecord);
	//me.valid = (!Ext.Array.contains(data.records, overRecord) && overRecord && overRecord.data && overRecord.data.type == 'folder') ? true : false;
				//me.valid = !Ext.Array.contains(data.records, me.overRecord);

	//return me.valid ? me.dropAllowed : me.dropNotAllowed;
			};
/*
			me.dropZone.onContainerOver = function()
			{
				console.log('1');
				this.valid = false;
				return false;
			};
*/
			me.dropZone.handleNodeDrop = function(data, record, position)
			{
				console.log(this);
				this.overRecord.store.load();
				// @TODO: wenn ordner verschoben wurden, dann ein reload durchführen
			};
		}
		
	}
});


/**
 * Ext.ux.filebrowser.plugin.Move Class
 * 
 * @author Harald Hanek (c) 2011
 * 
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define("Ext.ux.filebrowser.plugin.Move", {
	extend: 'Ext.AbstractPlugin',
	alias: "plugin.filebrowser.move",

	 uses: [
	        'Ext.ux.filebrowser.plugin.dragdrop.Grid',
	        'Ext.ux.filebrowser.plugin.dragdrop.Grid'
	    ],

	
	
	
	/**
	 * @cfg {String} moveFileUrl The URL to move files Takes precedence over
	 *      dataUrl
	 */
	    
	    
	constructor: function(config)
	{
		//this.callParent(arguments);
		this.callParent([config]);
		var me = this,
			cmp = me.getCmp();
		
		//me.filebrowser = cmp;
		
		//console.log(cmp);
		Ext.applyRecursive(cmp.treeConfig, {
			viewConfig:
			{
				plugins: [{
		            ptype: 'customtreeviewdragdrop',
		            dropGroup: 'fileMoveDD',
		            enableDrag: false,
		            appendOnly: true,
		            cmp: cmp
		            
		        }],
		        
	            listeners: {
	            	drop: me.onTreeNodeDrop,
	            	scope: me
	            }
	        }
        });
		
		
		Ext.applyRecursive(cmp.gridConfig, {
			viewConfig:
			{
				plugins: [{
		            ptype: 'customgridviewdragdrop',
		            ddGroup: 'fileMoveDD',
		            //dragText: 'Drag and drop to reorganize',
		            enableDrop: true,
		            //appendOnly: true
		            getDragData: function(e) {
					        console.log(e);
		            		var sourceEl = e.getTarget(v.itemSelector, 10), d;
					        if (sourceEl) {
					            d = sourceEl.cloneNode(true);
					            d.id = Ext.id();
					            return v.dragData = {
					                sourceEl: sourceEl,
					                repairXY: Ext.fly(sourceEl).getXY(),
					                ddel: d,
					                patientData: v.getRecord(sourceEl).data
					            };
					        }
					    }
		        }],
		        
	            listeners: {
	            	drop: me.onGridNodeDrop,
	            	scope: me/*,
	            	render: me.initializeDragZone*/
	            }
	        }
        });		
	},
	
	
	
	init: function(cmp)
	{
		var me = this,
			filebrowser = cmp;

		me.filebrowser = filebrowser;

		filebrowser.addEvents(

				/**
				 * @event beforemovefile Fires before one or more files will be moved to
				 *        another folder on the server, return false to cancel the event
				 * 
				 * @param {Ext.ux.FileBrowser} this
				 * @param {Array} files An array containing Ext.data.Record objects
				 *            representing the file(s) to move
				 * @param {String} sourceFolder Path of the source folder
				 * @param {String} destinationFolder Path of the destination folder
				 */
				'beforemovefile',
				
				/**
				 * @event movefile Fires when file(s) was/were successfully moved
				 * 
				 * @param {Ext.ux.FileBrowser} this
				 * @param {Object} opts The options that were used for the original
				 *            request
				 * @param {Object} o Decoded response body from the server
				 */
				'movefile',
				
				/**
				 * @event movefilefailed Fires when moving file(s) failed
				 * 
				 * @param {Ext.ux.FileBrowser} this
				 * @param {Object} opts The options that were used for the original
				 *            request
				 * @param {Object} o Decoded response body from the server
				 */
				'movefilefailed'
		);
	},

	
	/**
	 * Event handler for when a file from the grid is dropped on a folder in the
	 * tree
	 * 
	 * @private
	 * @param {Object} nodeData Custom data associated with the drop node
	 * @param {Ext.dd.DragSource} source The source that was dragged over this
	 *            dragzone
	 * @param {Ext.EventObject} evt The Event object
	 * @param {Object} data Object containing arbitrairy data supplied by drag
	 *            source
	 * @returns {Boolean}
	 */
	onTreeNodeDrop: function(node, data, dropRec, dropPosition)
	{
		var me = this,
			from = me.cmp.path,
			to = '/Root' + dropRec.getPath();
				
		return me.moveFile(data.records, from, to);
	},

	
	onGridNodeDrop: function(node, data, dropRec)
	{
		var me = this,
			from = me.cmp.path,
			to = from + '/' + dropRec.data.name;
		
		return me.moveFile(data.records, from, to);
	},
	
	
	/**
	 * Move a file on the server to another folder
	 * 
	 * @private
	 * @param {Array} files Array of Ext.data.Record objects representing the
	 *            files to move
	 * @param {String} sourceFolder Source folder
	 * @param {String} destinationFolder Destination folder
	 * @param {Boolean} overwrite If files should be overwritten in destination,
	 *            defaults to false
	 * @returns {Void}
	 */
	moveFile: function(files, sourceFolder, destinationFolder, overwrite)
	{
		var me = this,
			filebrowser = me.cmp,
			params;

		// fire beforedeletefile event
		if(filebrowser.eventsSuspended !== true && filebrowser.fireEvent('beforemovefile', this, files, sourceFolder, destinationFolder) === false)
		{
			return;
		}
		
		
		/*
		var params;
		// fire beforemovefile event
		if(true !== this.eventsSuspended && false === this.fireEvent('beforemovefile', this, files, sourceFolder, destinationFolder))
		{
			return;
		}
*/
		// set request parameters
		params = {
			action: 'move-file',
			sourcePath: sourceFolder,
			destinationPath: destinationFolder,
			overwrite: (true === overwrite) ? true : false
		};

		// loop over files array and add request parameters
		// like:
		// files[rec-id] : filename.ext
		Ext.each(files, function(item, index, allItems)
		{
			params['files[' + item.id + ']'] = item.get('name');
		});
		/*
		console.log(params);
return;
		// send request to server
		Ext.Ajax.request({
			url: this.moveFileUrl || this.dataUrl,
			scope: this,
			callback: this.actionCallback,
			params: params
		});*/
		
		
		Ext.Ajax.request({
			url: me.moveFileUrl || filebrowser.dataUrl,
			callback: me.actionCallback,
			scope: me,
			params: params
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
		var me = this,
			filebrowser = me.cmp,
			o = {},
			store,
			record;

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

		console.log(o, me, filebrowser);
		// check if server reports all went well
		// handle success/failure accordingly
		if(true === o.success)
		{
			switch(opts.params.action)
			{
				case 'move-file':
					// fire movefile event
					if(filebrowser.eventsSuspended !== true)
					{
						filebrowser.fireEvent('movefile', filebrowser, opts, o);
					}

					store = filebrowser.grid.getStore();
					Ext.each(o.data.successful, function(item, index, allItems)
					{
						record = store.data.findBy(function(record)
						{
							return record.id === item.recordId;
						});
						store.remove(record);								
					});
					break;

				default:
					break;
				}
		}
		else
		{
			switch(opts.params.action)
				{
				case 'move-file':
					// fire movefilefailed event
					if(filebrowser.eventsSuspended !== true)
					{
						filebrowser.fireEvent('movefilefailed', filebrowser, opts, o);
					}

					// delete successfully moved record(s) from the
					// grid
					store = me.grid.getStore();
					Ext.each(o.data.successful, function(item, index, allItems)
					{
						record = store.getById(item.recordId);
						store.remove(record);
					});

					// prompt for overwrite
					if(o.data.existing.length > 0)
					{
						Ext.Msg.show({
							title: me.il8n.confirmOverwriteTitleText,
							msg: me.il8n.confirmOverwriteMsgText,
							buttons: Ext.Msg.YESNO,
							icon: Ext.Msg.QUESTION,
							closable: false,
							scope: this,
							fn: function(buttonId, text, cfg)
							{
								var files, store;
								if(buttonId === 'yes')
								{
									// create array with
									// remaining files
									files = [];
									store = me.grid.getStore();
									Ext.each(o.data.existing, function(item, index, allItems)
									{
										files.push(store.getById(item.recordId));
									});

									// call again, but with
									// overwrite option
									me.moveFile(files, opts.params.sourcePath, opts.params.destinationPath, true);
								}
							}
						});
					}
					break;

				default:
					break;
				}
		}

	}
});
