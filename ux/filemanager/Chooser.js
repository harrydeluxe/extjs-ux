
Ext.define('Ext.ux.filemanager.Chooser', {
    extend: 'Ext.window.Window',
    uses: [
        'Ext.layout.container.Border',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.TextItem'
    ],
    
    requires: ['Ext.ux.filemanager.Panel'],
    
    
    width : 740,
    height: 570,
    title : 'Choose an Image',
    closeAction: 'hide',
    layout: 'fit',
    // modal: true,
    border: false,
    bodyBorder: false,
    plain: true,
    

    files: [],
    allowedType: ['image/jpeg','image/png'],
    fileExtensions: [],
    mimes: {},

    initComponent: function()
    {
    	var me = this;
    	
        (function(mime_data) {
    		var items = mime_data.split(/,/), i, y, ext;

    		for (i = 0; i < items.length; i += 2) {
    			ext = items[i + 1].split(/ /);

    			for (y = 0; y < ext.length; y++) {
    				me.mimes[ext[y]] = items[i];
    			}
    		}
    	})(
    		"application/msword,doc dot," +
    		"application/pdf,pdf," +
    		"application/pgp-signature,pgp," +
    		"application/postscript,ps ai eps," +
    		"application/rtf,rtf," +
    		"application/vnd.ms-excel,xls xlb," +
    		"application/vnd.ms-powerpoint,ppt pps pot," +
    		"application/zip,zip," +
    		"application/x-shockwave-flash,swf swfl," +
    		"application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
    		"application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
    		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
    		"application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," + 
    		"application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
    		"application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
    		"application/x-javascript,js," +
    		"application/json,json," +
    		"audio/mpeg,mpga mpega mp2 mp3," +
    		"audio/x-wav,wav," +
    		"audio/mp4,m4a," +
    		"image/bmp,bmp," +
    		"image/gif,gif," +
    		"image/jpeg,jpeg jpg jpe," +
    		"image/photoshop,psd," +
    		"image/png,png," +
    		"image/svg+xml,svg svgz," +
    		"image/tiff,tiff tif," +
    		"text/plain,asc txt text diff log," +
    		"text/html,htm html xhtml," +
    		"text/css,css," +
    		"text/csv,csv," +
    		"text/rtf,rtf," +
    		"video/mpeg,mpeg mpg mpe," +
    		"video/quicktime,qt mov," +
    		"video/mp4,mp4," +
    		"video/x-m4v,m4v," +
    		"video/x-flv,flv," +
    		"video/x-ms-wmv,wmv," +
    		"video/avi,avi," +
    		"video/webm,webm," +
    		"video/vnd.rn-realvideo,rv," +
    		"application/vnd.oasis.opendocument.formula-template,otf," +
    		"application/octet-stream,exe"
    	);
        
        
        //console.log(me.mimes);
    	me.filemanager = Ext.create('Ext.ux.filemanager.Panel', {	
			dataUrl: 'filemanagerpanelMongo.php',
			//path: '/sight/assets/js',
			path: '/media/Logos',
			//rootPath: '',
			//readOnly: true,
			listeners: {
				
				selectionchange: {
					fn: function(view, selections)
					{
						me.files = [];
						if(selections.length >= 1)
						{
							me.down('#ok').enable();
							me.down('#apply').enable();
							
							Ext.each(selections, function(selection)
							{
								var dt = selection.data.type;
								if(dt == '' || dt == 'folder' || !Ext.Array.contains(me.allowedType, dt))
								{
									me.down('#ok').disable();
									me.down('#apply').disable();
								}
								else
									me.files.push(selection);
							});
						}
						else
						{
							me.down('#ok').disable();
							me.down('#apply').disable();
						}
					},
					scope: me
				},
				
				filedblclick: {
					fn: function(view, selection)
					{
						//console.log(view, selection);
						me.files = [];	
						var dt = selection.data.type;
						if(dt == '' || dt == 'folder' || !Ext.Array.contains(me.allowedType, dt))
						{
							me.down('#ok').disable();
							me.down('#apply').disable();
						}
						else
						{
							me.files.push(selection);
							me.fireImageSelected(true);
						}
					},
					scope: this
				}
			},
			
			bodyStyle: {
					    background: 'transparent',
					    //padding: '10px',
						border: 'none'
					},
					
			dockedItems: [{
				dock: 'top',
				enableOverflow: true,
				xtype: 'toolbar',
				style: {
					background: 'transparent',
					border: 'none',
					padding: '5px 0'
				},
				listeners: {
					beforerender: function(toolbar)
					{
						var m = toolbar.ownerCt;
						
						
						var a = {
							// xtype:'splitbutton',
							// text: 'Actions',
							// textAlign: 'left',
							iconCls: 'ux-filemanager-icon-config',
							menu: [
							// me.toolbaritems.create,
							m.toolbaritems.rename,
									m.toolbaritems.download,
									'-',
									m.toolbaritems.reload]
						};
						toolbar.add({
							xtype: 'tbfill',
							//id: 'tbfill_1',
							flex: 0
						});
						toolbar.add(a);
						toolbar.add(m.actions.remove);
						toolbar.add(m.toolbaritems.create);
						toolbar.add(m.toolbaritems.upload);
						toolbar.add('->');
						toolbar.add({
							text: 'zu',
							handler: function(t)
							{
								m.tree.collapsed ? m.tree.expand() : m.tree.collapse();
							}
						});
						
						
						toolbar.add(m.toolbaritems.view);
						
					},
					scope: me
				}
			}],

	
			region: 'center',
			treeConfig: {rootVisible : false},			
			plugins: [
					{ ptype: 'filemanager.reload' },
					{ ptype: 'filemanager.rename' },
					{ ptype: 'filemanager.grouping' },
					{ ptype: 'filemanager.download'},
					{ ptype: 'filemanager.delete' },
					{ ptype: 'filemanager.upload' },
					{ ptype: 'filemanager.create' },
					{ ptype: 'filemanager.dragselector' },
					//{ ptype: 'filemanager.dragdrop' },
					{
						ptype: 'filemanager.view',
						mode: 'default'
					}
				]
			
			});   	
    	
    	
    	me.items = [me.filemanager],
       
    	me.buttons = [
            {
                text: 'OK',
                scope: me,
                disabled: true,
				itemId: 'ok',
                handler: function() {
                	me.fireImageSelected(true);
                }
            },
            {
                text: 'Apply',
                scope: me,
                disabled: true,
				itemId: 'apply',
                handler: function() {
                	me.fireImageSelected(false);
                }
            },
            {
                text: 'Cancel',
                scope: me,
                handler: function() {
                	me.hide();
                }
            }
        ];
        
    	me.callParent(arguments);
        
    	me.addEvents(
            'selected'
        );
    },

    
    /**
     * Fires the 'selected' event, informing other components that an file has been selected
     */
    fireImageSelected: function(hide)
    {
        var me = this;
        
        if(me.files.length >= 1)
        {
            me.fireEvent('selected', me.files);
            if(hide)
            	me.hide();
        }
    }
});