YUI.add('gallery-itsaviewmodelpanel', function (Y, NAME) {

'use strict';

/*jshint maxlen:235 */

/**
 *
 * Widget ITSAViewModelPanel
 *
 *
 * Has the same functionalities as ITSAViewModel, but will come inside a Panel (which floats by default).
 * Also has standard a 'close'-button. Using WidgetButtons functionalyties, more buttons can be added.
 *
 * These buttons are available by the module and will call Model's corresponding methods:
 *
 * close (visible by default)
 * add
 * destroy
 * reset
 * save
 * submit
 *
 *
 * @module gallery-itsaviewmodelpanel
 * @class ITSAViewModelPanel
 * @constructor
 * @extends ITSAPanel
 * @since 0.2
 */

var ITSAViewModelPanel,
    ITSAFORMELEMENT = Y.ITSAFormElement,
    YArray = Y.Array,
    Lang = Y.Lang,
    PLUGIN_TIMEOUT = 4000, // timeout within the plugin of itsatabkeymanager should be loaded
    ID = 'id',
    DESTROYED = 'destroyed',
    CONTENTBOX = 'contentBox',
    RENDERED = 'rendered',
    GALLERY = 'gallery-',
    VIEW = 'View',
    BODYVIEW = 'body'+VIEW,
    FOOTER = 'footer',
    FOOTERVIEW = FOOTER+VIEW,
    TEMPLATE = 'template',
    FOOTERTEMPLATE = FOOTER+'Template',
    FOCUSED_CLASS = 'itsa-focused',
    EDITABLE = 'editable',
    MODEL = 'model',
    FOCUSED = 'focused',
    VISIBLE = 'visible',
    CHANGE = 'Change',
    CLOSE = 'close',
    CLICK = 'click',
    CLOSE_CLICK = CLOSE+CLICK,
    BUTTON = 'button',
    BUTTON_HIDE_EVENT = BUTTON+':hide',
    BOOLEAN = 'boolean',
    STRING = 'string',
    LOAD = 'load',
    SUBMIT = 'submit',
    DELETE = 'delete',
    SAVE = 'save',
    DESTROY = 'destroy',
    VALUE = 'value',
    RESET = 'reset',
    FOCUSMANAGED = 'focusManaged',
    ITSATABKEYMANAGER = 'itsatabkeymanager',
    NO_HIDE_ON_LOAD = 'noHideOnLoad',
    NO_HIDE_ON_RESET = 'noHideOnReset',
    DISABLED = 'disabled',
    PURE_BUTTON_DISABLED = 'pure-'+BUTTON+'-'+DISABLED,
    VALIDATION_ERROR = 'validationerror',
    /**
      * Fired when a UI-elemnt needs to focus to the next element (in case of editable view).
      * The defaultFunc will refocus to the next field (when the Panel has focus).
      * Convenience-event which takes place together with the underlying models-event.
      *
      * @event focusnext
      * @param e {EventFacade} Event Facade including:
      * @param e.target {Y.Node} The node that fired the event.
      * @param e.model {Y.Model} modelinstance bound to the view
      * @param e.modelEventFacade {EventFacade} eventfacade that was passed through by the model that activated this event
      * @since 0.1
    **/
    FOCUS_NEXT = 'focusnext',
    VALIDATED_BTN_TYPES = {
        ok: true,
        retry: true,
        save: true,
        submit: true
    };

ITSAViewModelPanel = Y.ITSAViewModelPanel = Y.Base.create('itsaviewmodelpanel', Y.ITSAPanel, [], null, {
    ATTRS: {
        /**
         * Overruled from Y.ITSAPanel by making writeOnce=true.<br />
         * Template of the bodysection. Can be either a Y.Lang.sub-template or a Y.View.<br />
         * When a String-template is set, the template can make use of {body}, which will automaticly be replaced by the body-attribute under the hood.<br />
         * When an Y.View instance is set, the View's 'container' will be bound to the bodysection-div automaticly and the View's render() method
         * will be executed to fill the section with content. If the View is designed well, the panel-content will automaticly be updated when needed.
         *
         * @attribute bodyView
         * @type {String|Y.View}
         * @default null
         * @since 0.1
        */
        bodyView : {
            value: null,
            writeOnce: true
        },
        /**
         * Makes the View to render the editable-version of the Model. Only when the Model has <b>Y.Plugin.ITSAEditModel</b> plugged in.
         *
         * @attribute editable
         * @type {Boolean}
         * @default false
         * @since 0.3
         */
        editable: {
            value: false,
            validator: function(v){
                return (typeof v === BOOLEAN);
            }
        },
        /**
         * Determines whether tabbing through the elements is managed by gallery-itsatabkeymanager.
         *
         * @attribute focusManaged
         * @type {Boolean}
         * @default true
         * @since 0.3
         */
        focusManaged: {
            value: true,
            validator: function(v){
                return (typeof v === BOOLEAN);
            }
        },
        /**
         * Template for the footersection to render the Model. If its value is null or undefined, then you can make use of the String attributes 'footer' and 'footerRight'.<br />
         * The attribute MUST be a template that can be processed by either <i>Y.Lang.sub or Y.Template.Micro</i>,
         * where Y.Lang.sub is more lightweight. If you use Y.ITSAFormModel as 'model' and 'editable' is set true, be aware that all property-values are <u>html-strings</u>.
         * Should you templating with micro-templates <b>you need to look for the docs</b> what is the right way to do.
         *
         * <u>If you set this attribute after the view is rendered, the view will be re-rendered.</u>
         *
         * @attribute footerTemplate
         * @type {String}
         * @default null
         * @since 0.3
         */
        footerTemplate: {
            value: null,
            validator: function(v) {
                return (typeof v === STRING);
            }
        },

        /**
         * Overruled from Y.ITSAPanel by making writeOnce=true.<br />
         * Template of the footersection. Can be either a Y.Lang.sub-template or a Y.View.<br />
         * When a String-template is set, the template can make use of {footer} and {footerRight}, which will automaticly be replaced by the footer and footerRight-attributes under the hood.<br />
         * When an Y.View instance is set, the View's 'container' will be bound to the footersection-div automaticly and the View's render() method
         * will be executed to fill the section with content. If the View is designed well, the panel-content will automaticly be updated when needed.
         *
         * @attribute footerView
         * @type {String|Y.View}
         * @default null
         * @since 0.1
        */
        footerView : {
            value: null,
            writeOnce: true
        },

        /**
         * Overruled from Y.ITSAPanel by making readOnly=true.<br />
         * Template of the headersection. Can be either a Y.Lang.sub-template or a Y.View.<br />
         * When a String-template is set, the template can make use of {title} and {titleRight}, which will automaticly be replaced by the title and titleRight-attributes
         * under the hood. You need {titleRight} if you want the 'close-button' to render when the attribute 'titleRight' keeps undefined.<br />
         * When an Y.View instance is set, the View's 'container' will be bound to the headersection-div automaticly and the View's render() method
         * will be executed to fill the section with content. If the View is designed well, the panel-content will automaticly be updated when needed.
         *
         * @attribute headerView
         * @type {String|Y.View}
         * @default null
         * @since 0.1
        */
        headerView : {
            value: null,
            readOnly: true
        },

        /**
         * When set true, makes the Panel hide once a button is pressed. There are 2 buttons however that can make the panel not to hide: 'load' and 'reset',
         * which behaviour can be set through the attributes 'noHideOnLoad' and 'noHideOnReset'.
         *
         * @attribute hideOnBtn
         * @type {Boolean}
         * @default true
         * @since 0.1
        */
        hideOnBtn: {
            value: true,
            validator: function(v) {
                return (typeof v === BOOLEAN);
            }
        },

        /**
         * When set true, the Panel won't hide when the user clicks on the 'load'-button, even if 'hideOnBtn' is set true.
         *
         * @attribute noHideOnLoad
         * @type {Boolean}
         * @default true
         * @since 0.1
        */
        noHideOnLoad: {
            value: true,
            validator: function(v) {
                return (typeof v === BOOLEAN);
            }
        },

        /**
         * When set true, the Panel won't hide when the user clicks on the 'reset'-button, even if 'hideOnBtn' is set true.
         *
         * @attribute noHideOnReset
         * @type {Boolean}
         * @default true
         * @since 0.1
        */
        noHideOnReset: {
            value: true,
            validator: function(v) {
                return (typeof v === BOOLEAN);
            }
        },

        /**
         * The Y.Model that will be rendered in the panel. May also be an Object, which is handy in case the source is an
         * item of a Y.LazyModelList. If you pass a String-value, then the text is rendered as it is, assuming no model-instance.
         *
         * @attribute model
         * @type {Y.Model|Object|String}
         * @default {}
         * @since 0.3
         */
        model: {
            value: {},
            validator: function(v){ return ((v===null) || Lang.isObject(v) || (typeof v === STRING) || (v instanceof Y.Model)); }
        },

        /**
         * Template for the bodysection to render the Model. The attribute MUST be a template that can be processed by either <i>Y.Lang.sub or Y.Template.Micro</i>,
         * where Y.Lang.sub is more lightweight. If you use Y.ITSAFormModel as 'model' and 'editable' is set true, be aware that all property-values are <u>html-strings</u>.
         * Should you templating with micro-templates <b>you need to look for the docs</b> what is the right way to do.
         *
         * <u>If you set this attribute after the view is rendered, the view will be re-rendered.</u>
         *
         * @attribute template
         * @type {String}
         * @default null
         * @since 0.3
         */
        template: {
            value: null,
            validator: function(v) {
                return (typeof v === STRING);
            }
        }
    }
});

/**
 * @method initializer
 * @protected
 * @since 0.3
*/
ITSAViewModelPanel.prototype.initializer = function() {
    var instance = this,
        model = instance.get(MODEL),
        footertemplate = instance.get(FOOTERTEMPLATE);


    /**
     * Internal flag to state whether a datetimepicker is poped-up by this instance.
     * @property _pickerVis
     * @private
     * @default null
     * @type Boolean
    */

    /**
     * Internal flag that indicates wheter the panel is set locked just before another lockPanel command is about to execute
     * @property _lockedBefore
     * @private
     * @default null
     * @type Boolean
    */

    /**
     * Internal flag that indicates wheter the panel is set locked
     * @property _locked
     * @private
     * @default null
     * @type Boolean
    */

    /**
     * Internal list of all eventhandlers bound by this widget.
     * @property _eventhandlers
     * @private
     * @default []
     * @type Array
    */
    instance._eventhandlers = [];

    instance._set(BODYVIEW, new Y.ITSAViewModel({
        model: model,
        template: instance.get(TEMPLATE),
        editable: instance.get(EDITABLE),
        styled: false,
        focusManaged: false, // will be done at the Panel-level
        partOfMultiView: true
    }));

/*jshint expr:true */
    footertemplate && instance._set(FOOTERVIEW, new Y.ITSAViewModel({
        model: model,
        template: footertemplate,
        editable: false,
        styled: false,
        focusManaged: false, // will be done at the Panel-level
        partOfMultiView: true
    }));
/*jshint expr:false */

    // publishing event 'focusnext'
    instance.publish(
        FOCUS_NEXT,
        {
            defaultFn: Y.bind(instance._defFn_focusnext, instance),
            emitFacade: true
        }
    );
/*jshint expr:true */
    instance.get(VISIBLE) && instance.get(CONTENTBOX).addClass(FOCUSED_CLASS); // to make tabkeymanager work
/*jshint expr:false */
};

/**
 * Passes through to the underlying bodyView and footerView.<br />
 * Defines a custom property that can be refered to using templating, f.i. {btn_button_1}
 * <br />Imagebuttons can be set through 'labelHTML', f.i.: '<i class="icon-press"></i> press me' --> see module 'gallerycss-itsa-base' for more info.
 *
 * @method addCustomBtn
 * @param buttonId {String} unique id that will be used as the reference-property during templating. F.i. {btn_button_1}
 * @param labelHTML {String} Text on the button (equals buttonId when not specified). You can use imagebuttons: see module 'gallerycss-itsa-base' how to create.
 * @param [config] {Object} config (which that is passed through to Y.ITSAFormElement)
 * @param [config.value] {String} returnvalue which is available inside the eventlistener through e.value
 * @param [config.data] {String} when wanting to add extra data to the button, f.i. 'data-someinfo="somedata"'
 * @param [config.disabled=false] {Boolean}
 * @param [config.hidden=false] {Boolean}
 * @param [config.hotkey] {String} character that act as a hotkey: 'alt+char' will focus and click the button.
 *                                 The hotkey-character will be marked with the css-class 'itsa-hotkey' (span-element), which underscores by default, but can be overruled.
 *                                 If you want to Internationize, the you need to supply an object where the properties are the language-tag and the values a string (character).
 *                                 F.i. {us: 'a', nl: 'o'}. When Internationize, there will be no hotkey when the used language is not found in the hotkey-object.
 * @param [config.classname] for adding extra classnames to the button
 * @param [config.focusable=true] {Boolean}
 * @param [config.primary=false] {Boolean} making it the primary-button
 * @param [config.spinbusy=false] {Boolean} making a buttonicon to spin if busy
 * @param [config.tooltip] {String} tooltip when Y.Tipsy or Y.Tipsy is used
 * @since 0.3
 *
 */
ITSAViewModelPanel.prototype.addCustomBtn = function(buttonId, labelHTML, config) {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.addCustomBtn(buttonId, labelHTML, config);
/*jshint expr:true */
    footerview && footerview.addCustomBtn(buttonId, labelHTML, config);
/*jshint expr:false */
};

/**
 * ITSAViewModelPanel's bindUI-method. Binds events
 *
 * @method bindUI
 * @since 0.1
*/
ITSAViewModelPanel.prototype.bindUI = function() {
    var instance = this,
        contentBox = instance.get(CONTENTBOX),
        eventhandlers, bodyView, footerView;
    ITSAViewModelPanel.superclass.bindUI.apply(instance);

    eventhandlers = instance._eventhandlers;
    bodyView = instance.get(BODYVIEW);
    bodyView.addTarget(instance);

    footerView = instance.get(FOOTERVIEW);
/*jshint expr:true */
    footerView && footerView.addTarget(instance);
/*jshint expr:false */

    instance._setFocusManager(instance.get(FOCUSMANAGED));

    eventhandlers.push(
        instance.after(EDITABLE+CHANGE, function(e) {
            bodyView.set(EDITABLE, e.newVal);
        })
    );

    eventhandlers.push(
        instance.after(VISIBLE+CHANGE, function(e) {
            var visible = e.newVal,
                model;
/*jshint expr:true */
            if (!visible) {
                instance._pickerVis && Y.ItsaDateTimePicker.hide(true);
                model = instance.get(MODEL);
                if (model.toJSONUI) {
                    ITSAFORMELEMENT.tipsyOK._lastnode && model._FORM_elements[ITSAFORMELEMENT.tipsyOK._lastnode.get(ID)] && ITSAFORMELEMENT.tipsyOK.hideTooltip();
                    ITSAFORMELEMENT.tipsyInvalid._lastnode && model._FORM_elements[ITSAFORMELEMENT.tipsyInvalid._lastnode.get(ID)] && ITSAFORMELEMENT.tipsyInvalid.hideTooltip();
                }
            }
/*jshint expr:false */
            instance.get(CONTENTBOX).toggleClass(FOCUSED_CLASS, visible); // to make tabkeymanager work
        })
    );

    eventhandlers.push(
        instance.after(MODEL+CHANGE, function(e) {
            var footerView = instance.get(FOOTERVIEW);
            bodyView.set(MODEL, e.newVal);
/*jshint expr:true */
            footerView && footerView.set(MODEL, e.newVal);
/*jshint expr:false */
        })
    );

    eventhandlers.push(
        instance.after(TEMPLATE+CHANGE, function(e) {
            bodyView.set(TEMPLATE, e.newVal);
            contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
                function(itsatabkeymanager) {
                    itsatabkeymanager.refresh(contentBox);
                    if (contentBox.hasClass(FOCUSED_CLASS)) {
                        itsatabkeymanager.focusInitialItem();
                    }
                }
            );
        })
    );

    eventhandlers.push(
        instance.after(
            '*:viewrendered',
            function(e) {
                var viewinstance = e.target,
                    isFooterView = (viewinstance===instance.get(FOOTERVIEW));
                // BECAUSE we do not have a promise yet that tells when all formelements are definitely rendered on the screen,
                // we need to timeout
                if (isFooterView) {
                    instance._footercont.toggleClass('itsa-inlinefooter', true);
                    viewinstance.get('container').get('parentNode').setStyle('overflow', 'visible');
                    // reset previous width, otherwise the width keeps expanding
                    instance._body.setStyle('minWidth', '');
                    // now we can calculate instance._footer.get('offsetWidth')
                    instance._body.setStyle('minWidth', instance._footer.get('offsetWidth')+'px');
                    instance._footercont.toggleClass('itsa-inlinefooter', false);
                }
                Y.later(250, null, function() {
                    contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
                        function(itsatabkeymanager) {
                            itsatabkeymanager.refresh(contentBox);
                            if (contentBox.hasClass(FOCUSED_CLASS) && instance.get(VISIBLE) && !instance._locked) {
                                itsatabkeymanager.focusInitialItem();
                            }
                        }
                    );
                });
            }
        )
    );

    eventhandlers.push(
        instance.after(
            FOCUSMANAGED+CHANGE,
            function(e) {
                instance._setFocusManager(e.newVal);
            }
        )
    );

    eventhandlers.push(
        bodyView.on(
            FOCUS_NEXT,
            function(e) {
                if (e.target!==instance) {
                    var newevent = FOCUS_NEXT,
                        payload = {
                            type: newevent,
                            model: instance.get(MODEL),
                            modelEventFacade: e,
                            target: instance
                        };
                    instance.fire(newevent, payload);
                }
            }
        )
    );

    eventhandlers.push(
        instance.after(
            ['*:'+CLOSE_CLICK, '*:'+BUTTON+CLOSE],
            function(e) {
                instance.fire(BUTTON_HIDE_EVENT, {buttonNode: e.target});
            }
        )
    );

    eventhandlers.push(
        instance.after(FOCUSED+CHANGE, function(e) {
            var focusclassed = e.newVal && instance.get(VISIBLE);
            instance.get(CONTENTBOX).toggleClass(FOCUSED_CLASS, focusclassed);
        /*jshint expr:true */
            focusclassed && contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
                function(itsatabkeymanager) {
                    itsatabkeymanager._retreiveFocus();
                }
            );
        /*jshint expr:false */
        })
    );

    eventhandlers.push(
        instance.after(
            ['*:'+LOAD, '*:'+RESET],
            function(e) {
                var model = e.target;
        /*jshint expr:true */
                (model instanceof Y.Model) && instance.get(VISIBLE) && contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
                    function(itsatabkeymanager) {
                        // first enable the UI again, this is done within the submit-defaultfunc of the model as well, but that code comes LATER.
                        // and we need enabled element to set the focus
                        model.enableUI();
                        if (contentBox.hasClass(FOCUSED_CLASS)) {
                            itsatabkeymanager.focusInitialItem();
                        }
                    }
                );
        /*jshint expr:false */
            }
        )
    );

    eventhandlers.push(
        instance.on(FOOTERTEMPLATE+CHANGE, function(e) {
        /*jshint expr:true */
            var newTemplate = e.newVal,
                prevTemplate = e.prevVal,
                newFooterView;
            if (newTemplate) {
                if (!prevTemplate) {
                    newFooterView = new Y.ITSAViewModel({
                        model: instance.get(MODEL),
                        template: newTemplate,
                        editable: false,
                        styled: false,
                        focusManaged: false, // will be done at the Panel-level
                        partOfMultiView: true
                    });
                    instance._set(FOOTERVIEW, newFooterView);
                    newFooterView.addTarget(instance);
                    instance._renderFooter();
                }
                else {
                    instance.get(FOOTERVIEW).set('template', newTemplate);
                }
            }
            prevTemplate && !newTemplate && prevTemplate.destroy() && instance._set(FOOTERVIEW, null);
            contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
                function(itsatabkeymanager) {
                    itsatabkeymanager.refresh(contentBox);
                    if (contentBox.hasClass(FOCUSED_CLASS)) {
                        itsatabkeymanager.focusInitialItem();
                    }
                }
            );
        /*jshint expr:false */
        })
    );

    eventhandlers.push(
        instance.after(
            ['*:'+CLICK],
            function(e) {
                var node = e.buttonNode,
                    value = node && node.get(VALUE);
/*jshint expr:true */
                // value===CLOSE will be handled by the '*:'+CLOSE_CLICK eventlistener
                node && instance.get('hideOnBtn') && (value!==CLOSE) && (!instance.get(NO_HIDE_ON_RESET) || (value!==RESET)) && (!instance.get(NO_HIDE_ON_LOAD) || (value!==LOAD)) && instance.fire(BUTTON_HIDE_EVENT, {buttonNode: node});
/*jshint expr:false */
            }
        )
    );

    eventhandlers.push(
        instance._header.delegate(
            CLICK,
            function(e) {
                var node = e.target,
                    value = node.get(VALUE);
/*jshint expr:true */
                // value===CLOSE will be handled by the '*:'+CLOSE_CLICK eventlistener
                instance.get('hideOnBtn') && (value!==CLOSE) && (!instance.get(NO_HIDE_ON_RESET) || (value!==RESET)) && (!instance.get(NO_HIDE_ON_LOAD) || (value!==LOAD)) && instance.fire(BUTTON_HIDE_EVENT, {buttonNode: node});
/*jshint expr:false */
            },
            BUTTON
        )
    );

    eventhandlers.push(
        instance.on(BUTTON_HIDE_EVENT, function(e) {
            // in case of an ITSAFormElement that has editable fields --> you might need to preventDefault (=hide) when not validated
            var model = instance.get(MODEL),
                editable = instance.get(EDITABLE),
                btnNode = e.buttonNode,
                buttonValue = btnNode.get(VALUE),
                unvalidNodes = model.getUnvalidatedUI(),
                payload = {
                              target: model,
                              nodelist: unvalidNodes,
                              src: e.type
                          };
            if (VALIDATED_BTN_TYPES[buttonValue] && editable && model && model.toJSONUI && !unvalidNodes.isEmpty()) {
                e.preventDefault();
                model.fire(VALIDATION_ERROR, payload);
            }
        })
    );

    eventhandlers.push(
        instance.on(
            ['*:'+SUBMIT, '*:'+SAVE, '*:'+LOAD, '*:'+DESTROY],
            function(e) {
                var promise = e.promise,
                    model = e.target,
                    eventType = e.type.split(':')[1],
                    options = e.options,
                    destroyWithoutRemove = ((eventType===DESTROY) && (options.remove || options[DELETE])),
                    prevAttrs;
                if (!destroyWithoutRemove && (model instanceof Y.Model)) {
                    if ((eventType===SUBMIT) || (eventType===SAVE)) {
                        prevAttrs = model.getAttrs();
                        model.UIToModel();
                    }
                    // Caution: need to lockPanel AFTER UIToModel, because the changeevent would unlock again
                    instance._lockedBefore = instance._locked;
                    instance.lockPanel(true);
                    instance._setSpin(eventType, true);
    /*jshint expr:true */
                    (eventType===DESTROY) || promise.then(
                        function() {
                            ((eventType===LOAD) || (eventType===SUBMIT) || (eventType===SAVE)) && model.setResetAttrs();
                        },
                        function() {
                            ((eventType===SUBMIT) || (eventType===SAVE)) && model.setAttrs(prevAttrs, {fromInternal: true});
                            return true; // make promise fulfilled
                        }
                    ).then(
                        function() {
                            instance._setSpin(eventType, false);
        /*jshint expr:true */
                            instance._lockedBefore || instance.unlockPanel();
                            contentBox.hasClass(FOCUSED_CLASS) && contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
                                function(itsatabkeymanager) {
                                    itsatabkeymanager.focusInitialItem();
                                }
                            );
        /*jshint expr:false */
                        }
                    );
    /*jshint expr:false */
                }
            }
        )
    );

    eventhandlers.push(
        instance.on(
            '*:datepickerclick',
            function() {
                instance.lockPanel();
                instance._pickerVis = true;
                instance.once('*:'+FOCUS_NEXT, function() {
                    instance._pickerVis = false;
                    instance.unlockPanel();
                });
            }
        )
    );

};
/**
 * Locks the Panel (all UI-elements of the form-model) in case model is Y.ITSAFormModel and the view is editable.<br />
 * Passes through to the underlying bodyView and footerView.
 *
 * @method lockPanel
 * @since 0.3
*/
ITSAViewModelPanel.prototype.lockPanel = function() {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.lockView();
/*jshint expr:true */
    footerview ? footerview.lockView() : instance._footercont.all('button').addClass(PURE_BUTTON_DISABLED);
    arguments[0] || (instance._locked=true);
/*jshint expr:false */
};

