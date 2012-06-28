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
Ext.define('Ext.ux.toggleslide.ToggleSlide', {
    extend: 'Ext.Component',
    alias: 'widget.toggleslide',
    
    requires: ['Ext.ux.toggleslide.Thumb', 'Ext.fx.Anim'],

    /**
     * @cfg {Number} duration The duration for the slide animation (defaults to
     *      120)
     */
    duration: 120,
    
    /**
     * @cfg {String} onText The text to display when the toggle is in the 'On'
     *      position (defaults to 'ON')
     */
    onText: 'ON',
    
    /**
     * @cfg {String} offText The text to display when the toggle is in the 'Off'
     *      position (defaults to 'OFF')
     */
    offText: 'OFF',
    
    /**
     * @cfg {Boolean} resizeHandle Specifies whether the drag handle should be
     *      resized to cover the on or off side (defaults to true)
     */
    resizeHandle: true,
    
    /**
     * @cfg {Boolean} resizeContainer Specifies whether the contain element
     *      should be resized (defaults to true)
     */
    resizeContainer: true,
    
    /**
     * @cfg {String} onLabelCls The CSS class for the on label (defaults to
     *      'x-toggle-slide-label-on')
     */
    onLabelCls: 'x-toggle-slide-label-on',
    
    /**
     * @cfg {String} ofLabelCls The CSS class for the off label (defaults to
     *      'x-toggle-slide-label-off')
     */
    offLabelCls: 'x-toggle-slide-label-off',
    
    /**
     * @cfg {String} handleCls The CSS class for the drag handle (defaults to
     *      'x-toggle-slide-handle')
     */
    handleCls: 'x-toggle-slide-thumb',
    
    disabledCls: 'x-toggle-slide-disabled',
    
    /**
     * @cfg {Boolean} state The initial state of the Toggle (defaults to false)
     */
    state: false,
    
    /**
     * @cfg {Boolean} booleanMode Determines whether the internal value is
     *      represented as a Boolean. If not in booleanMode the internal value
     *      will be represented as the on or off label text. The value passed to
     *      event listeners will also be determined on this setting (defaults to
     *      true)
     */
    booleanMode: true,
    
    // private
    dragging: false,
    diff: 0,    
    diff2: 0,
    diff3: 0,
    frame: false,

    renderTpl: ['<div class="holder">',
                    '<label class="{onLabelCls}">',
                        '<span>{onText}</span>',
                    '</label>',
                    '<label class="{offLabelCls}">',
                        '<span>{offText}</span>',
                    '</label>',
                '</div>'],
                        
    autoEl: {
            tag: 'div',
            cls: 'x-toggle-slide-container'
    },
   
    
    initComponent: function()
    {
        var me = this;
        me.callParent(arguments);
        
        me.addEvents(
                /**
                 * @event beforechange Fires before this toggle is changed.
                 * @param {Ext.form.Checkbox} this This toggle
                 * @param {Boolean|String} state The next toggle state value if boolean
                 *            mode else the label for the next state
                 */
                'beforechange',
                
                /**
                 * @event change Fires when the toggle is on or off.
                 * @param {Ext.form.Checkbox} this This toggle
                 * @param {Boolean|String} state the new toggle state value, boolean if
                 *            in boolean mode else the label
                 */
                'change');
    },
    
    
    beforeRender: function()
    {
        var me = this;

        me.callParent();

        Ext.applyIf(me.renderData, {
            offLabelCls: me.offLabelCls,
            offText: me.offText,
            onLabelCls: me.onLabelCls,
            onText: me.onText,
            handleCls: me.handleCls
        });
        
        
    },
    
    /**
     * Set up the hidden field
     * 
     * @param {Object} ct The container to render to.
     * @param {Object} position The position in the container to render to.
     * @private
     */
    onRender: function()
    {
        var me = this;
        
        if(!me.resizeContainer)
            me.diff = 0;
        
        if(!me.resizeHandle)
        {
            me.diff2 = 3;
            me.diff3 = 5;
        }
        
        me.callParent(arguments);
        
        if (me.cls) {
            me.el.addCls(me.cls);
        }
        
        me.thumb = new Ext.ux.toggleslide.Thumb({
            ownerCt: me,
            slider: me,
            disabled    : !!me.disabled
        });

        var holder = me.el.first();
        
        me.onLabel = holder.first();
        me.onSpan = me.onLabel.first();
        
        me.offLabel = me.onLabel.next();
        me.offSpan = me.offLabel.first();

        if (me.rendered) {
            me.thumb.render();
        }
        me.handle = me.thumb.el;
        
        if(me.resizeHandle)
            me.thumb.bringToFront();
        else
            me.thumb.sendToBack();
        
        me.resize();
        me.disableTextSelection();
        
        if(!me.disabled)
        {
            me.registerToggleListeners();
        }
        else
        {
            Ext.ux.toggleslide.ToggleSlide.superclass.disable.call(me);
        }
    },
    
    /**
     * Resize assets.
     * 
     * @private
     */
    resize: function()
    {
        var me = this,
            container = me.el,
            offlabel = me.offLabel,
            onlabel = me.onLabel,
            handle = me.handle;
        
        if(me.resizeHandle)
        {
            var min = (onlabel.getWidth() < offlabel.getWidth()) ? onlabel.getWidth() : offlabel.getWidth();
            handle.setWidth(min);
        }

        if(me.resizeContainer)
        {
            var max = (onlabel.getWidth() > offlabel.getWidth()) ? onlabel.getWidth() : offlabel.getWidth();
            var expandPx = Math.ceil(container.getHeight() / 3);
            container.setWidth(max + handle.getWidth() + expandPx);
        }
        
        var b = handle.getWidth() / 2;
        onlabel.setWidth(container.getWidth() - b + me.diff2);
        offlabel.setWidth(container.getWidth() - b + me.diff2);
        var rightside = me.rightside = container.getWidth() - handle.getWidth() - me.diff;
        
        if(me.state)
        {
            handle.setLeft(rightside);
        }
        else
        {
            handle.setLeft(0);
        }
        me.onDrag();
    },
    
    /**
     * Turn off text selection.
     * 
     * @private
     */
    disableTextSelection: function()
    {
        var els = [this.el,
                this.onLabel,
                this.offLabel,
                this.handle];
        
        Ext.each(els, function(el)
        {
            el.on('mousedown', function(evt)
            {
                evt.preventDefault();
                return false;
            });
            
            if(Ext.isIE)
            {
                el.on('startselect', function(evt)
                {
                    evt.stopEvent();
                    return false;
                });
            }
        });
    },
    
    /**
     * Animates the handle to the next state.
     * 
     * @private
     */
    moveHandle: function(on, callback)
    {
        var me = this,
            runner = new Ext.util.TaskRunner(),
            to = on ? me.rightside : 0;
        
        Ext.create('Ext.fx.Anim', {
            target: me.handle,
            dynamic: true,
            easing: 'easeOut',
            duration: me.duration,
            to : {
                left: to
            },
            listeners: {
                beforeanimate: {
                    fn: function(ani)
                    {
                        me.task = runner.newTask({
                            run: function () {
                                me.onDrag();
                            },
                            interval: 10
                        });
                        me.task.start();
                    },
                    scope: this
                },
                afteranimate: {
                    fn: function(ani)
                    {
                        me.onDrag();
                        me.task.destroy();
                    },
                    scope: this
                } 
            },
            callback: callback
        });
    },
    
    /**
     * Constrain the drag handle to the containing el.
     * 
     * @private
     */
    onDragStart: function(e)
    {
        var me = this;

        me.dragging = true;
        
        me.dd.constrainTo(me.el, {
            right: me.diff
        });
    },
    
    /**
     * Determine if the handle has been dropped > half way into the other
     * position. Toggle if so or move the handle back to the original position
     * if not.
     * 
     * @private
     */
    onDragEnd: function(e)
    {
        var me = this,
            hc = (me.handle.getLeft(true) + me.handle.getRight(true)) / 2,
            cc = (me.el.getLeft(true) + me.el.getRight(true)) / 2,
            next = hc > cc;
        
        (me.state != next) ? me.toggle() : me.moveHandle(next);
        me.dragging = false;
    },
    
    /**
     * Adjust the label and span positions with the handles.
     * 
     * @private
     */
    onDrag: function(e)
    {
        var me = this,
            p = me.handle.getLeft(true) - me.rightside;

        p = (me.handle.getLeft(true) == me.rightside) ? 0 : p - me.diff3;

        me.onLabel.setStyle({
            marginLeft: p + 'px'
        });       
    },
    
    /**
     * If not dragging toggle.
     * 
     * @private
     */
    onMouseUp: function()
    {
        if(!this.dragging)
        {
            this.toggle();
        }
    },
    
    /**
     * Transition to the next state.
     */
    toggle: function()
    {
        var me = this,
            next = !this.state;
        
        if(!me.booleanMode)
        {
            next = me.state ? me.onText : me.offText;
        }
        
        if(me.fireEvent('beforechange', me, next) !== false)
        {
            me.state = !me.state;
            
            me.moveHandle(me.state, Ext.bind(me.fireEvent, me, ['change', me, me.getValue()]));
        }
        else
        {
            me.moveHandle(me.state);
        }
    },
    
    /**
     * If currently disabled, enable this component and fire the 'enable' event.
     * 
     * @return {Ext.Component} this
     */
    enable: function()
    {
        if(this.disabled)
        {
            Ext.ux.toggleslide.ToggleSlide.superclass.enable.call(this);
            this.registerToggleListeners();
            //this.thumb.enable();
        }
        return this;
    },
    
    /**
     * If currently enabled, disable this component and fire the 'disable'
     * event.
     * 
     * @return {Ext.Component} this
     */
    disable: function()
    {
        if(!this.disabled)
        {
            Ext.ux.toggleslide.ToggleSlide.superclass.disable.call(this);
            this.unregisterToggleListeners();
            //this.thumb.disable();
        }
        return this;
    },
    
    /**
     * Registers the mouseup listener and the DD instance for the handle.
     * 
     * @private
     */
    registerToggleListeners: function()
    {
        var me = this;
        
        me.dd = new Ext.dd.DD(me.handle);
        me.dd.startDrag = Ext.bind(me.onDragStart, me);
        me.dd.onDrag = Ext.bind(me.onDrag, me);
        me.dd.endDrag = Ext.bind(me.onDragEnd, me);
        
        me.el.on('mouseup', me.onMouseUp, me);
    },
    
    /**
     * Unregisters the mouseup listener and the DD instance for the handle.
     * 
     * @private
     */
    unregisterToggleListeners: function()
    {
        Ext.destroy(this.dd);
        this.el.un('mouseup', this.onMouseUp, this);
    },
    
    /**
     * Returns the current internal value, either text or boolean depending on
     * configured booleanMode.
     */
    getValue: function()
    {
        var me = this;
        return me.booleanMode ? me.state : (me.state ? me.onText : me.offText);
    }
});
