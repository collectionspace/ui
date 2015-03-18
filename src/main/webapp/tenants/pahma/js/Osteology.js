(function ($, fluid) {
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
            that.segmentInputs[segmentName][value].checked = true;
        };
        
        that.isComplete = function(boneName) {
            var complete = true;
            
            for (var segmentName in that.segments[boneName]) {
                if (that.model.fields[segmentName] !== "C") {
                    complete = false;
                    break;
                }
            }
            
            return complete;
        };
        
        that.isMissing = function(boneName) {
            var missing = true;
            
            for (var segmentName in that.segments[boneName]) {
                if (that.model.fields[segmentName] !== "0") {
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
            var boneName = $(element).data("complete");
            
            if (boneName) {
                if (!(boneName in that.completeInputs)) {
                    that.completeInputs[boneName] = {};
                }

                that.completeInputs[boneName][element.value] = element;
            }
            else {
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

            if (target.tagName === "INPUT" && target.type === "radio" && target.checked) {
                var name = target.name;
                var value = target.value;

                that.applier.requestChange(cspace.util.composeSegments("fields", name), value);

                var boneName = $(target).data("complete");

                if (boneName) {
                    for (var segmentName in that.segments[boneName]) {
                        that.setSegmentValue(segmentName, value);
                        that.applier.requestChange(cspace.util.composeSegments("fields", segmentName), value);    
                    };
                }
                else {
                    boneName = $(target).data("bone");

                    if (boneName) {
                        var completeInputs = that.completeInputs[boneName];

                        if (completeInputs) {
                            if (that.isComplete(boneName)) {
                                completeInputs["C"].checked = true;
                                that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs["C"].name), "C");
                            }
                            else if (that.isMissing(boneName)) {
                                completeInputs["0"].checked = true;
                                that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs["0"].name), "0");
                            }
                            else {
                                completeInputs["C"].checked = false;
                                completeInputs["0"].checked = false;
                                that.applier.requestChange(cspace.util.composeSegments("fields", completeInputs["0"].name), "");
                            }
                        }
                    }
                }
            }
        });
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.osteology");
})(jQuery, fluid);