/**
 * Unlocks the Panel (all UI-elements of the form-model) in case model is Y.ITSAFormModel and the view is editable.<br />
 * Passes through to the underlying bodyView and footerView.
 *
 * @method unlockPanel
 * @since 0.3
*/
ITSAViewModelPanel.prototype.unlockPanel = function() {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.unlockView();
/*jshint expr:true */
    footerview ? footerview.unlockView() : instance._footercont.all('button').removeClass(PURE_BUTTON_DISABLED);
/*jshint expr:false */
    instance._locked = false;
};

/**
 * Passes through to the underlying bodyView and footerView.<br />
 * Removes custom buttonlabels defined with setButtonLabel().
 * Available buttontypes are:
 * <ul>
 *   <li>btn_abort</li>
 *   <li>btn_cancel</li>
 *   <li>btn_close</li>
 *   <li>btn_destroy</li>
 *   <li>btn_ignore</li>
 *   <li>btn_load</li>
 *   <li>btn_no</li>
 *   <li>btn_ok</li>
 *   <li>btn_remove</li>
 *   <li>btn_reset</li>
 *   <li>btn_retry</li>
 *   <li>btn_save</li>
 *   <li>btn_submit</li>
 *   <li>btn_yes</li>
 *   <li>imgbtn_abort</li>
 *   <li>imgbtn_cancel</li>
 *   <li>imgbtn_close</li>
 *   <li>imgbtn_destroy</li>
 *   <li>imgbtn_ignore</li>
 *   <li>imgbtn_load</li>
 *   <li>imgbtn_no</li>
 *   <li>imgbtn_ok</li>
 *   <li>imgbtn_remove</li>
 *   <li>imgbtn_reset</li>
 *   <li>imgbtn_retry</li>
 *   <li>imgbtn_save</li>
 *   <li>imgbtn_submit</li>
 *   <li>imgbtn_yes</li>
 *   <li>spinbtn_load</li>
 *   <li>spinbtn_remove</li>
 *   <li>spinbtn_save</li>
 *   <li>spinbtn_submit</li>
 * </ul>
 *
 * @method removeButtonLabel
 * @param buttonType {String} the buttontype which text was replaced, one of those mentioned above.
 * @since 0.3
 *
*/
ITSAViewModelPanel.prototype.removeButtonLabel = function(buttonType) {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.removeButtonLabel(buttonType);
/*jshint expr:true */
    footerview && footerview.removeButtonLabel(buttonType);
/*jshint expr:false */
};

