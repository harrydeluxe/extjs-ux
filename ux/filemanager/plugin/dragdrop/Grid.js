/**
 * @class Ext.ux.filemanager.plugin.dragdrop.Grid
 * @extends Ext.grid.plugin.DragDrop
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.plugin.dragdrop.Grid', {
    extend: 'Ext.grid.plugin.DragDrop',
    alias: 'plugin.filemanagergridviewdragdrop',
    
    onViewRender: function(view)
    {
        var me = this;
        // console.log(view);
        me.callParent(arguments);
        
        if(me.dragZone)
        {
            me.dragZone.getDragText = function()
            {
                return this.dragData.item.innerHTML;
                var count = this.dragData.records.length;
                return Ext.String.format(this.dragText, count, count == 1 ? '' : 's');
            };
            
            me.dragZone.onInitDrag22 = function(x, y)
            {
                console.log(this);
                var me = this,
                    data = me.dragData,
                    view = data.view,
                    item = data.item,
                    selectionModel = view.getSelectionModel(),
                    record = view.getRecord(data.item),
                    e = data.event;
                
                // Update the selection to match what would have
                // been selected if the user had
                // done a full click on the target node rather
                // than starting a drag from it
                if(!selectionModel.isSelected(record) || e.hasModifier())
                {
                    selectionModel.selectWithEvent(record, e, true);
                }
                data.records = selectionModel.getSelection();
                console.log(data, me.ddel);
                // me.ddel.update(me.getDragText());
                // me.proxy.update(me.ddel.dom);
                me.ddel.update(item.innerHTML);
                me.proxy.update(data.ddel.dom);
                me.proxy.el.setWidth(200 - 6);
                me.proxy.el.setHeight(90);
                me.onStartDrag(x, y);
                return true;
            };
            
            me.dragZone.getDragData22 = function(e)
            {
                var view = this.view, item = e.getTarget(view.getItemSelector()), record, selectionModel, records;
                console.log(item, this.ddel);
                if(item)
                {
                    record = view.getRecord(item);
                    selectionModel = view.getSelectionModel();
                    records = selectionModel.getSelection();
                    return {
                        copy: this.view.copy || (this.view.allowCopy && e.ctrlKey),
                        event: new Ext.EventObjectImpl(e),
                        view: view,
                        ddel: this.ddel,
                        item: item,
                        records: records,
                        fromPosition: Ext.fly(item).getXY()
                    };
                }
            };
            
            me.dragZone.onStartDrag = function()
            {
                me.filemanager.grid.rowtip.disable();
            };
            
            me.dragZone.onEndDrag = function()
            {
                me.filemanager.grid.rowtip.enable();
            };
        }
        
        if(me.dropZone)
        {
            // console.log(view, me.dropZone);
            me.dropZone.onNodeOver = function(node, dragZone, e, data)
            {
                var me = this;
                me.overRecord = me.view.getRecord(node);
                me.valid = (!Ext.Array.contains(data.records, me.overRecord) && me.overRecord && me.overRecord.data && me.overRecord.data.type == 'folder') ? true
                        : false;
                return me.valid ? me.dropAllowed : me.dropNotAllowed;
            };
            me.dropZone.onContainerOver = function()
            {
                // console.log('1');
                this.valid = false;
                return false;
            };
            me.dropZone.handleNodeDrop = function(data, record, position)
            {
                var droppedRecords = data.records;
                // console.log('handleNodeDrop');
                // console.log(droppedRecords.length + ' records
                // dropped');
                // console.log('First record: ' +
                // droppedRecords[0].get('name'));
                // console.log('Drop target: ' +
                // record.get('name'));
            };
        }
    }
});