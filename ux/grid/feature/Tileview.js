/**
 * @class Ext.ux.grid.feature.Tileview
 * @extends Ext.grid.feature.Feature
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.grid.feature.Tileview', {
	extend: 'Ext.grid.feature.Feature',
	alias: 'feature.tileview',
	metaTableTplOrig: null, // stores the original template
	viewMode: null,
	viewTpls: {},	
	
	metaTableTpl: ['{[this.openTableWrap()]}',
		              '<table class="' + Ext.baseCSSPrefix + 'grid-table tileview" border="0" cellspacing="0" cellpadding="0" style="width: auto;">',
		                   '<tbody class="dragselect">',
		                   '{[this.openRows()]}',
		                       '{row}',
		                       '<tpl for="features">',
		                           '{[this.embedFeature(values, parent, xindex, xcount)]}',
		                       '</tpl>',
		                   '{[this.closeRows()]}',
		                   '</tbody>',
		               '</table>',
		               '{[this.closeTableWrap()]}'
		               ],
		                          
	getRowBody: function(values, viewMode)
	{
		if(this.viewTpls[viewMode])
		{
			return this.viewTpls[viewMode];
		}
	},

	mutateMetaRowTpl: function(metaRowTpl)
	{
		var me = this;

		if(me.view.chunker)
		{
			if(!me.metaTableTplOrig)
				me.metaTableTplOrig = me.view.chunker.metaTableTpl;

			if(!me.viewMode || me.viewMode == 'default')
				me.view.chunker.metaTableTpl = me.metaTableTplOrig;
			else
				me.view.chunker.metaTableTpl = me.metaTableTpl;
		}

		if(me.viewMode && me.viewMode != 'default')
		{
			metaRowTpl[0] = metaRowTpl[0].replace(Ext.baseCSSPrefix + 'grid-row', Ext.baseCSSPrefix + 'grid-row tileview');
			metaRowTpl[1] = null;
			metaRowTpl[2] = '{[this.getRowBody(values, this.viewMode)]}';
			metaRowTpl[3] = null;
			metaRowTpl[4] = null;
			metaRowTpl[5] = null;
			metaRowTpl[6] = "</tr>";			
		}
	},

	getMetaRowTplFragments: function()
	{
		return {
			getRowBody: this.getRowBody,
			viewMode: this.viewMode,
			viewTpls: this.viewTpls
		};
	},

	setView: function(mode)
	{
		var me = this;
		
		if(me.viewMode != mode)
		{
			me.viewMode = mode;
			me.view.refresh();
		}
	}
});