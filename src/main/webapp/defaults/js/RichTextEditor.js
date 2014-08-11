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
			destroyEditor: null,
			onSubmit: null
		}
	});

	cspace.richTextEditor.preInit = function(that) {
		that.transferData = function() {
			cspace.richTextEditor.transferData(that);
		};
		
		that.bindEvents = function() {
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
			
			// If this is a repeatable field, transfer the data from the editable div into the 
			// original textarea/input before each time the model is updated. This handles
			// the case where the plus button is clicked while the editable div has focus.
			// In that situation, the blur handler fires too late to update the model before
			// the repeating fields are redrawn, so the current value would be lost.
			
			that.events.repeatableOnUpdateModel.addListener(that.transferData, that.id);
			
			// If this is a repeatable field, destroy the editor and all event handlers
			// when the repeatable fields are redrawn.
			
			that.events.repeatableOnRefreshView.addListener(that.destroyEditor, that.id);
			
			// Destroy the editor and all event handlers when told.
			
			that.events.destroyEditor.addListener(that.destroyEditor, that.id);
		}
		
		that.removeAllListeners = function() {
			that.events.onSubmit.removeListener(that.id);
			that.events.repeatableOnUpdateModel.removeListener(that.id);
			that.events.repeatableOnRefreshView.removeListener(that.id);
			that.events.destroyEditor.removeListener(that.id);
		};
		
		that.destroyEditor = function(arg) {
			that.removeAllListeners();
			that.editor.destroy();
		}
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
		
		that.bindEvents();
	}
		
	cspace.richTextEditor.transferData = function(that) {
		var data = that.editor.getData();
		
		that.container.val(data);
		that.container.change();
	}
})(jQuery, fluid);