Ext.Loader.setConfig({
	'enabled': true,
	'paths': {
		'Ext.ux': 'http://extjs.cachefly.net/ext-4.1.1-gpl/examples/ux/',
		'Ext.ux.grid.plugin': '../../ux/grid/plugin',
		'Ext.ux.form.field': '../../ux/form/field'
	}
});

Ext.require([ 'Ext.ux.CheckColumn', 'Ext.ux.grid.plugin.RowEditing', 'Ext.ux.form.field.Grid' ]);

Ext.onReady(function()
{
	Ext.define('Numbers', {
		extend: 'Ext.data.Model',
		fields: [ {
			name: 'type',
			type: 'string'
		}, {
			name: 'number',
			type: 'string'
		}, {
			name: 'active',
			type: 'bool'
		} ]
	});

	var rowEditing = Ext.create('Ext.ux.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false
	});

	Ext.define('Ext.Rudi.grid.Panel', {
		extend: 'Ext.grid.Panel',
		mixins: [ 'Ext.ux.form.field.Grid' ],
		initComponent: function()
		{
			var me = this;
			
			me.callParent(arguments);
			
			// Init mixins
			me.initField();
		}
	});

	var grid = Ext.create('Ext.Rudi.grid.Panel', {
		title: 'Phone Number',
		name: 'phonenumbers',
		layout: 'fit',
		height: 190,
		store: Ext.create('Ext.data.Store', {
			model: 'Numbers',
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			},
			sorters: [ {
				property: 'type',
				direction: 'ASC'
			} ]
		}),
		columns: [ {
			header: 'Type',
			dataIndex: 'type',
			menuDisabled: true,
			sortable: true,
			width: 190,
			field: {
				xtype: 'combobox',
				editable: false,
				allowBlank: false,
				forceSelection: true,
				triggerAction: 'all',
				store: [ 'Home', 'Business', 'Mobile', 'Fax' ],
				queryMode: 'local',
				lazyRender: true,
				listClass: 'x-combo-list-small'
			}
		}, {
			header: 'Number',
			dataIndex: 'number',

			flex: 2,
			editor: {
				allowBlank: false,
				xtype: 'textfield'
			}
		}, {
			xtype: 'checkcolumn',
			header: 'Active',
			dataIndex: 'active',
			width: 60,
			editor: {
				xtype: 'checkbox',
				cls: 'x-grid-checkheader-editor'
			}
		} ],
		tbar: [ {
			text: 'Add',
			handler: function()
			{
				if(rowEditing.editing)
					return false;

				var r = {
					type: 'Home',
					number: '',
					active: true
				};

				rowEditing.startAdd(r, 0);
			}
		}, {
			itemId: 'removeEmployee',
			text: 'Remove',
			handler: function()
			{
				var sm = grid.getSelectionModel();
				rowEditing.cancelEdit();
				grid.store.remove(sm.getSelection());
			},
			disabled: true
		} ],
		plugins: [ rowEditing ],
		listeners: {
			'selectionchange': function(view, records)
			{
				grid.down('#removeEmployee').setDisabled(!records.length);
			}
		}
	});

	var formPanel = Ext.create('Ext.form.Panel', {
		renderTo: 'editor-grid',
		title: 'Form Panel',
		bodyStyle: 'padding:5px 5px 0',
		width: 600,
		height: 400,
        waitMsgTarget: true,

		items: [ {
			xtype: 'fieldset',
			title: 'Your Contact Information',
			defaultType: 'textfield',
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
			items: [ {
				xtype: 'fieldcontainer',
				layout: 'hbox',
				combineErrors: true,
				defaultType: 'textfield',
				defaults: {
					labelAlign: 'top'
				},
				items: [ {
					name: 'firstName',
					fieldLabel: 'First Name',
					flex: 2,
					allowBlank: false
				}, {
					name: 'lastName',
					fieldLabel: 'Last Name',
					flex: 3,
					margins: '0 0 0 6',
					allowBlank: false
				} ]
			}, {
				xtype: 'fieldcontainer',
				layout: 'hbox',
				defaultType: 'textfield',
				defaults: {
					labelAlign: 'top'
				},
				items: [ {
					name: 'company',
					fieldLabel: 'Company',
					flex: 2
				}, {
					name: 'email',
					fieldLabel: 'Email',
					vtype: 'email',
					flex: 3,
					margins: '0 0 0 6'
				} ]
			} ]
		},

		grid

		],

		buttons: [ '->', {
			text: 'Load',
			handler: function()
			{
				formPanel.getForm().load({
					method: 'get',
					url: 'grid.json',
					waitMsg: 'Loading...'
				});
			}
		}, {
			text: 'Save',
			formBind: true,
			handler: function()
			{
				this.up('form').getForm().submit({
					url: 'grid.json',
					submitEmptyText: false,
					waitMsg: 'Saving Data...'
				});
			}
		}, {
			text: 'Reset',
			formBind: true,
			handler: function()
			{
				this.up('form').getForm().reset();
			}
		}]
	});
});