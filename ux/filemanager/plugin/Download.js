/**
 * @class Ext.ux.filemanager.plugin.Download
 * @extends Ext.AbstractPlugin
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define("Ext.ux.filemanager.plugin.Download", {
    extend: "Ext.AbstractPlugin",
    alias: "plugin.filemanager.download",
    
    /**
     * @cfg {String} downloadFileUrl The URL to download files Takes precedence
     *      over dataUrl
     */
    
    init: function(cmp)
    {
        var me = this;
        me.filemanager = cmp;
        cmp.actions.download = Ext.create('Ext.Action', {
            text: cmp.il8n.downloadText,
            iconCls: 'ux-filemanager-icon-download',
            cls: 'x-btn-text-icon',
            cmd: 'download',
            disabled: true,
            canToggle: true,
            singleFile: true,
            file: true,
            folder: false,
            handler: function(widget, event)
            {
                var row = cmp.grid.getView().getSelectionModel().getSelection()[0];
                me.downloadFile(row);
            },
            scope: me
        });
        cmp.registerToolbarItem('download', cmp.actions.download);
        cmp.gtb.unshift(cmp.actions.download); // toolbar
        // cmp.gcm.unshift(cmp.actions.download); // context menu
        cmp.registerGridContextMenu(cmp.actions.download);
        cmp.addEvents(
        /**
         * @event beforedownloadfile Fires before file will be downloaded from
         *        the server, return false to cancel the event
         * @param {Ext.ux.filemanagerPanel} this
         * @param {Ext.data.Record} record The record representing the file that
         *            will be downloaded
         */
        'beforedownloadfile');
    },
    
    /**
     * Download a file from the server Shamelessly stolen from Saki's
     * FileTreePanel (Saki FTW! :p) But it does exactly what i need it to do,
     * and it does it very well..
     * 
     * @see http://filetree.extjs.eu/
     * @private
     * @param {Ext.data.Record} record Record representing the file that needs
     *            to be downloaded
     * @returns {Void}
     */
    downloadFile: function(record)
    {
        var me = this,
            filemanager = this.filemanager,
            id = Ext.id(),
            frame,
            form,
            hidden,
            callback;
        
        if(filemanager.eventsSuspended !== true && filemanager.fireEvent('beforedownloadfile', filemanager, record) === false)
        {
            return;
        }
        
        callback = function()
        {
            Ext.EventManager.removeListener(frame, 'load', callback, this);
            
            setTimeout(function()
            {
                document.body.removeChild(form);
            }, 100);
            
            setTimeout(function()
            {
                document.body.removeChild(frame);
            }, 110);
        };
        
        // create a new iframe element
        frame = document.createElement('iframe');
        frame.id = id;
        frame.name = id;
        frame.className = 'x-hidden';
        Ext.EventManager.addListener(frame, 'load', callback, me);
        // use blank src for Internet Explorer
        if(Ext.isIE)
        {
            frame.src = Ext.SSL_SECURE_URL;
        }
        // append the frame to the document
        document.body.appendChild(frame);
        // also set the name for Internet Explorer
        if(Ext.isIE)
        {
            document.frames[id].name = id;
        }
        // create a new form element
        form = Ext.core.DomHelper.append(document.body, {
            tag: 'form',
            method: 'post',
            action: this.downloadFileUrl || filemanager.dataUrl,
            target: id
        });
        // create hidden input element with the 'action'
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'action';
        hidden.value = 'download-file';
        form.appendChild(hidden);
        // create another hidden element that holds the path of
        // the file to download
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'path';
        hidden.value = filemanager.path + '/' + record.data.name;
        form.appendChild(hidden);
        form.submit();
    }
});
