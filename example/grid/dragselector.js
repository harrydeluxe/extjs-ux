Ext.Loader.setConfig({
    enabled: true,
	paths: {
		'Ext.ux': 'http://extjs.cachefly.net/extjs-4.1.1-gpl/examples/ux/',
		'Ext.ux.grid': '../../ux/grid',
		//'Ext.ux.grid.plugin': '../../ux/grid/plugin'
	}
});

Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
    'Ext.ux.CheckColumn',
    'Ext.ux.grid.plugin.DragSelector'
]);

Ext.onReady(function(){
    // Define our data model
    Ext.define('Employee', {
        extend: 'Ext.data.Model',
        fields: [
            'name',
            'email',
            { name: 'start', type: 'date', dateFormat: 'n/j/Y' },
            { name: 'salary', type: 'float' },
            { name: 'active', type: 'bool' }
        ]
    });

    // Generate mock employee data
    var data = (function() {
        var lasts = ['Jones', 'Smith', 'Lee', 'Wilson', 'Black', 'Williams', 'Lewis', 'Johnson', 'Foot', 'Little', 'Vee', 'Train', 'Hot', 'Mutt'],
            firsts = ['Fred', 'Julie', 'Bill', 'Ted', 'Jack', 'John', 'Mark', 'Mike', 'Chris', 'Bob', 'Travis', 'Kelly', 'Sara'],
            lastLen = lasts.length,
            firstLen = firsts.length,
            usedNames = {},
            data = [],
            s = new Date(2007, 0, 1),
            now = new Date(),

            getRandomInt = function(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },

            generateName = function() {
                var name = firsts[getRandomInt(0, firstLen - 1)] + ' ' + lasts[getRandomInt(0, lastLen - 1)];
                if (usedNames[name]) {
                    return generateName();
                }
                usedNames[name] = true;
                return name;
            };

        while (s.getTime() < now.getTime()) {
            var ecount = getRandomInt(0, 3);
            for (var i = 0; i < ecount; i++) {
                var name = generateName();
                data.push({
                    start : Ext.Date.add(Ext.Date.clearTime(s, true), Ext.Date.DAY, getRandomInt(0, 27)),
                    name : name,
                    email: name.toLowerCase().replace(' ', '.') + '@sencha-test.com',
                    active: getRandomInt(0, 1),
                    salary: Math.floor(getRandomInt(35000, 85000) / 1000) * 1000
                });
            }
            s = Ext.Date.add(s, Ext.Date.MONTH, 1);
        }

        return data;
    })();

    // create the Data Store
    var store = Ext.create('Ext.data.Store', {
        // destroy the store if the grid is destroyed
        autoDestroy: true,
        model: 'Employee',
        proxy: {
            type: 'memory'
        },
        data: data,
        sorters: [{
            property: 'start',
            direction: 'ASC'
        }]
    });

    // create the grid and specify what field you want
    // to use for the editor at each column.
    var grid = Ext.create('Ext.grid.Panel', {
        store: store,
        columns: [{
            header: 'Name',
            dataIndex: 'name',
            flex: 1,
            editor: {
                // defaults to textfield if no xtype is supplied
                allowBlank: false
            }
        }, {
            header: 'Email',
            dataIndex: 'email',
            width: 160,
            editor: {
                allowBlank: false,
                vtype: 'email'
            }
        }, {
            xtype: 'datecolumn',
            header: 'Start Date',
            dataIndex: 'start',
            width: 90,
            field: {
                xtype: 'datefield',
                allowBlank: false,
                format: 'm/d/Y',
                minValue: '01/01/2006',
                minText: 'Cannot have a start date before the company existed!',
                maxValue: Ext.Date.format(new Date(), 'm/d/Y')
            }
        }, {
            xtype: 'numbercolumn',
            header: 'Salary',
            dataIndex: 'salary',
            format: '$0,0',
            width: 90,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 1,
                maxValue: 150000
            }
        }, {
            xtype: 'checkcolumn',
            header: 'Active?',
            dataIndex: 'active',
            width: 60,
            editor: {
                xtype: 'checkbox',
                cls: 'x-grid-checkheader-editor'
            }
        }],
        renderTo: 'editor-grid',
        width: 600,
        height: 400,
        title: 'Employee Salaries',
        frame: true,
        multiSelect: true,
        tbar: [{
            itemId: 'removeEmployee',
            text: 'Remove Employee',
            iconCls: 'employee-remove',
            handler: function()
            {
                var sm = grid.getSelectionModel().getSelection();

				for( var i = 0; i < sm.length; i++)
				{
					//sm[i].commit();
					store.remove(sm[i]);
				}
            },
            disabled: true
        }],
        plugins: [Ext.create('Ext.ux.grid.plugin.DragSelector', {})],
        listeners: {
            'selectionchange': function(view, records) {
                grid.down('#removeEmployee').setDisabled(!records.length);
            }
        }
    });
});