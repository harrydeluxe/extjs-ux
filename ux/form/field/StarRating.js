/**
 * @Copyright (c) 2011 Aurélio Saraiva
 * @Page https://github.com/aureliosaraiva/ExtJS-FieldStarRating try at
 *       http://exemplos.aureliosaraiva.com/fieldstar/exemplo.html
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions: The above copyright
 * notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @Version 0.2
 * @Release 2012-04-27
 */
Ext.define('Ext.ux.form.field.StarRating', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.ratingfield',
    fieldSubTpl: ['<div id="{id}" class="{fieldCls}"></div>',
            {
                compiled: true,
                disableFormats: true
            }],
    fieldCls: Ext.baseCSSPrefix + 'form-rating-field',
    value: null,
    
    /**
     * Define a quantidade de itens o componente vai ter bem como os valores de
     * retorno para cada item
     * 
     * @default [1, 2, 3, 4, 5]
     */
    items: [1, 2, 3, 4, 5],
    startText: false,
    endTest: false,
    
    initEvents: function()
    {
        this.callParent();
        this.inputEl.on('mouseover', this._over, this, {
            delegate: 'span.x-rating-item'
        });
        this.inputEl.on('mouseout', this._out, this, {
            delegate: 'span.x-rating-item'
        });
        this.inputEl.on('click', this._click, this, {
            delegate: 'span.x-rating-item'
        });
    },
    
    setValue: function(v)
    {
        var me = this;
        me.callParent(arguments);
        me.markRating(v);
    },
    
    markRating: function(v)
    {
        var me = this, re = false;
        if(me.rendered)
        {
            Ext.each(this.items, function(o, i)
            {
                var va = o.getAttribute('value');
                if(!v)
                {
                    o.removeCls('x-rating-selected');
                }
                else
                {
                    if(!re)
                    {
                        o.addCls('x-rating-selected');
                        if(va == v)
                        {
                            re = true;
                        }
                    }
                    else
                    {
                        o.removeCls('x-rating-selected');
                    }
                }
            }, me);
            this.hiddenField.dom.value = v;
        }
    },
    
    onRender: function()
    {
        var me = this;
        
        me.callParent(arguments);
        var name = me.name || Ext.id();
        me.hiddenField = me.inputEl.insertSibling({
            tag: 'input',
            type: 'hidden',
            name: name
        });
        var skell = [],
            childs = [];
        
        if(me.startText)
        {
            skell.push({
                tag: 'div',
                html: me.startText,
                cls: 'x-rating-text'
            });
        }
        
        Ext.each(this.items, function(o, i)
        {
            if(!Ext.isObject(o))
            {
                o = {
                    value: o
                };
            }
            if(o.text)
            {
                if(!me.tips)
                {
                    me.tips = {};
                }
                me.tips[o.value] = o.text;
            }
            childs.push({
                tag: 'span',
                value: o.value || i,
                cls: 'x-rating-item'
            });
        }, this);
        
        skell.push({
            tag: 'div',
            id: this.id + '-container',
            children: childs,
            cls: 'x-rating-container'
        });
        
        if(me.endText)
        {
            skell.push({
                tag: 'div',
                html: me.endText,
                cls: 'x-rating-text'
            });
        }
        
        if(me.tips)
        {
            skell.push({
                tag: 'div',
                id: this.id + '-tip',
                cls: 'x-rating-tip'
            });
        }
        
        Ext.DomHelper.append(me.inputEl, skell, true);
        me.items = [];
        Ext.each(Ext.get(this.id + '-container').query('.x-rating-item'), function(o, i)
        {
            me.items.push(Ext.get(o));
        });
        
        me.setValue(me.value);
    },
    
    _click: function(e, o)
    {
        var v = o.getAttribute('value');
        if(v == this.value)
        {
            v = null;
        }
        this.setValue(v);
    },
    
    _out: function()
    {
        this.markRating(this.value);
        this.hideTips();
    },
    
    _over: function(e, o)
    {
        var v = o.getAttribute('value');
        this.markRating(v);
        this.showTips(v);
    },
    
    showTips: function(v)
    {
        if(this.tips)
        {
            var tip = Ext.get(this.id + '-tip');
            tip.update(this.tips[v]);
        }
    },
    
    hideTips: function()
    {
        if(this.tips)
        {
            var tip = Ext.get(this.id + '-tip');
            tip.update('');
        }
    }
});
