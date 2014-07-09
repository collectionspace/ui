/*
Copyright 2014 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
	fluid.log("RichTextEditor.js loaded");
    
	fluid.defaults("cspace.richTextEditor", {
		gradeNames: ["fluid.viewComponent", "autoInit"],
		preInitFunction: "cspace.richTextEditor.preInit",
		finalInitFunction: "cspace.richTextEditor.finalInit",
		events: {
			repeatableOnRefreshView: null,
			recordEditorAfterSave: null,
			recordEditorAfterCancel: null,
			removeAllListeners: null,
			onSubmit: null
		},
		listeners: {
			removeAllListeners: {
				listener: "{richTextEditor}.removeAllListeners"
			}
		}
	});

	cspace.richTextEditor.preInit = function(that) {
		that.transferData = function() {
			cspace.computedField.transferData(that);
		};
		
		that.removeAllListeners = function() {
			that.events.onSubmit.removeListener(that.id);
		};
	};
		
	cspace.richTextEditor.finalInit = function(that) {
		// Inline editors should only be created manually.

		CKEDITOR.disableAutoInline = true;

		// Create a div that will contain the editable rich text, and add it after this component's container (which should be a textarea or input).

		var editableDiv = $('<div class="richtext" contenteditable="true"></div>').insertAfter(that.container);
		var isMultiline = that.container.is("textarea");
		
		if (isMultiline) {
			editableDiv.addClass("multiline");

			// UC Berkeley customization: textarea elements may have class "short". Transfer this to the editable div.
			
			if (that.container.hasClass("short")) {
				editableDiv.addClass("short");
			}
		}
		
		// Instantiate an inline editor, using the div just created.
		
		that.editor = CKEDITOR.inline(editableDiv[0], {
			autoUpdateElement: false,		// We don't care about updating the textarea on form submit, since we only use AJAX to submit data.
			enterMode: CKEDITOR.ENTER_BR,	// This prevents content from being wrapped in extra <p> tags.
			entities: false,				// Insert actual characters instead of HTML entities for readability.
			coreStyles_bold: {				// Use b instead of strong for bold, since it's more semantically neutral.
				element: 'b',
				overrides: 'strong'
			},
			coreStyles_italic: {			// Use i instead of em for italic, since it's more semantically neutral.
				element: 'i',
				overrides: 'em'
			},
			removeButtons: "",				// Prevent the underline button from being removed.
			toolbar: [[						// Configure the toolbar. TODO: Make this able to be specified for each field (via app layer config/uispec).
				'Bold',
				'Italic',
				'Underline',
				'Superscript'
			]]
		});

		// When the field loses focus, transfer the data from the editable div into the 
		// original textarea/input. This is necessary because the field might be used
		// in the title bar or as an input to a computed field, so it needs to be 
		// updated in real time.
		
		that.editor.on("blur", function(event) {
			that.transferData();
		});
		
		// When the form is submitted, transfer the data from the editable div into the 
		// original textarea/input. This is necessary in addition to the blur handler, because
		// if the editable div has focus when the form is submitted, the blur event fires
		// too late to transfer the value before the form is saved.
		
		that.events.onSubmit.addListener(that.transferData, that.id);
		
		if (!isMultiline) {
			// This isn't a multiline field, so disable the enter key.
			
			that.editor.on('key', function(event) {
				if (event.data.keyCode == 13 || event.data.keyCode == CKEDITOR.SHIFT + 13) {
					event.cancel();
				}
			});
		}
		
		// Set the content of the editable div to the value of the original textarea/input.
		
		that.editor.setData(that.container.val());
		
		// Hide the original textarea/input.
		
		that.container.css("display", "none");
	}
		
	cspace.computedField.transferData = function(that) {
		var data = that.editor.getData();
		
		// Chrome uses &nbsp; entities for spaces occurring immediately before tags.
		// This doesn't actually seem to be necessary, so replace them with regular
		// spaces for readability.
		
		data = data.replace(/&nbsp;/g, " ");

		that.container.val(data);
		that.container.change();
	}
})(jQuery, fluid);