/**
 * Passes through to the underlying bodyView and footerView.<br />
 * Removes custom buttons defined with addCustomBtn().
 *
 * @method removeCustomBtn
 * @param buttonId {String} unique id that will be used as the reference-property during templating. F.i. {btn_button_1}
 * @since 0.3
 *
*/
ITSAViewModelPanel.prototype.removeCustomBtn = function(buttonId) {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.removeCustomBtn(buttonId);
/*jshint expr:true */
    footerview && footerview.removeCustomBtn(buttonId);
/*jshint expr:false */
};

/**
 * Passes through to the underlying bodyView and footerView.<br />
 * Removes custom buttonlabels defined with setButtonHotKey().
 * 'buttontype' should be one of the folowing buttonTypes:
 * <ul>
 *   <li>btn_abort</li>
 *   <li>btn_cancel</li>
 *   <li>btn_close</li>
 *   <li>btn_destroy</li>
 *   <li>btn_ignore</li>
 *   <li>btn_load</li>
 *   <li>btn_no</li>
 *   <li>btn_ok</li>
 *   <li>btn_remove</li>
 *   <li>btn_reset</li>
 *   <li>btn_retry</li>
 *   <li>btn_save</li>
 *   <li>btn_submit</li>
 *   <li>btn_yes</li>
 *   <li>imgbtn_abort</li>
 *   <li>imgbtn_cancel</li>
 *   <li>imgbtn_close</li>
 *   <li>imgbtn_destroy</li>
 *   <li>imgbtn_ignore</li>
 *   <li>imgbtn_load</li>
 *   <li>imgbtn_no</li>
 *   <li>imgbtn_ok</li>
 *   <li>imgbtn_remove</li>
 *   <li>imgbtn_reset</li>
 *   <li>imgbtn_retry</li>
 *   <li>imgbtn_save</li>
 *   <li>imgbtn_submit</li>
 *   <li>imgbtn_yes</li>
 *   <li>spinbtn_load</li>
 *   <li>spinbtn_remove</li>
 *   <li>spinbtn_save</li>
 *   <li>spinbtn_submit</li>
 * </ul>
 *
 * @method removeHotKey
 * @param buttonType {String} the buttontype whose hotkey should be removed --> should be one of the types mentioned above.
 * @since 0.3
 *
*/
ITSAViewModelPanel.prototype.removeHotKey = function(buttonType) {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.removeHotKey(buttonType);
/*jshint expr:true */
    footerview && footerview.removeHotKey(buttonType);
/*jshint expr:false */
};

