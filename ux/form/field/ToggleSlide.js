/**
 * @class Ext.ux.toggleslide.ToggleSlide
 * @extends Ext.Component
 * 
 * The Initial Developer of the Original Code is Sean McDaniel <sean@mcdconsulting.com>
 * Copyright(c) 2010, http://www.mcdconsultingllc.com Licensed under the terms
 * of the Open Source LGPL 3.0 http://www.gnu.org/licenses/lgpl.html
 * @see https://github.com/steelThread/ExtJs-ToggleSlide
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.form.field.ToggleSlide', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.toggleslidefield',
    
    requires: ['Ext.ux.toggleslide.ToggleSlide'],
            
    fieldSubTpl: ['<div id="{id}" class="{fieldCls}"></div>',
        {
            compiled: true,
            disableFormats: true
        }],
                  
    value: null,
    
    /**
     * Initialize the component.
     * @private
     */
    initComponent : function()
    {
        var me = this,
            cfg = {id: me.id + '-toggle-slide'};
        
        cfg = Ext.copyTo(cfg, me.initialConfig, [
            'onText',
            'offText', 
            'resizeHandle',
            'resizeContainer',
            'background',
            'onLabelCls',
            'offLabelCls',
            'handleCls',
            'state',
            'booleanMode'
        ]);

        me.toggle = new Ext.ux.toggleslide.ToggleSlide(cfg);
        
        me.callParent(arguments);
    },    
    

                  
    onRender: function(ct, position)
    {
        var me = this;
        
        me.callParent(arguments);

        me.toggle.render(me.inputEl);
        me.setValue(me.toggle.getValue());
    },
    
 
    /**
     * Initialize any events for this class.
     * @private
     */
    initEvents: function()
    {
        this.callParent();
        //Ext.ux.form.field.ToggleSlide.superclass.initEvents.call(this);
        this.toggle.on('change', this.onToggleChange, this);   
    },

    /**
     * Utility method to set the value of the field when the toggle changes.
     * @param {Object} toggle The toggleSlide object.
     * @param {Object} v The new value.
     * @private
     */
    onToggleChange: function(toggle, state)
    {
        //console.log('onToggleChange', toggle, state);
        return this.setValue(state);
    },
    
    /**
     * Utility method to set the value of the field when the toggle changes.
     * @param {Object} toggle The toggleSlide object.
     * @param {Object} v The new value.
     * @private
     */
    onChange: function(toggle, state)
    {
        //console.log('onChange', toggle, state);
        //return this.setValue(state);
    },

    /**
     * Enable the toggle when the field is enabled.
     * @private
     */
    onEnable: function(){
        Ext.ux.form.field.ToggleSlide.superclass.onEnable.call(this);
        this.toggle.enable();
    },
    
    /**
     * Disable the toggle when the field is disabled.
     * @private
     */
    onDisable: function(){
        Ext.ux.form.field.ToggleSlide.superclass.onDisable.call(this);
        this.toggle.disable();
    },

    /**
     * Ensure the toggle is destroyed when the field is destroyed.
     * @private
     */
    beforeDestroy: function(){
        Ext.destroy(this.toggle);
        this.callParent();
    }
});
