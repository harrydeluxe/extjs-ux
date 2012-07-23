/**
 * @class Ext.ux.filemanager.GridPanel
 * @extends Ext.Panel
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */
Ext.define('Ext.ux.filemanager.GridPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.ux-filemanagerpanel',
	
	uses: [	'Ext.ux.filemanager.plugin.Create',
	       	'Ext.ux.filemanager.plugin.DragSelector',
	       	'Ext.ux.filemanager.plugin.View',
 			'Ext.ux.filemanager.plugin.Reload',
 			'Ext.ux.filemanager.plugin.Rename',
 			'Ext.ux.filemanager.plugin.Grouping',
 			'Ext.ux.filemanager.plugin.Download',
 			'Ext.ux.filemanager.plugin.Upload',
 			'Ext.ux.filemanager.plugin.Delete',
 			'Ext.ux.filemanager.plugin.DragDrop'		
	 		],
	
	requires: ['Ext.data.SortTypes',
	           'Ext.ux.filemanager.view.Tree',
	           'Ext.ux.filemanager.view.Grid',
	           'Ext.ux.filemanager.store.Grid',
	           'Ext.ux.filemanager.model.Tree',
	           'Ext.ux.filemanager.store.Tree',
	           'Ext.ux.filemanager.model.Grid'],
	           
	           
	mixins: {
		il8n: 'Ext.ux.filemanager.locale.de_DE'
	},
	/**
	 * @cfg {String} foldersUrl The URL to fetch folders
	 */
	/**
	 * @cfg {String} filesUrl The URL to fetch files
	 */
	/**
	 * @cfg {String} dataUrl The URL that is used to process requests Required
	 *      if not all URL options are set Defaults to: 'files.php'
	 */
	dataUrl: '',
	layout: 'border',
	/**
	 * @cfg {String} rootNode description goes here
	 */
	// rootNode: 'Root',
	rootPath: '',
	path: '',
	readOnly: false,
	selectionMode: 'MULTI', // SINGLE,SIMPLE,MULTI
	border: false,
	treeConfig: {},
	gridConfig: {},
	gcm: [], // contextmenu grid
	gtb: [], // toolbar (Gridtoolbar)
	tcm: [], // contextmenu tree
	toolbaritems: {}, // contextmenu tree
	
	registerToolbarItem: function(name, item)
	{
		var me = this;
		me.toolbaritems[name] = item;
	},
	
	initComponent: function()
	{
		var me = this;
		me.actions = {};
		me.actionsTree = {};
		me.tree = Ext.create('Ext.ux.filemanager.view.Tree', Ext.applyRecursive(me.treeConfig, {
			region: 'west',
			width: 200,
			maxWidth: 500,
			minWidth: 50,
			resizable: {
				transparent: true,
				dynamic: true,
				handles: 'e',
				listeners: {
					resizedrag222: function(resizer, w, h)
					{
						// console.log(resizer, w, h);
						if(w <= 70)
						{
							// panel.setWidth(100);
							// resizer.destroy();
							// resizer.target.collapse();
							// panel.close();
						}
					}
				}
			},
			collapseMode: 'mini',
			hideCollapseTool: true,
			collapsible: true,
			// titleCollapse: false,
			// resizeHandles: 'e',
			bodyStyle: 'padding: 10px 0; border-right: none',
			tcm: me.tcm,
			foldersUrl: me.foldersUrl || me.dataUrl,
			rootNode: me.rootNode,
			rootPath: me.rootPath,
			path: me.path,
			
			store: Ext.create('Ext.ux.filemanager.store.Tree', {
				foldersUrl: me.foldersUrl,
				rootPath: me.rootPath,
				rootNode: me.rootNode
			}),
			actionsTree: me.actionsTree,
			listeners: {
				
				changeSelection: function(tree, view, node)
				//selectionChange: function(tree)
				{
					// console.log(tree.path);
					me.path = tree.path;
					me.grid.store.proxy.extraParams = {
						node: tree.path
					};
					me.grid.store.load();
				},
				
				collapse: {
					fn: function(panel)
					{
						// console.log(panel);
						Ext.getCmp('tbfill_1').setWidth(0);
						// Ext.getCmp('tbfill_1').setWidth(panel.width);
					},
					scope: this
				},
				beforeexpand: {
					fn: function(panel)
					{
						// console.log(panel);
						Ext.getCmp('tbfill_1').setWidth(panel.width);
					},
					scope: this
				},
				resize: {
					fn: function(panel, adjWidth, adjHeight)
					{
						// console.log(panel);
						Ext.getCmp('tbfill_1').setWidth(adjWidth);
						/*
						 * if(adjWidth <= 70) { //panel.setWidth(100);
						 * panel.collapse(); //panel.close(); }
						 */
					},
					scope: this
				}
			}
			
		}));
		
		me.dockedItems = [{
			dock: 'top',
			enableOverflow: true,
			xtype: 'toolbar',
			style: {
				background: 'transparent',
				border: 'none',
				padding: '5px 0'
			},
			listeners: {
				beforerender: function(toolbar)
				{
					var a = {
						// xtype:'splitbutton',
						// text: 'Actions',
						// textAlign: 'left',
						iconCls: 'ux-filemanager-icon-config',
						menu: [
						// me.toolbaritems.create,
						me.toolbaritems.rename,
								me.toolbaritems.download,
								'-',
								me.toolbaritems.reload]
					};
					toolbar.add({
						xtype: 'tbfill',
						id: 'tbfill_1',
						flex: 0
					});
					/**/
					toolbar.add(a);
					toolbar.add(me.toolbaritems.remove);
					toolbar.add(me.toolbaritems.create);
					toolbar.add(me.toolbaritems.upload);
					toolbar.add('->');
					toolbar.add({
						text: 'zu',
						handler: function(t)
						{
							me.tree.collapsed ? me.tree.expand() : me.tree.collapse();
						}
					});
					toolbar.add(me.toolbaritems.view);
					
				},
				scope: me
			}
		}];
		
		
		me.grid = Ext.create('Ext.ux.filemanager.view.Grid', Ext.applyRecursive(me.gridConfig, {
			//id: Ext.id(), // for dragdrop upload
			selectionMode: 'MULTI', // SINGLE,SIMPLE,MULTI
			region: 'center',
			filesUrl: me.filesUrl || me.dataUrl,
			store: Ext.create('Ext.ux.filemanager.store.Grid', {
				filesUrl: me.filesUrl
			}),
			gcm: me.gcm,
			actions: me.actions,
			listeners: {
				folderdblclick: {
					fn: function(grid)
					{
						me.tree.selectPath(grid.path, 'ids');
						// me.tree.selectPath('/'+(grid.path).replace(/(^\/+|\/+$)/g,
						// ""), 'ids');
					},
					scope: me
				},
				selectionChange: {
					fn: function(grid, sm)
					{
						// console.log(grid, sm);
						// sm.selected.length == 1
					},
					scope: me
				}
			}
		}));
		me.items = [me.tree,
				me.grid];
		me.callParent(arguments);
	},
	
	getPath: function()
	{
		return this.path;
	},
	
	setPath: function(path)
	{
		var me = this;
		me.path = path;
	},
	
	getSelection: function()
	{
	}
});