/**
 * Passes through to the underlying bodyView and footerView.<br />
 * Creates a custom label for the buttons that are referenced by one of the folowing buttonTypes:
 * <ul>
 *   <li>btn_abort</li>
 *   <li>btn_cancel</li>
 *   <li>btn_close</li>
 *   <li>btn_destroy</li>
 *   <li>btn_ignore</li>
 *   <li>btn_load</li>
 *   <li>btn_no</li>
 *   <li>btn_ok</li>
 *   <li>btn_remove</li>
 *   <li>btn_reset</li>
 *   <li>btn_retry</li>
 *   <li>btn_save</li>
 *   <li>btn_submit</li>
 *   <li>btn_yes</li>
 *   <li>imgbtn_abort</li>
 *   <li>imgbtn_cancel</li>
 *   <li>imgbtn_close</li>
 *   <li>imgbtn_destroy</li>
 *   <li>imgbtn_ignore</li>
 *   <li>imgbtn_load</li>
 *   <li>imgbtn_no</li>
 *   <li>imgbtn_ok</li>
 *   <li>imgbtn_remove</li>
 *   <li>imgbtn_reset</li>
 *   <li>imgbtn_retry</li>
 *   <li>imgbtn_save</li>
 *   <li>imgbtn_submit</li>
 *   <li>imgbtn_yes</li>
 *   <li>spinbtn_load</li>
 *   <li>spinbtn_remove</li>
 *   <li>spinbtn_save</li>
 *   <li>spinbtn_submit</li>
 * </ul>
 * 'labelHTML' may consist <u>{label}</u> which will be replaced by the default internationalized labelHTML. This way you can create imagebuttons that still hold the default label.
 * <b>Note</b> The default buttonLabels are internationalized, this feature will be lost when using this method (unless you use <u>{label}</u> in the new labelHTML).
 *
 * @method setButtonLabel
 * @param buttonType {String} the buttontype which text should be replaced, which should be one of the types mentioned above.
 * @param labelHTML {String} new button-label
 * @since 0.3
 *
*/
ITSAViewModelPanel.prototype.setButtonLabel = function(buttonType, labelHTML) {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.setButtonLabel(buttonType, labelHTML);
/*jshint expr:true */
    footerview && footerview.setButtonLabel(buttonType, labelHTML);
/*jshint expr:false */
};

