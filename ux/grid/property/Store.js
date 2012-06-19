/**
 * @class Ext.ux.grid.property.Store
 * @extends Ext.grid.property.Store
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.grid.property.Store', {
    extend: 'Ext.grid.property.Store',
    
    uses: ['Ext.ux.grid.property.Property'],
    
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    
    /**
     * Creates new property store.
     * @param {Ext.grid.Panel} grid The grid this store will be bound to
     * @param {Object} source The source data config object
     */
    constructor: function(grid, source)
    {
        var me = this,
            tmp = me.superclass.constructor; // stores temporary the parent constructor
        
        me.grid = grid;
        me.source = source;

        delete me.superclass.constructor;
        
        me.callParent([{
            data: source || [],
            model: Ext.ux.grid.property.Property,
            proxy: me.getProxy(),
            groupField: grid.groupField
        }]);
        
        me.superclass.constructor = tmp;
    },
    
    setValue: function(prop, value, create)
    {
        var me = this,
            rec = me.getRec(prop);

        if(rec)
        {
            rec.set('value', value);
            me.source[prop] = value;
        }
        else if(create)
        {
            // only create if specified.
            me.source[prop] = value;
            rec = new Ext.ux.grid.property.Property({
                name: prop,
                value: value
            }, prop);
            me.add(rec);
        }
    }
});