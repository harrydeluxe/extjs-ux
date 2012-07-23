

/**
 * Additional Format function(s) to use
 */
Ext.apply(Ext.util.Format, {
	/**
	 * Format filesize to human readable format Also deals with filesizes in
	 * units larger then MegaBytes
	 * 
	 * @param {Integer} size Filesize in bytes
	 * @returns {String} Formatted filesize
	 */
	bytesToSi: function(size)
	{
		//console.log(size);
		if(typeof size === 'number' && size > 0)
		{
			var s, e, r;
			s = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
			e = Math.floor(Math.log(size) / Math.log(1024));
			r = size / Math.pow(1024, e);
			if(Math.round(r.toFixed(2)) !== r.toFixed(2))
			{
				r = r.toFixed(2);
			}
			return r + ' ' + s[e];
		}
		else
		{
			return '';
		}
	}
});


/**
 * @class Ext.ux.filemanager.Panel
 * @extends Ext.Panel
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.filemanager.Panel', {
	extend: 'Ext.Panel',
	alias: 'widget.ux-filemanagerpanel',
	
	/**
	 * @cfg {String} getFoldersUrl
	 * The URL to fetch folders Takes precedence over dataUrl
	 */
	
	/**
	 * @cfg {String} getFilesUrl
	 * The URL to fetch files Takes precedence over dataUrl
	 */
	
	/**
	 * @cfg {String} createFolderUrl
	 * The URL to create a folder Takes precedence over dataUrl
	 */
	
	/**
	 * @cfg {String} dataUrl
	 * The URL that is used to process requests Required if not all URL options are set Defaults to: 'filemanagerpanel.php'
	 */
	dataUrl: '',

	/**
	 * @cfg {String} defaultThumbnailImage
	 * Default image to use in thumnail view
	 */
	defaultThumbnailImage: 'media/icons/48/document_blank.png',


	layout: 'border',
		
	rootNode: 'Root',
	rootId: 'Root',
	rootPath: '/',
	path: '',
	
	readOnly: false,
	
	
	selectionMode: 'MULTI', // SINGLE,SIMPLE,MULTI
	border: false,
	
	treeConfig: {},
	gridConfig: {},
	
	gcm: [], // contextmenu grid
	gtb: [], // toolbar (Gridtoolbar)
	
	tcm: [], // contextmenu tree
	
	
	initComponent: function()	
	{
		var me = this;


		me.addEvents(	
			//'beforeupload', 			// ???
			'gridSelectionChange', 		// harry
			'treeSelectionChange' 		// harry
		);

		
		me.actions = {};
		me.actionsTree = {};

		
		me.tree = Ext.create('Ext.tree.TreePanel', Ext.applyRecursive(me.treeConfig, {
			//cls: 'ux-filemanager-tree',
			title: me.il8n.treePanelHeaderText,
			//collapsed: true,
			region: 'west',
			width: 200,
			autoScroll: true,
			containerScroll: true,
			split: true,
			collapseMode: 'mini',
			collapsible: true,
			animate: true,
			useArrows: true,
			
			
			stateId: 'stateTreefilemanager',
			
			viewConfig: {
				loadMask: false,
				singleSelect: true
	        },
	        
			store: Ext.create('Ext.data.TreeStore', {
		        model: 'Ext.ux.filemanager.model.Tree',
				appendId: true,
				proxy: {
		            type: 'ajax',
		            extraParams: {
		            	action: "get-folders"
		            },
		            reader: {
		                type: 'json'
		            },
		            url: me.getFoldersUrl || me.dataUrl
		        },
		        fields: ['text','type','ids','leaf'],
		        root: {
		        	text: me.rootNode || 'Root',
		            id: me.rootId || 'Root',
		            ids: 'media',
		            expanded: true
		        },
		        //autoLoad: false,
		        //nodeParam: 'path',
		        listeners: {
		        	
		        	beforeload: function(store, operation)
		        	{
		        		operation.params.node = me.rootPath + operation.node.getPath();		        		
		        	},

		        	load: function(a, b, records)
		        	{		        		
		        		// wenn der record ohne id kommt!!!
		        		Ext.each(records, function(record)									
		    			{
		        			//console.log(record.data);
		        			if(record.data.id == "")
		        				record.data.id = record.data.parentId + "/" + record.data.text;	
		    			});
		        		
		        		if(!me.firstload)
		        		{
		        			me.firstload = true;
		        			if(me.path != '')
		        				me.tree.selectPath("root/" + me.path.replace(/(^\/+|\/+$)/g, ""));
		        		}
		        	}
				},
		        folderSort: true,
		        sorters: [{
		            property: 'text',
		            direction: 'ASC'
		        }]
		    }),		
		    
		    
			listeners: {
				containercontextmenu: {
					fn: function(view, e){e.stopEvent();},
					scope: me					
				},
				
				itemcontextmenu: {
					fn: me.onTreeContextMenu,
					scope: me
				},
				
				afterrender: {
					fn: me.onTreeAfterRender,
					scope: me,
					single: true
				},
				
				selectionchange: {
					fn: me.onTreeSelectionChange,
					scope: me
					//single: true
				}
			}
		}));

			
		me.gridToolbar = Ext.create('Ext.toolbar.Toolbar', {
			listeners:
			{
				beforerender: function(toolbar)
				{
					Ext.each(me.gtb, function(tb)									
					{
						toolbar.add(tb);				
					});
				},
				scope: me
			}
		});

		me.gridstore = Ext.create('Ext.ux.filemanager.store.Grid', me);
		/*
		me.gridstore = Ext.create('Ext.data.Store', {
	        model: 'Ext.ux.filemanager.model.Grid',
	        proxy: {
	            type: 'ajax',
	            api: {
	                read    : me.getFilesUrl || me.dataUrl + "?action=get-files",
	                create  : undefined,
	                update  : undefined,
	                destroy : undefined
	            },
	            reader: {
	                type: 'json',
	                successProperty: 'success',
	                root: 'data',
	                messageProperty: 'message'
	            },
	            listeners: {
	                exception: function(proxy, response, operation){
	                    Ext.MessageBox.show({
	                        title: 'REMOTE EXCEPTION',
	                        msg: operation.getError(),
	                        icon: Ext.MessageBox.ERROR,
	                        buttons: Ext.Msg.OK
	                    });
	                }
	            }
	        },
	        
	        //groupField: 'type',
	    	 sorters: [
	    	           {property: 'type', direction: 'ASC'},
	    	          {property: 'name', direction: 'ASC' }
	    	          ]
	    });
*/
       

		
		me.grid = Ext.create('Ext.grid.GridPanel', Ext.applyRecursive(me.gridConfig, {
			id: 'fbgrid', // for dragdrop upload
			region: 'center',
			layout: 'fit',
			tbar: me.gridToolbar,
			loadMask: false,
			stateId: 'stateGridfilemanager',
			
			multiSelect: true,
			//singleSelect: false,
			store: me.gridstore,
			columns: [ {
				xtype: 'gridcolumn',
				id: 'name',
				dataIndex: 'name',
				header: me.il8n.gridColumnNameHeaderText,
				sortable: true,
				hideable: false,
				flex: 1
			}, {
				// xtype: 'numbercolumn',
				dataIndex: 'size',
				header: me.il8n.gridColumnSizeHeaderText,
				sortable: true,
				width: 60,
				align: 'right',
				renderer: Ext.util.Format.bytesToSi
			}, {
				dataIndex: 'type',
				header: me.il8n.gridColumnTypeHeaderText,
				sortable: true,
				width: 80
			}, {
				// xtype: 'booleancolumn',
				dataIndex: 'date_modified',
				header: me.il8n.gridColumnDateModifiedText,
				sortable: true,
				width: 120,
				renderer: Ext.util.Format.dateRenderer(me.il8n.displayDateFormat)
			} ],
			

	        viewConfig: {
	            stripeRows: false,
	            //multiSelect: true,
	            chunker: Ext.view.TableChunker,				
	            emptyText: me.il8n.noFilesText,
	            
	            loadMask: false,
	            
	            
	            listeners: {
	            	containercontextmenu: {
						fn: me.onGridContextMenu,
						scope: me
					},
	                itemcontextmenu: function(view, rec, node, index, e)
	                {
	                	//console.log('cont', view);
	                	me.onGridContextMenu(view, e);
	                },
	                itemmousedown: function(view, rec, node, index, e)
	                {	               	                	
	                	//if(view.selModel.selected && view.selModel.selected.length >= 1)
	                		//return false;	                	
	                },
	                
	                beforeitemmousedown: function(view, rec, node, index, e)
	                {
	                	if(e.button > 0)
	                	{
	                		e.stopEvent();
	                		return false;
	                	}
	                },
	                
	                itemkeydown: function(view, rec, node, index, e)
	                {
	                	//console.log('itemkeydown', e.keyCode);
	                },
	                itemdblclick: {
						fn: me.onGridDoubleClick,
						scope: me
					},
	                render: function(view) {

	                	me.rowtip = Ext.create('Ext.tip.ToolTip', {
	                		target: view.el,
	                		delegate: view.itemSelector,
	                		trackMouse: true,	                		
	                	    listeners:
	                	    {
	                			beforeshow: function updateTipBody(tip)
	                			{
	                				var r = view.getRecord(tip.triggerElement);
	                				
	                				/*if(r.get('type') == 'folder')
	                					return false;
	                				*/
	                				tip.update(['Name: <b>' + r.get('name') + '</b><br />',
	                				'Typ: ' + r.get('type') + '<br />',
	                				'Größe: ' + Ext.util.Format.bytesToSi(r.get('size')) + '<br />',
	                				'Erstellt am: ' + Ext.util.Format.date(r.get('date_modified'), me.il8n.displayDateFormat) + '<br />'].join(""));
	                				//return true;
	                			}
	                		}
	                	});
	                	me.rowtip.disable();
	                }
	            }	            
	            //loadMask: false,
	            //loadingText: null, // wie blöd ist das denn?
	            //loadingUseMsg: false,	            
	        },
		   
	        
	    	selModel: Ext.create('Ext.selection.RowModel', {
	    		mode: me.selectionMode,
	    		listeners: {
					selectionchange: function(sm, nodes)	
			    	{
			    		var me = this;
			    		
			    		me._gridSelection = sm.selected; // aktuelle auswahl speichern
			    		me._gridSelectionIsFolder = (sm.selected.length == 1 && sm.selected.items[0].data.type == 'folder') ? true : false;

			    		me.fireEvent('gridSelectionChange', me, sm);
			    		
			    		Ext.each(Ext.Object.getValues(me.actions), function(action)
			    		{
			    			if(action.items && action.items[0] && action.items[0].canToggle)
			    			{
			    				var disabled = true;

		    					if(sm.hasSelection() && (sm.selected.length == 1 || !action.items[0].singleFile))
		    					{		    						
		    						disabled = (me._gridSelectionIsFolder == true && action.items[0].folder == false) ? true : false;
		    					}
		    					else if(sm.hasSelection() && sm.selected.length > 1)
		    					{
		    						disabled = (action.items[0].singleFile) ? true : false;	    						
		    					}
		    					else
	    						{
	    							disabled = true;
	    						}

		    					if(me.readOnly && action.items[0].readOnly)
		    					{
		    						disabled = true;
		    					}
		    					
			    				action.setDisabled(disabled);
			    			}
			    		});
			    	},
			    	
			    	beforeselect: function(a, b, c)
			    	{
			    		
			    	},
			    	scope: me
				}
	    	})
	        
		}));


		
		me.items = [ me.tree, me.grid];
		me.callParent();
		
		me.listeners = {
			afterrender: me.onAfterRender,
            scope: me
		};
	},

	
	onAfterRender: function(panel)
	{
		var map = Ext.create('Ext.util.KeyMap', panel.el,
				[
				   {
						key: 65,	// a
						ctrl: true,
						fn: function(c, e)
						{
							console.log('strg + a');
							e.stopEvent();
							panel.grid.getView().getSelectionModel().selectAll();
							panel.grid.getView().focus();
						}
					},
					{
						key: 82,	// r
						ctrl: true,
						fn: function(c, e)
						{
							console.log('strg + r');
							e.stopEvent();
							panel.reloadGrid();
							//panel.grid.getView().focus();	// ??
						}
					}
			]);
		// evtl. noch ein destroy einbauen
		
		//console.log('onAfterRender');
	},

	
	onGridDoubleClick : function(view, record, item, index, event)
	{
		
		if(record.data.type && record.data.type == 'folder')
		{
			var path = this.path.replace(new RegExp("^"+ this.rootPath +"", "g"), "");
			
			this.tree.selectPath(("root" + path + "/" + record.data.name).replace(/(^\/+|\/+$)/g, ""));
		}
	},

	
	/**
	 * Event handler for when tree node is right-clicked Shows context menu
	 * 
	 * @private
	 * @param {Ext.tree.TreeNode} node Tree node that was right-clicked
	 * @param {Ext.EventObject} evt Event object
	 * @returns {Void}
	 */
	onTreeContextMenu: function(view, record, item, index, event)
	{
		var me = this,
			contextmenu = me.getTreeContextMenu();

		event.stopEvent();
		contextmenu.showAt(event.getXY());
	},

	
	/**
	 * Gets and lazy creates context menu for folder tree
	 * 
	 * @private
	 * @returns {Ext.menu.Menu} Context menu
	 */
	getTreeContextMenu: function()
	{
		var me = this;
		
		if(!me.treeContextMenu)
		{
			me.treeContextMenu = Ext.create('Ext.menu.Menu', {				
				items: me.tcm
			});
		}
		return me.treeContextMenu;
		
	},
	
	
	/**
	 * Event handlers for when grid row is right-clicked Shows context menu
	 * 
	 * @private
	 * @param {Ext.grid.GridPanel} grid Grid panel that was right-clicked
	 * @param {Integer} rowIndex Index of the selected row
	 * @param {Ext.EventObject} evt Event object
	 * @returns {Void}
	 */		
	onGridContextMenu: function(view, event)
	{
		var me = this,
			contextmenu = (me._gridSelectionIsFolder == true) ? me.getTreeContextMenu() : me.getGridContextMenu();
		
		event.stopEvent();
		contextmenu.showAt(event.getXY());
	},

	/**
	 * Gets and lazy creates context menu for file grid
	 * 
	 * @private
	 * @returns {Ext.menu.Menu} Context menu
	 */
	getGridContextMenu: function()
	{
		var me = this;
		
		if(!me.gridContextMenu)
		{
			me.gridContextMenu = Ext.create('Ext.menu.Menu', {				
				items: me.gcm
			});
		}
		return me.gridContextMenu;
	},

	
	/**
	 * Event handler for when the selection changes in the tree Appends the
	 * folder path of the selected node to the request Causes files to be loaded
	 * in the grid for selected node Toggles displaying of 'minus' and 'gear'
	 * tools depending on selection
	 * 
	 * @private
	 * @param {Ext.tree.DefaultSelectionModel} sm Selection model
	 * @param {Ext.tree.TreeNode} node The selected tree node
	 * @returns {Void}
	 */
	onTreeSelectionChange: function(view, selection)
	{
		var me = this;
		
		if(selection[0])
		{
			var node = selection[0];
			me.path = me.rootPath + node.getPath();
			me.grid.store.proxy.extraParams = { path: me.path };
			me.grid.store.load();
			
			if(me.actionsTree.rename)
			{
				// actions ein/ausschalten
				me.actionsTree.rename.setDisabled(!node.parentNode);
				me.actionsTree.rename.setDisabled(node.isRoot());
				//console.log(node.isRoot());
			}
			
			me.fireEvent('treeSelectionChange', me, view);
		}
	},
	

	/**
	 * Event handler for when the tree is renderer Selects the root node,
	 * causing the files in the root to be loaded
	 * 
	 * @private
	 * @param {Ext.tree.TreePanel} tree The tree panel
	 * @returns {Void}
	 */
	onTreeAfterRender: function(tree)
	{
		//console.log('onTreeAfterRender');
		var me = this,
			root = tree.getRootNode();
		
		if(me.path != '')
		{
			if(!me.firstload)
				tree.selectPath("root/" + me.path.replace(/(^\/+|\/+$)/g, ""));
		}
		else if(root)
			tree.getView().getSelectionModel().select(root);
	},

	
	/**
	 * Event handler when the grid is rendered Creates a new tooltip that shows
	 * on the grid rows
	 * 
	 * @private
	 * @param {Ext.grid.GridPanel} grid The grid panel
	 * @returns {Void}
	 */
	onGridRender: function(grid)
	{
		
	},
	

	/**
	 * Refreshes the grid with data from the server
	 * 
	 * @returns {Void}
	 */
	reloadGrid: function()
	{
		this.grid.store.load();
	},

	
	/**
	 * Refreshes the tree with data from the server
	 * 
	 * @returns {Void}
	 */
	reloadTreeNode: function(node)
	{
		var me = this,
			node = (node) ? node : me.tree.getSelectionModel().getSelection()[0];
		
		me.tree.store.load({
		    node: node
		});
	}
	
});



