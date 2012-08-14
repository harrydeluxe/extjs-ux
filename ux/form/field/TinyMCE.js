/**
 * @class Ext.ux.form.field.TinyMCE
 * @extends Ext.form.field.TextArea
 *
 * The Initial Developer of the Original Code is daanlib with some methods of
 * Fady Khalife (http://code.google.com/p/ext-js-4-tinymce-ux/source/browse/trunk/ux/form/TinyMCE.js)
 * @see http://www.sencha.com/forum/showthread.php?138436-TinyMCE-form-field
 *
 * @contributor Harald Hanek
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */
Ext.define("Ext.ux.form.field.TinyMCE", {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.tinymcefield',

    requires: ['Ext.ux.form.field.TinyMCEWindowManager'],

    config: {
        height: 170
    },

    hideBorder: false,

    inProgress: false,

    lastWidth: 0,

    lastHeight: 0,

    statics: {
        tinyMCEInitialized: false,
        globalSettings: {
            accessibility_focus: false,
            language: "en",
            mode: "exact",
            skin: "extjs",
            theme: "advanced",
            plugins: 'autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template',
            theme_advanced_buttons1: 'newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect',
            theme_advanced_buttons2: 'cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor',
            theme_advanced_buttons3: 'tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen',
            theme_advanced_buttons4: 'insertlayer,moveforward,movebackward,absolute,|,styleprops,spellchecker,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,blockquote,pagebreak',
            // extended_valid_elements:
            // "a[name|href|target|title|onclick],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],hr[class|width|size|noshade],font[face|size|color|style],span[class|align|style]",
            // template_external_list_url:
            // "example_template_list.js"
            // content_css : "/lib/css/editor.css",
            theme_advanced_toolbar_location: 'top',
            theme_advanced_toolbar_align: 'left',
            theme_advanced_statusbar_location: 'bottom',
            theme_advanced_resize_horizontal: false,
            theme_advanced_resizing: false,
            width: '100%'
        },

        setGlobalSettings: function(settings) {
            Ext.apply(this.globalSettings, settings);
        }
    },

    constructor: function(config) {
        var me = this;

        config.height = (config.height && config.height >= me.config.height) ? config.height : me.config.height;

        Ext.applyIf(config.tinymceConfig, me.statics().globalSettings);

        me.addEvents({
            "editorcreated": true
        });

        me.callParent([config]);
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.on('resize', function(elm, width, height) {

            if (!width || !height)
                return;

            me.lastWidth = width;
            me.lastHeight = (!me.editor) ? me.inputEl.getHeight() : height;
            //me.lastHeight = height;

            if (!me.editor)
                me.initEditor();
            else
                me.setEditorSize(me.lastWidth, me.lastHeight);

        }, me);
    },

    initEditor: function() {
        var me = this;

        if (me.inProgress)
            return;

        me.inProgress = true;

        // Init values we do not want changed
        me.tinymceConfig.elements = me.getInputId();
        me.tinymceConfig.mode = 'exact';

        me.tinymceConfig.height = me.lastHeight - 5;
        //me.tinymceConfig.height = me.inputEl.getHeight() - 5;

        me.tinymceConfig.setup = function(editor) {
            editor.onInit.add(function(editor) {
                me.inProgress = false;
            });

            editor.onKeyPress.add(Ext.Function.createBuffered(me.validate, 250, me));

            editor.onPostRender.add(function(editor) {
                me.editor = editor;
                window.b = me.editor;

                editor.windowManager = new Ext.ux.form.field.TinyMCEWindowManager({
                    editor: me.editor
                });

                me.tableEl = Ext.get(me.editor.id + "_tbl");
                me.iframeEl = Ext.get(me.editor.id + "_ifr");

                me.edToolbar = me.tableEl.down(".mceToolbar");
                me.edStatusbar = me.tableEl.down(".mceStatusbar");

                if (me.hideBorder)
                    me.tableEl.setStyle('border', '0px');

                Ext.Function.defer(function() {

                    if (me.tableEl.getHeight() != me.lastHeight - 5)
                        me.setEditorSize(me.lastWidth, me.lastHeight);

                    //me.setEditorSize(me.lastWidth, (me.tableEl.getHeight() != me.lastHeight - 2) ? me.tableEl.getHeight() : me.lastHeight);
                }, 10, me);

                me.fireEvent('editorcreated', me.editor, me);
            });
        };

        tinymce.init(me.tinymceConfig);
    },

    setEditorSize: function(width, height) {
        var me = this,
            frameHeight = height - 2;

        if (!me.editor || !me.rendered)
            return;

        if (me.edToolbar)
            frameHeight -= me.edToolbar.getHeight();

        if (me.edStatusbar)
            frameHeight -= me.edStatusbar.getHeight();

        //console.log(me.edToolbar);
        me.iframeEl.setHeight(frameHeight);

        //me.tableEl.setWidth(width);
        me.tableEl.setHeight(height);
        me.inputEl.setHeight(height);
    },

    isDirty: function() {
        var me = this;

        if (me.disabled || !me.rendered) {
            return false;
        }
        return me.editor && me.editor.initialized && me.editor.isDirty();
    },

    getValue: function() {
        if (this.editor)
            return this.editor.getContent();

        return this.value;
    },

    setValue: function(value) {
        var me = this;
        me.value = value;
        if (me.rendered)
            me.withEd(function() {
                me.editor.undoManager.clear();
                me.editor.setContent(value === null || value === undefined ? '' : value);
                me.editor.startContent = me.editor.getContent({
                    format: 'raw'
                });
                me.validate();
            });
    },

    getSubmitData: function() {
        var ret = {};
        ret[this.getName()] = this.getValue();
        return ret;
    },

    insertValueAtCursor: function(value) {
        var me = this;

        if (me.editor && me.editor.initialized) {
            me.editor.execCommand('mceInsertContent', false, value);
        }
    },

    onDestroy: function() {
        var me = this;

        if (me.editor) {
            me.editor.destroy();
        }
        me.callParent(arguments);
    },

    getEditor: function() {
        return this.editor;
    },

    getRawValue: function() {
        var me = this;

        return (!me.editor || !me.editor.initialized) ? Ext.valueFrom(me.value, '') : me.editor.getContent();
    },

    disable: function() {
        var me = this;

        me.withEd(function() {
            var editor = me.editor;

            tinymce.each(editor.controlManager.controls, function(c) {
                c.setDisabled(true);
            });

            tinymce.dom.Event.clear(editor.getBody());
            tinymce.dom.Event.clear(editor.getWin());
            tinymce.dom.Event.clear(editor.getDoc());
            tinymce.dom.Event.clear(editor.formElement);

            editor.onExecCommand.listeners = [];

            me.iframeEl.dom.contentDocument.body.contentEditable = false;
            me.iframeEl.addCls('x-form-field x-form-text');
        });

        return me.callParent(arguments);
    },

    enable: function() {
        var me = this;

        me.withEd(function() {
            var editor = me.editor;

            editor.bindNativeEvents();

            tinymce.each(editor.controlManager.controls, function(c) {
                c.setDisabled(false);
            });

            editor.nodeChanged();

            me.iframeEl.dom.contentDocument.body.contentEditable = true;
            me.iframeEl.removeCls('x-form-field x-form-text');
        });

        return me.callParent(arguments);
    },

    withEd: function(func) {
        var me = this;

        // If editor is not created yet, reschedule this call.
        if (!me.editor)
            me.on("editorcreated", function() {
                me.withEd(func);
            }, me);
        // Else if editor is created and initialized
        else if (me.editor.initialized)
            func.call(me);
        // Else if editor is created but not initialized yet.
        else
            me.editor.onInit.add(Ext.Function.bind(function() {
                Ext.Function.defer(func, 10, me);
            }, me));
    },

    validateValue: function(value) {
        var me = this;

        if (Ext.isFunction(me.validator)) {
            var msg = me.validator(value);
            if (msg !== true) {
                me.markInvalid(msg);
                return false;
            }
        }

        if (value.length < 1 || value === me.emptyText) {
            // if it's blank
            if (me.allowBlank) {
                me.clearInvalid();
                return true;
            }
            else {
                me.markInvalid(me.blankText);
                return false;
            }
        }

        if (value.length < me.minLength) {
            me.markInvalid(Ext.String.format(me.minLengthText, me.minLength));
            return false;
        }
        else
            me.clearInvalid();

        if (value.length > me.maxLength) {
            me.markInvalid(Ext.String.format(me.maxLengthText, me.maxLength));
            return false;
        }
        else
            me.clearInvalid();

        if (me.vtype) {
            var vt = Ext.form.field.VTypes;
            if (!vt[me.vtype](value, me)) {
                me.markInvalid(me.vtypeText || vt[me.vtype + 'Text']);
                return false;
            }
        }

        if (me.regex && !me.regex.test(value)) {
            me.markInvalid(me.regexText);
            return false;
        }
        return true;
    }
});