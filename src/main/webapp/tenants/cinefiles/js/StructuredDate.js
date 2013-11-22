/*
Copyright 2011 University of California, Berkeley; Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, window, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {	
	
	// Default options for the component.
	fluid.defaults("cspace.structuredDate", {
		gradeNames: ["fluid.rendererComponent", "autoInit"],
		preInitFunction: "cspace.structuredDate.preInit",
		postInitFunction: "cspace.structuredDate.postInitFunction",
		finalInitFunction: "cspace.structuredDate.finalInitFunction",
		selectors: {
			popupContainer: ".csc-structuredDate-popup-container"
		},
		styles: {
			structuredDate: "cs-structuredDate-input"
		},
		root: "",
		elPath: "",
		invokers: {
			showPopup: {
				funcName: "cspace.structuredDate.showPopup",
				args: "{structuredDate}"
			},
			hidePopup: {
				funcName: "cspace.structuredDate.hidePopup",
				args: "{structuredDate}"
			}
		},
		// Sub-components of this component are declared here.
		//
		// Options that will be passed to the subcomponent(s) to override
		// their defaults also go here.
		components: {
			popup: {
				type: "cspace.structuredDate.popup",
				container: "{structuredDate}.popupContainer",
				options: {
					model: "{structuredDate}.model",
					applier: "{structuredDate}.applier",
					elPaths: "{structuredDate}.options.elPaths",
					root: "{structuredDate}.options.root",
					events: {
						removeListeners: "{structuredDate}.events.removeListeners"
					}
				}
			}
		},
		events: {
			removeListeners: null
		},
		listeners: {
			removeListeners: {
				listener: "{structuredDate}.removeApplierListeners"
			}
		}
	});
	
	cspace.structuredDate.preInit = function (that) {
		that.removeApplierListeners = function () {
			that.applier.modelChanged.removeListener("elPath-" + that.id);
		};
	};

	cspace.structuredDate.finalInitFunction = function (that) {
		// Dismiss the structured date popup by pressing the ESC key
		that.union.keyup(function (event) {
			if (cspace.util.keyCode(event) === $.ui.keyCode.ESCAPE) {
				that.container.focus();
				that.hidePopup();
			}
		});

		// Open the structured date popup by pressing the Return/Enter key
		// when focus is on the container field
		//
		// Makes it possible to re-open the popup after it has been
		// dismissed using the ESC key
		that.container.keyup(function (event) {
			if (cspace.util.keyCode(event) === $.ui.keyCode.ENTER) {
				that.showPopup();
			}
		});

		// Hide the popup when focus leaves the union of the
		// container field and the structured date popup container
		fluid.deadMansBlur(that.union, {
			exclusions: {union: that.union},
			handler: that.hidePopup
		});
		
		// If the value of the summary element in the model changes,
		// update the value of the container field to reflect that change.
		if (that.options.elPath) {
			var fullElPath = cspace.util.composeSegments(that.options.root, that.options.elPath);
			that.applier.modelChanged.addListener(fullElPath, function (model) {
				that.container.val(fluid.get(model, fullElPath));
			}, "elPath-" + that.id);
		}
		
		// Show the structured date popup when focus is placed
		// in the popup container
		that.container.focus(that.showPopup);
	};
	
	cspace.structuredDate.hidePopup = function (that) {
		that.popup.hide();
	};
	
	var positionPopup = function (popup, container) {
		/*
			if popup window overflows screen on right
			try positioning it by (my) top right (at) right bottom (of) container
			if this causes the popup to overflow to the left 
			position it by (my) center top (at) center bottom (of) container 
			with (collision) fit horizontal, flip vertical 
		*/
		var offset = popup.offset();
		if ($(window).width() - offset.left < popup.width()) {
			popup.position({
				my: "right top", 
				at: "right bottom", 
				of: container,
				collision: "none flip",
				using: function (hash) {
					if (hash.left < 0) {
						popup.position({
							my: "center top",
							at: "center bottom",
							of: container,
							collision: "fit flip"
						});
					} else {
						popup.css({
							"top": hash.top,
							"left": hash.left
						});
					}
				}
			});
		} else {
			popup.position({
				my: "left top", 
				at: "left bottom",
				of: container
			});
		}
	};

	cspace.structuredDate.showPopup = function (that) {
		that.popup.show();
	};
	
	cspace.structuredDate.postInitFunction = function (that) {
		that.container.addClass(that.options.styles.structuredDate);
		// Create a container element and attach it to the DOM.
		// The structured date popup will later be inserted within this container.
		that.popupContainer =
			$("<div/>").addClass((that.options.selectors.popupContainer).substring(1));
		that.popupContainer.hide();
		that.container.after(that.popupContainer);
		// Declare the combination of the input field that triggers
		// the popup behavior, and the popup itself, as a consolidated
		// entity on which we can define behaviors, such as loss of focus (blur).
		that.union = that.container.add(that.popupContainer);
	};
	
	// Default options for the popup sub-component.
	fluid.defaults("cspace.structuredDate.popup", {
		finalInitFunction: "cspace.structuredDate.popup.finalInitFunction",
		preInitFunction: "cspace.structuredDate.popup.preInit",
		gradeNames: ["fluid.rendererComponent", "autoInit"],
		// When merging models between component and sub-component,
		// the "preserve" policy will share the original model object,
		// rather than using an independent copy of that object for each.
		mergePolicy: {
			"rendererOptions.applier": "applier"
		},
		protoTree: {},
		getProtoTree: "cspace.structuredDate.popup.getProtoTree",
		parentBundle: "{globalBundle}",
		selectorsToIgnore: ["popup"],
		selectors: {
			popup: ".csc-structuredDate-popup",
			// Also you will need a separate selector for the label "Date Text" as well
			// in order to be able to assign the label value from the message bundle and make
			// it ready for initialization.
			// NOTE: dateDateText replaced by dateDisplayDate (Rick, 05 May 2011).
			close: ".csc-structuredDate-close",
			dateDisplayDate: ".csc-structuredDate-dateDisplayDate",
			dateDisplayDateLabel: ".csc-structuredDate-dateDisplayDate-label",
			datePeriod: ".csc-structuredDate-datePeriod",
			datePeriodLabel: ".csc-structuredDate-datePeriod-label",
			dateAssociation: ".csc-structuredDate-dateAssociation",
			dateAssociationLabel: ".csc-structuredDate-dateAssociation-label",
			dateNote: ".csc-structuredDate-dateNote",
			dateNoteLabel: ".csc-structuredDate-dateNote-label",
			dateHeaderLabel: ".csc-structuredDate-dateHeader-label",
			dateYearLabel: ".csc-structuredDate-dateYear-label",
			dateMonthLabel: ".csc-structuredDate-dateMonth-label",
			dateDayLabel: ".csc-structuredDate-dateDay-label",
			dateEraLabel: ".csc-structuredDate-dateEra-label",
			dateCertaintyHeaderLabel: ".csc-structuredDate-dateCertaintyHeader-label",
			dateCertaintyLabel: ".csc-structuredDate-dateCertainty-label",
			dateQualifierLabel: ".csc-structuredDate-dateQualifier-label",
			dateQualifierValueLabel: ".csc-structuredDate-dateQualifierValue-label",
			dateQualifierUnitLabel: ".csc-structuredDate-dateQualifierUnit-label",
			dateEarliestSingleRowLabel: ".csc-structuredDate-dateEarliestSingleRow-label",
			dateLatestRowLabel: ".csc-structuredDate-dateLatestRow-label",
			dateScalarValueLabel: ".csc-structuredDate-dateScalarValue-label",
			dateEarliestSingleYear: ".csc-structuredDate-dateEarliestSingleYear",
			dateEarliestSingleMonth: ".csc-structuredDate-dateEarliestSingleMonth",
			dateEarliestSingleDay: ".csc-structuredDate-dateEarliestSingleDay",
			dateEarliestSingleEra: ".csc-structuredDate-dateEarliestSingleEra",
			dateEarliestSingleCertainty: ".csc-structuredDate-dateEarliestSingleCertainty",
			dateEarliestSingleQualifier: ".csc-structuredDate-dateEarliestSingleQualifier",
			dateEarliestSingleQualifierValue: ".csc-structuredDate-dateEarliestSingleQualifierValue",
			dateEarliestSingleQualifierUnit: ".csc-structuredDate-dateEarliestSingleQualifierUnit",
			dateEarliestScalarValue: ".csc-structuredDate-dateEarliestScalarValue",
			dateLatestYear: ".csc-structuredDate-dateLatestYear",
			dateLatestMonth: ".csc-structuredDate-dateLatestMonth",
			dateLatestDay: ".csc-structuredDate-dateLatestDay",
			dateLatestEra: ".csc-structuredDate-dateLatestEra",
			dateLatestCertainty: ".csc-structuredDate-dateLatestCertainty",
			dateLatestQualifier: ".csc-structuredDate-dateLatestQualifier",
			dateLatestQualifierValue: ".csc-structuredDate-dateLatestQualifierValue",
			dateLatestQualifierUnit: ".csc-structuredDate-dateLatestQualifierUnit",
			dateLatestScalarValue: ".csc-structuredDate-dateLatestScalarValue",
			parseStatus: ".csc-structuredDate-parseStatus"
		},
		strings: {},
		stringPaths: {
			close: "structuredDate-close",
			dateDisplayDateLabel: "structuredDate-dateDisplayDateLabel",
			datePeriodLabel: "structuredDate-datePeriodLabel",
			dateAssociationLabel: "structuredDate-dateAssociationLabel",
			dateNoteLabel: "structuredDate-dateNoteLabel",
			dateHeaderLabel: "structuredDate-dateHeaderLabel",
			dateYearLabel: "structuredDate-dateYearLabel",
			dateMonthLabel: "structuredDate-dateMonthLabel",
			dateDayLabel: "structuredDate-dateDayLabel",
			dateEraLabel: "structuredDate-dateEraLabel",
			dateCertaintyHeaderLabel: "structuredDate-dateCertaintyHeaderLabel",
			dateCertaintyLabel: "structuredDate-dateCertaintyLabel",
			dateQualifierLabel: "structuredDate-dateQualifierLabel",
			dateQualifierValueLabel: "structuredDate-dateQualifierValueLabel",
			dateQualifierUnitLabel: "structuredDate-dateQualifierUnitLabel",
			dateEarliestSingleRowLabel: "structuredDate-dateEarliestSingleRowLabel",
			dateLatestRowLabel: "structuredDate-dateLatestRowLabel",
			dateScalarValueLabel: "structuredDate-scalarValueLabel"
		},
		// This is the place to specify the template for the popup
		// (e.g. StructuredDate.html). This template will be fetched
		// and appended inside the component's container automatically
		// at render time.
		resources: {
			template: cspace.resourceSpecExpander({
				fetchClass: "slowTemplate",
				url: "%webapp/html/components/StructuredDate.html",
				options: {
					dataType: "html"
				}
			})
		},
		root: "",
		elPaths: {},
		invokers: {
			resolveFullElPath: {
				funcName: "cspace.structuredDate.popup.resolveFullElPath",
				args: ["{popup}.composeElPath", "{arguments}.0"]
			},
			composeElPath: {
				funcName: "cspace.structuredDate.popup.composeElPath",
				args: ["{popup}.options.elPaths", "{popup}.options.root", "{arguments}.0"]
			},
			composeRootElPath: {
				funcName: "cspace.structuredDate.popup.composeRootElPath",
				args: ["{popup}.options.elPaths", "{popup}.options.root"]
			},
			updateScalarValues: {
				funcName: "cspace.structuredDate.popup.updateScalarValues",
				args: ["{arguments}.0", "{arguments}.2", "{popup}"]
			},
			updateStructuredFields: {
				funcName: "cspace.structuredDate.popup.updateStructuredFields",
				args: "{popup}"
			},
			show: {
				funcName: "cspace.structuredDate.popup.show",
				args: ["{popup}", "{cspace.structuredDate}.container"]
			},
			hide: {
				funcName: "cspace.structuredDate.popup.hide",
				args: "{popup}"
			}
		},
		defaultFormat: "yyyy-MM-dd",
		displayScalars: false,
		events: {
			removeListeners: null
		},
		listeners: {
			removeListeners: {
				listener: "{popup}.removeApplierListeners"
			}
		},
		components: {
			// The data source used to parse display dates.
			dateParserDataSource: {
				type: "cspace.structuredDate.dateParserDataSource"
			}
		},
		dateParserURL: cspace.componentUrlBuilder("%tenant/%tname/parseDate?displayDate=%displayDate")
	});
	
	fluid.demands("cspace.structuredDate.dateParserDataSource", "cspace.structuredDate.popup", {
		funcName: "cspace.URLDataSource",
		args: {
			url: "{popup}.options.dateParserURL",
			termMap: {
				displayDate: "%displayDate"
			},
			targetTypeName: "cspace.structuredDate.dateParserDataSource"
		}
	});
	
	var validate = function (value, field) {
		var parsed = parseInt(value, 10),
			month = arguments[2],
			year = arguments[3];

		if (field === "Month") {
			parsed -= 1;
		}
		if (!Date["validate" + field](parsed, year, month)) {
			throw "Invalid " + field;
		}
		return parsed;
	};

	var setDateYear = function (year) {
		var parsedYear = validate(year, "Year");
		var date = new Date();
		return date.set({year: parsedYear});
	};
	
	var setDateMonth = function (date, month, earliest) {
		var opts = {};
		if (!month) {
			opts.month = earliest ? 0 : 11;
		} else {
			opts.month = validate(month, "Month");
		}
		return date.set(opts);
	};
	
	var setDateDay = function (date, day, earliest) {
		var opts = {};
		if (!day) {
			opts.day = earliest ? 1 : Date.getDaysInMonth(date.getYear(), date.getMonth());
		} else {
			opts.day = validate(day, "Day", date.getYear(), date.getMonth());
		}
		return date.set(opts);
	};
	
	var setDate = function (year, month, day, earliest) {
		var date = setDateYear(year);
		setDateMonth(date, month, earliest);
		setDateDay(date, day, earliest);
		return date;
	};
	
	var setStaticDate = function (eYear, eMonth, eDay, lYear, lMonth, lDay, earliest) {
		var firstYear = eYear, secondYear = lYear,
			firstMonth = eMonth, secondMonth = lMonth,
			firstDay = eDay, secondDay = lDay;
		if (!earliest) {
			firstYear = lYear;
			firstMonth = lMonth;
			firstDay = lDay;
			secondYear = eYear;
			secondMonth = eMonth;
			secondDay = eDay;
		}
		return firstYear ? setDate(firstYear, firstMonth, firstDay, earliest) :
		                   setDate(secondYear, firstMonth || secondMonth, firstDay || secondDay, earliest);
	};

	cspace.structuredDate.popup.show = function (that, container) {
		that.refreshView();
		that.container.show();
		positionPopup(that.locate("popup"), container);
	};

	cspace.structuredDate.popup.hide = function (that) {
		that.container.hide();
	};
	
	cspace.structuredDate.popup.updateScalarValues = function (model, changeRequest, popup) {
		if (!popup) {
			return;
		}
		var applier = popup.applier,
			composeElPath = popup.composeElPath,
			refreshView = popup.refreshView,
			defaultFormat = popup.options.defaultFormat,
			displayScalars = popup.options.displayScalars;
		// Login is based on:
		// http://wiki.collectionspace.org/display/collectionspace/Date+Schema+Computations
		var eScalarValuePath = composeElPath("dateEarliestScalarValue"),
			lScalarValuePath = composeElPath("dateLatestScalarValue");
		if (changeRequest[0].path === eScalarValuePath || changeRequest[0].path === lScalarValuePath) {
			return;
		}   
		var eYear = fluid.get(model, composeElPath("dateEarliestSingleYear")),
			lYear = fluid.get(model, composeElPath("dateLatestYear")),
			eMonth = fluid.get(model, composeElPath("dateEarliestSingleMonth")),
			lMonth = fluid.get(model, composeElPath("dateLatestMonth")),
			eDay = fluid.get(model, composeElPath("dateEarliestSingleDay")),
			lDay = fluid.get(model, composeElPath("dateLatestDay"));

		if (!eYear && !lYear) {
			return;
		}
		
		var eStaticDate, lStaticDate;
		try {
			eStaticDate = setStaticDate(eYear, eMonth, eDay, lYear, lMonth, lDay, true);
			lStaticDate = setStaticDate(eYear, eMonth, eDay, lYear, lMonth, lDay, false);
			// CSPACE-4793: Adding 1 day to latest so it is inclusive of the last day.
			lStaticDate = lStaticDate.add({days: 1});
		} catch (e) {
			return;
		}

		applier.requestChange(eScalarValuePath, eStaticDate.toString(defaultFormat));
		applier.requestChange(lScalarValuePath, lStaticDate.toString(defaultFormat));
		if (displayScalars) {
			refreshView();
		}
	};

	cspace.structuredDate.popup.updateStructuredFields = function (that) {
		var displayDateFullElPath = that.composeElPath("dateDisplayDate");
		var displayDate = fluid.get(that.model, displayDateFullElPath);

		var directModel = {
			displayDate: displayDate
		};
		
		that.dateParserDataSource.get(directModel, function(data) {
			if (data.isError) {
				that.parseStatus.isError = true;

				if (data.messages) {
					console.log(data.messages.join(": "));

					that.parseStatus.message = data.messages[0];
					that.parseStatus.messageDetail = data.messages[1];
				}
				else {
					console.log("Unknown parse error");
				}
			}
			else {
				that.parseStatus.isError = false;
				that.parseStatus.message = "";
				that.parseStatus.messageDetail = "";
			}

			if (data.structuredDate) {
				that.applier.requestChange(that.composeRootElPath(), data.structuredDate);
			}
			else {
				that.applier.requestChange(that.composeRootElPath(), {
					dateDisplayDate: displayDate
				});
			}
			
			// Refresh the view. If the popup has focus, just calling
			// that.refreshView() causes the popup to move and
			// cover the container input, so call show() instead,
			// which will also calculate the correct position.
			that.show();
		});
	};
	
	cspace.structuredDate.popup.composeRootElPath = function (elPaths, root) {
		var path = fluid.find(elPaths, function(elPath) {
			var segs = elPath.split(".");
			return segs.slice(0, segs.length - 1).join(".");
		});
		return cspace.util.composeSegments(root, path);
	};
	
	cspace.structuredDate.popup.resolveFullElPath = function (composeElPath, key) {
		return "${" + composeElPath(key) + "}";
	};
	
	cspace.structuredDate.popup.composeElPath = function (elPaths, root, key) {
		return cspace.util.composeSegments(root, elPaths[key]);
	};
	
	cspace.structuredDate.popup.getProtoTree = function (that) {
		return {
			dateEarliestSingleQualifier: {
				optionnames: [
					"+/-",
					"+",
					"-"
				],
				optionlist: [
					"+/-",
					"+",
					"-"
				],
				selection: that.resolveFullElPath("dateEarliestSingleQualifier")
			},
			dateLatestDay: that.resolveFullElPath("dateLatestDay"),
			dateLatestYear: that.resolveFullElPath("dateLatestYear"),
			dateAssociation: that.resolveFullElPath("dateAssociation"),
			dateEarliestSingleEra: {
				decorators: [{
					func: "cspace.termList",
					type: "fluid",
					options: {
						elPath: that.composeElPath("dateEarliestSingleEra"),
						termListType: "dateEarliestSingleEra",
						recordType: "structureddate"
					}
				}]
			},
			dateDisplayDate: that.resolveFullElPath("dateDisplayDate"),
			dateEarliestSingleCertainty: {
				decorators: [{
					func: "cspace.termList",
					type: "fluid",
					options: {
						elPath: that.composeElPath("dateEarliestSingleCertainty"),
						termListType: "dateEarliestSingleCertainty",
						recordType: "structureddate"
					}
				}]
			},
			dateLatestEra: {
				decorators: [{
					func: "cspace.termList",
					type: "fluid",
					options: {
						elPath: that.composeElPath("dateLatestEra"),
						termListType: "dateLatestEra",
						recordType: "structureddate"
					}
				}]
			},
			dateEarliestSingleQualifierValue: that.resolveFullElPath("dateEarliestSingleQualifierValue"),
			dateLatestCertainty: {
				decorators: [{
					func: "cspace.termList",
					type: "fluid",
					options: {
						elPath: that.composeElPath("dateLatestCertainty"),
						termListType: "dateLatestCertainty",
						recordType: "structureddate"
					}
				}]
			},
			dateEarliestSingleYear: that.resolveFullElPath("dateEarliestSingleYear"),
			dateLatestQualifier: {
				optionnames: [
					"+/-",
					"+",
					"-"
				],
				optionlist: [
					"+/-",
					"+",
					"-"
				],
				selection: that.resolveFullElPath("dateLatestQualifier")
			},
			dateLatestQualifierValue: that.resolveFullElPath("dateLatestQualifierValue"),
			dateEarliestSingleQualifierUnit: {
				decorators: [{
					func: "cspace.termList",
					type: "fluid",
					options: {
						elPath: that.composeElPath("dateEarliestSingleQualifierUnit"),
						termListType: "dateEarliestSingleQualifierUnit",
						recordType: "structureddate"
					}
				}]
			},
			datePeriod: that.resolveFullElPath("datePeriod"),
			dateLatestMonth: that.resolveFullElPath("dateLatestMonth"),
			dateNote: that.resolveFullElPath("dateNote"),
			dateLatestQualifierUnit: {
				decorators: [{
					func: "cspace.termList",
					type: "fluid",
					options: {
						elPath: that.composeElPath("dateLatestQualifierUnit"),
						termListType: "dateLatestQualifierUnit",
						recordType: "structureddate"
					}
				}]
			},
			dateEarliestSingleDay: that.resolveFullElPath("dateEarliestSingleDay"),
			dateEarliestSingleMonth: that.resolveFullElPath("dateEarliestSingleMonth"),
			expander: {
				type: "fluid.renderer.condition",
				condition: that.options.displayScalars,
				trueTree: {
					dateScalarValueLabel: {
						messagekey: that.options.stringPaths.dateScalarValueLabel
					},
					dateEarliestScalarValue: that.resolveFullElPath("dateEarliestScalarValue"),
					dateLatestScalarValue: that.resolveFullElPath("dateLatestScalarValue")
				}
			},
			dateDisplayDateLabel: {
				messagekey: that.options.stringPaths.dateDisplayDateLabel
			},
			datePeriodLabel: {
				messagekey: that.options.stringPaths.datePeriodLabel
			},
			dateAssociationLabel: {
				messagekey: that.options.stringPaths.dateAssociationLabel
			},
			dateNoteLabel: {
				messagekey: that.options.stringPaths.dateNoteLabel
			},
			dateHeaderLabel: {
				messagekey: that.options.stringPaths.dateHeaderLabel
			},
			dateYearLabel: {
				messagekey: that.options.stringPaths.dateYearLabel
			},
			dateMonthLabel: {
				messagekey: that.options.stringPaths.dateMonthLabel
			},
			dateDayLabel: {
				messagekey: that.options.stringPaths.dateDayLabel
			},
			dateEraLabel: {
				messagekey: that.options.stringPaths.dateEraLabel
			},
			dateCertaintyHeaderLabel: {
				messagekey: that.options.stringPaths.dateCertaintyHeaderLabel
			},
			dateCertaintyLabel: {
				messagekey: that.options.stringPaths.dateCertaintyLabel
			},
			dateQualifierLabel: {
				messagekey: that.options.stringPaths.dateQualifierLabel
			},
			dateQualifierValueLabel: {
				messagekey: that.options.stringPaths.dateQualifierValueLabel
			},
			dateQualifierUnitLabel: {
				messagekey: that.options.stringPaths.dateQualifierUnitLabel
			},
			dateEarliestSingleRowLabel: {
				messagekey: that.options.stringPaths.dateEarliestSingleRowLabel
			},
			dateLatestRowLabel: {
				messagekey: that.options.stringPaths.dateLatestRowLabel
			},
			parseStatus: {
				decorators: {
					type: "fluid",
					func: "cspace.structuredDate.popup.parseStatus",
					container: "{popup}.options.selectors.parseStatus",
					options: {
						model: that.parseStatus,
						messageResolver: that.messageResolver
					}
				}
			}
		};
	};
	
	cspace.structuredDate.popup.finalInitFunction = function (that) {
		that.rootElPath = that.composeRootElPath();
		that.displayDateElPath = that.composeElPath("dateDisplayDate");
		
		that.options.protoTree = fluid.invokeGlobalFunction(that.options.getProtoTree, [that]);
		var scalarValuesComputedPath = that.composeElPath("scalarValuesComputed");
		if (scalarValuesComputedPath && fluid.get(that.model, scalarValuesComputedPath)) {
			that.applier.modelChanged.addListener(that.rootElPath, that.updateScalarValues, "updateScalarValues-" + that.rootElPath);
		}
		
		that.applier.modelChanged.addListener(that.displayDateElPath, function (model, oldModel) {
			var oldValue = fluid.get(oldModel, that.displayDateElPath);
			
			if (typeof(oldValue) == "undefined" || oldValue == null) {
				// Normalize blank values to empty string
				oldValue = "";
			}
			
			var currentValue = fluid.get(model, that.displayDateElPath);
		
			if (typeof(currentValue) == "undefined" || currentValue == null) {
				// Normalize blank values to empty string
				currentValue = "";
			}
			
			if (currentValue != oldValue) {
				that.updateStructuredFields();
			}
		}, "updateStructuredFields-" + that.displayDateElPath);
	};
	
	cspace.structuredDate.popup.preInit = function (that) {
		that.parseStatus = {
			isError: false,
			message: "",
			messageDetail: ""
		};
		
		that.removeApplierListeners = function () {
			that.applier.modelChanged.removeListener("updateScalarValues-" + that.rootElPath);
			that.applier.modelChanged.removeListener("updateStructuredFields-" + that.displayDateElPath);
		};
	};
	
	fluid.defaults("cspace.structuredDate.popup.parseStatus", {
		gradeNames: ["fluid.viewComponent"]
	});
	
	cspace.structuredDate.popup.parseStatus = function (container, options) {
		var that = fluid.initView("cspace.structuredDate.popup.parseStatus", container, options);
		
		if (that.model.isError) {
			that.container.addClass("error");
			that.container.text(that.options.messageResolver.resolve("structuredDate-parseErrorMessage", [that.model.message, that.model.messageDetail]));
			that.container.show();
		}
		else {
			that.container.removeClass("error");
			that.container.text("");
			that.container.hide();
		}
		
		return that;
	}

	// Fetching / Caching
	// ----------------------------------------------------
	
	// Call to primeCacheFromResources will start fetching/caching
	// of the template on this file load before the actual component's
	// creator function is called.
	fluid.fetchResources.primeCacheFromResources("cspace.structuredDate.popup");
	
}(jQuery, fluid));
