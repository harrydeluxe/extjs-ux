/**
 * @class Ext.ux.filemanager.view.Grid
 * @extends Ext.grid.Panel
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.view.Grid', {
    extend: 'Ext.grid.Panel',
    mixins: {
        il8n: 'Ext.ux.filemanager.locale.de_DE'
    },
    
    requires: ['Ext.tip.ToolTip',
               'Ext.util.KeyMap'],
    
    
    layout: 'fit',
    loadMask: false,
    // stateId: 'stateGridfilemanager',
    multiSelect: true,
    actions: {},
    
    initComponent: function()
    {
        var me = this;
        
        me.addEvents('selectionChange', 'selectfolder', 'selectfile', 'folderdblclick', 'filedblclick');
        
        Ext.applyRecursive(me, {
            columns: [{
                dataIndex: 'name',
                text: me.il8n.gridColumnNameHeaderText,
                sortable: true,
                hideable: false,
                flex: 1,
                minWidth: 120, // ????
                renderer: function(value, meta, record)
                {
                    meta.tdCls = 'ux-filemanager-grid-cell-inner ' + record.data.row_class;
                    return '<img src="' + Ext.BLANK_IMAGE_URL + '">' + value;
                }
            },
            {
                dataIndex: 'size',
                text: me.il8n.gridColumnSizeHeaderText,
                sortable: true,
                width: 90,
                align: 'right',
                renderer: Ext.util.Format.fileSize
            },
            {
                dataIndex: 'type',
                text: me.il8n.gridColumnTypeHeaderText,
                sortable: true,
                width: 120
            },
            {
                dataIndex: 'date_modified',
                text: me.il8n.gridColumnDateModifiedText,
                sortable: true,
                width: 120,
                xtype: 'datecolumn',
                format: me.il8n.displayDateFormat
            // renderer:
            // Ext.util.Format.dateRenderer(me.il8n.displayDateFormat)
            }],
            viewConfig: {
                // stripeRows: false,
                chunker: Ext.view.TableChunker,
                emptyText: me.il8n.noFilesText,
                loadMask: false,
                listeners: {
                    
                    beforeitemmousedown: {
                        fn: function(view, rec, node, index, e)
                        {
                            if(e.button > 0)
                            {
                                e.stopEvent();
                                return false;
                            }
                        },
                        scope: me
                    },
                    
                    itemdblclick: {
                        fn: me.onDoubleClick,
                        scope: me
                    },
                    
                    render: {
                        fn: function(view)
                        {
                            me.rowtip = new Ext.tip.ToolTip({
                                target: view.el,
                                delegate: view.itemSelector,
                                trackMouse: true,
                                showDelay: 700,
                                disabled: true,
                                listeners: {
                                    beforeshow: {
                                        fn: function(tip)
                                        {
                                            //console.log(view);
                                            var r = view.getRecord(tip.triggerElement);
                                            if(r)
                                            {
                                                tip.update(['Name: <b>' + r.get('name') + '</b><br />',
                                                        'Typ: ' + r.get('type') + '<br />',
                                                        'Größe: ' + Ext.util.Format.fileSize(r.get('size')) + '<br />',
                                                        'Erstellt am: ' + Ext.util.Format.date(r.get('date_modified'), me.il8n.displayDateFormat)
                                                                + '<br />'].join(""));
                                            }
                                        },
                                        scope: me
                                    }
                                }
                            });
                            me.rowtip.disable();
                        },
                        scope: me
                    }
                }
            },
            
            selModel: {
                mode: me.selectionMode
            },
            
            listeners: {
                selectionchange: {
                    fn: function(sm, nodes)
                    {
                        me._gridSelection = sm.selected; // aktuelle auswahl
                        // speichern
                        me._gridSelectionIsFolder = (sm.selected.length == 1 && sm.selected.items[0].data.type == 'folder') ? true : false;
                        // me.fireEvent('selectionChange', me, sm, nodes);
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
                    scope: me
                }
            }
        });
        
        me.callParent(arguments);
    },
    
    afterRender: function()
    {
        var me = this;

     // @todo Bei Singleselect string a nicht anwenden
        me.keyMap = new Ext.util.KeyMap({
            target: me.el,
            eventName: 'keydown',
            binding: [{
                key: 65, // a
                ctrl: true,
                fn: function(c, e)
                {
                    // console.log('strg + a');
                    e.stopEvent();
                    me.getView().getSelectionModel().selectAll();
                    me.getView().focus();
                }
            },
            {
                key: 82, // r
                ctrl: true,
                fn: function(c, e)
                {
                    // console.log('strg + r');
                    e.stopEvent();
                    me.reload();
                }
            }]
        });
        
        me.callParent(arguments);
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
                // me.fireEvent('selectfolder', me, record);
                me.fireEvent('folderdblclick', me, record);
            }
            else
            {
                me.fireEvent('filedblclick', me, record);
            }
        }
    },
    
    /**
     * Refreshes the grid with data from the server
     * 
     * @returns {Void}
     */
    reload: function()
    {
        //this.store.load();
        
        this.store.load({
            scope: this,
            callback: function(records, operation, success) {
                //console.log(records);
                this.focus();
            }
        });
    }
});