/**
 * @class Ext.ux.filemanager.GridPanel
 * @extends Ext.panel.Panel
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ux-filemanagerpanel',
    uses: ['Ext.ux.filemanager.plugin.Create',
            'Ext.ux.filemanager.plugin.DragSelector',
            'Ext.ux.filemanager.plugin.View',
            'Ext.ux.filemanager.plugin.Reload',
            'Ext.ux.filemanager.plugin.Rename',
            'Ext.ux.filemanager.plugin.Grouping',
            'Ext.ux.filemanager.plugin.Download',
            'Ext.ux.filemanager.plugin.Upload',
            'Ext.ux.filemanager.plugin.Delete',
            'Ext.ux.filemanager.plugin.DragDrop'],
            
    requires: ['Ext.data.SortTypes',
            // 'Ext.direct.RemotingProvider',
            // 'Ext.data.reader.Json',
            // 'Ext.form.field.Checkbox',
            'Ext.menu.Menu',
            'Ext.ux.filemanager.view.Tree',
            'Ext.ux.filemanager.view.Grid',
            'Ext.ux.filemanager.store.Grid',
            'Ext.ux.filemanager.model.Tree',
            'Ext.ux.filemanager.store.Tree',
            'Ext.ux.filemanager.model.Grid'],
            
    mixins: {
        il8n: 'Ext.ux.filemanager.locale.de_DE'
    },
    
    /**
     * @cfg {String} foldersUrl The URL to fetch folders
     */
    
    /**
     * @cfg {String} filesUrl The URL to fetch files
     */
    
    /**
     * @cfg {String} dataUrl The URL that is used to process requests Required
     *      if not all URL options are set Defaults to: 'files.php'
     */
    dataUrl: '',
    layout: 'border',
    /**
     * @cfg {String} rootNode description goes here
     */
    // rootNode: 'Root',
    rootPath: '',
    path: '',
    readOnly: false,
    selectionMode: 'MULTI', // SINGLE,SIMPLE,MULTI
    border: false,
    
    registerToolbarItem: function(name, item)
    {
        this.toolbaritems[name] = item;
    },
    
    registerGridContextMenu: function(item)
    {
        this.gridcontextmenu.unshift(item);
    },
    
    registerTreeContextMenu: function(item)
    {
        this.treecontextmenu.unshift(item);
    },
    
    constructor: function(config)
    {
        var me = this, tmpId = Ext.id(me, '');
        config = config || {};
        if(!config.id)
            config.id = 'filemanager_' + tmpId;
        config.treeConfig = Ext.apply({
            id: 'filemanager_tree_' + tmpId
        }, config.treeConfig);
        config.gridConfig = Ext.apply({
            id: 'filemanager_grid_' + tmpId
        }, config.gridConfig);
        config.treecontextmenu = []; // tree contextmenu
        config.gridcontextmenu = []; // grid contextmenu
        config.gcm = []; // contextmenu grid
        config.gtb = []; // toolbar (Gridtoolbar)
        config.tcm = []; // contextmenu tree
        config.toolbaritems = {}; // contextmenu tree; // contextmenu grid
        me.callParent([config]);
    },
    
    initComponent: function()
    {
        var me = this;
        
        me.actions = {};
        me.actionsTree = {};
        
        me.tree = new Ext.ux.filemanager.view.Tree(Ext.applyRecursive(me.treeConfig, {
            region: 'west',
            width: 200,
            maxWidth: 500,
            minWidth: 50,
            
            //collapsible: true,
            //collapseMode: 'mini',
            //hideCollapseTool: true,
            /*split: true,
            collapseMode: 'mini',
            collapsible: true,
            */
            resizable: {
                transparent: true,
                dynamic: true,
                handles: 'e'
            },
            
            collapseMode: 'mini',
            //animCollapse: true,
            bodyStyle: 'border-right: none',
             
            // bodyStyle: 'padding: 10px 0 0 0; border-right: none',
            tcm: me.tcm,
            foldersUrl: me.foldersUrl || me.dataUrl,
            rootNode: me.rootNode,
            rootPath: me.rootPath,
            path: me.path,
            store: Ext.create('Ext.ux.filemanager.store.Tree', {
                id: 'store_' + me.treeConfig.id,
                foldersUrl: me.foldersUrl,
                rootPath: me.rootPath,
                rootNode: me.rootNode
            }),
            actionsTree: me.actionsTree,
            listeners: {
                changeSelection: function(tree, view, node)
                {
                    me.path = tree.path;
                    me.grid.store.proxy.extraParams = {
                        node: tree.path
                    };
                    me.grid.store.load();
                    me.grid.focus();
                },
                containerclick: {
                    fn: function(view, e)
                    {
                        me.grid.focus();
                    },
                    scope: me
                },
                containercontextmenu: {
                    fn: function(view, e)
                    {
                        e.stopEvent();
                    },
                    scope: me
                },
                itemcontextmenu: {
                    fn: me.onTreeContextMenu,
                    scope: me
                }
            }
        }));
        
        me.grid = new Ext.ux.filemanager.view.Grid(Ext.applyRecursive(me.gridConfig, {
            store: new Ext.ux.filemanager.store.Grid({
                id: 'store_' + me.gridConfig.id,
                filesUrl: me.filesUrl
            }),
            selectionMode: 'MULTI', // SINGLE,SIMPLE,MULTI
            region: 'center',
            filesUrl: me.filesUrl || me.dataUrl,
            actions: me.actions,
            listeners: {
                folderdblclick: {
                    fn: function(grid)
                    {
                        me.tree.selectPath(grid.path, 'ids');
                    },
                    scope: me
                },
                containerclick: {
                    fn: function(view, e)
                    {
                        me.grid.focus();
                    },
                    scope: me
                },
                containercontextmenu: {
                    fn: me.onGridContextMenu,
                    scope: me
                },
                itemcontextmenu: {
                    fn: function(view, rec, node, index, e)
                    {
                        me.onGridContextMenu(view, e);
                    },
                    scope: me
                }
            }
        }));
        
        me.relayEvents(me.grid, ['selectionchange',
                'selectfolder',
                'selectfile',
                'filedblclick',
                'folderdblclick']);
        
        me.items = [me.tree,
                me.grid];
        
        me.callParent(arguments);
    },
    
    onGridContextMenu: function(view, event)
    {
        var me = this,
            contextmenu = (me.grid._gridSelectionIsFolder == true) ? me.getTreeContextMenu() : me.getGridContextMenu();
            
        event.stopEvent();
        contextmenu.showAt(event.getXY());
    },
    
    getGridContextMenu: function()
    {
        var me = this;
        
        if(!me.gridContextMenu)
        {
            me.gridContextMenu = new Ext.menu.Menu({
                items: me.gridcontextmenu,
                plain: true,
                //closable: true,
                listeners: {
                    hide: {
                        fn: function(menu, e)
                        {
                            /*
                             * klaut den focus bei einem dialog console.log(e);
                             * Ext.Function.defer(function(){
                             * 
                             * me.grid.getView().focus();
                             *  }, 10, me);
                             */
                        },
                        scope: me
                    }
                }
            });
        }
        return me.gridContextMenu;
    },
    
    onTreeContextMenu: function(view, record, item, index, event)
    {
        var me = this,
            contextmenu = me.getTreeContextMenu();
        
        event.stopEvent();
        contextmenu.showAt(event.getXY());
    },
    
    getTreeContextMenu: function()
    {
        var me = this;
        
        if(!me.treeContextMenu)
        {
            me.treeContextMenu = Ext.create('Ext.menu.Menu', {
                items: me.treecontextmenu
            });
        }
        
        return me.treeContextMenu;
    },
    
    getPath: function()
    {
        return this.path;
    },
    
    setPath: function(path)
    {
        var me = this;
        me.path = path;
    },
    
    getSelection: function()
    {
    }
});