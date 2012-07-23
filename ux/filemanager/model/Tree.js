/**
 * @class Ext.ux.filemanager.model.Tree
 * @extends Ext.data.Model
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.model.Tree', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.UuidGenerator'],
    idgen: 'uuid',
    
    fields: [{
        name: 'text',
        type: 'string'
    },
    {
        name: 'id',
        type: 'string'
    },
    {
        name: 'leaf',
        type: 'string'
    },
    {
        name: 'ids',
        type: 'string'
    }],
            
    getRealPath: function(field, separator)
    {
        var me = this,
            field = field || me.idProperty, separator = separator || '/',
            first = me.get(field),
            path = (first == '' || first == '/') ? [] : [first],
            parent = me.parentNode;
        
        while(parent)
        {
            var f = parent.get(field);
            
            if(f != '' && f != '/')
                path.unshift(f);
            
            parent = parent.parentNode;
        }
        return separator + path.join(separator);
    }
});