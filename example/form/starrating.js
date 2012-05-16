Ext.Loader.setConfig({
    'enabled': true,
    'paths': {
        'Ext.ux': 'http://extjs.cachefly.net/ext-4.0.7-gpl/examples/ux/',
        'Ext.ux.form.field': '../../ux/form/field'
    }
});

Ext.require(['Ext.ux.form.field.StarRating']);

Ext.onReady(function()
{
    var formPanel = Ext.create('Ext.form.Panel', {
        width: 400,
        title: 'Formulário de qualificação',
        bodyPadding: 10,
        renderTo: 'container',
        defaultType: 'sliderfield',
        defaults: {
            labelAlign: 'top',
            labelWidth: 200,
            anchor: '100%'
        },
        items: [{
            xtype: 'fieldcontainer',
            layout: 'hbox',
            combineErrors: true,
            defaultType: 'textfield',
            defaults: {
                labelAlign: 'top'
            },
            items: [{
                    name: 'firstName',
                    fieldLabel: 'First Name',
                    flex: 2,
                    allowBlank: false
                },
                {
                    name: 'lastName',
                    fieldLabel: 'Last Name',
                    flex: 3,
                    margins: '0 0 0 6',
                    allowBlank: false
                }]
            },
            {
                xtype: 'ratingfield',
                name: 'facilidade',
                startText: 'Difícil',
                endText: 'Fácil',
                items: [0,1,2,3,4,5,6,7,8],
                fieldLabel: 'Facilidade de utilização'
            },
            {
                xtype: 'ratingfield',
                name: 'ratingfield2',
                items: [0,1,2,3,4,5],
                fieldLabel: 'Organização das informações'
            },
            {
                xtype: 'ratingfield',
                name: 'ratingfield3',
                items: [{
                        value: 1,
                        text: 'Difícil'
                    },
                    {
                        value: 2,
                        text: 'Regular'
                    },
                    {
                        value: 3,
                        text: 'Bom'
                    },
                    {
                        value: 4,
                        text: 'Fácil'
                    }],
                fieldLabel: 'Layout das telas'
            },
            {
                xtype: 'ratingfield',
                name: 'ratingfield4',
                fieldLabel: 'Nomenclatura utilizada nas telas (nome de comandos, títulos, campos, etc.)'
            },
            {
                xtype: 'ratingfield',
                name: 'ratingfield5',
                fieldLabel: 'Mensagens do sistema'
            },
            {
                xtype: 'ratingfield',
                name: 'ratingfield6',
                fieldLabel: 'Assimilação das informações'
            }],
            buttons: ['->',
            {
                text: 'Load',
                handler: function()
                {
                    this.up('form').getForm().load({
                        method: 'get',
                        url: 'starrating.json',
                        waitMsg: 'Loading...'
                    });
                }
            },
            {
                text: 'Save',
                formBind: true,
                handler: function()
                {
                    this.up('form').getForm().submit({
                        url: 'form.json',
                        submitEmptyText: false,
                        waitMsg: 'Saving Data...'
                    });
                }
            },
            {
                text: 'Reset',
                formBind: true,
                handler: function()
                {
                    this.up('form').getForm().reset();
                }
            }]
    });
});