/**
 * Passes through to the underlying bodyView and footerView.<br />
 * Creates a listener to the specific hotkey (character). The hotkey will be bound to the specified buttonType, that should be one of types mentioned below.
 * The hotkey-character will be marked with the css-class 'itsa-hotkey' (span-element), which underscores by default, but can be overruled.
 * <ul>
 *   <li>btn_abort</li>
 *   <li>btn_cancel</li>
 *   <li>btn_close</li>
 *   <li>btn_destroy</li>
 *   <li>btn_ignore</li>
 *   <li>btn_load</li>
 *   <li>btn_no</li>
 *   <li>btn_ok</li>
 *   <li>btn_remove</li>
 *   <li>btn_reset</li>
 *   <li>btn_retry</li>
 *   <li>btn_save</li>
 *   <li>btn_submit</li>
 *   <li>btn_yes</li>
 *   <li>imgbtn_abort</li>
 *   <li>imgbtn_cancel</li>
 *   <li>imgbtn_close</li>
 *   <li>imgbtn_destroy</li>
 *   <li>imgbtn_ignore</li>
 *   <li>imgbtn_load</li>
 *   <li>imgbtn_no</li>
 *   <li>imgbtn_ok</li>
 *   <li>imgbtn_remove</li>
 *   <li>imgbtn_reset</li>
 *   <li>imgbtn_retry</li>
 *   <li>imgbtn_save</li>
 *   <li>imgbtn_submit</li>
 *   <li>imgbtn_yes</li>
 *   <li>spinbtn_load</li>
 *   <li>spinbtn_remove</li>
 *   <li>spinbtn_save</li>
 *   <li>spinbtn_submit</li>
 * </ul>
 *
 * @method setHotKey
 * @param buttonType {String} the buttontype which receives the hotkey, which should be one of the types mentioned above.
 * @param hotkey {String|Object} character that act as a hotkey: 'alt+char' will focus and click the button.
 *                               The hotkey-character will be marked with the css-class 'itsa-hotkey' (span-element), which underscores by default, but can be overruled.
 *                               If you want to Internationize, the you need to supply an object where the properties are the language-tag and the values a string (character).
 *                               F.i. {us: 'a', nl: 'o'}. When Internationize, there will be no hotkey when the used language is not found in the hotkey-object.
 * @since 0.3
 *
*/
ITSAViewModelPanel.prototype.setHotKey = function(buttonType, hotkey) {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // bodyview always exists, footerview, we need to check first:
    bodyview.setHotKey(buttonType, hotkey);
/*jshint expr:true */
    footerview && footerview.setHotKey(buttonType, hotkey);
/*jshint expr:false */
};

