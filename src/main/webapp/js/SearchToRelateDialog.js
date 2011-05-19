/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("SearchToRelateDialog.js loaded");

    var handleAddClick = function (that) {
        return function () {
            var data = that.search.model.results;
            var i, newIndex = 0;
            var newRelations = [];
            var source = {
                csid: that.model.csid,
                recordtype: that.options.primary
            };
            // NOTE: using for in so that we don't loop through data that we haven't actually fetched yet. 
            for (i in data) {
                if (data[i].selected) {
                    newRelations[newIndex] = {
                        source: source,
                        target: data[i],
                        type: "affects",
                        "one-way": false
                    };
                    ++newIndex;
                }
            }
            that.events.addRelations.fire({
                items: newRelations
            });
            that.close();
        };
    };
    
    var bindEventHandlers = function (that, addDialog) {
        that.locate("addButton", addDialog).click(handleAddClick(that));
        that.locate("closeButton", addDialog).click(function () {
            that.close();
        });
        that.locate("createNewButton", addDialog).click(function () {
            that.events.onCreateNewRecord.fire();
            that.close();
        });
        that.search.events.afterSearch.addListener(function () {
            that.locate("addButton").show();
        });
    };
    
    cspace.searchToRelateDialog = function (container, options) {
        var that = fluid.initRendererComponent("cspace.searchToRelateDialog", container, options);
        var recordName = that.messageResolver.resolve(that.options.related);
        var title = that.messageResolver.resolve("title", {recordType: recordName});
        that.container.dialog({
            autoOpen: false,
            modal: true,
            minWidth: 700,
            draggable: true,
            dialogClass: "cs-search-dialog cs-search-dialogFor-" + recordName.replace(/\s+/g,""),
            position: ["center", 100],
            title: title                
        });
        
        that.open = function () {
            that.search.hideResults();
            that.locate("addButton").hide();
            that.container.dialog("open");        
        };
        that.close = function () {
            that.container.dialog("close");
        };
        that.renderer.refreshView();
        fluid.initDependents(that);

        that.locate("addButton", that.container).hide();

        that.events.afterRender.fire(that);

        bindEventHandlers(that, that.container);
        that.events.afterSetup.fire(that);
        return that;
    };

    cspace.searchToRelateDialog.produceTree = function (that) {
        return {
            closeButtonImg: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        alt: that.options.strings.closeAlt
                    }
                }
            },
            relationshipType: {
                messagekey: "relationshipType"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: that.options.showCreate || false,
                trueTree: {
                    createNew: {
                        messagekey: "createNew"
                    },
                    createNewButton: {
                        decorators: [{
                            type: "attrs",
                            attributes: {
                                value: that.options.strings.createNewButton
                            }
                        }, {
                            type: "addClass",
                            classes: that.options.styles.createNewButton
                        }]
                    },
                    multipleRelate: {
                        decorators: [{
                            type: "addClass",
                            classes: that.options.styles.multipleRelate
                        }]
                    }
                },
                falseTree: {
                    multipleRelate: {}
                }
            },
            addButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.addButton
                    }
                }
            },
            headerSelect: {
                messagekey: "headerSelect"
            },
            headerNumber: {
                messagekey: "headerNumber"
            },
            headerDetails: {
                messagekey: "headerDetails"
            },
            headerType: {
                messagekey: "headerType"
            },
            headerUpdatedAt: {
                messagekey: "headerUpdatedAt"
            },
            next: {
                messagekey: "next"
            },
            previous: {
                messagekey: "previous"
            }
        };
    };
    
    cspace.searchToRelateDialog.getDialogGetter = function (that) {
        return function () {
            return that.container;
        };
    };
    
    fluid.defaults("cspace.searchToRelateDialog", {
        gradeNames: "fluid.rendererComponent",
        mergePolicy: {
            model: "preserve"
        },
        selectors: {
            dialog: { // See comments for Confirmation.js - we adopt a common strategy now
            // since the problem in THIS component is that it invokes jquery.dialog on startup, thus
            // causing its container to move.
                expander: {
                    type: "fluid.deferredCall",
                    func: "cspace.searchToRelateDialog.getDialogGetter",
                    args: ["{searchToRelateDialog}"]
                }
            },
            addButton: ".csc-searchToRelate-addButton",
            closeButton: ".csc-searchToRelate-closeBtn",
            closeButtonImg: ".csc-searchToRelate-closeBtnImg",
            createNewButton: ".csc-searchToRelate-createButton",
            relationshipType: ".csc-searchToRelate-relationshipTypeSelect",
            createNew: ".csc-searchToRelate-createNew",
            headerSelect: ".csc-searchToRelate-headerSelect",
            headerNumber: ".csc-searchToRelate-headerNumber",
            headerDetails: ".csc-searchToRelate-headerDetails",
            headerType: ".csc-searchToRelate-headerType",
            headerUpdatedAt: ".csc-searchToRelate-headerUpdatedAt",
            previous: ".csc-searchToRelate-previous",
            next: ".csc-searchToRelate-next",
            multipleRelate: ".csc-related-steps"
        },
        styles: {
            multipleRelate: "cs-related-steps",
            createNewButton: "cs-searchToRelate-createButton"
        },
        selectorsToIgnore: ["closeButton", "dialog"],
        events: {
            addRelations: null,
            onCreateNewRecord: null,
            afterRender: null,
            afterSetup: null
        },
        rendererFnOptions: {
            rendererTargetSelector: "dialog"
        },
        produceTree: cspace.searchToRelateDialog.produceTree,
        parentBundle: "{globalBundle}",
        strings: {
            createNewButton: "Create",
            procedures: "Procedural",
            title: "Add Related %recordType Record",
            closeAlt: "close button",
            relationshipType: "Select relationship type:",
            createNew: "Create new record:",
            addButton: "Add to current record",
            headerSelect: "Select",
            headerNumber: "ID Number",
            headerDetails: "Detail",
            headerType: "Record Type",
            headerUpdatedAt: "Updated At",
            next: "next >",
            previous: "< previous"
        },
        components: {
            search: {
                type: "cspace.search.searchView",
                options: {
                    resultsSelectable: true,
                    recordType: "{searchToRelateDialog}.options.related",
                    components: {
                        mainSearch: {
                            options: {
                                strings: {
                                    recordTypeSelectLabel: "Search existing:" 
                                },
                                related: "{searchToRelateDialog}.options.related",
                                permission: "update"
                            }
                        }
                    }
                }
            }
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/searchToRelate.html"
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.searchToRelateDialog");
    
})(jQuery, fluid);
