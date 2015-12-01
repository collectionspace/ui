(function ($, fluid) {
    fluid.defaults("cspace.osteology", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        selectors: {},
        strings: {},
        parentBundle: "{globalBundle}",
        readOnly: "{recordEditor}.options.readOnly",
        //preInitFunction: "cspace.osteology.preInit",
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
    
    // cspace.osteology.preInit = function(that) {
    //
    // };
    
    cspace.osteology.finalInit = function(that) {
        that.bindEvents();
    };
    
    cspace.osteology.bindEvents = function(that, recordEditor) {
        recordEditor.events.afterRecordRender.addListener(function() {
            that.initForm();
        }, that.typeName);
    };
    
    cspace.osteology.initForm = function(that) {
        $("form.csc-osteology-form").osteoform({
            editable: !that.options.readOnly,
            value: that.model.fields,
            change: function(event, data) {
                that.applier.requestChange(cspace.util.composeSegments("fields", data.fieldName), data.value);
            }
        });
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.osteology");
})(jQuery, fluid);