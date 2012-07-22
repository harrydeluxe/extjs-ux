window.ondragenter = function(e)
{
    e.dataTransfer.dropEffect = 'none';
    e.preventDefault();
    return false;
};

window.ondragover = function(e)
{
    e.preventDefault();
    return false;
};

window.ondrop = function(e)
{
    return false;
};

window.ondragleave = function(e)
{
    return false;
};

Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'http://extjs.cachefly.net/extjs-4.1.1-gpl/examples/ux/',
        'Ext.ux.upload': '../../ux/upload'
    }
});

Ext.require(['Ext.grid.*',
        'Ext.data.*',
        'Ext.util.*',
        'Ext.state.*',
        'Ext.ux.upload.Button',
        'Ext.ux.upload.plugin.Window']);



Ext.onReady(function()
{	
	Ext.create('Ext.ux.upload.Button', {
		renderTo: Ext.getBody(),
		text: 'Select files',
		//singleFile: true,
		plugins: [{
                      ptype: 'ux.upload.window',
                      title: 'Upload',
                      width: 520,
                      height: 350
                  }
        ],
		uploader: 
		{
			url: 'upload.json',
			uploadpath: '/Root/files',
			autoStart: false,
			max_file_size: '2020mb',			
			drop_element: 'dragload',
			statusQueuedText: 'Ready to upload',
			statusUploadingText: 'Uploading ({0}%)',
			statusFailedText: '<span style="color: red">Error</span>',
			statusDoneText: '<span style="color: green">Complete</span>',

			statusInvalidSizeText: 'File too large',
			statusInvalidExtensionText: 'Invalid file type'
		},
		listeners: 
		{
			filesadded: function(uploader, files)								
			{
				//console.log('filesadded');
				return true;
			},
			
			beforeupload: function(uploader, file)								
			{
				//console.log('beforeupload');			
			},

			fileuploaded: function(uploader, file)								
			{
				//console.log('fileuploaded');
			},
			
			uploadcomplete: function(uploader, success, failed)								
			{
				//console.log('uploadcomplete');				
			},
			scope: this
		}
				
		
	});
});