/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

(function ($, fluid) {
    fluid.log("Autocomplete.js loaded");

    cspace.autocomplete = function () {
        return cspace.autocompleteImpl.apply(null, arguments);
    };

    // TODO: temporary conversion function whilst we ensure that all records are transmitted faithfully
    // from application layer with a reliable encoding (probably JSON itself)
    cspace.autocomplete.urnToRecord = function (string) {
        if (!string) {
            return {
                urn: "",
                label: ""
            };
        }
        else if (string.substring(0, 4) === "urn:") {
            return {
                urn: string,
                label: cspace.util.urnToString(string)
            };
        }
        else {
            return {
                urn: "urn:error:in:application:layer:every:autocomplete:field:must:have:an:urn",
                label: string
            };
        }
    };
    
    // Inspiration from http://stackoverflow.com/questions/158070/jquery-how-to-position-one-element-relative-to-another
    cspace.internalPositioner = function (jTarget, jToPosition, adjustX, adjustY) {
        var pos = jTarget.position();
        var target = fluid.unwrap(jTarget); 
        var toPosition = fluid.unwrap(jToPosition);
        var left = pos.left + target.offsetWidth - toPosition.offsetWidth + adjustX;
        var top = pos.top + (target.offsetHeight - toPosition.offsetHeight) / 2 + adjustY;
        jToPosition.css({
            position: "absolute",
            zIndex: 5000,
            left: left + "px",
            top: top + "px"
        });
    };
    
    cspace.autocomplete.longest = function (list) {
        var length = 0;
        var longest = "";
        fluid.each(list, function (item) {
            var label = item.label;
            if (label.length > length) {
                length = label.length;
                longest = label;
            }    
        });
        return longest;
    };
    
    /** A vestigial "autocomplete component" which does nothing other than track keystrokes
     * and fire events. It also deals with styling of a progress indicator attached to the
     * managed element, probably an <input>. */ 

    fluid.registerNamespace("fluid.autocomplete");

    fluid.defaults("fluid.autocomplete.autocompleteView", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            onSearch: null,
            onSearchDone: null
        },
        styles: {
            baseStyle: "cs-autocomplete-input",
            loadingStyle: "cs-autocomplete-loading"
        },
        components: {
            eventHolder: "{eventHolder}"
        }
    });

    fluid.autocomplete.bindListener = function (that) {
        that.container.keydown(function () {
            clearTimeout(that.outFirer);
            that.outFirer = setTimeout(function () {
                var newValue = that.container.val();
                if (newValue !== that.oldValue) {
                    that.oldValue = newValue;
                    that.events.onSearch.fire(newValue, newValue.length >= that.options.minChars);
                }
            }, that.options.delay);
        });
        that.container.change(function () {
            that.oldValue = that.container.val();
        });
    };


    fluid.autocomplete.autocompleteView = function (container, options) {
        var that = fluid.initView("fluid.autocomplete.autocompleteView", container, options);
        fluid.initDependents(that);
        that.container.addClass(that.options.styles.baseStyle);
        
        fluid.autocomplete.bindListener(that);
        
        that.events.onSearch.addListener(function (term, permitted) {
            if (permitted) {
                container.addClass(that.options.styles.loadingStyle);
            }
        });
        
        that.events.onSearchDone.addListener(function () {
            container.removeClass(that.options.styles.loadingStyle);
        });
        
        fluid.each(["selectAuthority", "selectMatch"], function (event) {
            that.eventHolder.events[event].addListener(function () {
                container.addClass(that.options.styles.loadingStyle);
            });
        });
        fluid.each(["afterSelectMatch", "afterSelectAuthority"], function (event) {
            that.eventHolder.events[event].addListener(function () {
                container.removeClass(that.options.styles.loadingStyle);
            });
        });
        
        that.suppress = function () {
            clearTimeout(that.outFirer);
            that.outFirer = null;
            that.oldValue = that.container.val();
        };
        that.suppress();
        
        return that;
    };

    /**** Definitions for testing environment - TODO: move to separate file somewhere ****/    
    fluid.defaults("cspace.autocomplete.testAuthoritiesDataSource", {
        url: "%test/data/autocomplete/authorities.json"
    });
    
    cspace.autocomplete.testAuthoritiesDataSource = cspace.URLDataSource;
   
    cspace.autocomplete.testMatchesParser = function (data, directModel) {
        var togo = [];
        var lowterm = directModel.term.toLowerCase();
        fluid.each(data, function (item) {
            if (item.label.toLowerCase().indexOf(lowterm) !== -1) {
                togo.push(item);
            }
        });
        return togo;
    };


    fluid.defaults("cspace.autocomplete.testMatchesDataSource", {
        url: "%test/data/autocomplete/matches.json",
        responseParser: cspace.autocomplete.testMatchesParser,
        delay: 1
    });
    
    cspace.autocomplete.testMatchesDataSource = cspace.URLDataSource;
    
    cspace.autocomplete.testNewTermDataSource = function (options) {
        return {
            options: {
                url: "../../../chain%termUrl"
            },
            put: function (model, directModel, callback) {
                fluid.log("Post of new term record " + JSON.stringify(model) + " to URL " + directModel.termURL);
                callback({urn: "urn:" + fluid.allocateGuid(), label: model.fields.displayName});
            }
        };
    };
    /**** End testing definitions ****/
    
    
    fluid.defaults("cspace.autocomplete.closeButton", {
        gradeNames: ["fluid.viewComponent"],
        styles: {
            button: "cs-autocomplete-closebutton"
        },
        markup: "<a href=\"#\"></a>",
        positionAdjustment: {
            x: -1,
            y: 0
        }
    });
    
    cspace.autocomplete.closeButton = function (container, options) {
        var that = fluid.initView("cspace.autocomplete.closeButton", container, options);
        var button = $(that.options.markup);
        button.addClass(that.options.styles.button);
        button.insertAfter(that.container);
        //$("body").append(button);
        button.hide();
        that.show = function () {
            button.show();
            cspace.internalPositioner(that.container, button, that.options.positionAdjustment.x, that.options.positionAdjustment.y);
        };
        that.hide = function () {
            button.hide();
        };
        that.button = button;
        return that;
    };
    
    cspace.autocomplete.makeSelectionTree = function (tree, repeatID, listPath, fieldName) {
        tree.expander = fluid.makeArray(tree.expander);
        tree.expander.push({
            repeatID: repeatID,
            type: "fluid.renderer.repeat",
            pathAs: "row",
            controlledBy: listPath,
            tree: "${" + fluid.model.composeSegments("{row}", fieldName) + "}"
        });
    };
    
    cspace.autocomplete.matchTerm = function (label, term) {
        return label.toLowerCase() === term.toLowerCase();
    };
    
    cspace.autocomplete.produceTree = function (that) {
        var tree = {};
        var index = fluid.find(that.model.matches, function (match, index) {
            if (cspace.autocomplete.matchTerm(match.label, that.model.term)) {
                return index;
            }
        });
        if (index === undefined) {
            tree.addToPanel = {};
            tree.addTermTo = {
                messagekey: "addTermTo",
                args: {term: "${term}"}
            };
            cspace.autocomplete.makeSelectionTree(tree, "authorityItem", "authorities", "fullName");
        }
        if (that.model.matches.length === 0) {
            tree.noMatches = {
                messagekey: "noMatches"
            };
        }
        else {
            tree.matches = {};
            tree.longestMatch = cspace.autocomplete.longest(that.model.matches);
            cspace.autocomplete.makeSelectionTree(tree, "matchItem", "matches", "label");
        }
        return tree;
    };
    
    cspace.autocomplete.popup = function (container, options) {
        var that = fluid.initRendererComponent("cspace.autocomplete.popup", container, options);
        fluid.initDependents(that);
        var input = fluid.unwrap(that.options.inputField);
        that.union = $(container).add(input);
        
        var decodeItem = function (item) { // TODO: make a generic utility for this (integrate with ViewParameters for URLs)
            var togo = {
                EL: that.renderer.boundPathForNode(item) 
            };
            togo.parsed = fluid.model.parseEL(togo.EL);
            if (togo.parsed.length === 3) {
                togo.type = togo.parsed[0];
                togo.index = togo.parsed[1];
            }
            return togo;
        };
        
        var activateFunction = function (item) {
            var decoded = decodeItem(item.target);
            if (decoded.type) {
                that.eventHolder.events[decoded.type === "authorities" ? "selectAuthority" : "selectMatch"].fire(decoded.index);
            }
        };
        that.container.click(activateFunction);
        
        that.open = function () {
            that.renderer.refreshView();
            
            var activatables = that.locate("authorityItem").add(that.locate("matchItem"));
            fluid.activatable(activatables, activateFunction);
            
            var selectables = $(activatables).add(input);
            that.selectable.selectables = selectables;
            that.selectable.selectablesUpdated();
            var container = that.container;
            container.show();
            container.dialog("open");
// NB: on IE8, the above creates a cyclically linked DOM structure! The following
// or variant may help with styling issues            
//            container.appendTo(document.body);
            container.position({
                my: "left top",
                at: "left bottom",
                of: that.options.inputField,
                collision: "none"
            });
        };
        
        that.close = function () {
            that.container.dialog("close");
            that.container.html("");
        };
        
        that.closeWithFocus = function () {
            that.close();
            that.options.inputField.focus();
        };
        
        that.blurHandler = fluid.deadMansBlur(that.union, {
                exclusions: {union: that.union}, 
                    handler: function () {
                    that.eventHolder.events.revertState.fire();
                }
        });

        function makeHighlighter(funcName) {
            return function (item) {
                var decoded = decodeItem(item); 
                if (decoded.type) {
                    $(item)[funcName](that.options.styles[decoded.type + "Select"]);
                }
            };
        }
        that.selectableContainer = that.container.parent();
        // TODO: sloppy use of "parent" here is necessary to prevent removal of tabindex order
        that.selectable = fluid.selectable(that.selectableContainer, {
            selectableElements: that.options.inputField,
            noBubbleListeners: true,
            onSelect: makeHighlighter("addClass"),
            onUnselect: makeHighlighter("removeClass"),
            selectablesTabindex: ""
        });
            
        that.escapeHandler = function (event) { // TODO: too annoying to use plugin because of FLUID-1313
            if (event.keyCode === $.ui.keyCode.ESCAPE) {
                that.eventHolder.events.revertState.fire();
            }
        };
        // We trigger only on KEYUP since at least Firefox has a totally unpreventable
        // default effect in between keypress and keyup of returning the field to its
        // old value.
        that.union.keyup(that.escapeHandler);
        
        that.eventHolder.events.afterSelectAuthority.addListener(that.closeWithFocus);
        that.eventHolder.events.afterSelectMatch.addListener(that.closeWithFocus);
       
        fluid.initDependents(that);
        
        return that;
    };
    
    fluid.defaults("cspace.autocomplete.popup", {
        gradeNames: "fluid.rendererComponent",
        mergePolicy: {
            model: "preserve"
        },
        selectors: {
            addToPanel: ".csc-autocomplete-addToPanel",
            authorityItem: ".csc-autocomplete-authorityItem",
            noMatches: ".csc-autocomplete-noMatches",
            matches: ".csc-autocomplete-matches",
            matchItem: ".csc-autocomplete-matchItem",
            longestMatch: ".csc-autocomplete-longestMatch",
            addTermTo: ".csc-autocomplete-addTermTo"
        },
        styles: {
            authoritiesSelect: "cs-autocomplete-authorityItem-select",
            matchesSelect: "cs-autocomplete-matchItem-select"
        },
        repeatingSelectors: ["matchItem", "authorityItem"],
        produceTree: "cspace.autocomplete.produceTree",
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "slowTemplate",
                        url: "%webapp/html/components/AutocompleteAddPopup.html"
                    }
                }
            }
        },
        components: {
            eventHolder: "{eventHolder}"
        }
    });

    fluid.fetchResources.primeCacheFromResources("cspace.autocomplete.popup");

    function updateAuthoritatively(that, termRecord) {
        that.hiddenInput.val(termRecord.urn);
        that.hiddenInput.change();
        fluid.log("New value " + termRecord.label);
        that.autocompleteInput.val(termRecord.label);
        that.model.baseRecord = fluid.copy(termRecord);
        that.model.term = termRecord.label;
        if (that.autocomplete) {
            that.autocomplete.suppress();
        }
    }
    
    // find the HIGHEST ancestor which has non-default position
    function findTopRelative(node) {
        var lastPos;
        while (node) {
            var jNode = $(node);
            if (jNode.is("body")) {
                return lastPos || jNode;
            }
            var position = jNode.css("position");
            if (position === "relative" || position === "absolute") {
                lastPos = jNode;
            } 
            node = node.parentNode; 
        }
    }

    var setupAutocomplete = function (that) {
        that.hiddenInput = that.container.is("input") ? that.container : $("input", that.container.parent());
        that.hiddenInput.hide();
        that.parent = that.hiddenInput.parent();
        var autocompleteInput = $("<input/>");
        autocompleteInput.insertAfter(that.hiddenInput);
        that.autocompleteInput = autocompleteInput;
        
        var popup = $("<div></div>");
        var topRelative = findTopRelative(autocompleteInput[0]);
        topRelative.append(popup);
        // neither of these two options work for layout - input sibling fails on with, body never appears at all
        //popup.insertAfter(autocompleteInput);
        //$("body").append(popup);
        that.popupElement = popup;

        var initialRec = cspace.autocomplete.urnToRecord(that.hiddenInput.val());
        updateAuthoritatively(that, initialRec);
    };

    cspace.autocompleteImpl = function (container, options) {
        var that = fluid.initView("cspace.autocomplete", container, options);
        that.model = {
            authorities: [],
            matches: []
        };

        setupAutocomplete(that);
        fluid.initDependents(that);
       
        that.closeButton.button.attr("title", that.options.strings.closeButton);
       
        that.autocomplete.events.onSearch.addListener(
            function (newValue, permitted) {
                that.model.term = newValue; // TODO: use applier and use "double wait" in "flapjax style"
                if (permitted) {
                    that.buttonAdjustor(true); // hide the button to show the "loading indicator"
                    that.matchesSource.get(that.model, function (matches) {
                        if (!matches) {
                            that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                                url: that.matchesSource.options.url
                            }));
                            return;
                        }
                        if (matches.isError === true) {
                            fluid.each(matches.messages, function (message) {
                                that.displayErrorMessage(message);
                            });
                            return;
                        }
                        that.model.matches = matches;
                        that.buttonAdjustor();
                        that.popup.open();
                        that.autocomplete.events.onSearchDone.fire(newValue);
                    }, cspace.util.provideErrorCallback(that, that.matchesSource.options.url, "errorFetching"));
                }
                else {
                    if (newValue === "") { // CSPACE-1651
                        var blankRec = cspace.autocomplete.urnToRecord("");
                        updateAuthoritatively(that, blankRec);
                    }
                    that.buttonAdjustor();
                    that.popup.closeWithFocus();
                }
            });
        
        that.eventHolder.events.selectMatch.addListener(that.selectMatch);
        that.eventHolder.events.selectAuthority.addListener(that.selectAuthority);
        that.eventHolder.events.revertState.addListener(that.revertState);

        // TODO: risk of asynchrony
        that.authoritiesSource.get(null, function (authorities) {
            if (!authorities) {
                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                    url: that.authoritiesSource.options.url
                }));
                return;
            }
            if (authorities.isError === true) {
                fluid.each(authorities.messages, function (message) {
                    that.displayErrorMessage(message);
                });
                return;
            }
            that.model.authorities = authorities;
        }, cspace.util.provideErrorCallback(that, that.authoritiesSource.options.url, "errorFetching"));

        that.closeButton.button.click(function () {
            that.eventHolder.events.revertState.fire();
            return false;
        });
        
        return that;
    };
    
    cspace.autocomplete.buttonAdjustor = function (closeButton, model, hide) {
        closeButton[model.term === model.baseRecord.label || hide ? "hide": "show"]();
    };
    
    cspace.autocomplete.selectAuthority = function (that, key) {
        var authority = that.model.authorities[key];
        that.buttonAdjustor(true); // Hide the button. It will be replaced by the spinnder to indicate selection is being saved (CSPACE-2091).
        that.newTermSource.put({fields: {displayName: that.model.term}}, {termUrl: authority.url}, function (response) {
            if (!response) {
                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                    url: that.newTermSource.options.url
                }));
                return;
            }
            if (response.isError === true) {
                fluid.each(response.messages, function (message) {
                    that.displayErrorMessage(message);
                });
                return;
            }
            updateAuthoritatively(that, response);
            that.eventHolder.events.afterSelectAuthority.fire();
        }, cspace.util.provideErrorCallback(that, that.newTermSource.options.url, "errorWriting"));
    };
    
    cspace.autocomplete.revertState = function (that) {
        updateAuthoritatively(that, that.model.baseRecord);
        that.buttonAdjustor();
        that.popup.close();
    };
    
    cspace.autocomplete.selectMatch = function (that, key) {
        var match = that.model.matches[key];
        updateAuthoritatively(that, match);
        that.buttonAdjustor();
        that.eventHolder.events.afterSelectMatch.fire();
    };
    
    cspace.autocomplete.selectMatchConfirm = function (that, key) {
        var match = that.model.matches[key];
        that.broaderDataSource.get({recordType: match.type, csid: match.csid}, function (response) {
            if (!response.broader) {
                updateAuthoritatively(that, match);
                that.buttonAdjustor();
                that.eventHolder.events.afterSelectMatch.fire();
                return;
            }
            that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                listeners: {
                    onClose: function (userAction) {
                        if (userAction === "act") {
                            updateAuthoritatively(that, match);
                            that.buttonAdjustor();
                        } else {
                            that.revertState();
                        }
                        that.eventHolder.events.afterSelectMatch.fire();
                    }
                },
                termMap: {
                    narrower: match["label"],
                    broader: response.broader["label"]
                },
                strings: {
                    primaryMessage: that.options.strings.narrowerChange,
                    actText: "Yes",
                    actAlt: "yes",
                    cancelText: "No",
                    cancelAlt: "no"
                }
            });
        });
    };
    
    fluid.defaults("cspace.autocomplete", {
        gradeNames: ["fluid.viewComponent"],
        termSaverFn: cspace.autocomplete.ajaxTermSaver,
        minChars: 3,
        delay: 500,
        invokers: {
            buttonAdjustor: {
                funcName: "cspace.autocomplete.buttonAdjustor",
                args: ["{autocomplete}.closeButton", "{autocomplete}.model", "{arguments}.0"]
            },
            selectAuthority: {
                funcName: "cspace.autocomplete.selectAuthority",
                args: ["{autocomplete}", "{arguments}.0"]
            },
            revertState: {
                funcName: "cspace.autocomplete.revertState",
                args: ["{autocomplete}"]
            },
            selectMatch: {
                funcName: "cspace.autocomplete.selectMatch",
                args: ["{autocomplete}", "{arguments}.0"]
            },
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{globalBundle}.messageBase", "{arguments}.0"]
            }
        },
        components: {
            autocomplete: {
                type: "fluid.autocomplete.autocompleteView",
                options: {
                    minChars: "{autocomplete}.options.minChars",
                    delay: "{autocomplete}.options.delay"
                }
            },
            eventHolder: {
                type: "fluid.autocomplete.eventHolder",
                priority: "first"
            },
            popup: {
                type: "cspace.autocomplete.popup",
                options: {
                    model: "{autocomplete}.model",
                    inputField: "{autocomplete}.autocompleteInput",
                    strings: "{autocomplete}.options.strings"
                }
            },
            authoritiesSource: {
                type: "cspace.autocomplete.authoritiesDataSource"
            },
            matchesSource: {
                type: "cspace.autocomplete.matchesDataSource"
            },
            newTermSource: {
                type: "cspace.autocomplete.newTermDataSource"
            },
            closeButton: {
                type: "cspace.autocomplete.closeButton"
            }
        },
        strings: {
            noMatches:   "- No matches -",
            addTermTo:   "Add \"%term\" to:",
            closeButton: "Cancel edit, and return this field to the most recent authority value"
        }
    });
    
    fluid.defaults("fluid.autocomplete.eventHolder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            revertState: null,
            selectAuthority: null,
            afterSelectAuthority: null,
            selectMatch: null,
            afterSelectMatch: null
        }
    });
        
})(jQuery, fluid);