/**
 * Updates Panels view by calling all view's render() methods.
 * You only need to call this when the attribute 'model' is an object and no Y.Model-instance and the properties are changed.
 *
 * @method syncUI
 * @since 0.3
*/
ITSAViewModelPanel.prototype.syncUI = function() {
    var instance = this,
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    // no need to sync when not rendered: first time will be done internally
    if (instance.get(RENDERED)) {
        bodyview.render();
/*jshint expr:true */
        footerview && footerview.render();
/*jshint expr:false */
    }
};

/**
  * Passes through to the underlying bodyView and footerView.<br />
  * Translates the given 'text; through Y.Int of this module. Possible text's that can be translated are:
  * <ul>
  *   <li>abort</li>
  *   <li>cancel</li>
  *   <li>close</li>
  *   <li>destroy</li>
  *   <li>ignore</li>
  *   <li>load</li>
  *   <li>reload</li>
  *   <li>no</li>
  *   <li>ok</li>
  *   <li>remove</li>
  *   <li>reset</li>
  *   <li>retry</li>
  *   <li>save</li>
  *   <li>submit</li>
  *   <li>yes</li>
  * </ul>
  *
  * @method translate
  * @param text {String} the text to be translated
  * @return {String} Translated text or the original text (if no translattion was posible)
  * @since 0.3
 **/
