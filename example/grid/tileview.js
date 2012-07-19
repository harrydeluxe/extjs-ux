Ext.Loader.setConfig({
    enabled: true,
	paths: {
		'Ext.ux': 'http://extjs.cachefly.net/extjs-4.1.1-gpl/examples/ux/',
		'Ext.ux.grid': 	'../../ux/grid',
		//'Ext.ux.grid.feature': '../../ux/grid/feature',
		'Ext.ux.container': '../../ux/container'
	}
});

Ext.require([
	'Ext.data.*',
	'Ext.grid.*',
	'Ext.ux.grid.feature.Tileview',
	'Ext.ux.grid.plugin.DragSelector',
	'Ext.ux.container.SwitchButtonSegment'
]);

Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	Ext.define('Restaurant', {
        extend: 'Ext.data.Model',
        fields: ['name', 'cuisine']
    });

	var Restaurants = Ext.create('Ext.data.Store', {
        storeId: 'restaraunts',
        model: 'Restaurant',
        sorters: ['cuisine','name'],
        groupField: 'cuisine',
        data: [{
            name: 'Cheesecake Factory',
            cuisine: 'American'
        },{
            name: 'University Cafe',
            cuisine: 'American'
        },{
            name: 'Slider Bar',
            cuisine: 'American'
        },{
            name: 'Shokolaat',
            cuisine: 'American'
        },{
            name: 'Gordon Biersch',
            cuisine: 'American'
        },{
            name: 'Crepevine',
            cuisine: 'American'
        },{
            name: 'Creamery',
            cuisine: 'American'
        },{
            name: 'Old Pro',
            cuisine: 'American'
        },{
            name: 'Nola\'s',
            cuisine: 'Cajun'
        },{
            name: 'House of Bagels',
            cuisine: 'Bagels'
        },{
            name: 'The Prolific Oven',
            cuisine: 'Sandwiches'
        },{
            name: 'La Strada',
            cuisine: 'Italian'
        },{
            name: 'Buca di Beppo',
            cuisine: 'Italian'
        },{
            name: 'Pasta?',
            cuisine: 'Italian'
        },{
            name: 'Madame Tam',
            cuisine: 'Asian'
        },{
            name: 'Sprout Cafe',
            cuisine: 'Salad'
        },{
            name: 'Pluto\'s',
            cuisine: 'Salad'
        },{
            name: 'Junoon',
            cuisine: 'Indian'
        },{
            name: 'Bistro Maxine',
            cuisine: 'French'
        },{
            name: 'Three Seasons',
            cuisine: 'Vietnamese'
        },{
            name: 'Sancho\'s Taquira',
            cuisine: 'Mexican'
        },{
            name: 'Reposado',
            cuisine: 'Mexican'
        },{
            name: 'Siam Royal',
            cuisine: 'Thai'
        },{
            name: 'Krung Siam',
            cuisine: 'Thai'
        },{
            name: 'Thaiphoon',
            cuisine: 'Thai'
        },{
            name: 'Tamarine',
            cuisine: 'Vietnamese'
        },{
            name: 'Joya',
            cuisine: 'Tapas'
        },{
            name: 'Jing Jing',
            cuisine: 'Chinese'
        },{
            name: 'Patxi\'s Pizza',
            cuisine: 'Pizza'
        },{
            name: 'Evvia Estiatorio',
            cuisine: 'Mediterranean'
        },{
            name: 'Cafe 220',
            cuisine: 'Mediterranean'
        },{
            name: 'Cafe Renaissance',
            cuisine: 'Mediterranean'
        },{
            name: 'Kan Zeman',
            cuisine: 'Mediterranean'
        },{
            name: 'Gyros-Gyros',
            cuisine: 'Mediterranean'
        },{
            name: 'Mango Caribbean Cafe',
            cuisine: 'Caribbean'
        },{
            name: 'Coconuts Caribbean Restaurant &amp; Bar',
            cuisine: 'Caribbean'
        },{
            name: 'Rose &amp; Crown',
            cuisine: 'English'
        },{
            name: 'Baklava',
            cuisine: 'Mediterranean'
        },{
            name: 'Mandarin Gourmet',
            cuisine: 'Chinese'
        },{
            name: 'Bangkok Cuisine',
            cuisine: 'Thai'
        },{
            name: 'Darbar Indian Cuisine',
            cuisine: 'Indian'
        },{
            name: 'Mantra',
            cuisine: 'Indian'
        },{
            name: 'Janta',
            cuisine: 'Indian'
        },{
            name: 'Hyderabad House',
            cuisine: 'Indian'
        },{
            name: 'Starbucks',
            cuisine: 'Coffee'
        },{
            name: 'Peet\'s Coffee',
            cuisine: 'Coffee'
        },{
            name: 'Coupa Cafe',
            cuisine: 'Coffee'
        },{
            name: 'Lytton Coffee Company',
            cuisine: 'Coffee'
        },{
            name: 'Il Fornaio',
            cuisine: 'Italian'
        },{
            name: 'Lavanda',
            cuisine: 'Mediterranean'
        },{
            name: 'MacArthur Park',
            cuisine: 'American'
        },{
            name: 'St Michael\'s Alley',
            cuisine: 'Californian'
        },{
            name: 'Cafe Renzo',
            cuisine: 'Italian'
        },{
            name: 'Osteria',
            cuisine: 'Italian'
        },{
            name: 'Vero',
            cuisine: 'Italian'
        },{
            name: 'Cafe Renzo',
            cuisine: 'Italian'
        },{
            name: 'Miyake',
            cuisine: 'Sushi'
        },{
            name: 'Sushi Tomo',
            cuisine: 'Sushi'
        },{
            name: 'Kanpai',
            cuisine: 'Sushi'
        },{
            name: 'Pizza My Heart',
            cuisine: 'Pizza'
        },{
            name: 'New York Pizza',
            cuisine: 'Pizza'
        },{
            name: 'California Pizza Kitchen',
            cuisine: 'Pizza'
        },{
            name: 'Round Table',
            cuisine: 'Pizza'
        },{
            name: 'Loving Hut',
            cuisine: 'Vegan'
        },{
            name: 'Garden Fresh',
            cuisine: 'Vegan'
        },{
            name: 'Cafe Epi',
            cuisine: 'French'
        },{
            name: 'Tai Pan',
            cuisine: 'Chinese'
        }]
    });
    
			
    var grid = Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        store: Restaurants,
        width: 660,
		height: 490,
        title: 'Restaurants',
        multiSelect: true,
        
        viewConfig: {
            stripeRows: true,
            chunker: Ext.view.TableChunker
        },
        
        plugins: [Ext.create('Ext.ux.grid.plugin.DragSelector')],
        
        features: [Ext.create('Ext.ux.grid.feature.Tileview', {
            viewMode: 'tileIcons',
			getAdditionalData: function(data, index, record, orig)
			{
				getRandomInt = function(min, max) {
	                return Math.floor(Math.random() * (max - min + 1)) + min;
	            };
	            
	            var files = ['4d8f3b2d98a60f8e0a00004b','4d8f3b2d98a60f8e0a000041','4d8f3b2d98a60f8e0a000054','4d8f3b2e98a60f8e0a000071','4d8f3b2e98a60f8e0a000077','4d8f3b2f98a60f8e0a00008a','4d8f3b2f98a60f8e0a000080','4d8f3b3098a60f8e0a0000a4','4d8f3b3098a60f8e0a0000ac'];
	            
	            generateThumbnail = function()
	            {
	                return files[getRandomInt(0, files.length - 1)] + '.jpg';
	            };
   
				if(this.viewMode)
				{
					return {
						thumbnails: generateThumbnail(),
						rating: 'Rating: ' + getRandomInt(1, 9)
					};
				}
				return {};
			},
			viewTpls:
			{
					mediumIcons: [
						'<td class="{cls} ux-explorerview-medium-icon-row">',
						'<table class="x-grid-row-table">',
							'<tbody>',
								'<tr>',
									'<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;thumbnails/medium_{thumbnails}&quot;) no-repeat scroll 50% 100% transparent;">',
									'</td>',
								'</tr>',
								'<tr>',
									'<td class="x-grid-col x-grid-cell">',
										'<div class="x-grid-cell-inner" unselectable="on">{name}</div>',
									'</td>',
								'</tr>',
							'</tbody>',
						'</table>',
						'</td>'].join(''),
				  
		  			tileIcons: [
						'<td class="{cls} ux-explorerview-detailed-icon-row">',
						'<table class="x-grid-row-table">',
							'<tbody>',
								'<tr>',
									'<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;thumbnails/tile_{thumbnails}&quot;) no-repeat scroll 50% 50% transparent;">',
									'</td>',
								
									'<td class="x-grid-col x-grid-cell">',
										'<div class="x-grid-cell-inner" unselectable="on">{name}<br><span>{rating}<br>{cuisine}</span></div>',
									'</td>',
								'</tr>',
							'</tbody>',
						'</table>',
						'</td>'].join('')
		
    		}
        }),
		{
            ftype: 'grouping',
            groupHeaderTpl: 'Cuisine: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
            disabled: false
        }],
        columns: [{
            text: 'Name',
            id: 'name',
            flex: 1,
            dataIndex: 'name'
        }, {
            text: 'Cuisine',
            id: 'cuisine',
            flex: 1,
            dataIndex: 'cuisine'
        }],
        tbar: ['->', {
            xtype: 'switchbuttonsegment',
            activeItem: 1,
            scope: this,
            items: [{
                tooltip: 'Details',
                viewMode: 'default',
                iconCls: 'icon-default'
            }, {
                tooltip: 'Tiles',
                viewMode: 'tileIcons',
                iconCls: 'icon-tile'
            }, {
                tooltip: 'Icons',
                viewMode: 'mediumIcons',
                iconCls: 'icon-medium'
            }],
            listeners: {
                change: function(btn, item)
                {
					grid.features[0].setView(btn.viewMode);		
                },
                scope: this
            }
        }
        ]
    });
});