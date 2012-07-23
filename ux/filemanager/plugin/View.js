/**
 * @class Ext.ux.filemanager.plugin.View
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define("Ext.ux.filemanager.plugin.View", {
    extend: 'Ext.AbstractPlugin',
    requires: ['Ext.ux.grid.feature.Tileview',
            'Ext.ux.container.SwitchButtonSegment'],
    alias: "plugin.filemanager.view",
    mixins: {
        observable: 'Ext.util.Observable',
        state: 'Ext.state.Stateful'
    },
    stateful: true,
    stateId: 'statefilemanagerPluginView',
    
    /**
     * @cfg {String} defaultThumbnailImage Default image to use
     *      in thumnail view
     */
    defaultThumbnailImage: 'media/icons/48/document_blank.png',
    
    /**
     * @cfg {String} thumbnailUrl The URL to rename files Takes
     *      precedence over thumbnailUrl
     */
    constructor: function(config)
    {
        this.callParent(arguments);
        
        var me = this,
            cmp = me.getCmp();
        
        me.mode = config.mode || null;
        
        me.viewfeature = new Ext.ux.grid.feature.Tileview({
            // var features = {
            // ftype: 'tileview',
            viewMode: me.mode,
            getAdditionalData: function(data, index, record, orig)
            {
                if(this.viewMode)
                {
                    return {
                        name: data.name,
                        thumbnails: data.thumbnails,
                        row_class: data.row_class,
                        size: Ext.util.Format.fileSize(data.size),
                        type: data.type
                    };
                }
                return {};
            },
            viewTpls: {
                largeIcons: ['<td class="{cls} ux-explorerview-large-icon-row">',
                        '<table class="x-grid-row-table">',
                            '<tbody>',
                                '<tr>',
                                    '<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;../../n9/backend/ext-ux-filebrowserpanel/FileBrowserPanel/thumbnails.php?size=large&id={thumbnails}&quot;) no-repeat scroll 50% 100% transparent;">',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="x-grid-col x-grid-cell">',
                                        '<div class="x-grid-cell-inner" unselectable="on">{name}</div>',
                                    '</td>',
                                '</tr>',
                            '</tbody>',
                        '</table>',
                        '</td>'].join(''),
                        
                mediumIcons: ['<td class="{cls} ux-explorerview-medium-icon-row">',
                        '<table class="x-grid-row-table">',
                            '<tbody>',
                                '<tr>',
                                    '<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;../../n9/backend/ext-ux-filebrowserpanel/FileBrowserPanel/thumbnails.php?size=medium&id={thumbnails}&quot;) no-repeat scroll 50% 100% transparent;">',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="x-grid-col x-grid-cell">',
                                        '<div class="x-grid-cell-inner" unselectable="on">{name}</div>',
                                    '</td>',
                                '</tr>',
                            '</tbody>',
                        '</table>',
                        '</td>'].join(''),
                        
                tileIcons: ['<td class="{cls} ux-explorerview-detailed-icon-row">',
                        '<table class="x-grid-row-table">',
                            '<tbody>',
                                '<tr>',
                                    '<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;../../n9/backend/ext-ux-filebrowserpanel/FileBrowserPanel/thumbnails.php?size=tile&id={thumbnails}&quot;) no-repeat scroll 50% 50% transparent;">',
                                    '</td>',
                                    '<td class="x-grid-col x-grid-cell">',
                                        '<div class="x-grid-cell-inner" unselectable="on">{name}<br><span>{type}<br>{size}</span></div>',
                                    '</td>',
                                '</tr>',
                            '</tbody>',
                        '</table>',
                        '</td>'].join('')
            }
        });
        
        me.addEvents('change');
        
        if(cmp.gridConfig.features)
            cmp.gridConfig.features.unshift(me.viewfeature);
        else
            cmp.gridConfig.features = [me.viewfeature];
        // me.addStateEvents('change');
    },
    
    init: function(cmp)
    {
        var me = this,
            activeItem = 0;
        
        cmp.grid.getView().on('render', function(view)
        {
            me.setMode(me.mode, false);
        });
        
        if(me.mode)
        {
            switch(me.mode)
            {
                case 'largeIcons':
                    activeItem = 3;
                    break;
                case 'mediumIcons':
                    activeItem = 2;
                    break;
                case 'tileIcons':
                    activeItem = 1;
                    break;
                default:
                    activeItem = 0;
            }
        }
        
        me.viewswitchbutton = new Ext.ux.container.SwitchButtonSegment({
            activeItem: activeItem,
            scope: me,
            items: [{
                tooltip: 'Details',
                viewMode: 'default',
                iconCls: 'ux-filemanager-view-default'
            },
            {
                tooltip: 'Tiles',
                viewMode: 'tileIcons',
                iconCls: 'ux-filemanager-view-tile'
            },
            {
                tooltip: 'Icons',
                viewMode: 'mediumIcons',
                iconCls: 'ux-filemanager-view-medium'
            },
            {
                tooltip: 'Thumbnails',
                viewMode: 'largeIcons',
                iconCls: 'ux-filemanager-view-large'
            }],
            listeners: {
                change: function(btn, item)
                {
                    me.setMode(btn.viewMode, false);
                },
                scope: this
            }
        });
        
        cmp.gtb.push('->', me.viewswitchbutton);
        cmp.registerToolbarItem('view', me.viewswitchbutton);
    },
    
    setMode: function(mode, searchbutton)
    {
        var me = this;
        me.mode = mode;
        switch(mode)
        {
            case 'largeIcons':
                me.cmp.grid.rowtip.enable();
                break;
            case 'mediumIcons':
                me.cmp.grid.rowtip.enable();
                break;
            case 'tileIcons':
                me.cmp.grid.rowtip.enable();
                break;
            default:
                me.cmp.grid.rowtip.disable();
        }
        
        me.viewfeature.setView(mode);

        if(searchbutton)
            me.viewswitchbutton.setActiveItem(me.viewswitchbutton.items.findIndex('viewMode', mode));
    },
    
    // State Management
    // private
    initStateEvents: function()
    {
        console.log('initStateEvents');
        var events = this.stateEvents;
        // push on stateEvents if they don't exist
        Ext.each(['change'], function(event)
        {
            if(Ext.Array.indexOf(events, event))
            {
                events.push(event);
            }
        });
        this.callParent();
    },
    
    getState: function()
    {
        console.log('getState');
        var me = this, state = me.callParent() || {}, mode = !!me.mode;
        state.mode = mode;
        Ext.apply(state, {
            size: maximized ? me.restoreSize : me.getSize(),
            pos: maximized ? me.restorePos : me.getPosition()
        });
        return state;
    },
    
    applyState: function(state)
    {
        console.log('applyState');
        var me = this;
        if(state)
        {
            me.mode = state.mode;
            if(me.mode)
            {
                me.hasSavedRestore = true;
                me.restoreSize = state.size;
                me.restorePos = state.pos;
            }
            else
            {
                Ext.apply(me, {
                    mode: state.mode
                });
            }
        }
    }
});