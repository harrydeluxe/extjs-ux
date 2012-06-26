Ext.define("UX.tinymce.WindowManager", {
    extend: tinymce.WindowManager,
    
    constructor: function(config)
    {
        tinymce.WindowManager.call(this, config.editor);
    },
    
    alert: function(txt, cb, s)
    {
        Ext.MessageBox.alert("", txt, function()
        {
            if(!Ext.isEmpty(cb))
            {
                cb.call(this);
            }
        }, s);
    },
    
    confirm: function(txt, cb, s)
    {
        Ext.MessageBox.confirm("", txt, function(btn)
        {
            if(!Ext.isEmpty(cb))
            {
                cb.call(this, btn == "yes");
            }
        }, s);
    },
    
    open: function(s, p)
    {
        s = s || {};
        p = p || {};
        if(!s.type)
        {
            this.bookmark = this.editor.selection.getBookmark('simple');
        }
        s.width = parseInt(s.width || 320);
        s.height = parseInt(s.height || 240) + (tinymce.isIE ? 8 : 0);
        s.min_width = parseInt(s.min_width || 150);
        s.min_height = parseInt(s.min_height || 100);
        s.max_width = parseInt(s.max_width || 2000);
        s.max_height = parseInt(s.max_height || 2000);
        s.movable = true;
        s.resizable = true;
        p.mce_width = s.width;
        p.mce_height = s.height;
        p.mce_inline = true;
        this.features = s;
        this.params = p;
        
        var win = Ext.create("Ext.window.Window", {
            title: s.name,
            width: s.width,
            height: s.height,
            minWidth: s.min_width,
            minHeight: s.min_height,
            resizable: true,
            maximizable: s.maximizable,
            minimizable: s.minimizable,
            modal: true,
            stateful: false,
            constrain: true,
            //border: false,
            layout: "fit",
            items: [Ext.create("Ext.Component", {
                autoEl: {
                    tag: 'iframe',
                    border: '0',
                    frameborder: '0',
                    src: s.url || s.file
                },
                style: 'border-width: 0px;'
            })]
        });
        p.mce_window_id = win.getId();
        
        win.show(null, function()
        {
            if(this.editor.id == 'mce_fullscreen')
                win.zIndexManager.setBase(200000);
            
            if(s.left && s.top)
                win.setPagePosition(s.left, s.top);
            var pos = win.getPosition();
            s.left = pos[0];
            s.top = pos[1];
            this.onOpen.dispatch(this, s, p);
        }, this);
        
        win.toFront(true);
        return win;
    },
    
    close: function(win)
    {
        // Probably not inline
        if(!win.tinyMCEPopup || !win.tinyMCEPopup.id)
        {
            tinymce.WindowManager.prototype.close.call(this, win);
            return;
        }
        
        var w = Ext.getCmp(win.tinyMCEPopup.id);
        
        if(w)
        {
            this.onClose.dispatch(this);
            w.close();
        }
    },
    
    setTitle: function(win, ti)
    {
        if(!win.tinyMCEPopup || !win.tinyMCEPopup.id)
        {
            tinymce.WindowManager.prototype.setTitle.call(this, win, ti);
            return;
        }
        
        var w = Ext.getCmp(win.tinyMCEPopup.id);
        
        if(w)
            w.setTitle(ti);
    },
    
    resizeBy: function(dw, dh, id)
    {
        var w = Ext.getCmp(id);
        
        if(w)
        {
            var size = w.getSize();
            w.setSize(size.width + dw, size.height + dh);
        }
    },
    
    focus: function(id)
    {
        var w = Ext.getCmp(id);

        //if(w)
            //w.setActive(true);
    }
});


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
        
    config:
    {
        height: 170
    },

    statics: {
        tinyMCEInitialized: false,
        globalSettings: {
            accessibility_focus: false,
            language: "en",
            mode: "exact",
            skin: "o2k7",
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
            width: '100%',
            height: '100%'
        },
        
        setGlobalSettings: function(settings)
        {
            Ext.apply(this.globalSettings, settings);
        }
    },
    
    constructor: function(config)
    {
        var me = this;
        
        config.height = (config.height && config.height >= me.config.height) ? config.height : me.config.height;
        
        Ext.applyIf(config.tinymceConfig, me.statics().globalSettings);
        
        me.addEvents({
            "editorcreated": true
        });
        
        me.callParent([config]);
    },
    
    initEditor: function()
    {
        var me = this;
        
     // Init values we do not want changed
        me.tinymceConfig.elements = me.getInputId();
        me.tinymceConfig.mode = 'exact';
        
        me.tinymceConfig.setup = function(editor)
        {
            editor.onKeyPress.add(Ext.Function.createBuffered(me.validate, 250, me));

            editor.onPostRender.add(function(editor)
            {
                me.editor = editor;
                window.b = me.editor;
                //me.on('resize', me.onResize, me);
                //tinymce.add(me.editor);

                editor.windowManager = Ext.create("UX.tinymce.WindowManager", {
                    editor: me.editor
                });
                
                me.tableEl = Ext.get(me.editor.id + "_tbl");
                me.iframeEl = Ext.get(me.editor.id + "_ifr");
                
                me.fireEvent('editorcreated', me.editor, me);
            });
        };
        
        tinymce.init(me.tinymceConfig);
    },
    
    afterRender: function()
    {
        var me = this;
        
        me.callParent(arguments);
        
        me.tinymceConfig.height = me.height - 25;
        
        me.initEditor();
    },
    

    isDirty: function()
    {
        var me = this;
        if(me.disabled || !me.rendered)
        {
            return false;
        }
        return me.editor && me.editor.initialized && me.editor.isDirty();
    },

    getValue: function()
    {
        if(this.editor)
            return this.editor.getContent();
        
        return this.value;
    },
    
    setValue: function(value)
    {
        var me = this;
        me.value = value;
        if(me.rendered)
            me.withEd(function()
            {
                me.editor.undoManager.clear();
                me.editor.setContent(value === null || value === undefined ? '' : value);
                me.editor.startContent = me.editor.getContent({
                    format: 'raw'
                });
                me.validate();
                // me.editor.resizeToContent();
            });
    },
    
    getSubmitData: function()
    {
        var ret = {};
        ret[this.getName()] = this.getValue();
        return ret;
    },
    
    insertValueAtCursor: function(value)
    {
        var me = this;
        
        if(me.editor && me.editor.initialized)
        {
            me.editor.execCommand('mceInsertContent', false, value);
        }
    },
    
    onDestroy: function()
    {
        var me = this;
        
        if(me.editor)
        {
            me.editor.destroy();
        }
        me.callParent(arguments);
    },
    
    onResize: function(component, adjWidth, adjHeight)
    {
        var width,
            bodyWidth = component.bodyEl.getWidth();
        
        if(component.iframeEl)
        {
            width = bodyWidth - component.iframeEl.getBorderWidth('lr') - 2;
            component.iframeEl.setWidth(width);
        }
        
        if(component.tableEl)
        {
            width = bodyWidth - component.tableEl.getBorderWidth('lr') - 2;
            component.tableEl.setWidth(width);
        }
    },
    
    getEditor: function()
    {
        return this.editor;
    },
    
    getRawValue: function()
    {
        var me = this;
        
        return (!me.editor || !me.editor.initialized) ? Ext.valueFrom(me.value, '') : me.editor.getContent();
    },
    
    disable: function()
    {
        this.withEd(function()
        {
            var bodyEl = this.editor.getBody();
            bodyEl = Ext.get(bodyEl);
            if(bodyEl.hasCls('mceContentBody'))
            {
                bodyEl.removeCls('mceContentBody');
                bodyEl.addCls('mceNonEditable');
            }
        });
    },
    
    enable: function()
    {
        this.withEd(function()
        {
            var bodyEl = this.editor.getBody();
            bodyEl = Ext.get(bodyEl);
            if(bodyEl.hasCls('mceNonEditable'))
            {
                bodyEl.removeCls('mceNonEditable');
                bodyEl.addCls('mceContentBody');
            }
        });
    },
    
    withEd: function(func)
    {
        var me = this;
        
        // If editor is not created yet, reschedule this call.
        if(!me.editor)
            me.on("editorcreated", function()
            {
                me.withEd(func);
            }, me);
        // Else if editor is created and initialized
        else if(me.editor.initialized)
            func.call(me);
        // Else if editor is created but not initialized yet.
        else
            me.editor.onInit.add(Ext.Function.bind(function()
            {
                Ext.Function.defer(func, 10, me);
            }, me));
    },
                        
    validateValue: function(value)
    {
        var me = this;
        
        if(Ext.isFunction(me.validator))
        {
            var msg = me.validator(value);
            if(msg !== true)
            {
                me.markInvalid(msg);
                return false;
            }
        }
        
        if(value.length < 1 || value === me.emptyText)
        { // if it's blank
            if(me.allowBlank)
            {
                me.clearInvalid();
                return true;
            }
            else
            {
                me.markInvalid(me.blankText);
                return false;
            }
        }
        
        if(value.length < me.minLength)
        {
            me.markInvalid(Ext.String.format(me.minLengthText, me.minLength));
            return false;
        }
        else
            me.clearInvalid();
        
        if(value.length > me.maxLength)
        {
            me.markInvalid(Ext.String.format(me.maxLengthText, me.maxLength));
            return false;
        }
        else
            me.clearInvalid();
        
        if(me.vtype)
        {
            var vt = Ext.form.field.VTypes;
            if(!vt[me.vtype](value, me))
            {
                me.markInvalid(me.vtypeText || vt[me.vtype + 'Text']);
                return false;
            }
        }
        
        if(me.regex && !me.regex.test(value))
        {
            me.markInvalid(me.regexText);
            return false;
        }
        return true;
    }
});