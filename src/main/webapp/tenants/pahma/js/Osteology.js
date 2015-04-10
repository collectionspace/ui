(function ($, fluid) {
    var BASE_EL_PATH = "fields";
    var COMPLETE_CLASS = "complete";
    var COMPLETE_VALUE = "C";
    var ABSENT_CLASS = "absent";
    var ABSENT_VALUE = "0";
    var PARENT_ATTRIBUTE_NAME = "parent";
    var AGGREGATES_ATTRIBUTE_NAME = "aggregates-children-of";
    var PROPAGATES_ATTRIBUTE_NAME = "propagates-to-children-of";
    
    fluid.defaults("cspace.osteology", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        selectors: {},
        strings: {},
        parentBundle: "{globalBundle}",
        preInitFunction: "cspace.osteology.preInit",
        finalInitFunction: "cspace.osteology.finalInit",
        invokers: {
            bindEvents: {
                funcName: "cspace.osteology.bindEvents",
                args: ["{osteology}", "{recordEditor}"]
            },
            initForm: {
                funcName: "cspace.osteology.initForm",
                args: ["{osteology}"]
            }
        }
    });
    
    cspace.osteology.preInit = function(that) {
        that.isItemName = function(candidateName) {
            return (candidateName in that.inputs);
        };
        
        that.setItemValue = function(itemName, value) {
            that.inputs[itemName][value].checked = true;
        };
        
        that.areAllChildrenComplete = function(itemName) {
            var complete = true;
            
            for (var childName in that.children[itemName]) {
                if (that.model.fields[childName] !== COMPLETE_VALUE) {
                    complete = false;
                    break;
                }
            }
            
            return complete;
        };
        
        that.areAllChildrenAbsent = function(itemName) {
            var absent = true;
            
            for (var childName in that.children[itemName]) {
                if (that.model.fields[childName] !== ABSENT_VALUE) {
                    absent = false;
                    break;
                }
            }
            
            return absent;
        };
    };
    
    cspace.osteology.finalInit = function(that) {
        that.bindEvents();
    };
    
    cspace.osteology.bindEvents = function(that, recordEditor) {
        recordEditor.events.afterRecordRender.addListener(function() {
            that.initForm();
        }, that.typeName);
    };
    
    cspace.osteology.initForm = function(that) {
        that.form = $("form.csc-osteology-form");
        
        // itemName: {childItemName: true, ...}
        that.children = {};
        
        // itemName: {value: input element, ...}
        that.inputs = {};
        
        // itemName: {value: input element, ...}
        that.aggregatingInputs = {};
        
        that.form.find("input[type='radio']").each(function(index, element) {
            $(element).wrap("<label></label>").after("<span></span>").addClass(function() {
                switch (element.value) {
                    case COMPLETE_VALUE: return COMPLETE_CLASS;
                    case ABSENT_VALUE: return ABSENT_CLASS;
                }
            });
            
            var aggregatesItemName = $(element).data(AGGREGATES_ATTRIBUTE_NAME);
            
            if (aggregatesItemName) {
                if (!(aggregatesItemName in that.aggregatingInputs)) {
                    that.aggregatingInputs[aggregatesItemName] = {};
                }

                that.aggregatingInputs[aggregatesItemName][element.value] = element;
            }

            var itemName = element.name;
            var parentItemName = $(element).data(PARENT_ATTRIBUTE_NAME);

            if (parentItemName) {
                if (!(parentItemName in that.children)) {
                    that.children[parentItemName] = {};
                }
                
                that.children[parentItemName][itemName] = true;
            }
            
            if (!(itemName in that.inputs)) {
                that.inputs[itemName] = {};
            }
            
            that.inputs[itemName][element.value] = element;
        });

        // console.log(that.children);
        // console.log(that.inputs);
        // console.log(that.aggregatingInputs);
        
        // Fill in the form using values from the model.
        
        for (var name in that.model.fields) {
            if (that.isItemName(name)) {
                that.setItemValue(name, that.model.fields[name]);
            }
        }
        
        that.form.change(function(event) {
            var target = event.target;
            var name = target.name;
            var value = target.value;

            that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, name), value);

            if (target.tagName === "INPUT" && target.type === "radio" && target.checked) {
                updateChildren(that, target);
                updateParents(that, target);
            }
        });
    };
    
    var updateChildren = function(that, input) {
        var name = input.name;
        var value = input.value;

        var aggregatesItemName = $(input).data(AGGREGATES_ATTRIBUTE_NAME);

        if (aggregatesItemName) {
            if (value === COMPLETE_VALUE || value === ABSENT_VALUE) {
                for (var childName in that.children[aggregatesItemName]) {
                    that.setItemValue(childName, value);
                    that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, childName), value);
                    
                    updateChildren(that, that.inputs[childName][value]);
                };
            }
        }
    };
    
    var updateParents = function(that, input) {
        var name = input.name;
        var value = input.value;

        var parentName = $(input).data(PARENT_ATTRIBUTE_NAME);

        if (parentName) {
            var aggregatingInputs = that.aggregatingInputs[parentName];
            
            if (aggregatingInputs) {
                var isBinary = 
                    Object.keys(aggregatingInputs).length === 2
                    && (COMPLETE_VALUE in aggregatingInputs)
                    && (ABSENT_VALUE in aggregatingInputs);

                if (isBinary && that.areAllChildrenComplete(parentName)) {
                    aggregatingInputs[COMPLETE_VALUE].checked = true;
                    that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, aggregatingInputs[COMPLETE_VALUE].name), COMPLETE_VALUE);
                    
                    updateParents(that, aggregatingInputs[COMPLETE_VALUE]);
                }
                else if (isBinary && that.areAllChildrenAbsent(parentName)) {
                    aggregatingInputs[ABSENT_VALUE].checked = true;
                    that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, aggregatingInputs[ABSENT_VALUE].name), ABSENT_VALUE);
                    
                    updateParents(that, aggregatingInputs[ABSENT_VALUE]);
                }
                else {
                    aggregatingInputs[COMPLETE_VALUE].checked = false;
                    aggregatingInputs[ABSENT_VALUE].checked = false;
                    that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, aggregatingInputs[ABSENT_VALUE].name), "");
                    
                    updateParents(that, aggregatingInputs[ABSENT_VALUE]);
                }
            }
        }
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.osteology");
})(jQuery, fluid);