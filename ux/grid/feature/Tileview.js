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
		if(this.view.chunker)
		{
			if(!this.metaTableTplOrig)			
				this.metaTableTplOrig = this.view.chunker.metaTableTpl;

			if(!this.viewMode || this.viewMode == 'default')
				this.view.chunker.metaTableTpl = this.metaTableTplOrig;
			else
				this.view.chunker.metaTableTpl = this.metaTableTpl;		
		}
		
		if(this.viewMode && this.viewMode != 'default')
		{
			delete metaRowTpl[1];
			delete metaRowTpl[3];
			
			metaRowTpl[2] = '{[this.getRowBody(values, this.viewMode)]}';
			metaRowTpl[0] = metaRowTpl[0].replace(Ext.baseCSSPrefix + 'grid-row', Ext.baseCSSPrefix + 'grid-row tileview');
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
		if(this.viewMode != mode)
		{
			this.viewMode = mode;	
			this.view.refresh();
		}
	}  
});