/**
 * Strings for internationalization
 */
//Ext.define('Ext.ux.filemanager.Panel.il8n', {
Ext.ux.filemanager.Panel.prototype.il8n = {
	displayDateFormat: 'd.m.Y H:i',
	newText: 'Neu',
	renameText: 'Umbenennen',// 'Rename',
	deleteText: 'Löschen',// 'Delete',
	uploadText: 'Dateien hinzufügen ...',// 'Upload',
	downloadText: 'Herunterladen',// 'Download'
	viewsText: 'Views',
	detailsText: 'Details',
	thumbnailsText: 'Thumbnails',
	newFolderText: 'Neuer Ordner',// 'New-Folder',
	noFilesText: 'Keine Dateien in diesem Ordner',// 'No files to display'
	treePanelHeaderText: 'Ordner',// 'Folders'
	gridPanelHeaderText: 'Dateien',// 'Files'
	gridColumnNameHeaderText: 'Name',
	gridColumnSizeHeaderText: 'Größe',
	gridColumnTypeHeaderText: 'Type',
	gridColumnDateModifiedText: 'Änderungsdatum',// 'Date Modified',
	extensionChangeTitleText: 'Error changing extension',
	extensionChangeMsgText: "Cannot rename '{0}'. You cannot change the file extension.",
	confirmDeleteFolderTitleText: 'Confirm folder delete',
	confirmDeleteFolderMsgText: "Are you sure you want to remove the folder '{0}' and all of it's contents?",
	confirmDeleteSingleFileTitleText: 'Datei löschen',// 'Confirm file
														// delete',
	confirmDeleteSingleFileMsgText: "Are you sure you want to delete '{0}'?",
	confirmDeleteMultipleFileTitleText: 'Dateien löschen',// 'Confirm multiple
															// file delete'
	confirmDeleteMultipleFileMsgText: "Are you sure you want to delete these {0} files?",
	confirmOverwriteTitleText: 'Confirm file replace',
	confirmOverwriteMsgText: 'One or more files with the same name already exist in the destination folder. Do you wish to overwrite these?',
	actionRequestFailureTitleText: 'Oh dear..',
	actionRequestFailureMsgText: "It seems like your colleague spilled coffee on your keyboard. We can't send your request until you hang it out to dry",
	actionResponseFailureTitleText: 'PANIC!!',
	actionResponseFailureMsgText: 'Pink elephants are stampeding through the server! Run for the hills!'
};






