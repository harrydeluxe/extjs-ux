/**
 * Small override
 * @see http://www.sencha.com/forum/showthread.php?183860-Feature-Request-for-Ext.view.TableChunker
 */

Ext.onReady(function() {

    Ext.grid.feature.Feature.override(
        {
            mutateMetaTableTpl: function(metaTableTplArray) {
            }
        });

    Ext.view.TableChunker.getTableTpl = function(cfg, textOnly) {
        var tpl,
            tableTplMemberFns = {
                openRows: this.openRows,
                closeRows: this.closeRows,
                embedFeature: this.embedFeature,
                embedFullWidth: this.embedFullWidth,
                openTableWrap: this.openTableWrap,
                closeTableWrap: this.closeTableWrap
            },
            tplMemberFns = {},
            features = cfg.features || [],
            ln = features.length,
            i = 0,
            memberFns = {
                embedRowCls: this.embedRowCls,
                embedRowAttr: this.embedRowAttr,
                firstOrLastCls: this.firstOrLastCls
            },
            metaRowTpl = Array.prototype.slice.call(this.metaRowTpl, 0),
            metaTableTpl = Array.prototype.slice.call(this.metaTableTpl, 0);


        for (; i < ln; i++) {
            if (!features[i].disabled) {
                features[i].mutateMetaTableTpl(metaTableTpl); // new
                features[i].mutateMetaRowTpl(metaRowTpl);
                Ext.apply(memberFns, features[i].getMetaRowTplFragments());
                Ext.apply(tplMemberFns, features[i].getFragmentTpl());
                Ext.apply(tableTplMemberFns, features[i].getTableFragments());
            }
        }

        metaRowTpl = new Ext.XTemplate(metaRowTpl.join(''), memberFns);
        cfg.row = metaRowTpl.applyTemplate(cfg);

        metaTableTpl = new Ext.XTemplate(metaTableTpl.join(''), tableTplMemberFns);	// new

        tpl = metaTableTpl.applyTemplate(cfg);

        // TODO: Investigate eliminating.
        if (!textOnly) {
            tpl = new Ext.XTemplate(tpl, tplMemberFns);
        }
        return tpl;

    };

});


/**
 * @class Ext.ux.grid.feature.Tileview
 * @extends Ext.grid.feature.Feature
 *
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
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

    getRowBody: function(values, viewMode) {
        if (this.viewTpls[viewMode]) {
            return this.viewTpls[viewMode];
        }
    },

    mutateMetaTableTpl: function(metaTableTpl) {
        var me = this;

        if (me.viewMode && me.viewMode != 'default') {
            metaTableTpl[1] = '<table class="' + Ext.baseCSSPrefix + 'grid-table tileview" border="0" cellspacing="0" cellpadding="0" style="width: auto;">';
            metaTableTpl[2] = '<tbody class="dragselect">';
            metaTableTpl[3] = null;
            metaTableTpl[4] = null;
            metaTableTpl[5] = null;
            metaTableTpl[6] = null;
            metaTableTpl[7] = null;
        }
    },

    mutateMetaRowTpl: function(metaRowTpl) {
        var me = this;

        if (me.viewMode && me.viewMode != 'default') {
            metaRowTpl[0] = '<tr class="' + Ext.baseCSSPrefix + 'grid-row tileview {[this.embedRowCls()]}" {[this.embedRowAttr()]}>';
            metaRowTpl[1] = null;
            metaRowTpl[2] = '{[this.getRowBody(values, this.viewMode)]}';
            metaRowTpl[3] = null;
            metaRowTpl[4] = null;
            metaRowTpl[5] = null;
            metaRowTpl[6] = "</tr>";
        }
    },

    getMetaRowTplFragments: function() {
        return {
            getRowBody: this.getRowBody,
            viewMode: this.viewMode,
            viewTpls: this.viewTpls
        };
    },

    setView: function(mode) {
        var me = this;

        if (me.viewMode != mode) {
            me.viewMode = mode;
            me.view.refresh();
        }
    }
});