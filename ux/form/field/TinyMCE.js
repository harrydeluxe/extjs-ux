/**
 * @class Ext.ux.form.field.TinyMCE
 * @extends Ext.Component
 * 
 * @author Harald Hanek
 * 
 * @author Fady Khalife (http://code.google.com/p/ext-js-4-tinymce-ux/source/browse/trunk/ux/form/TinyMCE.js)
 * @licence  www.gnu.org/licenses/lgpl.html
 */

Ext.define('Ext.ux.form.field.TinyMCE', {
	extend: 'Ext.Component',
	mixins: {
		labelable: 'Ext.form.Labelable',
		field: 'Ext.form.field.Field'
	},
	alternateClassName: [ 'Ext.form.TinyMCE' ],
	alias: 'widget.tinymcefield',
	
	fieldSubTpl: [ '<textarea id="{id}" ',
	               '<tpl if="name">name="{name}" </tpl>',
	               'tabIndex="-1" ',
	               'class="{fieldCls}" autocomplete="off" />',
	               '</textarea>',
	               {
					compiled: true,
					disableFormats: true
	               }
		],
		
	hideMode: 'offsets',
	
	fieldCls: Ext.baseCSSPrefix + 'tinymce-field',

	constructor: function(config)
	{
		var me = this;

		// The default configuration to use is none is specified
		var defaultConfig = {
			mode: 'none',
			theme: 'advanced',
			//skin: 'o2k7',
			plugins: 'autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template',
			theme_advanced_buttons1: 'newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect',
			theme_advanced_buttons2: 'cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor',
			theme_advanced_buttons3: 'tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen',
			theme_advanced_buttons4: 'insertlayer,moveforward,movebackward,absolute,|,styleprops,spellchecker,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,blockquote,pagebreak',
			theme_advanced_toolbar_location: 'top',
			theme_advanced_toolbar_align: 'left',
			theme_advanced_statusbar_location: 'bottom',
			theme_advanced_resize_horizontal : false,
            theme_advanced_resizing : false,
            width : '100%',
            height: '100%'			
		};

		// Apply any user specified tinymceInit configurations
		config.tinymceConfig = config.tinymceConfig || {};
		Ext.applyIf(config.tinymceConfig, defaultConfig);

		// Init values we do not want changed
		config.tinymceConfig.mode = 'none';

		me.callParent(arguments);
	},

	initComponent: function()
	{
		var me = this;

		me.callParent(arguments);

		// Init mixins
		me.initLabelable();
		me.initField();

		// Set name to id id one is not set
		if(!me.name)
		{
			me.name = me.getInputId();
		}
	},

	getInputId: function()
	{
		var me = this;
		return me.name || (me.name = Ext.id());
	},

	getSubTplData: function()
	{
		var me = this,
			inputId = me.getInputId();

		return {
			id: inputId,
			fieldCls: me.fieldCls,
			name: me.name || inputId
		};
	},

	getSubTplMarkup: function()
	{
		var me = this;
		return me.getTpl('fieldSubTpl').apply(me.getSubTplData());
	},

	initRenderTpl: function()
	{
		var me = this;
		if(!me.hasOwnProperty('renderTpl'))
		{
			me.renderTpl = me.getTpl('labelableRenderTpl');
		}
		return me.callParent();
	},

	initRenderData: function()
	{
		var me = this;
		return Ext.applyIf(me.callParent(), me.getLabelableRenderData());
	},

	onRender: function()
	{
		var me = this,
			inputId = me.getInputId(),
			renderSelectors = me.renderSelectors;

		//Ext.applyIf(renderSelectors, me.getLabelableSelectors());
		//Ext.applyIf(renderSelectors, me.getLabelableRenderData());

		Ext.applyIf(renderSelectors, {
			textareaEl: '.' + me.fieldCls
		});

		me.callParent(arguments);

		// Default value for textarea
		me.setRawValue(me.rawValue);

		// Render and add editor
		// http://tinymce.moxiecode.com/wiki.php/API3:class.tinymce.Editor
		me.ed = new tinymce.Editor(inputId, me.tinymceConfig);
		me.ed.render();

		me.on('resize', me.onResize, me);

	},

	getSubmitValue: function()
	{
		var me = this;
		return me.processRawValue(me.getRawValue());
	},

	getRawValue: function()
	{
		var me = this, value;

		// Sync textarea with editor content if initialized
		if(me.ed && me.ed.initialized)
		{
			me.ed.save();
		}

		value = me.textareaEl ? me.textareaEl.getValue() : Ext.value(me.rawValue, '');
		me.rawValue = value;
		return value;
	},

	setRawValue: function(value)
	{
		var me = this;
			value = Ext.value(value, '');
			
		me.rawValue = value;

		// Some Field subclasses may not render an textareaEl
		if(me.textareaEl)
		{
			me.textareaEl.dom.value = value;
		}

		// Sync editor with textarea if initialized
		if(me.ed && me.ed.initialized)
		{
			me.ed.setContent(value);
			me.ed.undoManager.clear();
		}
		return value;
	},

	valueToRaw: function(value)
	{
		return '' + Ext.value(value, '');
	},

	rawToValue: function(rawValue)
	{
		return rawValue;
	},

	processRawValue: function(value)
	{
		return value;
	},

	reset: function()
	{
		var me = this;
		
		me.setValue(me.originalValue);
		me.clearInvalid();
		
		// delete here so we reset back to the original state
		delete me.wasValid;
	},

	getValue: function()
	{
		var me = this,
			value = me.rawToValue(me.processRawValue(me.getRawValue()));
		
		me.value = value;
		return value;
	},

	setValue: function(value)
	{
		var me = this;
		me.setRawValue(me.valueToRaw(value));
		return me.mixins.field.setValue.call(me, value);
	},
	
	insertValueAtCursor: function(value)
	{
		var me = this;
		
		if(me.ed && me.ed.initialized)
		{
			me.ed.execCommand('mceInsertContent', false, value);
		}
	},
		 
	toggleEditor: function()
	{
		tinymce.execCommand('mceToggleEditor', false, this.name);
	}
});