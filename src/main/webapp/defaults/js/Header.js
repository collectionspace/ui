/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.header", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        mergePolicy: {
            model: "preserve",
            schema: "nomerge",
            permissions: "nomerge"
        },
        components: {
            searchBox: {
                type: "cspace.searchBox",
                options: {
                    related: ["allCategory", "cataloging", "procedures", "vocabularies"]
                }
            }
        },
        produceTree: "cspace.header.produceTree",
        selectorsToIgnore: ["searchBox" ],
        parentBundle: "{globalBundle}",
        model: {
            menuitems: [
            {
                messagekey: "menuItems-myCollectionSpace",
                href: "myCollectionSpace.html"
            },
            {
                messagekey: "menuItems-createNew",
                href: "createnew.html",
                hide: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.modelBuilder",
                        args: {
                            related: "all",
                            resolver: "{permissionsResolver}",
                            recordTypeManager: "{recordTypeManager}",
                            permission: "create",
                            callback: "cspace.header.buildCreateNewModel"
                        }
                    }
                }
            },
            {
                messagekey: "menuItems-findEdit",
                href: "findedit.html"
            },
            {
                messagekey: "menuItems-administration",
                href: "administration.html",
                hide: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.modelBuilder",
                        args: {
                            related: "administration",
                            resolver: "{permissionsResolver}",
                            recordTypeManager: "{recordTypeManager}",
                            permission: "list",
                            callback: "cspace.header.buildCreateNewModel"
                        }
                    }
                }
            }

            ]
        },
        selectors: {
            //menu-item div box
            menuItem: ".csc-header-menu-item",
            label: ".csc-header-link",
            //other
            searchBox: ".csc-header-searchBox",
            logout: ".csc-header-logout",
            user: ".csc-header-user",
            userName: ".csc-header-userName",
            logoutForm: ".csc-header-logout-form"
        },
        repeatingSelectors: ["menuItem"],
        invokers: {
            refreshComponents: {
                funcName: "cspace.util.refreshComponents",
                args: "{header}"
            }
        },
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate",
                        url: "%webapp/html/components/header.html",
                        options: {
                            dataType: "html"
                        }
                    }
                }
            }
        },
        urls: cspace.componentUrlBuilder({
            logoutUrl: "%tenant/%tname/logout"
        }),
        login: "{userLogin}",
        strings: {},
        postInitFunction: "cspace.header.postInit",
        finalInitFunction: "cspace.header.finalInit"
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.header");
    
    cspace.header.postInit = function (that) {
        that.refreshView();
    };
    
    cspace.header.finalInit = function (that) {
        that.refreshComponents();
    };

    /*
 * Used for conditional expander in tree. Called on each of the menu items. 
 * If args.hide is true, the menu item is hidden.
 * @param hide boolean that is === true if we need to hide the tab.
 * @return true if the item should be _displayed_
 */
    cspace.header.assertMenuItemDisplay = function(hide) {
        return !hide;
    };

    /**
 * Callback used for the create new part of the model. The records argument will contain
 * the records that the user has create permission to. If this is empty, the user cannot
 * create any records, and hence the Create New menu item should be hidden. This is taken care
 * by returning true - which will be passed to the conditional expanders args.hide variable.
 * @param options
 * @param records records argument will contain the records that the user has create permission to
 * @return whether create new menu item should be hidden. If user does not have create permission
 * to any records, true is returned, meaning menu item should be hidden.
 */
    cspace.header.buildCreateNewModel = function(options, records) {
        return (!records || records.length < 1); //return true if we want to hide
    };

    // A public function that is called as createNew's treeBuilder method and builds a component tree.
    cspace.header.produceTree = function (that) {
        var tree = {
            logout: {
                messagekey: "header-logout"
            },
            user: {
                messagekey: "header-greeting"
            },
            userName: {
                messagekey: "header-userName",
                args: [that.options.login.options.screenName]
            },
            logoutForm: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        action: that.options.urls.logoutUrl
                    }
                }
            },
            expander: {
                repeatID: "menuItem",
                type: "fluid.renderer.repeat",
                pathAs: "item",
                valueAs: "itemName",
                controlledBy: "menuitems",
                tree: { //check whether to display the menu items by calling assertMenuItemDisplay with the hide variable
                    expander: {
                        type: "fluid.renderer.condition",
                        condition: {
                            funcName: "cspace.header.assertMenuItemDisplay",
                            args: "${{itemName}.hide}"
                        },
                        trueTree: {
                            label: {
                                target: "${{item}.href}",
                                linktext: {
                                    messagekey: "${{item}.messagekey}"
                                }
                            }
                        }
                    }
                }
            }
        };
        return tree;
    };
    
})(jQuery, fluid);