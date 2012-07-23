Ext.define('Ext.ux.filebrowser.view.Tree', {
	extend: 'Ext.tree.TreePanel',

	mixins: {
		il8n: 'Ext.ux.filebrowser.locale.de_DE'
	},

	autoScroll: true,
	containerScroll: true,
	animate: true,
	useArrows: true,
	actionsTree: {},

	initComponent: function()
	{
		var me = this;

		me.addEvents('selectionChange2');
//console.log(me);
		Ext.applyRecursive(me, {

			viewConfig: {
				loadMask: false,
				singleSelect: true
			},

			store: Ext.create('Ext.ux.filebrowser.store.Tree', {
				foldersUrl: me.foldersUrl,
				rootPath: me.rootPath,
				rootNode: me.rootNode,
				listeners: {

					load: function(a, node, records, successful)
					{
						/*//console.log(me);
						if(!me.firstload)
						{
							me.firstload = true;
							var root = me.getRootNode();

							if(me.path != '')
							{
								me.selectPath(me.path, 'ids');
							}
							else if(root)
								me.getView().getSelectionModel().select(root);
						}*/
					}
				}
			}),

			listeners: {
				afterlayout: {
					fn: function(tree)
					{
						var path = tree.path;
						tree.store.load({
							scope: tree,
							callback: function(records, operation, success)
							{
								if(!path)
									tree.getRootNode().expand();
							}
						});
					},
					single: true,
					scope: me
				},
				containercontextmenu: {
					fn: function(view, e)
					{
						e.stopEvent();
					},
					scope: me
				},
				itemcontextmenu: {
					fn: me.onContextMenu,
					scope: me
				},
				select: me.onSelect,
				scope: me
			}
		});

		me.callParent(arguments);
	},

	/**
	 * Event handler for when tree node is right-clicked Shows context menu
	 * 
	 * @private
	 * @param {Ext.tree.TreeNode} node Tree node that was right-clicked
	 * @param {Ext.EventObject} evt Event object
	 * @returns {Void}
	 */
	onContextMenu: function(view, record, item, index, event)
	{
		var me = this,
			contextmenu = me.getContextMenu();

		event.stopEvent();
		contextmenu.showAt(event.getXY());
	},

	/**
	 * Gets and lazy creates context menu for folder tree
	 * 
	 * @private
	 * @returns {Ext.menu.Menu} Context menu
	 */
	getContextMenu: function()
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

	onSelect: function(view, node)
	{
		var me = this, s = (me.getRootNode().data.ids != me.rootPath) ? me.rootPath : '';

		//console.log(me.getRootNode(), me);
		// me.path = node.getRealPath('ids');
		me.path = s + node.getRealPath('ids');

		if(me.actionsTree.rename)
		{
			// actions ein/ausschalten
			me.actionsTree.rename.setDisabled(!node.parentNode);
			me.actionsTree.rename.setDisabled(node.isRoot());
			// console.log(node.isRoot());
		}

		me.fireEvent('selectionChange2', me, view);
	},

	/**
	 * Refreshes the tree with data from the server
	 * 
	 * @returns {Void}
	 */
	reloadNode: function(node)
	{
		var me = this, node = (node) ? node : me.getSelectionModel().getSelection()[0];

		// console.log(node, node.getRealPath());
		// operation.node.getRealPath();
		/*
		 * me.store.load({ node: node });
		 */
		node.removeAll();
		/**/
		me.store.load({
			node: node
		});
	}

});