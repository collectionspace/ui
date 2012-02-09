/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var uispecVerifierTester = function ($) {

    var template = "<div class=\"csc-movement-template csc-listEditor-details\">\
        <div class=\"csc-movement\">\
            <div id=\"secondary-nav\">\
                <div id=\"secondary-nav-menu-sub\">\
                    <div class=\"button-row\">\
                        <a style=\"display:none;\" class=\"csc-goto gotoButton\"></a>\
                        <input type=\"button\" class=\"csc-createFromExisting createFromExistingButton\" />\
                        <input type=\"button\" class=\"csc-cancel cancelButton\" />\
                        <input type=\"button\" class=\"csc-delete deleteButton\" />\
                        <input type=\"button\" class=\"csc-save saveButton\" /></div>\
                    <div class=\"time-stamp\"> </div>\
                </div>\
            </div>\
            <div class=\"csc-templateEditor\"></div>\
            <div class=\"fl-container-flex fl-fix information-group\">\
                <div class=\"csc-recordEditor-header fl-container-flex header toggle csc-movement-locationMovementInformation-label\"></div>\
                <div class=\"csc-recordEditor-togglable fl-container-flex fl-fix content main\">\
                    <div class=\"info-column\">\
                        <div class=\"info-pair\">\
                            <div class=\"header\">\
                                <div class=\"label required csc-movement-currentLocationHeader-label\"></div>\
                            </div>\
                            <div class=\"content\">\
                                <table>\
                                    <thead>\
                                        <tr>\
                                            <td><span class=\"csc-movement-currentLocation-label\"></span><span class=\"required\">*</span></td>\
                                            <td class=\"csc-movement-currentLocationFitness-label\"></td>\
                                            <td class=\"csc-movement-currentLocationNote-label\"></td>\
                                        </tr>\
                                    </thead>\
                                    <tbody>\
                                        <tr>\
                                            <td><input type=\"text\" class=\"csc-movement-currentLocation\" /></td>\
                                            <td><select class=\"csc-movement-currentLocationFitness input-select\"><option value=\"\">Options not loaded</option></select></td>\
                                            <td><input type=\"text\" class=\"csc-movement-currentLocationNote\" /></td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                            </div\
                        </div>\
                    </div>\
                    <div class=\"info-column\">\
                        <div class=\"info-column2-50 fl-force-left\">\
                            <div class=\"info-pair\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-locationDate-label\"></div>\
                                </div>\
                                <div class=\"content\">\
                                    <input type=\"text\" class=\"csc-movement-locationDate\" />\
                                </div>\
                            </div>\
                        </div>\
                        <div class=\"info-column2-50 fl-force-right\">\
                            <div class=\"info-pair\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-normalLocation-label\"></div>\
                                </div>\
                                <div class=\"content\">\
                                    <input type=\"text\" class=\"input-alpha csc-movement-normalLocation\" />\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div> <!-- information-group -->\
            <div class=\"fl-container-flex fl-fix information-group\">\
                <div class=\"csc-recordEditor-header fl-container-flex header toggle csc-movement-movementControlInformation-label\"></div>\
                <div class=\"csc-recordEditor-togglable fl-container-flex fl-fix content main\">\
                    <div class=\"info-column\">\
                        <div class=\"info-column2-50 fl-force-left\">\
                            <div class=\"info-pair\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-movementReferenceNumber-label\"></div>\
                                </div>\
                                <div class=\"content csc-movement-movementReferenceNumber-container\">\
                                    <input type=\"text\" class=\"input-numeric-long csc-movement-movementReferenceNumber pattern-chooser-input\" />\
                                </div>\
                            </div>\
                        </div>\
                        <div class=\"info-column2-50 fl-force-right\">\
                            <div class=\"info-pair\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-movementContact-label\"></div>\
                                </div>\
                                <div class=\"content\">\
                                    <input type=\"text\" class=\"input-alpha csc-movement-movementContact\" />\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class=\"info-column\">\
                        <div class=\"info-column2-50 fl-force-left\">\
                            <div class=\"info-column2-50 fl-force-left\">\
                                <div class=\"info-pair\">\
                                    <div class=\"header\">\
                                        <div class=\"label csc-movement-plannedRemovalDate-label\"></div>\
                                    </div>\
                                    <div class=\"content\">\
                                        <input type=\"text\" class=\"csc-movement-plannedRemovalDate\" />\
                                    </div>\
                                </div>\
                            </div>\
                            <div class=\"info-column2-50 fl-force-right\">\
                                <div class=\"info-pair\">\
                                    <div class=\"header\">\
                                        <div class=\"label csc-movement-removalDate-label\"></div>\
                                    </div>\
                                    <div class=\"content\">\
                                        <input type=\"text\" class=\"csc-movement-removalDate\" />\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class=\"info-column2-50 fl-force-right\">\
                            <div class=\"info-pair-select\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-movementMethods-label\"></div>\
                                </div>\
                                <div class=\"content repeatable\">\
                                    <select class=\"csc-movement-movementMethods input-select\"><option value=\"\">Options not loaded</option></select>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class=\"info-column\">\
                        <div class=\"info-column2-50 fl-force-left\">\
                            <div class=\"info-pair-select\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-reasonForMove-label\"></div>\
                                </div>\
                                <div class=\"content\">\
                                    <select class=\"csc-movement-reasonForMove input-select\"><option value=\"\">Options not loaded</option></select>\
                                </div>\
                            </div>\
                        </div>\
                        <div class=\"info-column2-50 fl-force-right\">\
                            <div class=\"info-pair\">\
                                <div class=\"header\">\
                                    <div class=\"label csc-movement-movementNote-label\"></div>\
                                </div>\
                                <div class=\"content\">\
                                    <textarea rows=\"4\" cols=\"30\" class=\"input-textarea csc-movement-movementNote\"></textarea>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div> <!-- information-group -->\
            <div id=\"secondary-nav-footer\">\
                <div id=\"secondary-nav-menu-sub\">\
                    <div class=\"button-row\">\
                        <a style=\"display:none;\" class=\"csc-goto gotoButton\"></a>\
                        <input type=\"button\" class=\"csc-createFromExisting createFromExistingButton\" />\
                        <input type=\"button\" class=\"csc-cancel cancelButton\" />\
                        <input type=\"button\" class=\"csc-delete deleteButton\" />\
                        <input type=\"button\" class=\"csc-save saveButton\" />\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>";

    var bareUISpecVerifierTest = new jqUnit.TestCase("UISPEC Verifier Tests");
    
    var uispecVerifierTest = cspace.tests.testEnvironment({
        testCase: bareUISpecVerifierTest
    });

    var tearDown = function (messageBar) {
        messageBar.applier.requestChange("", {
            message: "",
            time: undefined
        });
        messageBar.refreshView();
        messageBar.hide();
    };

    uispecVerifierTest.test("Init", function () {
        var uv = cspace.uispecVerifier();
        jqUnit.assertValue("UV is created", uv);
    });

    uispecVerifierTest.test("Simple Match", function () {
        var uv = cspace.uispecVerifier({
            uispec: {
                "recordEditor": {
                    ".csc-movement-movementNote": "${fields.movementNote}",
                    ".csc-movement-currentLocationNote": "${fields.currentLocationNote}"
                }
            },
            template: template
        });
        jqUnit.assertEquals("There should be no message", "", uv.messageBar.locate("message").text());
        tearDown(uv.messageBar);
    });

    uispecVerifierTest.test("Simple No Match", function () {
        var uv = cspace.uispecVerifier({
            uispec: {
                "recordEditor": {
                    ".csc-movement-movementNote": "${fields.movementNote}",
                    ".csc-movement-currentLocationNote": "${fields.currentLocationNote}",
                    ".csc-movement-fieldThatWillNotMatch": "${fields.fieldThatWillNotMatch}"
                }
            },
            template: template
        });
        jqUnit.assertEquals("Message should say", "The following keys are missing in the template: .csc-movement-fieldThatWillNotMatch", uv.messageBar.locate("message").text());
        tearDown(uv.messageBar);
    });

    uispecVerifierTest.test("Complicated Match", function () {
        var uv = cspace.uispecVerifier({
            uispec: {
                "recordEditor": {
                    ".csc-movement-movementReferenceNumber-container": {
                        "decorators": [
                            {
                                "func": "cspace.numberPatternChooser",
                                "type": "fluid",
                                "options": {
                                    "model": {
                                        "names": [
                                            "Movement"
                                        ],
                                        "list": [
                                            "movement"
                                        ],
                                        "samples": [
                                            "MV2010.001"
                                        ]
                                    },
                                    "selectors": {
                                        "numberField": ".csc-movement-movementReferenceNumber"
                                    }
                                }
                            }
                        ]
                    },
                    ".csc-movement-movementReferenceNumber-label": {
                        "messagekey": "movement-movementReferenceNumberLabel"
                    },
                    ".csc-movement-plannedRemovalDate": {
                        "decorators": [
                            {
                                "func": "cspace.datePicker",
                                "type": "fluid"
                            }
                        ],
                        "value": "${fields.plannedRemovalDate}"
                    },
                    ".csc-movement-movementContact": {
                        "decorators": [
                            {
                                "func": "cspace.autocomplete",
                                "type": "fluid",
                                "options": {
                                    "queryUrl": "../../../tenant/core/movement/autocomplete/movementContact",
                                    "vocabUrl": "../../../tenant/core/movement/source-vocab/movementContact"
                                }
                            }
                        ],
                        "value": "${fields.movementContact}"
                    },
                    ".csc-movement-movementMethods": {
                        "decorators": [
                            {
                                "func": "cspace.makeRepeatable",
                                "type": "fluid",
                                "options": {
                                    "repeatTree": {
                                        "expander": {
                                            "tree": {
                                                ".csc-movement-movementMethods": {
                                                    "default": "",
                                                    "optionnames": [
                                                        "Please select a value",
                                                        "Forklift",
                                                        "Handcarried",
                                                        "Trolley"
                                                    ],
                                                    "optionlist": [
                                                        "",
                                                        "forklift",
                                                        "handcarried",
                                                        "trolley"
                                                    ],
                                                    "selection": "${{row}.movementMethod}"
                                                }
                                            },
                                            "type": "fluid.noexpand"
                                        }
                                    },
                                    "elPath": "fields.movementMethods"
                                }
                            }
                        ]
                    },
                    expander: {
                        tree: {
                            ".csc-movement-movementMethods": "quickTest"
                        }
                    }
                }
            },
            template: template
        });
        jqUnit.assertEquals("There should be no message", "", uv.messageBar.locate("message").text());
        tearDown(uv.messageBar);
    });

    uispecVerifierTest.test("Complicated NO Match", function () {
        var uv = cspace.uispecVerifier({
            uispec: {
                "recordEditor": {
                    ".csc-movement-movementReferenceNumber-container-NO": {
                        "decorators": [
                            {
                                "func": "cspace.numberPatternChooser",
                                "type": "fluid",
                                "options": {
                                    "model": {
                                        "names": [
                                            "Movement"
                                        ],
                                        "list": [
                                            "movement"
                                        ],
                                        "samples": [
                                            "MV2010.001"
                                        ]
                                    },
                                    "selectors": {
                                        "numberField": ".csc-movement-movementReferenceNumber"
                                    }
                                }
                            }
                        ]
                    },
                    ".csc-movement-movementReferenceNumber-label-NO": {
                        "messagekey": "movement-movementReferenceNumberLabel"
                    },
                    ".csc-movement-plannedRemovalDate-NO": {
                        "decorators": [
                            {
                                "func": "cspace.datePicker",
                                "type": "fluid"
                            }
                        ],
                        "value": "${fields.plannedRemovalDate}"
                    },
                    ".csc-movement-movementContact-NO": {
                        "decorators": [
                            {
                                "func": "cspace.autocomplete",
                                "type": "fluid",
                                "options": {
                                    "queryUrl": "../../../tenant/core/movement/autocomplete/movementContact",
                                    "vocabUrl": "../../../tenant/core/movement/source-vocab/movementContact"
                                }
                            }
                        ],
                        "value": "${fields.movementContact}"
                    },
                    ".csc-movement-movementMethods-NO": {
                        "decorators": [
                            {
                                "func": "cspace.makeRepeatable",
                                "type": "fluid",
                                "options": {
                                    "repeatTree": {
                                        "expander": {
                                            "tree": {
                                                ".csc-movement-movementMethods-NO": {
                                                    "default": "",
                                                    "optionnames": [
                                                        "Please select a value",
                                                        "Forklift",
                                                        "Handcarried",
                                                        "Trolley"
                                                    ],
                                                    "optionlist": [
                                                        "",
                                                        "forklift",
                                                        "handcarried",
                                                        "trolley"
                                                    ],
                                                    "selection": "${{row}.movementMethod}"
                                                }
                                            },
                                            "type": "fluid.noexpand"
                                        }
                                    },
                                    "elPath": "fields.movementMethods"
                                }
                            }
                        ]
                    },
                    expander: {
                        tree: {
                            ".csc-movement-movementMethods-NO": "quickTest"
                        }
                    }
                }
            },
            template: template
        });
        jqUnit.assertEquals("Message should say", "The following keys are missing in the template: " +
                ".csc-movement-movementReferenceNumber-container-NO, " +
                ".csc-movement-movementReferenceNumber-label-NO, " +
                ".csc-movement-plannedRemovalDate-NO, " +
                ".csc-movement-movementContact-NO, " +
                ".csc-movement-movementMethods-NO, " +
                ".csc-movement-movementMethods-NO, " +
                ".csc-movement-movementMethods-NO", uv.messageBar.locate("message").text());
        tearDown(uv.messageBar);
    });
};

(function () {
    uispecVerifierTester(jQuery);
}());