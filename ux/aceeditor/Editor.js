/**
 * @class Ext.ux.aceeditor.Editor
 * @extends Ext.AbstractComponent
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.aceeditor.Editor', {
    extend: 'Ext.util.Observable',
    path: '',
    sourceCode: '',
    autofocus: true,
    fontSize: '12px',
    theme: 'clouds',
    printMargin: false,
    printMarginColumn: 80,
    highlightActiveLine: true,
    highlightGutterLine: true,
    highlightSelectedWord: true,
    showGutter: true,
    fullLineSelection: true,
    tabSize: 4,
    useSoftTabs: false,
    showInvisible: false,
    useWrapMode: false,
    codeFolding: true,
    
    constructor: function(owner, config)
    {
        var me = this;
        me.owner = owner;      
        
        me.addEvents({
            'editorcreated': true
             },
            'change');      

        me.callParent();
    },
    
    initEditor: function()
    {
        var me = this;       
        
        me.editor = ace.edit(me.editorId);
        me.editor.ownerCt = me;
        me.setMode(me.parser);
        me.setTheme(me.theme);
        me.editor.getSession().setUseWrapMode(me.useWrapMode);
        me.editor.setShowFoldWidgets(me.codeFolding);
        me.editor.setShowInvisibles(me.showInvisible);
        me.editor.setHighlightGutterLine(me.highlightGutterLine);
        me.editor.setHighlightSelectedWord(me.highlightSelectedWord);
        me.editor.renderer.setShowGutter(me.showGutter);
        me.setFontSize(me.fontSize);
        me.editor.setShowPrintMargin(me.printMargin);
        me.editor.setPrintMarginColumn(me.printMarginColumn);
        me.editor.setHighlightActiveLine(me.highlightActiveLine);
        me.getSession().setTabSize(me.tabSize);
        me.getSession().setUseSoftTabs(me.useSoftTabs);
        me.setValue(me.sourceCode);

        me.editor.getSession().on('change', function()
        {
            me.fireEvent('change', me);
            
        }, me);
        
        if(me.autofocus)
            me.editor.focus();
        else
        {
            me.editor.renderer.hideCursor();
            me.editor.blur();
        }
        
        me.editor.initialized = true;
        me.fireEvent('editorcreated', me);
    },
    
    getEditor: function()
    {
        return this.editor;
    },
    
    getSession: function()
    {
        return this.editor.getSession();
    },
    
    getTheme: function()
    {
        return this.editor.getTheme();
    },
    
    setTheme: function(name)
    {
        this.editor.setTheme("ace/theme/" + name);
    },
    
    setMode: function(mode)
    {
        this.getSession().setMode("ace/mode/" + mode);
    },
    
    getValue: function()
    {
        return this.editor.getSession().getValue();
    },
    
    setValue: function(value)
    {
        this.editor.getSession().setValue(value);
    },
    
    setFontSize: function(value)
    {
        this.editor.setFontSize(value);
    },
    
    undo: function()
    {
        this.editor.undo();
    },
    
    redo: function()
    {
        this.editor.redo();
    }
});
