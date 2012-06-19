Ext.define('Ext.ux.grid.property.Property', {
    extend: 'Ext.data.Model',
    idProperty: 'name',
    fields: [   
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'text',   // wenn vorhanden, wird dieser text angezeigt
            type: 'string'
        },
        {
            name: 'value'
        },
        {
            name: 'editor'  // custom editor
        },
        {
            name: 'group',  // for grouping
            type: 'string'
        },
        {
            name: 'editable',
            type: 'boolean',
            defaultValue: true
        },
        {
            name: 'status',
            type: 'boolean',
            defaultValue: true
        },
        {
            name: 'renderer',    // custom renderer
            defaultValue: null
        }
    ]
});