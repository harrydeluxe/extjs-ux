

/**
 * Additional Format function(s) to use
 */
Ext.apply(Ext.util.Format, {
	/**
	 * Format filesize to human readable format Also deals with filesizes in
	 * units larger then MegaBytes
	 * 
	 * @param {Integer} size Filesize in bytes
	 * @returns {String} Formatted filesize
	 */
	bytesToSi: function(size)
	{
		//console.log(size);
		if(typeof size === 'number' && size > 0)
		{
			var s, e, r;
			s = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
			e = Math.floor(Math.log(size) / Math.log(1024));
			r = size / Math.pow(1024, e);
			if(Math.round(r.toFixed(2)) !== r.toFixed(2))
			{
				r = r.toFixed(2);
			}
			return r + ' ' + s[e];
		}
		else
		{
			return '';
		}
	}
});


/**
 * @class Ext.ux.filemanager.filemanager
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.filemanager.filemanager', {
	
	/**
	 * @cfg {String} getFoldersUrl
	 * The URL to fetch folders Takes precedence over dataUrl
	 */
	
	/**
	 * @cfg {String} getFilesUrl
	 * The URL to fetch files Takes precedence over dataUrl
	 */

	
	/**
	 * @cfg {String} dataUrl
	 * The URL that is used to process requests Required if not all URL options are set Defaults to: 'filemanagerpanel.php'
	 */
	dataUrl: '',

	layout: 'border',
		
	rootNode: 'Root',
	rootId: 'Root',
	rootPath: '/',
	path: '',
	
	readOnly: false,
	
	
	selectionMode: 'MULTI', // SINGLE,SIMPLE,MULTI
	border: false,
	
	treeConfig: {},
	gridConfig: {},
	
	gcm: [], // contextmenu grid
	gtb: [], // toolbar (Gridtoolbar)
	
	tcm: [], // contextmenu tree
	
	
	
	
	getPath: function()
	{
		return this.path;
	},

	
	setPath: function(path)
	{
		var me = this;
		
		me.path = path;
	},
	
	
	getRootPath: function()
	{
		return this.path;
	},

	
	setRootPath: function(path)
	{
		var me = this;
		
		me.path = path;
	}
	
});