ITSAViewModelPanel.prototype.translate = function(text) {
    return this.get(BODYVIEW).translate(text);
};

/**
 * Cleans up bindings
 * @method destructor
 * @protected
  * @since 0.3
*/
ITSAViewModelPanel.prototype.destructor = function() {
    var instance = this,
        contentBox = instance.get(CONTENTBOX),
        bodyview = instance.get(BODYVIEW),
        footerview = instance.get(FOOTERVIEW);

    instance._clearEventhandlers();
    bodyview.removeTarget(instance);
/*jshint expr:true */
    contentBox.hasPlugin(ITSATABKEYMANAGER) && contentBox.unplug(ITSATABKEYMANAGER);
    bodyview && bodyview.destroy();
    footerview && footerview.destroy();
/*jshint expr:false */
};

/**
 * Cleaning up all eventlisteners
 *
 * @method _clearEventhandlers
 * @private
 * @since 0.4
 *
*/
ITSAViewModelPanel.prototype._clearEventhandlers = function() {

    var instance = this;
    YArray.each(
        instance._eventhandlers,
        function(item){
            item.detach();
        }
    );
};

/**
 * default function of focusnext-event.
 * Will refocus to the next focusable UI-element.
 *
 * @method _defFn_focusnext
 * @private
  * @since 0.3
*/
ITSAViewModelPanel.prototype._defFn_focusnext = function() {
    var instance = this,
        contentBox = instance.get(CONTENTBOX);

/*jshint expr:true */
    contentBox.hasClass(FOCUSED_CLASS) && contentBox.pluginReady(ITSATABKEYMANAGER, PLUGIN_TIMEOUT).then(
        function(itsatabkeymanager) {
            itsatabkeymanager.next();
        },
        function() {
        }
    );
/*jshint expr:false */
};

