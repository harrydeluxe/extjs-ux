
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux.container': '../../ux/container'
    }
});

Ext.require([ 'Ext.ux.container.ButtonSegment' ]);

Ext.onReady(function()
{
    Ext.create('Ext.ux.container.ButtonSegment', {
        renderTo: Ext.getBody(),
        items: [ {
            text: 'Paste'
        }, {
            xtype: 'splitbutton',
            text: 'Menu Button',
            menu: [ {
                text: 'Menu Item 1'
            } ]
        }, {
            xtype: 'splitbutton',
            text: 'Cut',
            menu: [ {
                text: 'Cut Menu Item'
            } ]
        }, {
            text: 'Copy'
        }, {
            text: 'Format'
        } ]
    });

    Ext.create('Ext.ux.container.ButtonSegment', {
        renderTo: Ext.getBody(),
        style: 'margin-top:15px',
        defaults: {
            scale: 'medium'
        },
        items: [ {
            text: 'Lorem'
        }, {
            text: 'Ipsum'
        }, {
            text: 'dolor'
        } ]
    });

    Ext.create('Ext.Panel', {
        title: 'Segmented buttons in toolbar',
        width: 500,
        height: 250,
        style: 'margin-top:15px',
        bodyStyle: 'padding:10px',
        renderTo: Ext.getBody(),
        html: '',
        autoScroll: true,
        tbar: [ {
            xtype: 'button',
            text: 'Add'
        }, {
            xtype: 'button',
            text: 'Remove'
        }, '->', {
            xtype: 'buttonsegment',
            items: [ {
                xtype: 'splitbutton',
                text: 'Cut',
                menu: [ {
                    text: 'Cut Menu Item'
                } ]
            }, {
                text: 'Copy'
            }, {
                text: 'Format'
            } ]
        } ]
    });

});