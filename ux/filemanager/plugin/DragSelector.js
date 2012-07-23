/**
 * @class Ext.ux.filemanager.plugin.DragSelector
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define("Ext.ux.filemanager.plugin.DragSelector", {
    extend: 'Ext.AbstractPlugin',
    alias: "plugin.filemanager.dragselector",
    requires: ['Ext.ux.grid.plugin.DragSelector'],
    
    constructor: function(config)
    {
        this.callParent([config]);
        var me = this, cmp = me.getCmp();
        Ext.applyRecursive(cmp.gridConfig, {
            plugins: [Ext.create('Ext.ux.grid.plugin.DragSelector', {
                dragSafe: true,
                listeners: {
                    dragselectorstart: function(view)
                    {
                        view.grid.rowtip.disable();
                    },
                    dragselectorend: function(view)
                    {
                        view.grid.rowtip.enable();
                    }
                }
            })]
        });
    }
});