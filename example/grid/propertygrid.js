Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'http://extjs.cachefly.net/extjs-4.1.1-gpl/examples/ux/',
        'Ext.ux.grid.property': '../../ux/grid/property',
        'Ext.ux.grid.plugin': '../../ux/grid/plugin',
        'Ext.ux.form.field': '../../ux/form/field'
    }
});
Ext.require(['Ext.grid.*',
        'Ext.data.*',
        'Ext.util.*',
        'Ext.state.*',
        'Ext.form.*',
        'Ext.ux.CheckColumn',
        'Ext.ux.grid.property.Grid',
        'Ext.ux.grid.property.Property']);

Ext.onReady(function()
{
   
    var data = [{
            "name": "name",
            "text": "Name",
            "value": "www.delacap.com",
            "editor": "",
            "group": "Domain",
            "editable": true,
            "status": true,
            "renderer": ""
        },
        {
            "name": "online",
            "text": "Online",
            "value": true,
            "editor": "",
            "group": "Domain",
            "editable": true,
            "status": true,
            "renderer": ""
        },
        {
            "name": "path",
            "text": "Path",
            "value": "/var/www/",
            "editor": "",
            "group": "Domain",
            "editable": true,
            "status": true,
            "renderer": ""
        },
        {
            "name": "sitemap",
            "text": "Sitemap",
            "value": true,
            "editor": "",
            "group": "Page",
            "editable": true,
            "status": false,
            "renderer": ""
        },
        {
            "name": "date",
            "text": "Publish Date",
            "value": new Date(),
            "editor": "date",
            "group": "Page",
            "editable": false,
            "status": true,
            "renderer": ""
        },
        {
            "name": "timefield",
            "text": "Time",
            "value": '10:00',
            "editor": "evtStart",
            "group": "Page",
            "editable": false,
            "status": true,
            "renderer": null
        },
        {
            "name": "updateAllowed",
            "text": "Update allowed",
            "value": true,
            "editor": "",
            "group": "Page",
            "editable": false,
            "status": true,
            "renderer": ""
        },
        {
            "name": "searchable",
            "text": "Searchable",
            "value": true,
            "editor": "",
            "group": "Page",
            "editable": true,
            "status": false,
            "renderer": ""
        }];
    
    var grid = Ext.create('Ext.ux.grid.property.Grid', {
        title: 'Page',
        renderTo: 'editor-grid',
        width: 400,
        height: 460,
        renderTo: Ext.getBody(),
        groupingConfig: {
            groupHeaderTpl: 'Settings: {name}',
            disabled: false
        },
        customEditors: {
            'evtStart': new Ext.grid.CellEditor({
                field: new Ext.form.TimeField({
                    editable: false,
                    format: 'H:i',
                    minValue: '6:00',
                    maxValue: '12:00',
                    increment: 30
                })
            })
        },
        columns: [{
            xtype: 'checkcolumn',
            header: 'Status',
            dataIndex: 'status',
            menuDisabled: true,
            width: 60,
            editor: {
                xtype: 'checkbox',
                cls: 'x-grid-checkheader-editor'
            },
            listeners:
            {
                beforecheckchange: function(checkColumn, rowIndex, checked)
                {
                    var record = checkColumn.ownerCt.view.panel.store.getAt(rowIndex);
                    if(record && record.data.editable == false)
                        return false;
                }
            }
        }],
        source: data,
        tbar: [{
                text: 'Toggle groupping',
                handler: function()
                {
                    var g = grid.groupingFeature;
                    
                    if(g.disabled)
                        g.enable();
                    else
                        g.disable();
                }
            },
            {
                text: 'Toggle disabled',
                handler: function()
                {
                    var store = grid.getStore(),
                        rec = store.getById('updateAllowed');
                    rec.set('editable', !rec.get('editable'));
                }
            }]
    });
});