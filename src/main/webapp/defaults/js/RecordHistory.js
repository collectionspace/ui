/*
Copyright 2013 University of California at Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";
    
    // Record History default options
    fluid.defaults("cspace.recordHistory", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
		model: {},
        selectors: {
            createdLabel: ".csc-recordHistory-created-label",
            createdAtLabel: ".csc-recordHistory-createdAt-label",
            createdAt: ".csc-recordHistory-createdAt",
            createdByLabel: ".csc-recordHistory-createdBy-label",
            createdBy: ".csc-recordHistory-createdBy",
            updatedLabel: ".csc-recordHistory-updated-label",
            updatedAtLabel: ".csc-recordHistory-updatedAt-label",
            updatedAt: ".csc-recordHistory-updatedAt",
            updatedByLabel: ".csc-recordHistory-updatedBy-label",
            updatedBy: ".csc-recordHistory-updatedBy"
        },
        // HTML template for the component
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordHistoryTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
		preInitFunction: "cspace.recordHistory.preInit",
        finalInitFunction: "cspace.recordHistory.finalInit",
		// Oh, the strings option is needed to make messages resolvable... 
        strings: {},
        // Message Bundle
        parentBundle: "{globalBundle}",
		elPaths: {
			createdAt: "fields.createdAt",
			createdBy: "fields.createdBy",
			updatedAt: "fields.updatedAt",
			updatedBy: "fields.updatedBy"
		},
        produceTree: "cspace.recordHistory.produceTree",
		mergePolicy: {
            recordApplier: "nomerge"
        },
    });

	cspace.recordHistory.produceTree = function(that) {
        // Rendering tree used for rendering body of the component
		return {
			expander: [{
			    type: "fluid.renderer.condition",
			    condition: that.hasCreated(),
			    trueTree: {
					createdLabel: {
						messagekey: "recordHistory-created"
					}
				}
			},{
			    type: "fluid.renderer.condition",
			    condition: that.hasCreatedAt(),
			    trueTree: {
					createdAtLabel: {
						messagekey: "recordHistory-createdAt"
					},
					createdAt: "${" + that.options.elPaths.createdAt + "}"
				}
			},{
			    type: "fluid.renderer.condition",
			    condition: that.hasCreatedBy(),
			    trueTree: {
					createdByLabel: {
						messagekey: "recordHistory-createdBy"
					},
					createdBy: "${" + that.options.elPaths.createdBy + "}"
				}
			},{
			    type: "fluid.renderer.condition",
			    condition: that.hasUpdated(),
			    trueTree: {
					updatedLabel: {
						messagekey: "recordHistory-updated"
					}
				}
			},{
			    type: "fluid.renderer.condition",
			    condition: that.hasUpdatedAt(),
			    trueTree: {
					updatedAtLabel: {
						messagekey: "recordHistory-updatedAt"
					},
					updatedAt: "${" + that.options.elPaths.updatedAt + "}"
				}
			},{
			    type: "fluid.renderer.condition",
			    condition: that.hasUpdatedBy(),
			    trueTree: {
					updatedByLabel: {
						messagekey: "recordHistory-updatedBy"
					},
					updatedBy: "${" + that.options.elPaths.updatedBy + "}"
				}
			}]
		}
	}
	
	cspace.recordHistory.preInit = function(that) {
		that.calculateCreatedAt = function(recordModel) {
			var createdAt = fluid.get(recordModel, that.options.elPaths.createdAt);
			that.applier.requestChange(that.options.elPaths.createdAt, createdAt);
		}
		
		that.calculateCreatedBy = function(recordModel) {
			var createdBy = fluid.get(recordModel, that.options.elPaths.createdBy);
			that.applier.requestChange(that.options.elPaths.createdBy, createdBy);
		}
		
		that.calculateUpdatedAt = function(recordModel) {
			var updatedAt = fluid.get(recordModel, that.options.elPaths.updatedAt);
			that.applier.requestChange(that.options.elPaths.updatedAt, updatedAt);
		}
		
		that.calculateUpdatedBy = function(recordModel) {
			var updatedBy = fluid.get(recordModel, that.options.elPaths.updatedBy);
			that.applier.requestChange(that.options.elPaths.updatedBy, updatedBy);
		}
		
		that.hasCreatedAt = function() {
			return !!fluid.get(that.model, that.options.elPaths.createdAt);
		}
		
		that.hasCreatedBy = function() {
			return !!fluid.get(that.model, that.options.elPaths.createdBy);
		}

		that.hasCreated = function() {
			return (that.hasCreatedAt() || that.hasCreatedBy());
		}
				
		that.hasUpdatedAt = function() {
			return !!fluid.get(that.model, that.options.elPaths.updatedAt);
		}

		that.hasUpdatedBy = function() {
			return !!fluid.get(that.model, that.options.elPaths.updatedBy);
		}
		
		that.hasUpdated = function() {
			return (that.hasUpdatedAt() || that.hasUpdatedBy());
		}
	}
	
    cspace.recordHistory.finalInit = function(that) {		
		bindEventHandlers(that);
	
		var recordModel = that.options.recordApplier.model;
		
		that.calculateCreatedAt(recordModel);
		that.calculateCreatedBy(recordModel);
		that.calculateUpdatedAt(recordModel);
		that.calculateUpdatedBy(recordModel);
		
		that.refreshView();
	}
    
	var bindEventHandlers = function(that) {
		that.options.recordApplier.modelChanged.addListener(that.options.elPaths.createdAt, function(recordModel, oldRecordModel) {
			that.calculateCreatedAt(recordModel);
	        that.refreshView();
	    });
	
		that.options.recordApplier.modelChanged.addListener(that.options.elPaths.createdBy, function(recordModel) {
			that.calculateCreatedBy(recordModel);
	        that.refreshView();
	    });

		that.options.recordApplier.modelChanged.addListener(that.options.elPaths.updatedAt, function(recordModel) {
			that.calculateUpdatedAt(recordModel);
	        that.refreshView();
	    });
	
		that.options.recordApplier.modelChanged.addListener(that.options.elPaths.updatedBy, function(recordModel) {
			that.calculateUpdatedBy(recordModel);
	        that.refreshView();
	    });
	}

    // Fetching / Caching
    // ----------------------------------------------------
    
    // Call to primeCacheFromResources will start fetching/caching
    // of the template on this file load before the actual component's
    // creator function is called
    fluid.fetchResources.primeCacheFromResources("cspace.recordHistory");
    
})(jQuery, fluid);
