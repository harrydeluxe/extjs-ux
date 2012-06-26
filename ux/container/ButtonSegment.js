/**
 * @class Ext.ux.container.ButtonSegment
 * @extends Ext.container.ButtonGroup
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.container.ButtonSegment', {
    extend: 'Ext.container.ButtonGroup',
    alias: 'widget.buttonsegment',

    baseCls: Ext.baseCSSPrefix + 'sbtn',

    buttonCls: Ext.baseCSSPrefix + 'sbtn',
    
    unstyled: true,
    
    frame: false,
    
    initComponent: function()
    {
        var me = this;
        
        me.callParent(arguments);
        
        me.activeItem = (me.activeItem + 1 > me.items.length) ? 0 : me.activeItem;
        
        me.items.each(function(el, c)
        {
            if(me.items.length === 1)
                el.addCls(me.buttonCls +'-single');
            else
            {
                var cls = c == 0 ? me.buttonCls +'-first' : (c == me.items.length - 1 ? me.buttonCls +'-last' : me.buttonCls +'-item');
                el.addCls(cls);
            }
        });

    },
    
    onBeforeAdd: function(component)
    {
        
    }
});