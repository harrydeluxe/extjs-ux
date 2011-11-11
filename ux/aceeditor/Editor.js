/**
 * Ext.ux.aceeditor.Editor Class
 * 
 * @extends Ext.AbstractComponent
 * @version 1.0
 * 
 * @author Harald Hanek (c) 2011 License: MIT
 *         (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.aceeditor.Editor', {
	// extend: 'Ext.AbstractComponent',

	path: '',
	sourceCode: '',
	fontSize: '12px',
	theme: 'clouds',
	printMargin: false,
	highlightActiveLine: true,
	tabSize: 4,
	useSoftTabs: false,
	showInvisible: false,
	useWrapMode: false,

	initEditor: function()
	{
		var me = this;

		me.editor = ace.edit(me.editorId);
		me.setMode(me.parser);
		me.setTheme(me.theme);
		me.editor.getSession().setUseWrapMode(me.useWrapMode);
		me.editor.setShowInvisibles(me.showInvisible);
		me.setFontSize(me.fontSize);
		me.editor.setShowPrintMargin(me.printMargin);
		me.editor.setHighlightActiveLine(me.highlightActiveLine);
		me.getSession().setTabSize(me.tabSize);
		me.getSession().setUseSoftTabs(me.useSoftTabs);
		me.setValue(me.sourceCode);
		me.editor.getSession().on('change', function()
		{
			//console.log('change', me);
			me.fireEvent('change', me);
		}, me);

		me.editor.focus();
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
		this.editor.getTheme();
	},

	setTheme: function(name)
	{
		// require("theme-" + name + ".js");
		this.editor.setTheme("ace/theme/" + name);
	},

	setMode: function(mode)
	{
		var Mode = require("ace/mode/" + mode).Mode;
		this.getSession().setMode(new Mode());
	},

	getValue: function()
	{
		this.editor.getSession().getValue();
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
