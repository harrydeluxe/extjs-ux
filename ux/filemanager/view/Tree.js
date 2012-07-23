/**
 * @class Ext.ux.filemanager.view.Tree
 * @extends Ext.tree.Panel
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.view.Tree', {
    extend: 'Ext.tree.Panel',
    mixins: {
        il8n: 'Ext.ux.filemanager.locale.de_DE'
    },
    autoScroll: true,
    containerScroll: true,
    animate: true,
    useArrows: true,
    actionsTree: {},
    autoselect: true,
    
    initComponent: function()
    {
        var me = this;
        
        me.addEvents('changeSelection');
        
        Ext.applyRecursive(me, {
            viewConfig: {
                loadMask: false,
                singleSelect: true
            },
            listeners: {
                afterlayout: {
                    fn: function(tree)
                    {
                        var me = this, path = (!tree.path || tree.path == '') ? false : tree.path;
                        tree.store.load({
                            scope: tree,
                            callback: function(records, operation, success)
                            {
                                if(!path)
                                {
                                    tree.getRootNode().expand();
                                    if(tree.autoselect)
                                        tree.getView().getSelectionModel().select(tree.getRootNode());
                                }
                                else if(path)
                                    tree.selectPath(path, 'ids');
                            }
                        });
                    },
                    single: true,
                    scope: me
                },
                
                /*
                 * containercontextmenu: { fn: function(view, e) {
                 * e.stopEvent(); }, scope: me }, itemcontextmenu: { fn:
                 * me.onContextMenu, scope: me },
                 */
                selectionchange: {
                    fn: function(view, selection)
                    {
                        if(selection.length == 1 && selection[0].data)
                        {
                            me.onSelect(view, selection[0]);
                        }
                    },
                    buffer: 200,
                    scope: me
                },
                itemclick: {
                    fn: function(view, record)
                    {
                        me.onSelect(view, record);
                    },
                    scope: me
                },
                scope: me
            }
        });
        me.callParent(arguments);
    },
    
    onSelect: function(view, node)
    {
        var me = this,
            s = (me.getRootNode().data.ids != me.rootPath) ? me.rootPath : '';
        
        if(me.currentNode && me.currentNode == node)
            return;
        
        me.currentNode = node;
        // console.log(view, node);
        me.path = s + node.getRealPath('ids');
        
        if(me.actionsTree.rename)
        {
            // actions ein/ausschalten
            me.actionsTree.rename.setDisabled(!node.parentNode);
            me.actionsTree.rename.setDisabled(node.isRoot());
            // console.log(node.isRoot());
        }
        
        me.fireEvent('changeSelection', me, view, node);
    },
    
    selectPath: function(path, field, separator, callback, scope)
    {
        var me = this,
            rootId = me.getRootNode().data.ids;
        
        if(!rootId || rootId == '')
            path = '/' + path;
        // console.log(rootId, me.getRootNode());
        me.callParent([path,
                field,
                separator,
                callback,
                scope]);
    },
    
    /**
     * Refreshes the tree with data from the server
     * 
     * @returns {Void}
     */
    reloadNode: function(node)
    {
        var me = this,
            node = (node) ? node : me.getSelectionModel().getSelection()[0];
        
        // console.log(node, node.getRealPath());
        // operation.node.getRealPath();
        /*
         * me.store.load({ node: node });
         */
        node.removeAll();
        me.store.load({
            node: node
        });
    }
});