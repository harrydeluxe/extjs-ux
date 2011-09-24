/**
 * Ext.ux.window.EachDialog Class
 * 
 * @author Harald Hanek (c) 2011
 * 
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.window.EachDialog', {
    extend: 'Ext.window.MessageBox',   
    
    initComponent: function()
    {
        var me = this;
		
        me.callParent();
   
        me.promptContainer.remove(me.msg);
        delete me.msg;
        
		me.msg = Ext.create('Ext.container.Container', {
            layout: {
                type: 'anchor'
            },          
            
            items: [
				me.msgtext = Ext.create('Ext.Component', {
				    autoEl: { tag: 'span' },
				    cls: 'ext-mb-text'
				}),
				me.checkbox = Ext.create('Ext.form.field.Checkbox', {
				    anchor: '100%',
				    name      : 'topping',
				    inputValue: '1'
				})
            ],
           
            update: function(v)
            {
            	me.msgtext.update(v);
            },
            
            getWidth: function()
            {
            	return me.msgtext.getWidth();
            }
        });
		me.promptContainer.add(me.msg);      
    },

    
    eachdialog: function(cfg, msg, fn, scope, multiline, value)
    {
        
    	if(Ext.isString(cfg))
    	{
            cfg = {
                prompt: true,
                title: cfg,
                minWidth: this.minPromptWidth,
                msg: msg,
                buttons: this.OKCANCEL,
                callback: fn,
                scope: scope,
                multiline: multiline,
                value: value
            };
        }
        return this.show(cfg);
    },

    
    reconfigure: function(cfg)
    {
        var me = this;
        
        if(cfg.label)
        {
            me.checkbox.boxLabel = cfg.label;
        }
        me.callParent([cfg]);
    },

    
    btnCallback: function(btn)
    {
        var me = this,
            value,
            field;

        field = me.checkbox;
        value = field.getValue();
        field.reset();

        btn.blur();
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    }

}, function() {
	Ext.ux.window.EachDialog = new this();
});
