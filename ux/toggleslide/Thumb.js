/**
 * @class Ext.ux.toggleslide.Thumb
 * 
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */

Ext.define('Ext.ux.toggleslide.Thumb', {

    /**
     * @private
     * @property {Number} topThumbZIndex
     * The number used internally to set the z index of the top thumb (see promoteThumb for details)
     */
    topZIndex: 10000,

    /**
     * @cfg {Ext.slider.MultiSlider} slider (required)
     * The Slider to render to.
     */

    /**
     * Creates new slider thumb.
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        var me = this;

        /**
         * @property {Ext.slider.MultiSlider} slider
         * The slider this thumb is contained within
         */
        Ext.apply(me, config || {}, {
            cls: Ext.baseCSSPrefix + 'toggle-slide-thumb',

            /**
             * @cfg {Boolean} constrain True to constrain the thumb so that it cannot overlap its siblings
             */
            constrain: false
        });
        me.callParent([config]);
    },

    /**
     * Renders the thumb into a slider
     */
    render: function() {
        var me = this;
        
        me.el = me.slider.el.insertFirst(me.getElConfig());
        me.onRender();
    },
    
    onRender: function() {
        if (this.disabled) {
            this.disable();
        }
        //this.initEvents();
    },

    getElConfig: function() {
        var me = this,
            slider = me.slider,
            style = {};

        style['left'] = 0;
        return {
            style: style,
            id  : this.id,
            cls : this.cls
        };
    },

    /**
     * @private
     * Bring thumb dom element to front.
     */
    bringToFront: function() {
        this.el.setStyle('zIndex', this.topZIndex);
    },

    /**
     * @private
     * Send thumb dom element to back.
     */
    sendToBack: function() {
        this.el.setStyle('zIndex', '');
        
        this.el.setStyle({
            visibility: 'hidden'
        });
        
    },
    
    disable: function() {

    }
});
