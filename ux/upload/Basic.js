/**
 * @class Ext.ux.upload.Basic
 * @extends Ext.util.Observable
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.upload.Basic', {
    extend: 'Ext.util.Observable',
    autoStart: true,
    autoRemoveUploaded: true,
    
    statusQueuedText: 'Ready to upload',
    statusUploadingText: 'Uploading ({0}%)',
    statusFailedText: 'Error',
    statusDoneText: 'Complete',
    statusInvalidSizeText: 'File too large',
    statusInvalidExtensionText: 'Invalid file type',
    

    configs: {
        uploader: {
            runtimes: '',
            url: '',
            browse_button: null,
            container: null,
            max_file_size: '128mb',
            resize: '',
            flash_swf_url: '',
            silverlight_xap_url: '',
            filters: [],
            //chunk_size: '1mb', // @see http://www.plupload.com/punbb/viewtopic.php?id=1259
            chunk_size: null,
            unique_names: true,
            multipart: true,
            multipart_params: {},
            multi_selection: true,
            drop_element: null,
            required_features: null
        }
    },
    
    constructor: function(owner, config)
    {
        var me = this;
        me.owner = owner;
        me.success = [];
        me.failed = [];
        Ext.apply(me, config.listeners);
        me.uploaderConfig = Ext.apply(me, config.uploader, me.configs.uploader);
        
        me.addEvents('beforestart',
                'uploadready',
                'uploadstarted',
                'uploadcomplete',
                'uploaderror',
                'filesadded',
                'beforeupload',
                'fileuploaded',
                'updateprogress',
                'uploadprogress',
                'storeempty');      
        
        Ext.define('Ext.ux.upload.Model', {
            extend: 'Ext.data.Model',
            fields: ['id',
                    'loaded',
                    'name',
                    'size',
                    'percent',
                    'status',
                    'msg']
        });
        
        me.store = Ext.create('Ext.data.JsonStore', {
            model: 'Ext.ux.upload.Model',
            listeners: {
                load: me.onStoreLoad,
                remove: me.onStoreRemove,
                update: me.onStoreUpdate,
                scope: me
            }
        });
        
        me.actions = {
            
            textStatus: Ext.create('Ext.Action', {
                text: '<i>uploader not initialized</i>'
            }),
            add: Ext.create('Ext.Action', {
                text: config.addButtonText || 'Add files',
                iconCls: config.addButtonCls,
                disabled: false
            }),
            start: Ext.create('Ext.Action', {
                text: config.uploadButtonText || 'Start',
                disabled: true,
                iconCls: config.uploadButtonCls,
                handler: me.start,
                scope: me
            }),
            cancel: Ext.create('Ext.Action', {
                text: config.cancelButtonText || 'Cancel',
                disabled: true,
                iconCls: config.cancelButtonCls,
                handler: me.cancel,
                scope: me
            }),
            removeUploaded: Ext.create('Ext.Action', {
                text: config.deleteUploadedText || 'Remove uploaded',
                disabled: true,
                handler: me.removeUploaded,
                scope: me
            }),
            removeAll: Ext.create('Ext.Action', {
                text: config.deleteAllText || 'Remove all',
                disabled: true,
                handler: me.removeAll,
                scope: me
            })
        };

        me.callParent();
    },
    
    /**
     * @private
     */
    initialize: function()
    {
        var me = this;
        if(!me.initialized)
        {
            me.initialized = true;
            me.initializeUploader();
        }
    },
    
    /**
     * Destroys this object.
     */
    destroy: function()
    {
        this.clearListeners();
    },
    
    setUploadPath: function(path)
    {
        this.uploadpath = path;
    },
    
    removeAll: function()
    {
        this.store.data.each(function(record)
        {
            this.removeFile(record.get('id'));
        }, this);
    },
    
    removeUploaded: function()
    {
        //console.log(this.store);
        this.store.each(function(record)
        {
            //console.log(record);
            if(record && record.get('status') == 5)
            {
                this.removeFile(record.get('id'));
            }
        }, this);
    },
    
    removeFile: function(id)
    {
        var me = this,
            file = me.uploader.getFile(id);
        
        if(file)
            me.uploader.removeFile(file);
        else
            me.store.remove(me.store.getById(id));
    },
    
    cancel: function()
    {
        var me = this;
        me.uploader.stop();
        me.actions.start.setDisabled(me.store.data.length == 0);
    },
    
    start: function()
    {
        var me = this;
        me.fireEvent('beforestart', me);
        if(me.multipart_params)
        {
            me.uploader.settings.multipart_params = me.multipart_params;
        }
        me.uploader.start();
        //console.log(me.uploader);
    },
    
    initializeUploader: function()
    {
        var me = this;

        if (!me.uploaderConfig.runtimes) {
            var runtimes = ['html5'];
            
            me.uploaderConfig.flash_swf_url && runtimes.push('flash');
            me.uploaderConfig.silverlight_xap_url && runtimes.push('silverlight');

            runtimes.push('html4');

            me.uploaderConfig.runtimes = runtimes.join(',');
        }

        me.uploader = Ext.create('plupload.Uploader', me.uploaderConfig);
        
        Ext.each(['Init',
                'ChunkUploaded',
                'FilesAdded',
                'FilesRemoved',
                'FileUploaded',
                'PostInit',
                'QueueChanged',
                'Refresh',
                'StateChanged',
                'BeforeUpload',
                'UploadFile',
                'UploadProgress',
                'Error'], function(v){
                    me.uploader.bind(v, eval("me._" + v), me);
                }, me);
        
        me.uploader.init();
    },
    
    updateProgress: function()
    {
        var me = this,
            t = me.uploader.total,
            speed = Ext.util.Format.fileSize(t.bytesPerSec),
            total = me.store.data.length,
            failed = me.failed.length,
            success = me.success.length,
            sent = failed + success,
            queued = total - success - failed,
            percent = t.percent;
        
        me.fireEvent('updateprogress', me, total, percent, sent, success, failed, queued, speed);
    },
    
    updateStore: function(v)
    {
        var me = this,
            data = me.store.getById(v.id);
        
        if(!v.msg)
        {
            v.msg = '';
        }
        if(data)
        {
            data.data = v;
            data.commit();
        }
        else
        {
            me.store.loadData([v], true);
        }
    },
    
    onStoreLoad: function(store, record, operation)
    {
        this.updateProgress();
    },
    
    onStoreRemove: function(store, record, operation)
    {
        var me = this;
        if(!store.data.length)
        {
            me.actions.start.setDisabled(true);
            me.actions.removeUploaded.setDisabled(true);
            me.actions.removeAll.setDisabled(true);
            me.uploader.total.reset();
            me.fireEvent('storeempty', me);
        }
        
        var id = record.get('id');
        Ext.each(me.success, function(v)
        {
            if(v && v.id == id)
                Ext.Array.remove(me.success, v);
        }, me);
        
        Ext.each(me.failed, function(v)
        {
            if(v && v.id == id)
                Ext.Array.remove(me.failed, v);
        }, me);
        
        me.updateProgress();
    },
    
    onStoreUpdate: function(store, record, operation)
    {
        record.data = this.fileMsg(record.data);
        this.updateProgress();
    },
    
    fileMsg: function(file)
    {
        var me = this;
        if(file.status && file.server_error != 1)
        {
            switch(file.status)
            {
                case 1:
                    file.msg = me.statusQueuedText;
                    break;
                case 2:
                    file.msg = Ext.String.format(me.statusUploadingText, file.percent);
                    break;
                case 4:
                    file.msg = file.msg || me.statusFailedText;
                    break;
                case 5:
                    file.msg = me.statusDoneText;
                    break;
            }
        }
        return file;
    },
    
    /**
     * Plupload EVENTS
     */
    _Init: function(uploader, data)
    {
        this.runtime = data.runtime;
        this.owner.enable(true); // button aktiv schalten
        this.fireEvent('uploadready', this);
    },
    
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    _BeforeUpload: function(uploader, file)
    {
        this.fireEvent('beforeupload', this, uploader, file);
    },
    
    _ChunkUploaded: function()
    {
    },
    
    _FilesAdded: function(uploader, files)
    {
        var me = this;
        
        if(me.uploaderConfig.multi_selection != true) 
        {
            if(me.store.data.length == 1)
            //if(uploader.files.length == 1)
                return false;
            
            files = [files[0]];
            uploader.files = [files[0]];  
        }   
         
        me.actions.removeUploaded.setDisabled(false);
        me.actions.removeAll.setDisabled(false);
        me.actions.start.setDisabled(uploader.state == 2);
        Ext.each(files, function(v)
        {
            me.updateStore(v);
            
        }, me);

        if(me.fireEvent('filesadded', me, files) !== false)
        {
            if(me.autoStart && uploader.state != 2)
                Ext.defer(function()
                {
                    me.start();
                }, 300);
        }
    },
    
    _FilesRemoved: function(uploader, files)
    {
        Ext.each(files, function(file)
        {
            this.store.remove(this.store.getById(file.id));
        }, this);
    },
    
    _FileUploaded: function(uploader, file, status)
    {
        var me = this,
            response = Ext.JSON.decode(status.response);
        
        if(response.success == true)
        {
            file.server_error = 0;
            me.success.push(file);
            me.fireEvent('fileuploaded', me, file, response);
        }
        else
        {
            if(response.message)
            {
                file.msg = '<span style="color: red">' + response.message + '</span>';
            }
            file.server_error = 1;
            me.failed.push(file);
            me.fireEvent('uploaderror', me, Ext.apply(status, {
                file: file
            }));
        }
        this.updateStore(file);
    },
    
    _PostInit: function(uploader)
    {
    },
    
    _QueueChanged: function(uploader)
    {
    },
    
    _Refresh: function(uploader)
    {
        Ext.each(uploader.files, function(v)
        {
            this.updateStore(v);
        }, this);
    },
    
    _StateChanged: function(uploader)
    {
        if(uploader.state == 2)
        {
            this.fireEvent('uploadstarted', this);
            this.actions.cancel.setDisabled(false);
            this.actions.start.setDisabled(true);
        }
        else
        {
            this.fireEvent('uploadcomplete', this, this.success, this.failed);
            if(this.autoRemoveUploaded)
                this.removeUploaded();
            this.actions.cancel.setDisabled(true);
            this.actions.start.setDisabled(this.store.data.length == 0);
        }
    },
    
    _UploadFile: function(uploader, file)
    {
    },
    
    _UploadProgress: function(uploader, file)
    {
        var me = this,
            name = file.name,
            size = file.size,
            percent = file.percent; 
    
        me.fireEvent('uploadprogress', me, file, name, size, percent);

        if(file.server_error)
            file.status = 4;
        
        me.updateStore(file);
    },
    
    _Error: function(uploader, data)
    {
        if(data.file)
        {
            data.file.status = 4;
            if(data.code == -600)
            {
                data.file.msg = Ext.String.format('<span style="color: red">{0}</span>', this.statusInvalidSizeText);
            }
            else if(data.code == -700)
            {
                data.file.msg = Ext.String.format('<span style="color: red">{0}</span>', this.statusInvalidExtensionText);
            }
            else
            {
                data.file.msg = Ext.String.format('<span style="color: red">{2} ({0}: {1})</span>', data.code, data.details,
                        data.message);
            }
            this.failed.push(data.file);
            this.updateStore(data.file);
        }
        this.fireEvent('uploaderror', this, data);
    }
});