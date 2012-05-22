/**
 * @class Ext.ux.grid.property.Grid
 * @extends Ext.grid.property.Grid
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.grid.property.Grid', {
    extend: 'Ext.grid.property.Grid',
    
    uses: [ 'Ext.ux.grid.property.Store',
            'Ext.ux.grid.property.HeaderContainer',
            'Ext.grid.feature.Grouping'],
    
    alias: 'widget.ux.propertygrid',
    
    /**
     * @cfg {String} groupField
     * The name of the field from the property store to use as the grouping field.
     */
    groupField: 'group',
    
    /**
     * @cfg {String} editableField
     * 
     */
    editableField: 'editable',
    
    /**
     * @cfg {String} groupingConfig
     * 
     */
    groupingConfig: {},

    
    viewConfig: {
        forceFit: true,
        getRowClass: function(record)
        {
            return (record.data[this.ownerCt.editableField] == false) ? "x-item-disabled" : "";
        },
        listeners:
        {
            beforeitemmousedown: function(view, record)
            {
                if(record && record.data.disabled)
                    return false;
            }
        }
    },

    
    /**
     * @private
     */
    initComponent: function()
    {
        var me = this,
            editableField = me.editableField;

        if(!Ext.get('Ext.ux.grid.property.Grid'))
            Ext.getBody().createChild({
                tag: 'style',
                type: 'text/css',
                id: 'Ext.ux.grid.property.Grid',
                html: '.x-item-disabled div.x-grid-cell-inner {color: gray !important;}'
            });

        me.addCls(Ext.baseCSSPrefix + 'property-grid');
        
        me.plugins = me.plugins || [];
        
        // Enable cell editing. Inject a custom startEdit which always edits
        // column 1 regardless of which column was clicked.        
        me.plugins.push(new Ext.grid.plugin.CellEditing({
            clicksToEdit: me.clicksToEdit,
            // Inject a startEdit which always edits the value column
            startEdit: function(record, column, e)
            {
                if(record.data && record.data[editableField] == false)
                    return false;
                
                // Maintainer: Do not change this 'this' to 'me'! It is the
                // CellEditing object's own scope.
                return this.self.prototype.startEdit.call(this, record, me.headerCt.child('#' + me.valueField));
            }
        }));

        me.features = me.features || [];

        me.groupingFeature = new Ext.grid.feature.Grouping(Ext.apply({
            groupHeaderTpl: '{name}',
            enableGroupingMenu: true,
            groupField: me.groupField
        }, me.groupingConfig));
        
        me.features.push(me.groupingFeature);       
        
        me.selModel = {
            selType: 'cellmodel',
            onCellSelect: function(position)
            {
                var record = me.store.getAt(position.row);
                if(record && record.data[editableField] == false)
                    return false;
                
                if(position.column != 1)
                    position.column = 1;
                
                return this.self.prototype.onCellSelect.call(this, position);
            }
        };
        
        me.customRenderers = me.customRenderers || {};
        me.customEditors = me.customEditors || {};
        
        if(me.store && me.source && me.store.data.items.length == 0)
        {
            me.store.loadRawData(me.source); // harry
        }
        
        // Create a property.Store from the source object unless configured with
        // a store
        if(!me.store)
        {
            me.propStore = me.store = new Ext.ux.grid.property.Store(me, me.source);
        }
        
        if(!me.propStore)
            me.propStore = me.store;
        
        me.columns = new Ext.ux.grid.property.HeaderContainer(me, me.store); // harry
        
        me.addEvents(
            /**
             * @event beforepropertychange Fires before a property value changes.
             *        Handlers can return false to cancel the property change (this
             *        will internally call {@link Ext.data.Record#reject} on the
             *        property's record).
             * @param {Object} source The source data object for the grid
             *            (corresponds to the same object passed in as the
             *            {@link #source} config property).
             * @param {String} recordId The record's id in the data store
             * @param {Mixed} value The current edited property value
             * @param {Mixed} oldValue The original property value prior to editing
             */
                
            'beforepropertychange',
            /**
             * @event propertychange Fires after a property value has changed.
             * @param {Object} source The source data object for the grid
             *            (corresponds to the same object passed in as the
             *            {@link #source} config property).
             * @param {String} recordId The record's id in the data store
             * @param {Mixed} value The current edited property value
             * @param {Mixed} oldValue The original property value prior to editing
             */
            'propertychange');

        Ext.grid.Panel.superclass.initComponent.call(me, arguments); // harry
        
        // Inject a custom implementation of walkCells which only goes up or
        // down
        me.getView().walkCells = this.walkCells;
        // Set up our default editor set for the 4 atomic data types
        me.editors = {
            'date': new Ext.grid.CellEditor({
                field: new Ext.form.field.Date({
                    selectOnFocus: true
                })
            }),
            'string': new Ext.grid.CellEditor({
                field: new Ext.form.field.Text({
                    selectOnFocus: true
                })
            }),
            'number': new Ext.grid.CellEditor({
                field: new Ext.form.field.Number({
                    selectOnFocus: true
                })
            }),
            'boolean': new Ext.grid.CellEditor({
                field: new Ext.form.field.ComboBox({
                    editable: false,
                    store: [[true, me.headerCt.trueText],
                            [false, me.headerCt.falseText]]
                })
            })
        };
        // Track changes to the data so we can fire our events.
        me.store.on('update', me.onUpdate, me);
    },

    /**
     * returns the correct editor type for the property type, or a custom one
     * keyed by the property name
     * 
     * @private
     */
    getCellEditor: function(record, column)
    {
        var me = this,
            propName = record.get(me.nameField),
            val = record.get(me.valueField),
            editor = me.customEditors[propName];

        editor = me.customEditors[record.data.editor] || record.data.editor || me.customEditors[propName]; // harry
        
        // A custom editor was found. If not already wrapped with a CellEditor,
        // wrap it, and stash it back
        // If it's not even a Field, just a config object, instantiate it before
        // wrapping it.
        if(editor)
        {
            if(Ext.isString(editor) && me.editors[editor]) // harry
            {
                editor = me.editors[editor];
            }
            else if(!(editor instanceof Ext.grid.CellEditor))
            {
                if(!(editor instanceof Ext.form.field.Base))
                {
                    editor = Ext.ComponentManager.create(editor, 'textfield');
                }
                editor = me.customEditors[propName] = new Ext.grid.CellEditor({
                    field: editor
                });
            }
        }
        else if(Ext.isDate(val))
        {
            editor = me.editors.date;
        }
        else if(Ext.isNumber(val))
        {
            editor = me.editors.number;
        }
        else if(Ext.isBoolean(val))
        {
            editor = me.editors['boolean'];
        }
        else
        {
            editor = me.editors.string;
        }
        
        // Give the editor a unique ID because the CellEditing plugin caches them
        editor.editorId = propName;
        return editor;
    },
    
 // Custom implementation of walkCells which only goes up and down.
    walkCells: function(pos, direction, e, preventWrap, verifierFn, scope)
    {
        var editableField = this.ownerCt.editableField;
        
        if (direction == 'left')
        {
            direction = 'up';
        } 
        else if (direction == 'right')
        {
            direction = 'down';
        }
        
        // skip diabled records  
        if(direction == 'down' && pos.row < pos.record.store.data.length - 1)
        {
            var i = pos.row,
                position = null;
            
            for(i; i < pos.record.store.data.length  - 1; i++)
            {
                f = pos.record.store.getAt(i + 1);

                if(f.data[editableField] == false)
                {
                    continue;
                }
                else
                {
                    position = i + 1;
                    break;
                }
            }
            if(!position)
                return false;
            else if(position > pos.row)
                pos.row = position - 1;
        }
        
        if(direction == 'up' && pos.row != 0)
        {
            var i = pos.row,
                position = null;

            for(i; i > 0; i--)
            {
                f = pos.record.store.getAt(i - 1);
                if(f.data[editableField] == false)
                {
                    continue;
                }
                else
                {
                    position = i - 1;
                    break;
                }
            }

            if(position == null)
                return false;
            else if(position < pos.row)
                pos.row = position + 1;  
        }

        
        pos = Ext.view.Table.prototype.walkCells.call(this, pos, direction, e, preventWrap, verifierFn, scope);
        if (!pos.column) {
            pos.column = 1;
        }
        return pos;
    }
});