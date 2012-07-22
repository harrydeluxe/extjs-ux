Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'http://extjs.cachefly.net/extjs-4.1.1-gpl/examples/ux/statusbar',
        'Ext.ux.aceeditor': '../../ux/aceeditor'
    }
});

Ext.require(['Ext.ux.aceeditor.Panel', 'Ext.ux.StatusBar']);

Ext.onReady(function()
{
    Ext.define('Editor.Panel.WithToolbar', {
        extend: 'Ext.ux.aceeditor.Panel',
        alias: 'widget.AceEditor.WithToolbar',
        initComponent: function()
        {
            var me = this, toolbar = [{
                text: 'Save',
                handler: function()
                {
                    alert(me.editor.getSession().getValue());
                },
                scope: me
            },
            {
                text: 'Undo',
                handler: me.undo,
                scope: me
            },
            {
                text: 'Redo',
                handler: me.redo,
                scope: me
            }/*,
            {
                text: 'Fullscreen',
                enableToggle: true,
                toggleHandler: function(button, state)
                {
                    var root = document.documentElement;
                    if(state)
                    {                  
                        if (root.webkitRequestFullScreen) {
                            root.webkitRequestFullScreen(
                                window.Element.ALLOW_KEYBOARD_INPUT
                            );
                        } else if (root.mozRequestFullScreen) {
                            root.mozRequestFullScreen();
                        }
                    }
                    else
                    {
                        if (document.webkitCancelFullScreen)
                            document.webkitCancelFullScreen();
                        else if (document.mozCancelFullScreen)
                            document.mozCancelFullScreen();
                        //(document.webkitCancelFullScreen || document.mozCancelFullScreen);  
                    }  
                },
                scope: me
            }*/,
            '->',
            {
                text: 'Settings',
                // iconCls: 'user',
                menu: {
                    xtype: 'menu',
                    plain: true,
                    items: [{
                        text: 'Show Invisibles',
                        handler: function()
                        {
                            me.showInvisible = (me.showInvisible) ? false : true;
                            me.editor.setShowInvisibles(me.showInvisible);
                        },
                        checked: (me.showInvisible),
                        scope: me
                    },
                    {
                        text: 'Wrap Lines',
                        handler: function()
                        {
                            me.useWrapMode = (me.useWrapMode) ? false : true;
                            me.editor.getSession().setUseWrapMode(me.useWrapMode);
                        },
                        checked: (me.useWrapMode),
                        scope: me
                    },
                    {
                        text: 'Code Folding',
                        handler: function()
                        {
                            me.codeFolding = (me.codeFolding) ? false : true;
                            me.editor.setShowFoldWidgets(me.codeFolding);
                        },
                        checked: (me.codeFolding),
                        scope: me
                    },
                    {
                        text: 'Highlight Active Line',
                        handler: function()
                        {
                            me.highlightActiveLine = (me.highlightActiveLine) ? false : true;
                            me.editor.setHighlightActiveLine(me.highlightActiveLine);
                        },
                        checked: (me.highlightActiveLine),
                        scope: me
                    },
                    {
                        text: 'Show Line Numbers',
                        handler: function()
                        {
                            me.showGutter = (me.showGutter) ? false : true;
                            me.editor.renderer.setShowGutter(me.showGutter);
                        },
                        checked: (me.showGutter),
                        scope: me
                    },
                    {
                        text: 'Highlight Selected Word',
                        handler: function()
                        {
                            me.highlightSelectedWord = (me.highlightSelectedWord) ? false : true;
                            me.editor.setHighlightSelectedWord(me.highlightSelectedWord);
                        },
                        checked: (me.highlightSelectedWord),
                        scope: me
                    },
                    {
                        xtype: 'menuseparator'
                    },
                    Ext.create('Ext.container.Container', {
                        layout: {
                            type: 'hbox'
                        },
                        items: [{
                            xtype: 'menuitem',
                            text: 'Font Size',
                            handler: function()
                            {
                            },
                            flex: 1,
                            checked: (me.highlightSelectedWord),
                            scope: me
                        },
                        {
                            fieldStyle: 'text-align: right',
                            hideLabel: true,
                            xtype: 'numberfield',
                            value: me.fontSize,
                            minValue: 6,
                            maxValue: 72,
                            width: 50,
                            flex: 0,
                            height: 12,
                            plain: true,
                            listeners: {
                                change: function(field, value)
                                {
                                    me.fontSize = value;
                                    me.setFontSize(me.fontSize + "px");
                                }
                            }
                        }]
                    }),
                    Ext.create('Ext.container.Container', {
                        layout: {
                            type: 'hbox'
                        },
                        width: 200,
                        items: [{
                            xtype: 'menuitem',
                            text: 'Show Print Margin',
                            handler: function()
                            {
                            },
                            flex: 1,
                            checked: (me.highlightSelectedWord),
                            scope: me
                        },
                        {
                            fieldStyle: 'text-align: right',
                            hideLabel: true,
                            xtype: 'numberfield',
                            value: me.printMarginColumn,
                            minValue: 1,
                            maxValue: 200,
                            width: 50,
                            flex: 0,
                            height: 12,
                            plain: true,
                            listeners: {
                                change: function(field, value)
                                {
                                    me.printMarginColumn = value;
                                    me.editor.setPrintMarginColumn(me.printMarginColumn);
                                }
                            }
                        }]
                    }),
                    {
                        xtype: 'menuseparator'
                    },
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox'
                        },
                        width: 240,
                        items: [{
                            xtype: 'menuitem',
                            text: 'Theme'
                        },
                        {
                            xtype: 'combo',
                            mode: 'local',
                            flex: 1,
                            value: me.theme,
                            triggerAction: 'all',
                            editable: false,
                            name: 'Theme',
                            displayField: 'name',
                            valueField: 'value',
                            queryMode: 'local',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['name',
                                        'value'],
                                data: [{
                                    value: 'ambiance',
                                    name: 'Ambiance'
                                },
                                {
                                    value: 'chrome',
                                    name: 'Chrome'
                                },
                                {
                                    value: 'clouds',
                                    name: 'Clouds'
                                },
                                {
                                    value: 'clouds_midnight',
                                    name: 'Clouds Midnight'
                                },
                                {
                                    value: 'cobalt',
                                    name: 'Cobalt'
                                },
                                {
                                    value: 'crimson_editor',
                                    name: 'Crimson Editor'
                                },
                                {
                                    value: 'dawn',
                                    name: 'Dawn'
                                },
                                {
                                    value: 'dreamweaver',
                                    name: 'Dreamweaver'
                                },
                                {
                                    value: 'eclipse',
                                    name: 'Eclipse'
                                },
                                {
                                    value: 'idle_fingers',
                                    name: 'idleFingers'
                                },
                                {
                                    value: 'kr_theme',
                                    name: 'krTheme'
                                },
                                {
                                    value: 'merbivore',
                                    name: 'Merbivore'
                                },
                                {
                                    value: 'merbivore_soft',
                                    name: 'Merbivore Soft'
                                },
                                {
                                    value: 'mono_industrial',
                                    name: 'Mono Industrial'
                                },
                                {
                                    value: 'monokai',
                                    name: 'Monokai'
                                },
                                {
                                    value: 'pastel_on_dark',
                                    name: 'Pastel on dark'
                                },
                                {
                                    value: 'solarized_dark',
                                    name: 'Solarized Dark'
                                },
                                {
                                    value: 'solarized_light',
                                    name: 'Solarized Light'
                                },
                                {
                                    value: 'textmate',
                                    name: 'TextMate'
                                },
                                {
                                    value: 'twilight',
                                    name: 'Twilight'
                                },
                                {
                                    value: 'tomorrow',
                                    name: 'Tomorrow'
                                },
                                {
                                    value: 'tomorrow_night',
                                    name: 'Tomorrow Night'
                                },
                                {
                                    value: 'tomorrow_night_blue',
                                    name: 'Tomorrow Night Blue'
                                },
                                {
                                    value: 'tomorrow_night_bright',
                                    name: 'Tomorrow Night Bright'
                                },
                                {
                                    value: 'tomorrow_night_eighties',
                                    name: 'Tomorrow Night 80s'
                                },
                                {
                                    value: 'vibrant_ink',
                                    name: 'Vibrant Ink'
                                }]
                            }),
                            listeners: {
                                change: function(field, value)
                                {
                                    me.theme = value;
                                    me.setTheme(me.theme);
                                }
                            }
                        }]
                    }]
                }
            }];
            
            var wordCount = Ext.create('Ext.toolbar.TextItem', {text: 'Position: 0'}),
                lineCount = Ext.create('Ext.toolbar.TextItem', {text: 'Line: 0'});
            
            
            Ext.apply(me, {
                tbar: toolbar,
                bbar: Ext.create('Ext.ux.StatusBar', {
                    //defaultText: 'Default status',
                    //statusAlign: 'right', // the magic config
                    items: [lineCount, wordCount]
                })
            });
            
            me.on('editorcreated', function()
                    {
                        me.editor.selection.on("changeCursor", function(e)
                                {
                                    var c = me.editor.selection.getCursor(),
                                        l = c.row + 1;
                                    
                                    wordCount.update('Position: ' + c.column);
                                    lineCount.update('Line: ' + l);
                                }, me);
                    });
            
            me.callParent(arguments);
        }
    });
    
    Ext.create('Ext.Window', {
        title: 'ACE Editor Example',
        layout: 'fit',
        maximizable: true,
        border: false,
        width: 700,
        height: 400,
        
        items: [{
            xtype: 'tabpanel',
            id: 'cont-tabpanel',
            items: [{
                xtype: 'AceEditor.WithToolbar',
                title: 'Javascript',
                sourceEl: 'pre_1',
                theme: 'twilight',
                parser: 'javascript',
                showInvisible: true,
                printMargin: true
            },
            {
                xtype: 'AceEditor',
                title: 'PHP',
                sourceCode: '<?php phpinfo(); ?>',
                parser: 'php'
            },
            {
                xtype: 'AceEditor.WithToolbar',
                title: 'HTML',
                fontSize: '14px',
                theme: 'chrome',
                url: 'aceeditor.html',
                parser: 'html',
                printMargin: true
            }]
        }]
    }).show();
});