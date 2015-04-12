(function ($, fluid) {
    var BASE_EL_PATH = "fields";
    var COMPLETE_CLASS = "complete";
    var COMPLETE_VALUE = "C";
    var ABSENT_CLASS = "absent";
    var ABSENT_VALUE = "0";
    
    var relations = {
        Cranium: {
            children: [
                "Frontal_L", "Frontal_R",
                "Occipital",
                "Sphenoid",
                "Vomer",
                "Ethmoid",
                "Parietal_L", "Parietal_R",
                "Temporal_L", "Temporal_R",
                "Maxilla_L", "Maxilla_R",
                "Nasal_L", "Nasal_R",
                "Zygomatic_L", "Zygomatic_R",
                "Lacrimal_L", "Lacrimal_R",
                "Palatine_L", "Palatine_R",
                "Mandible_L", "Mandible_R",
                "Orbit_L", "Orbit_R"
            ],
            computedFrom: [
                "Frontal_L", "Frontal_R",
                "Occipital",
                "Sphenoid",
                "Vomer",
                "Ethmoid",
                "Parietal_L", "Parietal_R",
                "Temporal_L", "Temporal_R",
                "Maxilla_L", "Maxilla_R",
                "Nasal_L", "Nasal_R",
                "Zygomatic_L", "Zygomatic_R",
                "Lacrimal_L", "Lacrimal_R",
                "Palatine_L", "Palatine_R",
                "Mandible_L", "Mandible_R",
                "Orbit_L", "Orbit_R"
            ]
        },
        Occipital: {
            children: [
                'Occipital_pars_basilaris',
                'Occipital_L_pars_lateralis',
                'Occipital_R_pars_lateralis'
            ],
            computedFrom: [
                'Occipital_pars_basilaris',
                'Occipital_L_pars_lateralis',
                'Occipital_R_pars_lateralis',
                '__other__'
            ]
        },
        
        //
        
        Humerus_L_complete: {
            children: [
                "Humerus_L_JS_P",
                "Humerus_L_shaft_P",
                "Humerus_L_shaft_M",
                "Humerus_L_shaft_D",
                "Humerus_L_JS_D"
            ],
            computedFrom: [
                "Humerus_L_JS_P",
                "Humerus_L_shaft_P",
                "Humerus_L_shaft_M",
                "Humerus_L_shaft_D",
                "Humerus_L_JS_D"
            ]
        },
        Humerus_R_complete: {
            children: [
                "Humerus_R_JS_P",
                "Humerus_R_shaft_P",
                "Humerus_R_shaft_M",
                "Humerus_R_shaft_D",
                "Humerus_R_JS_D"
            ],
            computedFrom: [
                "Humerus_R_JS_P",
                "Humerus_R_shaft_P",
                "Humerus_R_shaft_M",
                "Humerus_R_shaft_D",
                "Humerus_R_JS_D"
            ]
        },
        Radius_L_complete: {
            children: [
                "Radius_L_JS_P",
                "Radius_L_shaft_P",
                "Radius_L_shaft_M",
                "Radius_L_shaft_D",
                "Radius_L_JS_D"
            ],
            computedFrom: [
                "Radius_L_JS_P",
                "Radius_L_shaft_P",
                "Radius_L_shaft_M",
                "Radius_L_shaft_D",
                "Radius_L_JS_D"
            ]
        },
        Radius_R_complete: {
            children: [
                "Radius_R_JS_P",
                "Radius_R_shaft_P",
                "Radius_R_shaft_M",
                "Radius_R_shaft_D",
                "Radius_R_JS_D"
            ],
            computedFrom: [
                "Radius_R_JS_P",
                "Radius_R_shaft_P",
                "Radius_R_shaft_M",
                "Radius_R_shaft_D",
                "Radius_R_JS_D"
            ]
        },
        Ulna_L_complete: {
            children: [
                "Ulna_L_JS_P",
                "Ulna_L_shaft_P",
                "Ulna_L_shaft_M",
                "Ulna_L_shaft_D",
                "Ulna_L_JS_D"
            ],
            computedFrom: [
                "Ulna_L_JS_P",
                "Ulna_L_shaft_P",
                "Ulna_L_shaft_M",
                "Ulna_L_shaft_D",
                "Ulna_L_JS_D"
            ]
        },
        Ulna_R_complete: {
            children: [
                "Ulna_R_JS_P",
                "Ulna_R_shaft_P",
                "Ulna_R_shaft_M",
                "Ulna_R_shaft_D",
                "Ulna_R_JS_D"
            ],
            computedFrom: [
                "Ulna_R_JS_P",
                "Ulna_R_shaft_P",
                "Ulna_R_shaft_M",
                "Ulna_R_shaft_D",
                "Ulna_R_JS_D"
            ]
        },
       
        //
        
        Femur_L_complete: {
            children: [
                "Femur_L_JS_P",
                "Femur_L_shaft_P",
                "Femur_L_shaft_M",
                "Femur_L_shaft_D",
                "Femur_L_JS_D"
            ],
            computedFrom: [
                "Femur_L_JS_P",
                "Femur_L_shaft_P",
                "Femur_L_shaft_M",
                "Femur_L_shaft_D",
                "Femur_L_JS_D"
            ]
        },
        Femur_R_complete: {
            children: [
                "Femur_R_JS_P",
                "Femur_R_shaft_P",
                "Femur_R_shaft_M",
                "Femur_R_shaft_D",
                "Femur_R_JS_D"
            ],
            computedFrom: [
                "Femur_R_JS_P",
                "Femur_R_shaft_P",
                "Femur_R_shaft_M",
                "Femur_R_shaft_D",
                "Femur_R_JS_D"
            ]
        },
        Tibia_L_complete: {
            children: [
                "Tibia_L_JS_P",
                "Tibia_L_shaft_P",
                "Tibia_L_shaft_M",
                "Tibia_L_shaft_D",
                "Tibia_L_JS_D"
            ],
            computedFrom: [
                "Tibia_L_JS_P",
                "Tibia_L_shaft_P",
                "Tibia_L_shaft_M",
                "Tibia_L_shaft_D",
                "Tibia_L_JS_D"
            ]
        },
        Tibia_R_complete: {
            children: [
                "Tibia_R_JS_P",
                "Tibia_R_shaft_P",
                "Tibia_R_shaft_M",
                "Tibia_R_shaft_D",
                "Tibia_R_JS_D"
            ],
            computedFrom: [
                "Tibia_R_JS_P",
                "Tibia_R_shaft_P",
                "Tibia_R_shaft_M",
                "Tibia_R_shaft_D",
                "Tibia_R_JS_D"
            ]
        },
        Fibula_L_complete: {
            children: [
                "Fibula_L_JS_P",
                "Fibula_L_shaft_P",
                "Fibula_L_shaft_M",
                "Fibula_L_shaft_D",
                "Fibula_L_JS_D"
            ],
            computedFrom: [
                "Fibula_L_JS_P",
                "Fibula_L_shaft_P",
                "Fibula_L_shaft_M",
                "Fibula_L_shaft_D",
                "Fibula_L_JS_D"
            ]
        },
        Fibula_R_complete: {
            children: [
                "Fibula_R_JS_P",
                "Fibula_R_shaft_P",
                "Fibula_R_shaft_M",
                "Fibula_R_shaft_D",
                "Fibula_R_JS_D"
            ],
            computedFrom: [
                "Fibula_R_JS_P",
                "Fibula_R_shaft_P",
                "Fibula_R_shaft_M",
                "Fibula_R_shaft_D",
                "Fibula_R_JS_D"
            ]
        },
       
        //
        
        Os_coxae_L: {
            children: [
                "Ischium_L",
                "Ilium_L",
                "Pubis_L",
                "Acetabulum_L",
                "Auricular_surf_L"
            ],
            computedFrom: [
                "Ischium_L",
                "Ilium_L",
                "Pubis_L",
            ]
        },
        Os_coxae_R: {
            children: [
                "Ischium_R",
                "Ilium_R",
                "Pubis_R",
                "Acetabulum_R",
                "Auricular_surf_R"
            ],
            computedFrom: [
                "Ischium_R",
                "Ilium_R",
                "Pubis_R"
            ]
        },
        Scapula_L: {
            children: [
                'Glenoid_L'
            ],
            computedFrom: [
                'Glenoid_L',
                '__other__'
            ]
        },
        Scapula_R: {
            children: [
                'Glenoid_R'
            ],
            computedFrom: [
                'Glenoid_R',
                '__other__'
            ]
        },
        Sternum: {
            children: [
                'Manubrium'
            ],
            computedFrom: [
                'Manubrium',
                '__other__'
            ]
        }
    };
    
    var parents = {}
    
    for (var parentName in relations) {
        var children = relations[parentName].children;
        
        if (children) {
            for (var i=0; i<children.length; i++) {
                var childName = children[i];
                
                parents[childName] = parentName;
            }
        }
    }
    
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
        that.setFieldValue = function(fieldName, value) {
            if (fieldName in that.inputs) {
                var input = that.inputs[fieldName][value];
            
                if (input) {
                    input.checked = true;
                }
                else {
                    var inputs = that.inputs[fieldName];
                
                    for(var value in inputs) {
                        inputs[value].checked = false;
                    }
                }
            }
        };
        
        that.computeValue = function(fieldName) {
            var value = that.model.fields[fieldName];
            
            if (fieldName in relations) {
                var computedFromFields = relations[fieldName].computedFrom;
                
                if (computedFromFields && computedFromFields.length > 0) {
                    if (that.allFieldsHaveValue(computedFromFields, COMPLETE_VALUE)) {
                        value = COMPLETE_VALUE;
                    }
                    else if (that.allFieldsHaveValue(computedFromFields, ABSENT_VALUE)) {
                        value = ABSENT_VALUE;
                    }
                    else if (value == COMPLETE_VALUE || value == ABSENT_VALUE) {
                        value = "";
                    }
                }
            }
            
            return value;
        };
        
        that.allFieldsHaveValue = function(fields, value) {
            var result = true;
        
            for (var i=0; i<fields.length; i++) {
                var name = fields[i];

                if (that.model.fields[name] !== value) {
                    result = false;
                    break;
                }
            }
    
            return result;
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
        
        // name: {value: input element, ...}
        that.inputs = {};
        
        that.form.find("input[type='radio']").each(function(index, element) {
            $(element).wrap("<label></label>").after("<span></span>").addClass(function() {
                switch (element.value) {
                    case COMPLETE_VALUE: return COMPLETE_CLASS;
                    case ABSENT_VALUE: return ABSENT_CLASS;
                }
            });
            
            var inputName = element.name;
            
            if (!(inputName in that.inputs)) {
                that.inputs[inputName] = {};
            }
            
            that.inputs[inputName][element.value] = element;
        });

        // console.log(that.inputs);
        
        // Fill in the form using values from the model.
        
        for (var name in that.model.fields) {
            that.setFieldValue(name, that.model.fields[name]);
        }
        
        that.form.change(function(event) {
            var target = event.target;
            var name = target.name;
            var value = target.value;

            that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, name), value);

            if (target.tagName === "INPUT" && target.type === "radio") {
                updateParents(that, name);
                
                if (value === COMPLETE_VALUE || value === ABSENT_VALUE) {
                    updateChildren(that, name, value);
                    updateParents(that, name);
                }
            }
        });
    };
    
    var updateChildren = function(that, name, value) {
        if (name in relations) {
            var children = relations[name].children;

            if (children && children.length > 0) {
                for (var i=0; i<children.length; i++) {
                    var childName = children[i];
                
                    that.setFieldValue(childName, value);
                    that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, childName), value);
                
                    updateChildren(that, childName, value);
                };
            }
        }
    };
    
    var updateParents = function(that, name) {
        if (name in parents) {
            var parentName = parents[name];
            
            if (parentName) {
                var value = that.computeValue(parentName);
                
                that.setFieldValue(parentName, value);
                that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, parentName), value);
             
                updateParents(that, parentName);
            }
        }
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.osteology");
})(jQuery, fluid);