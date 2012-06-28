Ext.Loader.setConfig({
	'enabled': true,
	'paths': {
		//'Ext.ux': 'http://extjs.cachefly.net/ext-4.1.0-gpl/examples/ux/',
		'Ext.ux.toggleslide': '../../ux/toggleslide',
		'Ext.ux.form.field': '../../ux/form/field'
	}
});

Ext.require([ 'Ext.ux.form.field.ToggleSlide', 'Ext.ux.toggleslide.Thumb' ]);

Ext.onReady(function()
{

    var disabled = Ext.create('Ext.ux.toggleslide.ToggleSlide', {renderTo: 'disabled', disabled: true});
    Ext.create('Ext.Button', {
        renderTo: 'button', 
        text: 'Enable',
        height: 25,
        width: 50,
        handler: function(btn) {
            if (disabled.disabled) {
                disabled.enable();
                btn.setText('Disable');
            } else {
                disabled.disable();
                btn.setText('Enable');
            }
        }
    });
    
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'default'
    });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'custom-color', 
        onText: 'online', 
        offText: 'offline',
        cls: 'custom-color',
        state: true
    });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'default-resize-handle', 
        onText: 'online', 
        offText: 'offline',
        resizeHandle: false,
        state: true
    });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'default-on', 
        onText: 'M', 
        offText: 'F'
    });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'css-sized-container', 
        resizeHandle: false, 
        state: true,
        resizeContainer: false
    });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'long-tiny', 
        onText: 'Long Label Text', 
        offText: 'Short'
    });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'beforechange', 
        state: true,
        listeners: {
            beforechange: function(toggle, state) {
                return confirm('Toggle to ' + state + '?');
            }
       }            
   });
    
    new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'onchange-bool-false',
        state: true,
        booleanMode: false, 
        listeners: {
            change: function(toggle, state) {
                Ext.get('status-bool-false').dom.innerHTML = '<b>' + state + '</b>';
            },
            afterrender: function(toggle) {
                Ext.get('status-bool-false').dom.innerHTML = '<b>' + toggle.getValue() + '</b>';         
            }
        }
    });
    
    
    var toggle = new Ext.ux.toggleslide.ToggleSlide({
        renderTo: 'onchange', 
        listeners: {
            change: function(toggle, state) {
                Ext.get('status').dom.innerHTML = '<b>' + state + '</b>';
            },
            afterrender: function(toggle) {
                Ext.get('status').dom.innerHTML = '<b>' + toggle.getValue() + '</b>';
            }
        }
    });

    Ext.TaskManager.start({
        run: function() {toggle.toggle();},
        interval: 3000
    });
    
    
    var tbar = {
            items: [{
               text: 'Default:',
               xtype: 'tbtext'
            },{ 
               xtype: 'toggleslide'
            },'|',{
               text: 'Small Handle:',
               xtype: 'tbtext'
            },{
               xtype: 'toggleslide',
               state: true,
               resizeHandle: false           
            },'|',{
               text: 'Single Char:',
               xtype: 'tbtext'
            },{
               xtype: 'toggleslide',
               onText: 'y',
               offText: 'n'          
            },'|',{
               text: 'Small Handle:',
               xtype: 'tbtext'
           },{
               xtype: 'toggleslide',
               onText: 'y',
               offText: 'n',
               state: true,
               resizeHandle: false           
           } ,'->',{
               text: 'Long labels:',
               xtype: 'tbtext'
           },{
               xtype: 'toggleslide',
                 onText: 'On label text', 
                 offText: 'Off label text',
               resizeHandle: false           
           }]    
        };
    
    Ext.create('Ext.panel.Panel', {
        title: 'Toolbar/Menu Toggles',   
        tbar: tbar,
        renderTo: 'panel',
        height: 100,
        width: 800
    });
    
    
    var simple = new Ext.form.Panel({
        id: 'form-demo',
        renderTo: 'form',
        title: 'Form Toggles',
        frame:true,
        bodyStyle:'padding:5px 5px 0',
        width: 400,
        labelWidth: 125,
        buttonAlign: 'center',
        defaultType: 'toggleslidefield',
        items: [{
            fieldLabel: 'Default',
            name: 'default'
        },{
            fieldLabel: 'Small handle',
            name: 'smallHandle',
            resizeHandle: false,
            state: true
        },{
            fieldLabel: 'Single char labels',
            name: 'singleCharLables',
            onText: 'Y', 
            offText: 'N',
            resizeHandle: true  
        },{
            fieldLabel: 'Single char labels',
            name: 'singleCharLabelsNotResized',
            onText: 'Y', 
            offText: 'N',
            resizeHandle: false,    
            state: true
        },{
            fieldLabel: 'Long labels',
            name: 'longLabels',
            onText: 'On label text', 
            offText: 'Off label text',
            booleanMode: false,
            resizeHandle: false
        },{
            fieldLabel: 'Boolean mode off',
            name: 'booleanModeOff',                  
            booleanMode: false,
            state: true
        }],
        buttons: [{
            text: 'Post',
            handler: function() {
                var form = Ext.getCmp('form-demo');
                var fieldValues = [];
                form.items.each(function(item) {
                    fieldValues.push(item.getName() + ': ' + item.getValue()); 
                });
    
                Ext.Msg.alert('Post fields', fieldValues.join('<br>'));
            }
        },
        {
            text: 'Reset',
            formBind: true,
            handler: function()
            {
                var form = Ext.getCmp('form-demo');
                form.getForm().reset();
            }
        }]
    });

});