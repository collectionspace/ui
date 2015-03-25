(function ($, fluid) {
    var COMPLETE_VALUE = "C";
    var MISSING_VALUE = "0";
    
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
        that.setCompleteValue = function(boneName, value) {
            for (var inputValue in that.completeInputs[boneName]) {
                var input = that.completeInputs[boneName][inputValue];
                input.checked = (inputValue === value);
            }
        };
        
        that.isSegmentName = function(candidateName) {
            return (candidateName in that.segmentInputs);
        };
        
        that.setSegmentValue = function(segmentName, value) {
            console.log(segmentName + "=" + value);
            that.segmentInputs[segmentName][value].checked = true;
        };
        
        that.isComplete = function(boneName) {
            var complete = true;
            
            for (var segmentName in that.segments[boneName]) {
                if (that.model.fields[segmentName] !== COMPLETE_VALUE) {
                    complete = false;
                    break;
                }
            }
            
            return complete;
        };
        
        that.isMissing = function(boneName) {
            var missing = true;
            
            for (var segmentName in that.segments[boneName]) {
                if (that.model.fields[segmentName] !== MISSING_VALUE) {
                    missing = false;
                    break;
                }
            }
            
            return missing;
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
        
        // boneName: {segmentName: true, ...}
        that.segments = {};
        
        // segmentName: {value: input element, ...}
        that.segmentInputs = {};
        
        // boneName: {value: input element, ...}
        that.completeInputs = {};
        
        that.form.find("input[type='radio']").each(function(index, element) {
            $(element).wrap("<label></label>").after("<span></span>").addClass(function() {
                switch (element.value) {
                    case COMPLETE_VALUE: return "complete"
                    case MISSING_VALUE: return "missing"
                }
            });
            
            var boneName = $(element).data("complete");
            
            if (boneName) {
                if (!(boneName in that.completeInputs)) {
                    that.completeInputs[boneName] = {};
                }

                that.completeInputs[boneName][element.value] = element;
            }

            boneName = $(element).data("bone");

            if (boneName) {
                var segmentName = element.name;
                
                if (!(boneName in that.segments)) {
                    that.segments[boneName] = {};
                }
                
                that.segments[boneName][segmentName] = true;
                
                if (!(segmentName in that.segmentInputs)) {
                    that.segmentInputs[segmentName] = {};
                }
                
                that.segmentInputs[segmentName][element.value] = element;
            }
        });

        // console.log(that.segments);
        // console.log(that.segmentInputs);
        // console.log(that.completeInputs);
        
        // Fill in the form using values from the model.
        
        for (var name in that.model.fields) {
            if (name.match(/^(.*?)_complete$/)) {
                var boneName = RegExp.$1;
                
                that.setCompleteValue(boneName, that.model.fields[name]);
            }
            else if (that.isSegmentName(name)) {
                that.setSegmentValue(name, that.model.fields[name]);
            }
        }
        
        that.form.change(function(event) {
            var target = event.target;

            var name = target.name;
            var value = target.value;

            that.applier.requestChange(cspace.util.composeSegments("fields", name), value);

            if (target.tagName === "INPUT" && target.type === "radio" && target.checked) {
                propagateDown(that, target);
                propagateUp(that, target);
            }
        });
    };
    
    var propagateDown = function(that, input) {
        var name = input.name;
        var value = input.value;

        var boneName = $(input).data("complete");

        if (boneName) {
            if (value === COMPLETE_VALUE || value === MISSING_VALUE) {
                for (var segmentName in that.segments[boneName]) {
                    that.setSegmentValue(segmentName, value);
                    that.applier.requestChange(cspace.util.composeSegments("fields", segmentName), value);
                    
                    propagateDown(that, that.segmentInputs[segmentName][value]);
                };
            }
        }
    };
    
    var propagateUp = function(that, input) {
        var name = input.name;
        var value = input.value;

        var boneName = $(input).data("bone");

        if (boneName) {
            var completeInputs = that.completeInputs[boneName];

            if (completeInputs) {
                if (that.isComplete(boneName)) {
                    completeInputs[COMPLETE_VALUE].checked = true;
                    that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs[COMPLETE_VALUE].name), COMPLETE_VALUE);
                    
                    propagateUp(that, completeInputs[COMPLETE_VALUE]);
                }
                else if (that.isMissing(boneName)) {
                    completeInputs[MISSING_VALUE].checked = true;
                    that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs[MISSING_VALUE].name), MISSING_VALUE);
                    
                    propagateUp(that, completeInputs[MISSING_VALUE]);
                }
                else {
                    completeInputs[COMPLETE_VALUE].checked = false;
                    completeInputs[MISSING_VALUE].checked = false;
                    that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs[MISSING_VALUE].name), "");
                    
                    propagateUp(that, completeInputs[MISSING_VALUE]);
                }
            }
        }
    };
    
    var handleRadioCheck = function(that, input) {
        var name = input.name;
        var value = input.value;

        that.applier.requestChange(cspace.util.composeSegments("fields", name), value);

        var boneName = $(input).data("complete");

        if (boneName) {
            if (value === COMPLETE_VALUE || value === MISSING_VALUE) {
                for (var segmentName in that.segments[boneName]) {
                    that.setSegmentValue(segmentName, value);
                    that.applier.requestChange(cspace.util.composeSegments("fields", segmentName), value);
                    
                    handleRadioCheck(that, that.segmentInputs[segmentName][value]);
                };
            }
        }
        else {
            boneName = $(input).data("bone");

            if (boneName) {
                var completeInputs = that.completeInputs[boneName];

                if (completeInputs) {
                    if (that.isComplete(boneName)) {
                        completeInputs[COMPLETE_VALUE].checked = true;
                        that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs[COMPLETE_VALUE].name), COMPLETE_VALUE);
                    }
                    else if (that.isMissing(boneName)) {
                        completeInputs[MISSING_VALUE].checked = true;
                        that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs[MISSING_VALUE].name), MISSING_VALUE);
                    }
                    else {
                        completeInputs[COMPLETE_VALUE].checked = false;
                        completeInputs[MISSING_VALUE].checked = false;
                        that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs[MISSING_VALUE].name), "");
                    }
                }
            }
        }
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.osteology");
})(jQuery, fluid);