/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

    var makeRelater = function (that) {
        return function () {
            var data = that.search.resultsPager.options.dataModel;

            var newIndex = 0;
            var newRelations = [];
            var source = {
                csid: that.applier.model.csid,
                recordtype: that.options.currentRecordType
            };
            for (var i = 0; i < data.length; i++) {
                if (data[i].selected) {
                    newRelations[newIndex] = {
                        source: source,
                        target: data[i],
                        type: "affects",
                        "one-way": false
                    };
                    newIndex += 1;
                }
            }
            if (cspace.util.isLocal()) {
                that.updateRelations({items: newRelations});
            } else {
                that.dataContext.addRelations({items: newRelations});
            }

            that.dlg.dialog("close");
        };
    };

    var setupAddDialog = function (that) {
        var resources = {
            addDialog: {
                href: that.options.templates.dialog
            }
        };
        
        var addDialog = $("<div></div>", that.container[0].ownerDocument)
            .dialog({
                autoOpen: false,
                modal: true,
				minWidth: 700,
				draggable: true,
                dialogClass: "cs-search-dialog",
                position: ['center',100],
				title: "Add Related Object/Procedural  Record"                
            });
        
        addDialog.parent().css("overflow", "visible");
        
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["addDialog"], {});
            fluid.reRender(templates, addDialog, {});

            var searchOpts = {
                resultsSelectable: true
            };
            if (cspace.util.isLocal()) {
                searchOpts.searchUrlBuilder = function (recordType, query) {
                    var recordTypeParts = recordType.split('-');        
                    return "./data/" + recordTypeParts.join('/') + "/search/list.json";
                };
            }
            that.search = cspace.search(".main-search-page", searchOpts);

            that.locate("addButton", addDialog).click(makeRelater(that));
            that.locate("closeButton", addDialog).click(function () {
                addDialog.dialog("close");
            });
        });

        return addDialog;        
    };

    var bindEventHandlers = function (that) {
        that.dataContext.events.afterAddRelations.addListener(function (data) {
            that.updateRelations(data);
        });
    };

    cspace.searchToRelateDialog = function (container, applier, options) {
        var that = fluid.initView("cspace.searchToRelateDialog", container, options);
        that.applier = applier;
        
        var dcOpts = {
            recordType: "relationships"
        };
        if (cspace.util.isLocal()) {
            dcOpts.baseUrl = "data";
            dcOpts.fileExtension = ".json";
        }
        that.dataContext = cspace.dataContext(that.applier.model, dcOpts);

        that.dlg = setupAddDialog(that);

        bindEventHandlers(that);

        that.prepareDialog = function (type) {
            var selectBoxContainer = that.locate("selectBoxContainer", that.dlg);
            selectBoxContainer.empty();
            selectBoxContainer.append(that.locate(type+"Selecter", that.dlg).clone());
            that.locate("searchResults", that.dlg).hide();
        };

        that.updateRelations = function (newRelations) {
            var newModelRelations = [];
            fluid.model.copyModel(newModelRelations, that.applier.model.relations);
            var relIndex = newModelRelations.length;            
            for (var i = 0; i < newRelations.items.length; i++) {
                newModelRelations[relIndex] = newRelations.items[i].target;
                newModelRelations[relIndex].relationshiptype = newRelations.items[i].type;
                relIndex += 1;
            }
            that.applier.requestChange("relations", newModelRelations);
        };

        return that;
    };
    
    fluid.defaults("cspace.searchToRelateDialog", {
        selectors: {
            addButton: ".csc-relate-button",
            searchResults: ".csc-search-results",
            recordTypeString: ".csc-record-type",
            selectBoxContainer: ".csc-select-box-container",
            selectBoxes: ".csc-select-boxes",
            objectsSelecter: ".csc-recordTypeSelecter-object",
            proceduresSelecter: ".csc-recordTypeSelecter-procedures",
            closeButton: ".csc-searchToRelate-closeBtn"
        },
        templates: {
            dialog: "../html/searchToRelate.html"
        }
    });
})(jQuery, fluid_1_2);
