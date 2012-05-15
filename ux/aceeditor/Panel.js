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
    
    listeners: {
        resize: function()
        {
            if(this.editor)
            {
                this.editor.resize();
            }
        },
        activate: function()
        {
            if(this.editor && this.autofocus)
            {
                this.editor.focus();
            }
        }
    },
    
    initComponent: function()
    {
        var me = this,
            items = {
                xtype: 'component',
                autoEl: 'pre'
            };
        
        if(me.contentEl != null)
        {
            me.sourceCode = Ext.get(me.contentEl).dom.innerHTML;
        }
        
        Ext.apply(me, {
            items: items
        });
        
        me.callParent(arguments);
    },
    
    onRender: function()
    {
        var me = this;
        if(me.contentEl != null)
        {
            me.sourceCode = Ext.get(me.contentEl).dom.innerText;
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