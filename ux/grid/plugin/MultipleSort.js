/**
 * @class Ext.ux.grid.plugin.MultipleSort
 * @extends Ext.toolbar.Toolbar
 *
 * @author Harald Hanek (c) 2012
 * @license http://harrydeluxe.mit-license.org
 *
 * This plugin is based on Senchas multiple grid sorting example.
 * @see http://dev.sencha.com/deploy/ext-4.1.0-gpl/examples/grid/multiple-sorting.html
 *
 *
 *
 * @example
 * var multiplesort = Ext.create('Ext.ux.grid.plugin.MultipleSort', {
 *     autoHide: true,
 *     removeText: 'entfernen',
 *     removeAllText: 'alle entfernen',
 *     items: [
 *     {
 *         xtype: 'tbtext',
 *         text: 'Sortierfolge:',
 *         reorderable: false
 *     },
 *     {
 *         text: 'Nationalität',
 *         sortData: {
 *             property: 'nationalitaet'
 *             //direction: 'ASC' // default "ASC"
 *         }
 *     }]
 * });
 *
 * var grid = Ext.create('Ext.grid.Panel', {
 *     ...
 *     dockedItems: [multiplesort],
 *     plugins: [multiplesort],
 *     ...
 *
 */
Ext.define('Ext.ux.grid.plugin.MultipleSort', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'plugin.ux.multiplesort',
    requires: ['Ext.ux.BoxReorderer',
        'Ext.ux.ToolbarDroppable',
        'Ext.menu.Menu'],

    /**
     * @cfg {String/Object} layout
     */
    layout: {
        overflowHandler: 'Menu'
    },

    /**
     * @cfg {Number} minHeight
     * fix
     */
    minHeight: 29,

    /**
     * @cfg {Boolean} [autoHide=false]
     * If there is no sort button in the toolbar, it will be automatically hide.
     */
    autoHide: false,

    /**
     * @cfg {String} removeText
     * Text displayed in the sortbutton context menu for remove a button from the toolbar.
     */
    removeText: 'remove',

    /**
     * @cfg {String} removeAllText
     * Text displayed in the sortbutton context menu for remove all buttons from the toolbar.
     */
    removeAllText: 'remove all',

    initComponent: function() {
        var me = this;

        me.reorderer = new Ext.ux.BoxReorderer({
            listeners: {
                scope: me,
                Drop: function(r, c, button) { // update sort direction when button is dropped
                    me.changeSortDirection(button, false);
                }
            }
        });

        me.droppable = new Ext.ux.ToolbarDroppable({
            /**
             * Creates the new toolbar item from the drop event
             */
            createItem: function(data) {
                var header = data.header,
                    headerCt = header.ownerCt,
                    reorderer = headerCt.reorderer;

                // Hide the drop indicators of the standard
                // HeaderDropZone
                // in case user had a pending valid drop in
                if (reorderer) {
                    reorderer.dropZone.invalidateDrop();
                }

                return me.createSorterButtonConfig({
                    text: header.text,
                    sortData: {
                        property: header.dataIndex,
                        direction: "ASC"
                    }
                });
            },

            /**
             * Custom canDrop implementation which returns true
             * if a column can be added to the toolbar
             *
             * @param {Object} data Arbitrary data from the drag
             *            source. For a HeaderContainer, it will
             *            contain a header property which is the
             *            Header being dragged.
             * @return {Boolean} True if the drop is allowed
             */
            canDrop: function(dragSource, event, data) {
                var sorters = me.getSorters(),
                    header = data.header,
                    length = sorters.length,
                    entryIndex = this.calculateEntryIndex(event),
                    targetItem = this.toolbar.getComponent(entryIndex),
                    i;

                // Group columns have no dataIndex and therefore
                // cannot be sorted
                // If target isn't reorderable it could not be
                // replaced
                if (!header.dataIndex || (targetItem && targetItem.reorderable === false))
                    return false;

                for (i = 0; i < length; i++) {
                    if (sorters[i].property == header.dataIndex)
                        return false;
                }

                return true;
            },

            afterLayout: me.doSort
        });

        me.plugins = [me.reorderer,
            me.droppable];

        Ext.each(me.items, function(item) {
            if (item.sortData)
                Ext.applyIf(item, me.createSorterButtonConfig(item));
        }, me);

        me.callParent(arguments);
    },

    init: function(grid) {
        var me = this;

        if (!me.grid)
            me.grid = grid;

        me.grid.on('render', me.onGridRender, me, {
            single: true
        });
    },

    /**
     * avoid clone of this class.
     * @returns emptyFn
     */
    clone: function() {
        return {
            init: Ext.emptyFn
        };
    },

    onGridRender: function(grid) {
        grid.on('afterlayout', this.onGridAfterLayout, this, {
            single: true
        });
    },

    onGridAfterLayout: function(grid) {
        var me = this,
            headerCt = (grid.ownerCt && grid.ownerCt.lockedGrid) ? grid.ownerCt.lockedGrid.headerCt : grid.headerCt,
            dragZone = headerCt.reorderer.dragZone;

        /**
         * stops here if the toolbar is never rendered!
         * @todo addDocked add toolbar to grid
         */
        if (!me.rendered)
            return false;

        me.droppable.addDDGroup(dragZone.ddGroup);

        dragZone.self.override(
            {
                onStartDrag: function() {
                    if (me.autoHide && me.isHidden()) {
                        me.show(null, function() {
                            Ext.dd.DragDropManager.refreshCache(dragZone.groups);
                        }, me);
                    }
                },
                onEndDrag: function() {
                    if (me.autoHide && me.getSorters().length == 0) {
                        me.hide();
                    }
                }

            });

        me.doSort();
    },

    /**
     * Tells the store to sort itself according to our sort data
     */
    doSort: function() {
        var me = this.toolbar ? this.toolbar : this,
            sorters = me.getSorters();

        if (sorters.length >= 1) {
            me.show();
            me.grid.store.sort(sorters);
        }
        else {
            if (me.autoHide)
                me.hide();
        }
    },

    /**
     * Callback handler used when a sorter button is clicked or
     * reordered
     *
     * @param {Ext.Button} button The button that was clicked
     * @param {Boolean} changeDirection True to change direction
     *            (default). Set to false for reorder operations as we
     *            wish to preserve ordering there
     */
    changeSortDirection: function(button, changeDirection) {
        var sortData = button.sortData,
            iconCls = button.iconCls;

        if (sortData) {
            if (changeDirection !== false) {
                button.sortData.direction = Ext.String.toggle(button.sortData.direction, "ASC", "DESC");
                button.setIconCls(Ext.String.toggle(iconCls, "sort-asc", "sort-desc"));
            }

            this.grid.store.clearFilter();
            this.doSort();
        }
    },

    /**
     * Returns an array of sortData from the sorter buttons
     *
     * @return {Array} Ordered sort data from each of the sorter buttons
     */
    getSorters: function() {
        var sorters = [];

        Ext.each(this.query('button'), function(button) {
            if (button.sortData)
                sorters.push(button.sortData);
        }, this);

        return sorters;
    },

    /**
     * Convenience function for creating Toolbar Buttons that are tied
     * to sorters
     *
     * @param {Object} config Optional config object
     * @return {Object} The new Button configuration
     */
    createSorterButtonConfig: function(config) {
        var me = this;

        if (!config.sortData.direction)
            config.sortData.direction = 'ASC';

        Ext.applyIf(config, {
            listeners: {
                click: function(button) {
                    me.changeSortDirection(button, true);
                },

                render: function(button) {
                    var removeAllItem = new Ext.menu.Item({
                            text: me.removeAllText,
                            handler: function() {
                                Ext.each(me.query('button'), function(button) {
                                    if (button.sortData)
                                        me.remove(button);
                                }, me);

                                me.doSort();
                            }
                        }),
                        contextMenu = new Ext.menu.Menu({
                            showSeparator: false,
                            items: [
                                {
                                    text: me.removeText,
                                    handler: function() {
                                        me.remove(button);
                                        me.doSort();
                                    }
                                },
                                removeAllItem
                            ]
                        }),
                        el = button.getEl();

                    el.on('contextmenu', function(event) {
                        removeAllItem.setVisible(me.getSorters().length > 1);
                        event.stopEvent();
                        contextMenu.showAt(event.getXY());
                    });
                },

                scope: me
            },
            iconCls: 'sort-' + config.sortData.direction.toLowerCase(),
            reorderable: true,
            xtype: 'button'
        });

        return config;
    }
});