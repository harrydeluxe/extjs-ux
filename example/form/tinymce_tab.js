Ext.Loader.setConfig({
	'enabled': true,
	'paths': {
		'Ext.ux': 'http://extjs.cachefly.net/ext-4.1.0-gpl/examples/ux/',
		'Ext.ux.form.field': '../../ux/form/field'
	}
});

Ext.require([ 'Ext.ux.form.field.TinyMCE' ]);

Ext.onReady(function()
{
    var tinyForm2 = Ext.create('Ext.form.Panel', {
        title: 'Editor 2',
        border: false,
        fieldDefaults: {
            labelWidth: 55
        },
        defaultType: 'textfield',
        bodyPadding: 5,

        items: [{
            fieldLabel: 'Send To',
            name: 'to',
            anchor:'100%'  // anchor width by percentage
        },{
            fieldLabel: 'Subject',
            name: 'subject',
            anchor: '100%'  // anchor width by percentage
        },
        {
            xtype: 'tinymcefield',
            name: 'msg',
            fieldLabel: 'Biography',
            hideLabel: true,
            //height: 200,
            anchor: '100% -55',
            tinymceConfig: {
                theme_advanced_buttons1: 'fullscreen,|,undo,redo,|,bold,italic,strikethrough,|,charmap,|,removeformat,code',
                theme_advanced_buttons2: '',
                theme_advanced_buttons3: '',
                theme_advanced_buttons4: '',
                skin_variant : 'gray'
            }
        }]
    });

    var tinyForm3 = Ext.create('Ext.form.Panel', {
        title: 'Editor 1',
        border: false,
        layout: 'fit',
        items: [{
            xtype: 'tinymcefield',
            name: 'msg',
            hideLabel: true,
            hideBorder: true,
            anchor: '100%',
            tinymceConfig: {
                theme_advanced_buttons1: 'fullscreen,|,undo,redo,|,bold,italic,strikethrough,|,charmap,|,removeformat,code',
                theme_advanced_buttons2: '',
                theme_advanced_buttons3: '',
                theme_advanced_buttons4: '',
                skin_variant : 'gray'
            }
        }]
    });
    
    var tinyForm4 = Ext.create('Ext.form.Panel', {
        title: 'Editor 3',
        border: false,
        layout: 'fit',
        items: [{
            xtype: 'tinymcefield',
            name: 'msg',
            fieldLabel: 'Biography',
            hideLabel: true,
            hideBorder: true,
            anchor: '100%',
            tinymceConfig: {
                skin_variant : 'gray'
            }
        }]
    });
    
    var win = Ext.create('Ext.window.Window', {
        title: 'Resize Me',
        width: 660,
        height:380,
        minWidth: 300,
        minHeight: 200,
        layout: 'fit',
        plain: true,
        //border: false,
        items: Ext.create('Ext.tab.Panel', {
            border: false,
            plain: true,
            items: [tinyForm3, tinyForm2, tinyForm4]
        })/*,

        buttons: [{
            text: 'Send'
        },{
            text: 'Cancel'
        }]*/
    });

    win.show();
    
    
	
});