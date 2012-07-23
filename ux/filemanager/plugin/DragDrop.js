/**
 * @class Ext.ux.filemanager.plugin.DragDrop
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.plugin.DragDrop', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.filemanager.dragdrop',
    
    uses: ['Ext.ux.filemanager.plugin.dragdrop.Tree',
            'Ext.ux.filemanager.plugin.dragdrop.Grid'],
            
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    /**
     * @cfg {String} moveFileUrl The URL to move files Takes precedence over
     *      dataUrl
     */
    constructor: function(config)
    {
        this.callParent([config]);
        
        var me = this,
            cmp = me.getCmp();
        
        me.addEvents(
        /**
         * @event beforechange Fires before the slider value is changed. By
         *        returning false from an event handler, you can cancel the
         *        event and prevent the slider from changing.
         * @param {Ext.slider.Multi} slider The slider
         * @param {Number} newValue The new value which the slider is being
         *            changed to.
         * @param {Number} oldValue The old value which the slider was
         *            previously.
         */
        'beforechange',
        
        /**
         * @event change Fires when the slider value is changed.
         * @param {Ext.slider.Multi} slider The slider
         * @param {Number} newValue The new value which the slider has been
         *            changed to.
         * @param {Ext.slider.Thumb} thumb The thumb that was changed
         */
        'change',
        
        /**
         * @event changecomplete Fires when the slider value is changed by the
         *        user and any drag operations have completed.
         * @param {Ext.slider.Multi} slider The slider
         * @param {Number} newValue The new value which the slider has been
         *            changed to.
         * @param {Ext.slider.Thumb} thumb The thumb that was changed
         */
        'changecomplete',
        
        /**
         * @event dragstart Fires after a drag operation has started.
         * @param {Ext.slider.Multi} slider The slider
         * @param {Ext.EventObject} e The event fired from Ext.dd.DragTracker
         */
        'dragstart',
        
        /**
         * @event drag Fires continuously during the drag operation while the
         *        mouse is moving.
         * @param {Ext.slider.Multi} slider The slider
         * @param {Ext.EventObject} e The event fired from Ext.dd.DragTracker
         */
        'drag',
        
        /**
         * @event dragend Fires after the drag operation has completed.
         * @param {Ext.slider.Multi} slider The slider
         * @param {Ext.EventObject} e The event fired from Ext.dd.DragTracker
         */
        'dragend');
        
        Ext.apply(cmp.treeConfig, {
            // Ext.applyRecursive(cmp.treeConfig, {
            viewConfig: {
                plugins: [{
                    ptype: 'filemanagertreeviewdragdrop',
                    dropGroup: 'fileMoveDD',
                    enableDrag: false,
                    appendOnly: true,
                    cmp: cmp
                }],
                listeners: {
                    drop: me.onTreeNodeDrop,
                    scope: me
                }
            }
        });
        
        // cmp.gridConfig = Ext.apply({}, {
        Ext.applyIf(cmp.gridConfig, {
            // Ext.applyRecursive(cmp.gridConfig, {
            viewConfig: {
                plugins: [{
                    ptype: 'filemanagergridviewdragdrop',
                    filemanager: cmp,
                    ddGroup: 'fileMoveDD',
                    // dragText: 'Drag and drop to reorganize',
                    enableDrop: true,
                    // appendOnly: true
                    getDragData: function(e)
                    {
                        console.log(e);
                        var sourceEl = e.getTarget(v.itemSelector, 10), d;
                        if(sourceEl)
                        {
                            d = sourceEl.cloneNode(true);
                            d.id = Ext.id();
                            return v.dragData = {
                                sourceEl: sourceEl,
                                repairXY: Ext.fly(sourceEl).getXY(),
                                ddel: d,
                                patientData: v.getRecord(sourceEl).data
                            };
                        }
                    }
                }],
                /*
                 * plugins:
                 * [Ext.create('Ext.ux.filemanager.plugin.dragdrop.Grid', {
                 * ptype: 'filemanagergridviewdragdrop', filemanager: cmp,
                 * ddGroup: 'fileMoveDD', //dragText: 'Drag and drop to
                 * reorganize', enableDrop: true, //appendOnly: true
                 * getDragData: function(e) { console.log(e); var sourceEl =
                 * e.getTarget(v.itemSelector, 10), d; if (sourceEl) { d =
                 * sourceEl.cloneNode(true); d.id = Ext.id(); return v.dragData = {
                 * sourceEl: sourceEl, repairXY: Ext.fly(sourceEl).getXY(),
                 * ddel: d, patientData: v.getRecord(sourceEl).data }; } } })],
                 */
                listeners: {
                    drop: me.onGridNodeDrop,
                    scope: me
                }
            }
        }, cmp.gridConfig);
    },
    
    init: function(cmp)
    {
        var me = this,
            filemanager = cmp;
        
        me.filemanager = filemanager;
        
        filemanager.addEvents(
        /**
         * @event beforemovefile Fires before one or more files will be moved to
         *        another folder on the server, return false to cancel the event
         * @param {Ext.ux.filemanager} this
         * @param {Array} files An array containing Ext.data.Record objects
         *            representing the file(s) to move
         * @param {String} sourceFolder Path of the source folder
         * @param {String} destinationFolder Path of the destination folder
         */
        'beforemovefile',
        
        /**
         * @event movefile Fires when file(s) was/were successfully moved
         * @param {Ext.ux.filemanager} this
         * @param {Object} opts The options that were used for the original
         *            request
         * @param {Object} o Decoded response body from the server
         */
        'movefile',
        
        /**
         * @event movefilefailed Fires when moving file(s) failed
         * @param {Ext.ux.filemanager} this
         * @param {Object} opts The options that were used for the original
         *            request
         * @param {Object} o Decoded response body from the server
         */
        'movefilefailed');
    },
    
    /**
     * Event handler for when a file from the grid is dropped on a folder in the
     * tree
     * 
     * @private
     * @param {Object} nodeData Custom data associated with the drop node
     * @param {Ext.dd.DragSource} source The source that was dragged over this
     *            dragzone
     * @param {Ext.EventObject} evt The Event object
     * @param {Object} data Object containing arbitrairy data supplied by drag
     *            source
     * @returns {Boolean}
     */
    onTreeNodeDrop: function(node, data, dropRec, dropPosition)
    {
        var me = this, from = me.cmp.path, to = dropRec.getRealPath('ids');
        return me.moveFile(data.records, from, to);
    },
    
    onGridNodeDrop: function(node, data, dropRec)
    {
        var me = this, from = me.cmp.path, to = from + '/' + dropRec.data.name;
        return me.moveFile(data.records, from, to);
    },
    
    /**
     * Move a file on the server to another folder
     * 
     * @private
     * @param {Array} files Array of Ext.data.Record objects representing the
     *            files to move
     * @param {String} sourceFolder Source folder
     * @param {String} destinationFolder Destination folder
     * @param {Boolean} overwrite If files should be overwritten in destination,
     *            defaults to false
     * @returns {Void}
     */
    moveFile: function(files, sourceFolder, destinationFolder, overwrite)
    {
        var me = this,
            filemanager = me.cmp,
            params;
        
        // fire beforemovefile event
        if(filemanager.eventsSuspended !== true && filemanager.fireEvent('beforemovefile', this, files, sourceFolder, destinationFolder) === false)
        {
            return;
        }
        
        /*
         * var params; // fire beforemovefile event if(true !==
         * this.eventsSuspended && false === this.fireEvent('beforemovefile',
         * this, files, sourceFolder, destinationFolder)) { return; }
         */
        // set request parameters
        params = {
            action: 'move-file',
            sourcePath: sourceFolder,
            destinationPath: destinationFolder,
            overwrite: (true === overwrite) ? true : false
        };
        // loop over files array and add request parameters
        // like:
        // files[rec-id] : filename.ext
        Ext.each(files, function(item, index, allItems)
        {
            params['files[' + item.id + ']'] = item.get('name');
        });
        
        /*
         * console.log(params); return; // send request to server
         * Ext.Ajax.request({ url: this.moveFileUrl || this.dataUrl, scope:
         * this, callback: this.actionCallback, params: params });
         */
        Ext.Ajax.request({
            url: me.moveFileUrl || filemanager.dataUrl,
            callback: me.actionCallback,
            scope: me,
            params: params
        });
    },
    
    /**
     * Callback that handles all actions performed on the server (rename, move
     * etc.) Called when Ajax request finishes, regardless if this was a success
     * or not
     * 
     * @private
     * @param {Object} opts The options that were used for the original request
     * @param {Boolean} success If the request succeded
     * @param {Object} response The XMLHttpRequest object containing the
     *            response data
     * @returns {Void}
     */
    actionCallback: function(opts, success, response)
    {
        var me = this, filemanager = me.cmp, o = {}, store, record;
        // check if request was successful
        if(success !== true)
        {
            Ext.Msg.show({
                title: me.il8n.actionRequestFailureTitleText,
                msg: me.il8n.actionRequestFailureMsgText,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                closable: false
            });
            return;
        }
        try
        {
            o = Ext.decode(response.responseText);
        } catch(e)
        {
            Ext.Msg.show({
                title: me.il8n.actionResponseFailureTitleText,
                msg: me.il8n.actionResponseFailureMsgText,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                closable: false
            });
        }
        // console.log(o, me, filemanager);
        // check if server reports all went well
        // handle success/failure accordingly
        if(true === o.success)
        {
            switch(opts.params.action)
            {
                case 'move-file':
                    // fire movefile event
                    if(filemanager.eventsSuspended !== true)
                    {
                        filemanager.fireEvent('movefile', filemanager, opts, o);
                    }
                    store = filemanager.grid.getStore();
                    Ext.each(o.data.successful, function(item, index, allItems)
                    {
                        record = store.data.findBy(function(record)
                        {
                            return record.id === item.recordId;
                        });
                        store.remove(record);
                    });
                    break;
                default:
                    break;
            }
        }
        else
        {
            switch(opts.params.action)
            {
                case 'move-file':
                    // fire movefilefailed event
                    if(filemanager.eventsSuspended !== true)
                    {
                        filemanager.fireEvent('movefilefailed', filemanager, opts, o);
                    }
                    // delete successfully moved record(s) from the
                    // grid
                    store = me.grid.getStore();
                    Ext.each(o.data.successful, function(item, index, allItems)
                    {
                        record = store.getById(item.recordId);
                        store.remove(record);
                    });
                    // prompt for overwrite
                    if(o.data.existing.length > 0)
                    {
                        Ext.Msg.show({
                            title: me.il8n.confirmOverwriteTitleText,
                            msg: me.il8n.confirmOverwriteMsgText,
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            closable: false,
                            scope: this,
                            fn: function(buttonId, text, cfg)
                            {
                                var files, store;
                                if(buttonId === 'yes')
                                {
                                    // create array with
                                    // remaining files
                                    files = [];
                                    store = me.grid.getStore();
                                    Ext.each(o.data.existing, function(item, index, allItems)
                                    {
                                        files.push(store.getById(item.recordId));
                                    });
                                    // call again, but with
                                    // overwrite option
                                    me.moveFile(files, opts.params.sourcePath, opts.params.destinationPath, true);
                                }
                            }
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }
});
