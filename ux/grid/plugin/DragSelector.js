/**
 * @class Ext.ux.grid.plugin DragSelector
 * @extends Ext.util.Observable
 * 
 * @author Harald Hanek
 * @copyright 2011, DELACAP, all rights reserved.
 * 
 * The Initial Developer of the Original Code is: Claudio Walser aka Foggy
 * cwa[at]uwd.ch
 * 
 * @copyright 2007-2008, UWD GmbH, all rights reserved.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

Ext.define('Ext.ux.grid.plugin.DragSelector', {
	extend: 'Ext.util.Observable',
	requires: [ 'Ext.dd.DragTracker', 'Ext.util.Region', 'Ext.grid.Scroller' ],
	alias: 'plugin.ux.dragselector',

	isDragging: false,
	scrollTopStart: 0,
	scrollTop: 0,
	targetDragSelector: '.dragselect',

	constructor: function(config)
	{
		var me = this;

		me.addEvents(
		/**
		 * @event dragselectorstart Fires when DragSelector starts
		 * 
		 * @param {Ext.ux.grid.plugin.DragSelector} this
		 */
		'dragselectorstart',

		/**
		 * @event dragselectorend Fires when DragSelector ends
		 * 
		 * @param {Ext.ux.grid.plugin.DragSelector} this
		 */
		'dragselectorend');

		me.callParent([ config ]);
	},

	init: function(cmp)
	{
		var me = this;

		me.grid = cmp;
		me.view = me.grid.getView();
		me.selModel = me.view.getSelectionModel();

		me.mon(me.view, 'render', me.onRender, me);
		me.mon(me.view, 'bodyscroll', me.syncScroll, me);

		if(!me.grid.verticalScroller)
		{
			Ext.apply(me.grid, {
				verticalScroller: {
					xtype: 'gridscroller',
					activePrefetch: false
				}
			});
		}
	},

	onRender: function(view)
	{
		var me = this;

		me.tracker = Ext.create('Ext.dd.DragTracker', {
			onBeforeStart: Ext.Function.bind(me.onBeforeStart, me),
			onStart: Ext.Function.bind(me.onStart, me),
			onDrag: Ext.Function.bind(me.onDrag, me),
			onEnd: Ext.Function.bind(me.onEnd, me)
		});

		me.tracker.initEl(view.el);
		me.scroller = view.el;
	},

	syncScroll: function(e)
	{
		// this.syncRegions();
		this.fillRegions();
		var top = this.scroller.getScroll().top;
		this.scrollTop = top - this.scrollTopStart;
		if(this.isDragging)
		{
			this.onDrag(e, true);
		}
	},

	fillAllRegions: function()
	{
		this.mainRegion = this.scroller.getRegion();
		this.bodyRegion = this.scroller.getRegion();

		var objectsSelected = this.objectsSelected = [];

		this.view.all.each(function(el)
		{
			objectsSelected.push(this.selModel.isSelected(objectsSelected.length));

		}, this);

		this.fillRegions();
		this.syncScroll();
	},

	fillRegions: function()
	{
		var rs = this.rs = [];

		this.view.all.each(function(el)
		{
			rs.push(el.getRegion());
		});
	},

	/*
	 * syncRegions: function() { this.fillRegions(); },
	 */

	cancelClick: function(e)
	{
		this.ctrlState = e.ctrlKey;
		this.shiftState = e.shiftKey;
		// grid.stopEditing();
		var target = e.getTarget();

		if(!this.ctrlState && !this.shiftState && target.className === 'x-grid-view')
		{
			this.selModel.clearSelections();
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
			return false;
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
		if(!me.proxy)
		{
			me.proxy = me.view.el.createChild({
				cls: 'x-view-selector'
			});
		}
		else
		{
			me.proxy.setDisplayed('block');
		}
		me.isDragging = true;

		me.fireEvent('dragselectorstart', me);
	},

	onDrag: function(e, scaleSelector)
	{
		var me = this, startXY = me.tracker.startXY, xy = me.tracker.getXY();

		if(xy[0] < startXY[0] && !scaleSelector)
		{
			xy[0] += 2;
		}

		if(me.scrollTop >= 0)
		{
			if((startXY[1] - me.scrollTop) <= xy[1])
			{
				var y = startXY[1] - me.scrollTop;
				var h = Math.abs(y - xy[1]);
			}
			else
			{
				var y = xy[1];
				var h = Math.abs(startXY[1] - xy[1]) - me.scrollTop;
			}
			var x = Math.min(startXY[0], xy[0]);
			var w = Math.abs(startXY[0] - xy[0]);
			me.bodyRegion.top -= me.scrollTop;
		}
		else
		{
			if((startXY[1] - me.scrollTop) < xy[1])
			{
				var y = startXY[1] - me.scrollTop;
				var h = Math.abs(y - xy[1]);
			}
			else
			{
				var y = xy[1];
				var h = Math.abs((startXY[1] - me.scrollTop) - xy[1]);
			}

			var x = Math.min(startXY[0], xy[0]);
			var w = Math.abs(startXY[0] - xy[0]);

			me.bodyRegion.bottom -= me.scrollTop;
		}

		// ( Number top, Number right, Number bottom, Number left )
		var dragRegion = Ext.create('Ext.util.Region', y, x + w, y + h, x);

		// dragRegion.constrainTo(view.el.getRegion());
		dragRegion.constrainTo(me.bodyRegion);

		me.proxy.setRegion(dragRegion);

		var view = me.view, s = me.scroller;

		for( var i = 0; i < me.rs.length; i++)
		{
			var r = me.rs[i], sel = dragRegion.intersect(r), selected = me.selModel.isSelected(i), selectedBefore = me.objectsSelected[i];

			if(this.ctrlState)
			{
				if(selectedBefore)
				{
					if(sel && selected)
					{
						view.getSelectionModel().deselect(i);
					}
					else if(!sel && !selected)
					{
						view.getSelectionModel().select(i, true);
					}
				}
				else
				{
					if(sel && !selected)
					{
						view.getSelectionModel().select(i, true);
					}
					else if(!sel && selected)
					{
						view.getSelectionModel().deselect(i);
					}
				}
			}
			else
			{
				if(sel && !selected)
				{
					view.getSelectionModel().select(i, true);
				}
				else if(!sel && selected)
				{
					view.getSelectionModel().deselect(i);
				}
			}
		}

		if(xy[1] + 10 >= me.mainRegion.bottom)
		{
			// slow up for ie
			if(Ext.isIE)
			{
				setTimeout(function()
				{
					s.scrollTo('top', s.getScroll().top + 40);
				}, 100);
			}
			else
			{
				me.grid.verticalScroller.setScrollTop(s.getScroll().top + 40);
			}
		}

		if(xy[1] - 10 <= me.mainRegion.top)
		{
			// slow up for ie
			if(Ext.isIE)
			{
				setTimeout(function()
				{
					s.scrollTo('top', s.getScroll().top - 40);
				}, 100);
			}
			else
			{
				me.grid.verticalScroller.setScrollTop(s.getScroll().top - 40);
			}
		}
	},

	onEnd: function(e)
	{
		var me = this;
		me.isDragging = false;

		if(me.proxy)
		{
			// this.proxy.setDisplayed(false);
			me.proxy.hide(true);
			// this.proxy.remove();
			me.proxy = null;
		}
		e.preventDefault();

		me.fireEvent('dragselectorend', me);
	}
});