/**
 * @class Ext.ux.filemanager.plugin.Upload
 * @extends Ext.AbstractPlugin
 * 
 * @copyright Copyright (c) 2011-2012 Harald Hanek
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.filemanager.plugin.Upload',
{
    extend: 'Ext.AbstractPlugin',
    
    requires: ['Ext.ux.window.EachDialog',
            'Ext.ux.upload.Button',
            'Ext.ux.upload.plugin.Window'],
            
    alias: "plugin.filemanager.upload",
    
    init: function(cmp)
    {
        var me = this, filemanager = cmp, uploadbytes = 0;
        me.filemanager = filemanager;

        cmp.actions.upload = new Ext.ux.upload.Button({
                text: 'Upload',
                iconCls: 'ux-filemanager-icon-upload',
                singleFile: true,
                plugins: [{
                    ptype: 'ux.upload.window',
                    title: 'Upload',
                    width: 520,
                    height: 350
                }],
                uploader: {
                    autoRemoveUploaded: true,
                    text: 'Dateien hinzufügen...',
                    url: 'http://localhost/delacap/web/labs/n9backend/filemanager/upload.php',
                    // flash_swf_url:
                    // '../ux4/upload/plupload/js/plupload.flash.swf',
                    uploadpath: '/Root/popichtig',
                    autoStart: true,
                    showProgressPanel: true,
                    showFilesPanel: true,
                    max_file_size: '512mb',
                    filesPanelConfig: {
                        title: 'Dateien'
                    },
                    drop_element: filemanager.grid.id,
                    statusQueuedText: 'Bereit zum upload',
                    statusUploadingText: 'Uploading ({0}%)',
                    statusFailedText: '<span style="color: red">Fehler</span>',
                    statusDoneText: '<span style="color: green">Fertig</span>',
                    statusInvalidSizeText: 'Datei zu groß',
                    statusInvalidExtensionText: 'Invalid file type'
                },
                listeners: {
                    updateprogress: function(uploader, total, percent, sent, success, failed, queued, speed)
                    {
                        // console.log('updateprogress',
                        // uploader, total, percent,
                        // sent, success, failed,
                        // queued, speed);
                    },
                    
                    uploadprogress: function(uploader, file, name, size, percent)
                    {
                        // console.log('uploadprogress', uploader, file, name, size, percent);
                    },
                    
                    filesadded: function(uploader, files)
                    {
                        if(!filemanager.path)
                            return false;
                        
                        var tmp_files = [];
                        
                        Ext.each(files, function(file)
                        {
                            if(filemanager.path)
                                file.path = filemanager.path;
                            if(filemanager.grid.store.findRecord('name', file.name))
                                tmp_files.push(file);
                        }, this);
                        
                        if(tmp_files.length != 0)
                        {
                            uploader.cancel(); // testen!
                            var mb = Ext.ux.window.EachDialog,
                                cmessage = 'Die Datei <b>"{0}"</b> existiert bereits. Soll sie überschrieben werden?', conf = {
                                title: 'Datei überschreiben?',
                                msg: Ext.String.format(cmessage, tmp_files[0].name),
                                label: 'Für alle?',
                                buttons: Ext.Msg.YESNOCANCEL,
                                icon: Ext.window.MessageBox.QUESTION,
                                closable: false
                            };
                            
                            mb.show(Ext.apply(conf, {
                                fn: function(btn, checkbox)
                                {
                                    if(btn == 'no')
                                    {
                                        if(checkbox === true)
                                        {
                                            Ext.each(tmp_files, function(tfile)
                                            {
                                                uploader.uploader.removeFile(tfile);
                                            });
                                            tmp_files = [];
                                        }
                                        else
                                            uploader.uploader.removeFile(tmp_files[0]);
                                    }
                                    else if(btn == 'cancel')
                                    {
                                        uploader.removeAll();
                                        tmp_files = [];
                                        // return
                                        // false;
                                    }
                                    else
                                    {
                                        if(checkbox === true)
                                        {
                                            tmp_files = [];
                                        }
                                    }
                                    tmp_files.shift();
                                    if(tmp_files.length != 0)
                                    {
                                        conf.msg = Ext.String.format(cmessage, tmp_files[0].name);
                                        mb.show(conf);
                                    }
                                    else
                                    {
                                        if(uploader.uploader.files.length == 0)
                                            return false;
                                        
                                        if(uploader.owner.plugins[0].ptype == "ux.upload.window")
                                        {
                                            uploader.owner.plugins[0].window.show();
                                        }
                                        // console.log(uploader);
                                        if(uploader.autoStart && uploader.uploader.state != 2)
                                            Ext.defer(function()
                                            {
                                                uploader.start();
                                            }, 300);
                                    }
                                }
                            }));
                            return false;
                        }
                    },
                    
                    beforeupload: function(panel, uploader, file)
                    {
                        if(file.path)
                            uploader.settings.url = Ext.urlAppend(panel.url, "path=" + file.path);
                    },
                    
                    fileuploaded: function(uploader, file)
                    {
                        if(file.size)
                            uploadbytes = uploadbytes + file.size;
                        // console.log(uploadbytes);
                        if(uploadbytes > 2000000) // 2MB
                        {
                            var mbstore = filemanager.grid.getStore(), current = mbstore.currentPage;
                            // console.log(file);
                            mbstore.loadPage(current);
                            uploadbytes = 0;
                        }
                    },
                    
                    uploadcomplete: function(panel, uploader, success, failed)
                    {
                        var mbstore = filemanager.grid.getStore(), current = mbstore.currentPage;
                        mbstore.loadPage(current);
                        uploadbytes = 0;
                    },
                    scope: this
                }
            });
        
        cmp.registerToolbarItem('upload', cmp.actions.upload);
        cmp.gtb.unshift(cmp.actions.upload); // add button to toolbar
    }
});