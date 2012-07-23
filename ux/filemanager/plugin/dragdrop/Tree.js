/**
 * @class Ext.ux.filemanager.plugin.dragdrop.Tree
 * @extends Ext.tree.plugin.TreeViewDragDrop
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.plugin.dragdrop.Tree', {
    extend: 'Ext.tree.plugin.TreeViewDragDrop',
    alias: 'plugin.filemanagertreeviewdragdrop',
    
    onViewRender: function(view)
    {
        var me = this;
        
        me.callParent(arguments);
        
        if(me.dropZone)
        {
            me.dropZone.onNodeOver = function(node, dragZone, e, data)
            {
                // overRecord = me.view.getRecord(node);
                var position = this.getPosition(e, node), returnCls = this.dropNotAllowed, view = this.view, targetNode = view
                        .getRecord(node), indicator = this.getIndicator(), indicatorX = 0, indicatorY = 0;
                
                // auto node expand check
                this.cancelExpand();
                
                if(position == 'append' && !this.expandProcId
                        && !Ext.Array.contains(data.records, targetNode)
                        && !targetNode.isLeaf()
                        && !targetNode.isExpanded())
                {
                    this.queueExpand(targetNode);
                }
                
                /*
                 * if(!node || !data.item) { return false; }
                 */
                var tp = targetNode.getRealPath('ids'),
                    sp = me.cmp.panel.path;
                
                if(tp != sp)
                {
                    this.valid = true;
                    this.currentPosition = position;
                    this.overRecord = targetNode;
                    returnCls = Ext.baseCSSPrefix + 'tree-drop-ok-append';
                    // @TODO: set a class on the parent folder node to
                    // be able to style it
                    indicator.hide();
                }
                else
                {
                    this.valid = false;
                }
                
                this.currentCls = returnCls;
                return returnCls;
            };
            
            me.dropZone.handleNodeDrop = function(data, record, position)
            {
                console.log(this);
                this.overRecord.store.load();
                // @TODO: wenn ordner verschoben wurden, dann ein reload
                // durchführen
            };
        }
    }
});