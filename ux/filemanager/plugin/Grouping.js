/**
 * @class Ext.ux.filemanager.plugin.Grouping
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define("Ext.ux.filemanager.plugin.Grouping", {
    extend: 'Ext.AbstractPlugin',
    alias: "plugin.filemanager.grouping",
    
    constructor: function(config)
    {
        this.callParent([config]);
        
        var me = this,
            cmp = me.getCmp();
        
        me.mode = config.mode || null;
        
        var features = {
            ftype: 'grouping',
            groupHeaderTpl: 'Type: {name} ({rows.length} Objekt{[values.rows.length > 1 ? "e" : ""]})',
            disabled: true
        };
        
        if(cmp.gridConfig.features)
            cmp.gridConfig.features.unshift(features);
        else
            cmp.gridConfig.features = [features];
    }
});