/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jqUnit, jQuery, start, stop, expect*/
"use strict";

cspace = cspace || {};

(function ($) {
    /*
     * Utility to call qUnit's start() only once all tests have executed
     */
    var done; 
    var startIfDone = function (numTests) {
        if (++done === numTests) {
            done = 0;
            start();
        }
    };

    cspace.testData = cspace.testData || {};

    var testPageSpec = {
        recordEditor: {
            href: "test-data/template1.html",
            templateSelector: "#template1mainNode",
            targetSelector: "#insertTemplate1here"
        },
        sidebar: {
            href: "test-data/template2.html",
            templateSelector: "#template2mainNode",
            targetSelector: "#insertTemplate2here"
        }
    };

    var pageBuilderTester = function () {
        
        var pageBuilderTest = new jqUnit.TestCase("PageBuilder Tests", function () {
            cspace.util.isTest = true;
        });
        
        var basicTestListeners = {
            pageReady: function () {
                start();
            }
        };
        
        var testIOCoptionsPBIO = {
            listeners: basicTestListeners,
        };
        var testIOCoptionsPB = {
            selectors: {
                recordEditor: "#recordEditorContainer",
                relatedRecords: "#linksContainer"
            },
            components: {
                recordEditor: {
                    type: "cspace.testComponent2"
                },
                relatedRecords: {
                    type: "cspace.testComponent3"
                }
            },
            userLogin: cspace.tests.userLogin,
            option1: "bar", 
            option2: "cat"
        };
        
        var optionsWithComponentsWithOptions = {
            pageBuilder: {
                options: {
                    selectors: {
                        recordEditor: "#recordEditorContainer",
                        relatedRecords: "#linksContainer"
                    },
                    components: {
                        recordEditor: {
                            type: "cspace.testComponent4",
                            options: {
                                foo: "bar",
                                bat: "cat"
                            }
                        },
                        relatedRecords: {
                            type: "cspace.testComponent5",
                            options: {
                                foo: {
                                    bar: "bat",
                                    cat: "CATT"
                                }
                            }
                        }
                    },
                    userLogin: cspace.tests.userLogin,
                }
            },
            pageBuilderIO: {
                options: {
                    listeners: basicTestListeners
                }
            }
        };
        
        var optionsWithComponentsWithIOCdemands = {
            pageBuilder: {
                options: {
                    selectors: {
                        recordEditor: "#recordEditorContainer"
                    },
                    components: {
                        recordEditor: {
                            type: "cspace.testComponent6",
                            options: {
                                foo: "{pageBuilder}.options.option1",
                                bat: "{pageBuilder}.options.option2",
                                options: {
                                    foobarSubcomponent: "{pageBuilder}.options.option1"
                                }
                            }
                        }
                    },
                    userLogin: cspace.tests.userLogin,
                    option1: "September",
                    option2: "Toronto"
                }
            },
            pageBuilderIO: {
                options: {
                    listeners: basicTestListeners
                }
            }
        };
        
        var optionsWithComponentsWithAdditionalParameters = {
            pageBuilder: {
                options: {
                    userLogin: cspace.tests.userLogin,
                    selectors: {
                        recordEditor: "#recordEditorContainer"
                    },
                    components: {
                        recordEditor: {
                            type: "cspace.testComponent7",
                            options: {
                                option1: "Danny Kaye"
                            }
                        }
                    }
                }
            },
            pageBuilderIO: {
                options: {
                    listeners: basicTestListeners
                }
            }
        };
        
        var optionsWithComponentsWithDemandInParameters = {
            pageBuilder: {
                options: {
                    userLogin: cspace.tests.userLogin,
                    selectors: {
                        recordEditor: "#recordEditorContainer"
                    },
                    components: {
                        recordEditor: {
                            type: "cspace.testComponent8",
                            options: {
                                option1: "Danny Kaye"
                            }
                        }
                    },
                    pbOpt: "Jacob"
                }
            },
            pageBuilderIO: {
                options: {
                    listeners: basicTestListeners
                }
            }
        };
        
        cspace.testComponent1 = function (container, options) {
            var body = $("body");
            jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
            jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
            jqUnit.assertEquals("Rest of doc wasn't inserted", 0, $("#shouldntbehere", body).length);
            start();
        };
        
        fluid.defaults("cspace.testComponent2", {
            gradeNames: ["fluid.viewComponent"]
        });
        cspace.testComponent2 = function (container, options) {
            var that = fluid.initView("cspace.testComponent2", container, options);
            jqUnit.assertTrue("testComponent2 instantiated", true);
            jqUnit.assertEquals("testComponent2 initiated with correct container", "recordEditorContainer", that.container.attr("id"));
        };
        
        fluid.defaults("cspace.testComponent3", {
            gradeNames: ["fluid.viewComponent"]
        });
        cspace.testComponent3 = function (container, options) {
            var that = fluid.initView("cspace.testComponent3", container, options);
            jqUnit.assertTrue("testComponent3 instantiated", true);
            jqUnit.assertEquals("testComponent3 initiated with correct container", "linksContainer", that.container.attr("id"));
        };
        
        fluid.defaults("cspace.testComponent4", {
            gradeNames: ["fluid.viewComponent"]
        });
        cspace.testComponent4 = function (container, options) {
            var that = fluid.initView("cspace.testComponent4", container, options);
            jqUnit.assertTrue("TestComponent4 instantiated", true);
            jqUnit.assertEquals("TestComponent4 initiated with correct container", "recordEditorContainer", that.container.attr("id"));
            var options = optionsWithComponentsWithOptions.pageBuilder.options.components.recordEditor.options;
            jqUnit.assertDeepEq("TestComponent4 initiated with correct options", options.foo, that.options.foo);
            jqUnit.assertDeepEq("TestComponent4 initiated with correct options", options.bat, that.options.bat);
        };
        
        fluid.defaults("cspace.testComponent5", {
            gradeNames: ["fluid.viewComponent"]
        });
        cspace.testComponent5 = function (container, options) {
            var that = fluid.initView("cspace.testComponent5", container, options);
            jqUnit.assertTrue("TestComponent5 instantiated", true);
            jqUnit.assertEquals("TestComponent5 initiated with correct container", "linksContainer", that.container.attr("id"));
            var options = optionsWithComponentsWithOptions.pageBuilder.options.components.relatedRecords.options;
            jqUnit.assertDeepEq("TestComponent4 initiated with correct options", options.bar, that.options.bar);
            jqUnit.assertDeepEq("TestComponent4 initiated with correct options", options.cat, that.options.cat);
        };
        
        cspace.testComponent6 = function (container, options) {
            jqUnit.assertTrue("testComponent6 instantiated", true);
            var that = fluid.initLittleComponent("cspace.testComponent6", options);
            jqUnit.assertEquals("testComponent6 initiated with correct container", optionsWithComponentsWithIOCdemands.pageBuilder.options.selectors.recordEditor, container);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option1", "September", that.options.foo);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option2", "Toronto", that.options.bat);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option1 for subcomponent", "September", that.options.options.foobarSubcomponent);
        };
        
        cspace.testComponent7 = function (container, stringParam, options) {
            jqUnit.assertTrue("testComponent7 instantiated", true);
            var that = fluid.initLittleComponent("cspace.testComponent6", options);
            jqUnit.assertEquals("testComponent7 initiated with correct container", optionsWithComponentsWithAdditionalParameters.pageBuilder.options.selectors.recordEditor, container);
            jqUnit.assertDeepEq("testComponent7 initiated with correct extra parameter", "extraParameter", stringParam);
            jqUnit.assertDeepEq("testComponent7 initiated with correct option", "Danny Kaye", that.options.option1);
        };
        
        cspace.testComponent8 = function (container, nameParam, options) {
            jqUnit.assertTrue("testComponent8 instantiated", true);
            var that = fluid.initLittleComponent("cspace.testComponent6", options);
            jqUnit.assertEquals("testComponent8 initiated with correct container", optionsWithComponentsWithDemandInParameters.pageBuilder.options.selectors.recordEditor, container);
            jqUnit.assertDeepEq("testComponent8 initiated with correct extra parameter demanded from PageBuilder", "Jacob", nameParam);
            jqUnit.assertDeepEq("testComponent8 initiated with correct option", "Danny Kaye", that.options.option1);
        };
            
        pageBuilderTest.asyncTest("Assembly of HTML only", function () {
            var pageBuilderIOOpts = {
                pageSpec: testPageSpec,
                listeners: {
                    pageReady: function () {
                        var body = $("body");
                        jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
                        jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
                        jqUnit.assertEquals("Rest of doc wasn't inserted", 0, $("#shouldntbehere", body).length);
                        $("#testText1").remove();
                        $("#testText2").remove();
                        start();
                    }
                }
            };
            var pbIO = cspace.pageBuilderIO(pageBuilderIOOpts);
            done = 0;
            pbIO.initPageBuilder({
                htmlOnly: true,
                userLogin: cspace.tests.userLogin
            });
        });

        pageBuilderTest.asyncTest("Assembly of HTML", function () {
            expect(3);
            
            fluid.demands("recordEditor", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
            
            var pageBuilderIOOpts = {
                pageSpec: testPageSpec
            };
            var pbIO = cspace.pageBuilderIO(pageBuilderIOOpts);
            var pageBuilderOpts = {
                selectors: {
                    recordEditor: "#recordEditorContainer"
                },
                components: {
                    recordEditor: {
                        type: "cspace.testComponent1"
                    }
                },
                userLogin: cspace.tests.userLogin
            };
            done = 0;
            pbIO.initPageBuilder(pageBuilderOpts);
        });

    
        pageBuilderTest.asyncTest("Invocation of dependent components: container parameter", function () {
            expect(4);    // this is total num of assertions in the test components
            fluid.demands("recordEditor", "cspace.pageBuilder", {
                container: "{pageBuilder}.options.selectors.recordEditor"
            });
            fluid.demands("relatedRecords", "cspace.pageBuilder", {
                container: "{pageBuilder}.options.selectors.relatedRecords"
            });
            var pbIO = cspace.pageBuilderIO(testIOCoptionsPBIO);
            pbIO.initPageBuilder(testIOCoptionsPB);
        });
    
        pageBuilderTest.asyncTest("Invocation of dependent components: container plus options only", function () {
            expect(8);
            fluid.demands("recordEditor", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
            fluid.demands("relatedRecords", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.relatedRecords", fluid.COMPONENT_OPTIONS]);
            var pbIO = cspace.pageBuilderIO(optionsWithComponentsWithOptions.pageBuilderIO.options);
            pbIO.initPageBuilder(optionsWithComponentsWithOptions.pageBuilder.options);
        });
        
        pageBuilderTest.asyncTest("Invocation of dependent components: mini IOC", function () {
            expect(5);
            fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.test1");
            fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.test1"], 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
            var pbIO = cspace.pageBuilderIO(optionsWithComponentsWithIOCdemands.pageBuilderIO.options);
            pbIO.initPageBuilder(optionsWithComponentsWithIOCdemands.pageBuilder.options);
        });
        
        pageBuilderTest.asyncTest("Invocation of dependent components: additional parameters to components", function () {
            expect(4);
            fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.test2");
            fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.test2"], 
                ["{pageBuilder}.options.selectors.recordEditor", "extraParameter", fluid.COMPONENT_OPTIONS]);
            var pbIO = cspace.pageBuilderIO(optionsWithComponentsWithAdditionalParameters.pageBuilderIO.options);
            pbIO.initPageBuilder(optionsWithComponentsWithAdditionalParameters.pageBuilder.options);
        });
        
        pageBuilderTest.asyncTest("Invocation of dependent components: IOC in additional parameters", function () {
            expect(4);
            fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.test3");
            fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.test3"], 
                ["{pageBuilder}.options.selectors.recordEditor", "{pageBuilder}.options.pbOpt", fluid.COMPONENT_OPTIONS]);
            var pbIO = cspace.pageBuilderIO(optionsWithComponentsWithDemandInParameters.pageBuilderIO.options);
            pbIO.initPageBuilder(optionsWithComponentsWithDemandInParameters.pageBuilder.options);
        });
        
        pageBuilderTest.test("cspace.composite.compose", function () {
            var resourceSpec = {
                test1: {
                    href: "../../chain/test/test1",
                    options: {
                        type: "GET",
                        dataType: "json"
                    }
                },
                test2: {
                    href: "../../chain/test/test2",
                    options: {
                        type: "GET",
                        dataType: "json"
                    }
                },
                test3: {
                    href: "../../chain/test/test3",
                    options: {
                        type: "GET",
                        dataType: "json"
                    }
                }
            };
            var expected = {
                composite: {
                    href: "../../chain/composite",
                    options: {
                        type: "POST",
                        dataType: "json",
                        data: "{\"test1\":{\"path\":\"/test/test1\",\"method\":\"GET\",\"dataType\":\"json\"},\"test3\":{\"path\":\"/test/test3\",\"method\":\"GET\",\"dataType\":\"json\"}}"
                    }
                },
                test2: {
                    href: "../../chain/test/test2",
                    options: {
                        type: "GET",
                        dataType: "json"
                    }
                },
            };
            var result = cspace.composite.compose(fluid.model.transformWithRules, ["test1", "test3"], {
                composite: "../../chain/composite",
                prefix: "../../chain"
            }, resourceSpec);
            jqUnit.assertDeepEq("Test2 should stay", expected.test2, result.test2);
            jqUnit.assertEquals("Composite href is now", expected.composite.href, result.composite.href);
            jqUnit.assertEquals("Composite type is now", expected.composite.options.type, result.composite.options.type);
            jqUnit.assertEquals("Composite dataType is now", expected.composite.options.dataType, result.composite.options.dataType);
            jqUnit.assertEquals("Composite data is now", expected.composite.options.data, result.composite.options.data);
        });
    };
    
    $(document).ready(function () {
        pageBuilderTester();
    });

})(jQuery);
    

