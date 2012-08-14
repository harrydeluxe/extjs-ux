/**
 * @class Ext.ux.form.field.TinyMCEWindowManager
 * @extends tinymce.WindowManager
 *
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define("Ext.ux.form.field.TinyMCEWindowManager", {
    extend: tinymce.WindowManager,

    constructor: function(config) {
        tinymce.WindowManager.call(this, config.editor);
    },

    alert: function(txt, cb, s) {
        Ext.MessageBox.alert("", txt, function() {
            if (!Ext.isEmpty(cb)) {
                cb.call(this);
            }
        }, s);
    },

    confirm: function(txt, cb, s) {
        Ext.MessageBox.confirm("", txt, function(btn) {
            if (!Ext.isEmpty(cb)) {
                cb.call(this, btn == "yes");
            }
        }, s);
    },

    open: function(s, p) {
        s = s || {};
        p = p || {};
        if (!s.type) {
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

        win.show(null, function() {
            if (this.editor.fullscreen_is_enabled)
                win.zIndexManager.setBase(200000);

            if (s.left && s.top)
                win.setPagePosition(s.left, s.top);
            var pos = win.getPosition();
            s.left = pos[0];
            s.top = pos[1];
            this.onOpen.dispatch(this, s, p);
        }, this);

        win.toFront(true);
        return win;
    },

    close: function(win) {
        // Probably not inline
        if (!win.tinyMCEPopup || !win.tinyMCEPopup.id) {
            tinymce.WindowManager.prototype.close.call(this, win);
            return;
        }

        var w = Ext.getCmp(win.tinyMCEPopup.id);

        if (w) {
            this.onClose.dispatch(this);
            w.close();
        }
    },

    setTitle: function(win, ti) {
        if (!win.tinyMCEPopup || !win.tinyMCEPopup.id) {
            tinymce.WindowManager.prototype.setTitle.call(this, win, ti);
            return;
        }

        var w = Ext.getCmp(win.tinyMCEPopup.id);

        if (w)
            w.setTitle(ti);
    },

    resizeBy: function(dw, dh, id) {
        var w = Ext.getCmp(id);

        if (w) {
            var size = w.getSize();
            w.setSize(size.width + dw, size.height + dh);
        }
    },

    focus: function(id) {
        //var w = Ext.getCmp(id);

        //if(w)
        //w.setActive(true);
    }
});