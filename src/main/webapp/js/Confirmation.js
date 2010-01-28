/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2, window*/

var cspace = cspace || {};

(function ($, fluid) {
	
	var bindEvents = function (that) {
		that.locate("cancel").click(function () {
            that.container.dialog("close");
        });
		that.locate("closeButton").click(function () {
            that.container.dialog("close");
        });
        that.locate("proceed").click(function (e) {
            window.location = that.options.model.href;
        });
        that.locate("save").click(function (e) {
            that.options.action();
            window.location = that.options.model.href;
        });
	};
	
	var setup = function (that) {
		bindEvents(that);
	};
	
	cspace.confirmation = function (container, options) {
		var that = fluid.initView("cspace.confirmation", container, options);
		setup(that);
		return that;
	};
	
	fluid.defaults("cspace.confirmation", {
        selectors: {
            cancel: ".csc-confirmationDialogButton-cancel",
            proceed: ".csc-confirmationDialogButton-proceed",
            save: ".csc-confirmationDialogButton-save",
			closeButton: ".csc-confirmationDialog-closeBtn"
        }
    });
	
})(jQuery, fluid_1_2);