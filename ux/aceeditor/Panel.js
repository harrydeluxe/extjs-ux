/**
 * @class Ext.ux.aceeditor.Panel
 * @extends Ext.panel.Panel
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.aceeditor.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.AceEditor',
    mixins: {
        editor: 'Ext.ux.aceeditor.Editor'
    },
    layout: 'fit',
    autofocus: true,
    border: false,
    
    initComponent: function()
    {
        var me = this,
            items = {
                xtype: 'component',
                autoEl: 'pre'
            };

        Ext.apply(me, {
            items: items
        });
        
        me.callParent(arguments);

        // Event listeners should be here, not in "listeners" to avoid being
        // overwritten when the component's instantiated with listeners.
        me.on('activate', function() {
            if(this.editor && this.autofocus) {
                this.editor.focus();
            }
        }, me);

        me.on('resize', function() {
            if(this.editor) {
                this.editor.resize();
            }
        }, me);
    },
    
    onRender: function()
    {
        var me = this;

        if(me.sourceEl != null)
        {
            //me.sourceCode = Ext.get(me.sourceEl).getHTML();
            //me.sourceCode = Ext.get(me.sourceEl).dom.innerHTML; 
            me.sourceCode = Ext.get(me.sourceEl).dom.outerText; 
            //me.sourceCode = Ext.get(me.sourceEl).dom.value;
        }
        
        me.editorId = me.items.keys[0];
        me.oldSourceCode = me.sourceCode;
        
        me.callParent(arguments);

        // init editor on afterlayout
        me.on('afterlayout', function()
        {
            if(me.url)
            {
                Ext.Ajax.request({
                    url: me.url,
                    success: function(response)
                    {
                        me.sourceCode = response.responseText;
                        me.initEditor();
                    }
                });
            }
            else
            {
                me.initEditor();
            }
            
        }, me, {
            single: true
        });
    }
});
