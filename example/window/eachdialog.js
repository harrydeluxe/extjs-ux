Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext.ux.window': '../../ux/window'
	}
});

Ext.require([ 'Ext.ux.window.EachDialog' ]);

Ext.onReady(function()
{	
	var tmp_files = [{name: 'file_1.jpg'}, {name: 'file_2.jpg'}, {name: 'file_3.jpg'}];
	
	if(tmp_files.length != 0)									
	{
		var mb = Ext.ux.window.EachDialog,
		cmessage = 'The file <b>"{0}"</b> already exists. Do you want to overwrite it?',
		conf = {
		    title: 'Overwrite file?',
		    msg: Ext.String.format(cmessage, tmp_files[0].name),
			label: 'Mark for all?',
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
							// do something like: uploader.uploader.removeFile(tfile);
							//alert('uploader.removeFile');
						});	
																	
						tmp_files = [];
					}
					else
					{  
						// do something like: uploader.uploader.removeFile(tmp_files[0]);
					    //alert('uploader.removeFile');
					}
				}												
				else if(btn == 'cancel')												
				{
					// do something like: uploader.removeAll();
				    //alert('uploader.removeAll');
					tmp_files = [];
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
				    // do something like: uploader.start();
                    //alert('uploader.start');
                }
					
			}
		}
		));
		
		return false;
			
	}
});