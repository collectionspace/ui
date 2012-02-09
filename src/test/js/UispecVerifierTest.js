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
    });
};

(function () {
    uispecVerifierTester(jQuery);
}());