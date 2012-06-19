/**
 * @class Ext.ux.grid.property.HeaderContainer
 * @extends Ext.grid.header.Container
 * 
 * A custom HeaderContainer for the {@link Ext.grid.property.Grid}. Generally
 * it should not need to be used directly.
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.grid.property.HeaderContainer', {
    extend: 'Ext.grid.header.Container',
    nameWidth: 115,
    // private - strings used for locale support
    nameText: 'Name',
    valueText: 'Value',
    dateFormat: 'm/j/Y',
    trueText: 'true',
    falseText: 'false',
    // private
    nameColumnCls: Ext.baseCSSPrefix + 'grid-property-name',
    
    /**
     * Creates new HeaderContainer.
     * 
     * @param {Ext.grid.property.Grid} grid The grid this store will be bound to
     * @param {Object} source The source data config object
     */
    constructor: function(grid, store)
    {
        var me = this, columns = [{
                header: me.nameText,
                width: grid.nameColumnWidth || me.nameWidth,
                sortable: grid.sortableColumns,
                dataIndex: grid.nameField,
                renderer: Ext.Function.bind(me.renderProp, me),
                itemId: grid.nameField,
                menuDisabled: true,
                groupField: true,
                tdCls: me.nameColumnCls
            },
            {
                header: me.valueText,
                renderer: Ext.Function.bind(me.renderCell, me),
                getEditor: Ext.Function.bind(me.getCellEditor, me),
                sortable: grid.sortableColumns,
                flex: 1,
                fixed: true,
                dataIndex: grid.valueField,
                itemId: grid.valueField,
                menuDisabled: true
            },
            {
                header: grid.groupField,
                hidden: true,
                sortable: grid.sortableColumns,
                dataIndex: grid.groupField,
                itemId: grid.groupField
            }];
        
        if(grid.columns)
            columns = columns.concat(Ext.isArray(grid.columns) ? grid.columns : [grid.columns]);
        
        me.grid = grid;
        me.store = store;
        me.callParent([{
            items: columns
        }]);
    },
    
    getCellEditor: function(record)
    {
        return this.grid.getCellEditor(record, this);
    },
    
    /**
     * Render a property name cell
     * 
     * @private
     */
    renderProp: function(v, metadata, record)
    {
        return record.data['text'] || this.getPropertyName(v);
    },
    
    /**
     * Render a property value cell
     * 
     * @private
     */
    renderCell: function(val, meta, rec)
    {
        var me = this,
            renderer = me.grid.customRenderers[rec.get(me.grid.nameField)],
            result = val,
            c = rec.data.renderer != '' ? rec.data.renderer : null;
        
        renderer = me.grid.customRenderers[c] || c || me.grid.customRenderers[rec.get(me.grid.nameField)]; // harry
        
        var v = me.grid.customEditors[rec.get('editor')];
        if(!rec.get('renderer') && v)
        {
            var t = v.field || v;
            if(t.rendered && t.rawValue)
                return t.rawValue;
        }
        
        if(renderer)
        {
            return renderer.apply(me, arguments);
        }
        
        if(Ext.isDate(val))
        {
            result = me.renderDate(val);
        }
        else if(Ext.isBoolean(val))
        {
            result = me.renderBool(val);
        }
        return Ext.util.Format.htmlEncode(result);
    },
    
    /**
     * @private
     */
    renderDate: Ext.util.Format.date,

    /**
     * @private
     */
    renderBool: function(bVal)
    {
        return this[bVal ? 'trueText' : 'falseText'];
    },
     
    /**
     * Renders custom property names instead of raw names if defined in the Grid
     * 
     * @private
     */
    getPropertyName: function(name)
    {
        var pn = this.grid.propertyNames;
        return pn && pn[name] ? pn[name] : name;
    }
});