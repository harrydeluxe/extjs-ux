Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux.upload': '../../ux/upload'
	}
});

Ext.require([ 'Ext.ux.upload.Button' ]);

Ext.onReady(function()
{	
	Ext.create('Ext.ux.upload.Button', {
		renderTo: Ext.getBody(),
		text: 'Upload',
		singleFile: true,
		uploader: 
		{
			url: 'upload.php',
			uploadpath: '/Root/files',
			autoStart: true,
			maxFileSize: '2020mb',
			
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
				console.log('filesadded');
				return true;
			},
			
			beforeupload: function(uploader, file)								
			{
				console.log('beforeupload');			
			},

			fileuploaded: function(uploader, file)								
			{
				console.log('fileuploaded');
			},
			
			uploadcomplete: function(uploader, success, failed)								
			{
				console.log('uploadcomplete');				
			},
			scope: this
		}
				
		
	});
});