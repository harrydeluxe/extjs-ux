Ext.define('Ext.ux.filemanager.view.Grid', {
	extend: 'Ext.grid.GridPanel',

	mixins: {
		il8n: 'Ext.ux.filemanager.locale.de_DE'
	},
	
	layout: 'fit',
	loadMask: false,
	stateId: 'stateGridfilemanager',
	multiSelect: true,
	actions: {},

	
	formatName: function(value, p, record)
	{
		// return Ext.String.format('<div class="topic"><b>{0}</b><span
		// class="author">{1}</span></div>', value, record.get('name') ||
		// "Unknown");
		return Ext.String.format('<div class="topic">{0}</div>', value);
	},

	initComponent: function()
	{
		var me = this;
//console.log(me.id);
		me.addEvents('selectionChange',
				'selectfolder',
				'selectfile',
				'folderdblclick',
				'filedblclick');
/**/
		if(!me.id)
			me.id = Ext.id();

		// me.gridstore = Ext.create('Ext.ux.filemanager.store.Grid', me);

		Ext.apply(me, {
			
			/*
			 store: Ext.create('Ext.ux.filemanager.store.Grid', {
				filesUrl: me.filesUrl
			}),
			*/
			
			columns: [
			{
				xtype: 'gridcolumn',
				id: 'name',
				dataIndex: 'name',
				header: me.il8n.gridColumnNameHeaderText,
				sortable: true,
				hideable: false,
				flex: 1
			},
			{
				dataIndex: 'size',
				header: me.il8n.gridColumnSizeHeaderText,
				sortable: true,
				width: 90,
				align: 'right',
				renderer: Ext.util.Format.fileSize
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
				// stripeRows: false,
				chunker: Ext.view.TableChunker,
				emptyText: me.il8n.noFilesText,

				loadMask: false,

				listeners: {

					containercontextmenu:
					{
						fn: me.onContextMenu,
						scope: me
					},

					itemcontextmenu: function(view, rec, node, index, e)
					{
						// console.log('cont', view);
						me.onContextMenu(view, e);
					},

					itemmousedown: function(view, rec, node, index, e)
					{
						// if(view.selModel.selected &&
						// view.selModel.selected.length >= 1)
						// return false;
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
						// console.log('itemkeydown', e.keyCode);
					},

					itemdblclick: {
						fn: me.onDoubleClick,
						scope: me
					},

					render: function(view)
					{
						me.rowtip = Ext.create('Ext.tip.ToolTip', {
							target: view.el,
							delegate: view.itemSelector,
							trackMouse: true,
							showDelay: 700,
							disabled: true,
							listeners: {
								beforeshow: function updateTipBody(tip)
								{
									var r = view.getRecord(tip.triggerElement);
									if(r)
									{
										/*
										 * if(r.get('type') == 'folder') return
										 * false;
										 */
										tip.update([
														'Name: <b>' + r.get('name') + '</b><br />',
														'Typ: ' + r.get('type') + '<br />',
														'Größe: ' + Ext.util.Format.fileSize(r.get('size')) + '<br />',
														'Erstellt am: ' + Ext.util.Format.date(r.get('date_modified'), me.il8n.displayDateFormat)
																+ '<br />' ].join(""));
									}
								}
							}
						});
						me.rowtip.disable();
					}
				}
			},

			selModel: Ext.create('Ext.selection.RowModel', {
				mode: me.selectionMode,
				listeners: {
					selectionchange: function(sm, nodes)
					{
						var me = this;

						me._gridSelection = sm.selected; // aktuelle auswahl
															// speichern
						me._gridSelectionIsFolder = (sm.selected.length == 1 && sm.selected.items[0].data.type == 'folder') ? true : false;

						//me.fireEvent('selectionChange', me, sm, nodes);
						
						// @todo dieser teil muss überarbeitet werden,
						// z.B. wenn mehrere Dateien gewählt wurden
						if(sm.selected.length == 1)
						{							
							if(me._gridSelectionIsFolder)
							{				
								me.fireEvent('selectfolder', me, sm.selected.items);
							}
							else
							{
								me.fireEvent('selectfile', me, sm.selected.items);								
							}
						}
						
						

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

		});

		me.callParent(arguments);

		me.listeners = {
			afterrender: me.onAfterRender,
			scope: me
		};
	},

	onAfterRender: function(grid)
	{
		//@todo Bei Singleselect string a nicht anwenden
		var map = Ext.create('Ext.util.KeyMap', grid.el, [ {
			key: 65, // a
			ctrl: true,
			fn: function(c, e)
			{
				console.log('strg + a');
				e.stopEvent();
				grid.getView().getSelectionModel().selectAll();
				grid.getView().focus();
			}
		}, {
			key: 82, // r
			ctrl: true,
			fn: function(c, e)
			{
				console.log('strg + r');
				e.stopEvent();
				grid.reload();
				// panel.grid.getView().focus(); // ??
			}
		} ]);
	},

	onDoubleClick: function(view, record, item, index, event)
	{
		var me = this;

		if(record.data.type)
		{
			if(record.data.type == 'folder')
			{				
				var p = me.store.proxy.extraParams.node,
				separator = (p.substring(p.length - 1, p.length) == '/') ? '' : '/';
				
				me.path = me.store.proxy.extraParams.node + separator + record.data.name;
				//me.fireEvent('selectfolder', me, record);
				me.fireEvent('folderdblclick', me, record);
			}
			else
			{
				me.fireEvent('filedblclick', me, record);				
			}
		}
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
	onContextMenu: function(view, event)
	{
		var me = this, contextmenu = (me._gridSelectionIsFolder == true) ? me.getTreeContextMenu() : me.getContextMenu();

		event.stopEvent();
		contextmenu.showAt(event.getXY());
	},

	/**
	 * Gets and lazy creates context menu for file grid
	 * 
	 * @private
	 * @returns {Ext.menu.Menu} Context menu
	 */
	getContextMenu: function()
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
	 * Refreshes the grid with data from the server
	 * 
	 * @returns {Void}
	 */
	reload: function()
	{
		this.store.load();
	}

});