/**
 * Sets or unsets the focusManager (provided by gallery-itsatabkeymanager)
 *
 * @method _setFocusManager
 * @private
 * @param activate {Boolean}
 * @since 0.3
*/
ITSAViewModelPanel.prototype._setFocusManager = function(activate) {
    var instance = this,
        contentBox = instance.get(CONTENTBOX),
        itsatabkeymanager = contentBox.itsatabkeymanager;

    if (activate) {
        // If Y.Plugin.ITSATabKeyManager is plugged in, then refocus to the first item
        Y.use(GALLERY+ITSATABKEYMANAGER, function() {
            if (!instance.get(DESTROYED)) {
                if (itsatabkeymanager) {
                    itsatabkeymanager.refresh(contentBox);
                }
                else {
                    contentBox.plug(Y.Plugin.ITSATabKeyManager);
                    itsatabkeymanager = contentBox.itsatabkeymanager;
                }
                if (contentBox.hasClass(FOCUSED_CLASS)) {
                    itsatabkeymanager.focusInitialItem();
                }
            }
        });
    }
    else {
/*jshint expr:true */
        itsatabkeymanager && contentBox.unplug(ITSATABKEYMANAGER);
/*jshint expr:false */
    }
};

/**
 * Transforms the buttonicon into a 'spinner'-icon or reset to original icon.
 * In case there are multiple of the same buttontypes rendered, all are affected.
 *
 * @method _setSpin
 * @private
 * @param buttonType {String} buttontype which is to be affected.
 * @param spin {Boolean} whether to spin or not (=return to default).
 * @since 0.3
 *
*/
ITSAViewModelPanel.prototype._setSpin = function(buttonType, spin) {
    var instance = this,
        buttonicons = instance.get(CONTENTBOX).all('[data-buttonsubtype="'+buttonType+'"] i');
    buttonicons.toggleClass('itsaicon-form-loading', spin);
    buttonicons.toggleClass('itsa-busy', spin);
};

}, 'gallery-2013.10.14-07-00', {
    "requires": [
        "gallery-itsapluginpromise",
        "node-pluginhost",
        "base-build",
        "base-base",
        "event-outside",
        "model",
        "gallery-itsapanel",
        "gallery-itsaviewmodel",
        "gallery-itsaformelement"
    ]
});
