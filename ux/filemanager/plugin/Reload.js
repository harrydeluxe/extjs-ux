/**
 * @class Ext.ux.filemanager.plugin.Reload
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define("Ext.ux.filemanager.plugin.Reload", {
    extend: "Ext.AbstractPlugin",
    alias: "plugin.filemanager.reload",
    
    init: function(cmp)
    {
        var me = this,
            button = {
            // xtype: 'button',
            iconCls: 'ux-filemanager-icon-reload',
            text: 'Reload',
            handler: function()
            {
                me.cmp.grid.reload();
            }
        };
        
        cmp.registerToolbarItem('reload', button);
        cmp.gtb.unshift(button); // add button to toolbar
        
        cmp.actionsTree.reloadNode = new Ext.Action({
            text: 'Reload',
            iconCls: 'ux-filemanager-icon-reload',
            // cls: 'ux-filemanager-icon-reload',
            cmd: 'reloadTreeNode',
            handler: function(widget, event)
            {
                me.cmp.tree.reloadNode();
            },
            scope: me
        });
        
        // cmp.tcm.unshift(cmp.actionsTree.reloadNode); // tree context menu
        cmp.registerTreeContextMenu(cmp.actionsTree.reloadNode);
    }
});