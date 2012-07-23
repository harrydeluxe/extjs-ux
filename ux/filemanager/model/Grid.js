Ext.apply(Ext.data.SortTypes, {
    asFileName: function(v)
    {
        return v.toUpperCase();
    },
    asFolder: function(v)
    {
        if(v == 'folder')
            return 'A';
        return v.toUpperCase();
    }
});

/**
 * @class Ext.ux.filemanager.model.Grid
 * @extends Ext.data.Model
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.filemanager.model.Grid', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'name',
        type: 'string',
        sortType: 'asFileName'
    },
    {
        name: 'size',
        type: 'int'
    // defaultValue: '-'
    },
    {
        name: 'type',
        type: 'string',
        sortType: 'asFolder'
    },
    {
        name: 'date_modified',
        type: 'date',
        dateFormat: 'timestamp'
    },
    {
        name: 'row_class',
        type: 'string',
        defaultValue: 'ux-filemanager-icon-unknown-file'
    },
    {
        name: 'thumbnails',
        type: 'string'
    },
    {
        name: 'thumbnail',
        type: 'string'
    // defaultValue: me.defaultThumbnailImage
    },
    {
        name: 'extension',
        type: 'string'
    }]
});