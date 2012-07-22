/**
 * @class Ext.ux.grid.plugin DragSelector
 * @extends Ext.util.Observable
 * 
 * @author Harald Hanek (c) 2011-2012
 * 
 * The Initial Developer of the Original Code is: Claudio Walser aka Foggy cwa[at]uwd.ch
 * @copyright 2007-2008, UWD GmbH, all rights reserved. License details:
 * http://www.gnu.org/licenses/lgpl.html
 */
Ext.define('Ext.ux.grid.plugin.DragSelector', {
    extend: 'Ext.util.Observable',
    requires: ['Ext.dd.DragTracker',
            'Ext.util.Region'],
            
    alias: 'plugin.ux.dragselector',
    dragging: false,
    scrollTopStart: 0,
    scrollTop: 0,
    targetDragSelector: '.dragselect',
    dragSafe: false,
    scrollSpeed: 10,
    
    constructor: function(config)
    {
        var me = this;
        
        me.addEvents(
            /**
             * @event dragselectorstart Fires when DragSelector starts
             * @param {Ext.ux.grid.plugin.DragSelector} this
             */
            'dragselectorstart',
            /**
             * @event dragselectorend Fires when DragSelector ends
             * @param {Ext.ux.grid.plugin.DragSelector} this
             */
            'dragselectorend');
        
        me.callParent([config]);
    },
    
    init: function(cmp)
    {
        var me = this;
        me.grid = cmp;
        me.view = me.grid.getView();
        me.selModel = me.view.getSelectionModel();
        me.mon(me.view, 'render', me.onRender, me);
        me.mon(me.view, 'bodyscroll', me.syncScroll, me);
    },
    
    onRender: function()
    {
        var me = this;
       
        me.tracker = new Ext.dd.DragTracker({
            view: me.view, // new
            dragSelector: me, // new
            el: me.view.el, // new
            onBeforeStart: Ext.Function.bind(me.onBeforeStart, me),
            onStart: Ext.Function.bind(me.onStart, me),
            onDrag: Ext.Function.bind(me.onDrag, me),
            onEnd: Ext.Function.bind(me.onEnd, me)
        });
        
        me.dragRegion = new Ext.util.Region();
        me.scroller = me.view.getEl();
    },
    
    syncScroll: function(e)
    {        
        var top = this.scroller.getScroll().top;
        
        this.scrollTop = top - this.scrollTopStart;
        
        this.fillRegions();

        if(this.dragging)
        {
            this.onDrag(e, true);
        }
    },
    
    fillAllRegions: function()
    {
        var me = this, 
            objectsSelected = me.objectsSelected = [];
        
        me.mainRegion = me.scroller.getRegion();
        me.bodyRegion = me.scroller.getRegion();
        
        me.view.all.each(function(el)
        {
            objectsSelected.push(me.selModel.isSelected(objectsSelected.length));
        }, me);
        
        me.syncScroll();
    },
    
    fillRegions: function()
    {
        var rs = this.rs = [];
        this.view.all.each(function(el)
        {
            rs.push(el.getRegion());
        });
    },
    
    cancelClick: function(e)
    {
        var me = this, target = e.getTarget();
        me.ctrlState = e.ctrlKey;
        me.shiftState = e.shiftKey;
        // grid.stopEditing();
        if(!me.ctrlState && !me.shiftState && target.className === 'x-grid-view')
        {
            me.selModel.clearSelections();
        }
        return true;
    },
    
    onBeforeStart: function(e)
    {
        // return false if is a right mouseclick
        if(e.button === 2)
        {
            return false;
        }

        // return false if any grid editor is active
        if(this.grid.editingPlugin && this.grid.editingPlugin.editing)
        {
            // return false;
        }
        
        // scrollbar fix from digitalbucket.net :)
        if(e.getPageX() > this.view.el.getX() + this.view.el.dom.clientWidth - 20)
        {
            return false;
        }
        
        // call cancelClick
        this.cancelClick(e);
        return !this.dragSafe || e.target == this.view.el.dom || Ext.DomQuery.is(e.target, this.targetDragSelector);
    },
    
    onStart: function(e)
    {
        var me = this;
        
        me.scrollTopStart = me.scroller.getScroll().top;
        me.fillAllRegions();

        me.getProxy().show();
        me.dragging = true;
        me.fireEvent('dragselectorstart', me);
    },
    
    /**
     * @private
     * Creates a Proxy element that will be used to highlight the drag selection region
     * @return {Ext.Element} The Proxy element
     */
    getProxy: function()
    {
        if(!this.proxy)
        {
            this.proxy = this.view.getEl().createChild({
                tag: 'div',
                cls: 'x-view-selector'
            });
        }
        return this.proxy;
    },
    
    onDrag: function(e, scaleSelector)
    {
        var me = this,
            selModel = me.view.getSelectionModel(), // new
            proxy = me.getProxy(), // new
            bodyRegion = me.bodyRegion,
            startXY = me.tracker.startXY,
            dragRegion = me.dragRegion, // new
            currentXY = me.tracker.getXY(),
            width = Math.abs(startXY[0] - currentXY[0]),
            minX = Math.min(startXY[0], currentXY[0]),
            minY = Math.min(startXY[1], currentXY[1]) - me.scrollTop,
            height = Math.abs(minY - currentXY[1]);
        
        
        if(currentXY[0] < startXY[0] && !scaleSelector)
        {
            currentXY[0] += 2;
        }
        
        if(me.scrollTop >= 0)
        {
            if((startXY[1] - me.scrollTop) > currentXY[1])
            {
                minY = currentXY[1];
                height = Math.abs(startXY[1] - currentXY[1]) - me.scrollTop;
            }
            
            bodyRegion.top -= me.scrollTop; 
        }
        else
        {
            if((startXY[1] - me.scrollTop) > currentXY[1])
            {
                minY = currentXY[1];
                height = Math.abs((startXY[1] - me.scrollTop) - currentXY[1]);
            }
            
            bodyRegion.bottom -= me.scrollTop;   
        }       
        
        Ext.apply(dragRegion, {
            top: minY,
            left: minX,
            right: minX + width,
            bottom: minY + height
        });

        dragRegion.constrainTo(bodyRegion);
        proxy.setRegion(dragRegion);

        var s = me.scroller;

        for( var i = 0; i < me.rs.length; i++)
        {
            var r = me.rs[i],
                sel = dragRegion.intersect(r),
                selected = selModel.isSelected(i),
                selectedBefore = me.objectsSelected[i];
            
            if(me.ctrlState)
            {
                if(selectedBefore)
                {
                    if(sel && selected)
                    {
                        selModel.deselect(i);
                    }
                    else if(!sel && !selected)
                    {
                        selModel.select(i, true);
                    }
                }
                else
                {
                    if(sel && !selected)
                    {
                        selModel.select(i, true);
                    }
                    else if(!sel && selected)
                    {
                        selModel.deselect(i);
                    }
                }
            }
            else
            {
                if(sel && !selected)
                {
                    selModel.select(i, true);
                }
                else if(!sel && selected)
                {
                    selModel.deselect(i);
                }
            }
        }
        
        if(currentXY[1] + 10 >= me.mainRegion.bottom)
        {
            if(Ext.isIE)
            {
                setTimeout(function()
                {
                    s.scrollTo('top', s.getScroll().top + 40);
                }, 100);
            }
            else
            {
                me.setScrollTop(s.getScroll().top + me.scrollSpeed);
            }
        }
        
        if(currentXY[1] - 10 <= me.mainRegion.top)
        {
            if(Ext.isIE)
            {
                setTimeout(function()
                {
                    s.scrollTo('top', s.getScroll().top - 40);
                }, 100);
            }
            else
            {
                me.setScrollTop(s.getScroll().top - me.scrollSpeed);
            }
        }
    },
    
    setScrollTop: function(scrollTop)
    {
        var el = this.scroller,
            elDom = el && el.dom;
        
        if(elDom)
        {
            return elDom.scrollTop = Ext.Number.constrain(scrollTop, 0, elDom.scrollHeight - elDom.clientHeight);
        }
    },
    
    onEnd: function(e)
    {
        var me = this;
        me.dragging = false;        
        me.getProxy().hide();       
        e.preventDefault();
        me.fireEvent('dragselectorend', me);
    }
});