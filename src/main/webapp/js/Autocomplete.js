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
        events: {
            onSearch: null,
            onSearchDone: null
        },
        styles: {
            baseStyle: "cs-autocomplete-input",
            loadingStyle: "cs-autocomplete-loading"
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
        
        that.suppress = function () {
            clearTimeout(that.outFirer);
            that.outFirer = null;
            that.oldValue = that.container.val();
        };
        that.suppress();
        
        return that;
    };
     
    fluid.demands("cspace.autocomplete.authoritiesDataSource", 
                  "cspace.autocomplete", {
        funcName: "cspace.URLDataSource",
        args: {url: "{autocomplete}options.vocabUrl"}
    });
    
    fluid.demands("cspace.autocomplete.matchesDataSource", 
                  "cspace.autocomplete", {
        funcName: "cspace.URLDataSource", 
        args: {
            url: "%queryUrl?q=%term",
            termMap: {
                queryUrl: "{autocomplete}options.queryUrl",
                term: "encodeURIComponent:%term"
            }
        }
    });

    fluid.demands("cspace.autocomplete.newTermDataSource", 
                  "cspace.autocomplete", {
        funcName: "cspace.URLDataSource",
        args: { 
            url: "../../chain%termUrl",
            termMap: {
                termUrl: "%termUrl"
            },
            writeable: true  
        }
    });


    /**** Definitions for testing environment - TODO: move to separate file somewhere ****/    
    fluid.defaults("cspace.autocomplete.testAuthoritiesDataSource", {
        url: "%test/data/autocomplete/authorities.json"
    });
    
    cspace.autocomplete.testAuthoritiesDataSource = cspace.URLDataSource;
   
    fluid.demands("cspace.autocomplete.authoritiesDataSource",  ["cspace.localData", "cspace.autocomplete"],
        {funcName: "cspace.autocomplete.testAuthoritiesDataSource",
         args: {}});


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
        
    fluid.demands("cspace.autocomplete.matchesDataSource", ["cspace.localData", "cspace.autocomplete"],
        {funcName: "cspace.autocomplete.testMatchesDataSource",
         args: {}});
    
    fluid.demands("cspace.autocomplete.newTermDataSource",  ["cspace.localData", "cspace.autocomplete"],
        {funcName: "cspace.autocomplete.testNewTermDataSource",
         args: {}});
    
    cspace.autocomplete.testNewTermDataSource = function (options) {
        return {
            put: function (model, directModel, callback) {
                fluid.log("Post of new term record " + JSON.stringify(model) + " to URL " + directModel.termURL);
                callback({urn: "urn:" + fluid.allocateGuid(), label: model.fields.displayName});
            }
        };
    };
    /**** End testing definitions ****/
    
    
    fluid.defaults("cspace.autocomplete.closeButton", {
        styles: {
            button: "cs-autocomplete-closebutton"
        },
        buttonImageUrl: "../images/icnDelete.png",
        markup: "<a href=\"#\"><img /></a>",
        positionAdjustment: {
            x: -1,
            y: 1
        }
    });
    
    cspace.autocomplete.closeButton = function (container, options) {
        var that = fluid.initView("cspace.autocomplete.closeButton", container, options);
        var button = $(that.options.markup);
        $("img", button).attr("src", that.options.buttonImageUrl);
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
    
    cspace.autocomplete.makeSelectionTree = function (model, listPath, fieldName) {
        var list = fluid.model.getBeanValue(model, listPath);
        return { // TODO: This could *really* be done by an expander but it looks like right now the API is not suitable
            children: 
                fluid.transform(list, function (value, key) {
                    return {
                        valuebinding: fluid.model.composeSegments(listPath, key, fieldName)
                    };
                }
            )
        };
    };
    
    cspace.autocomplete.matchTerm = function (label, term) {
        return label.toLowerCase() === term.toLowerCase();
    };
    
    cspace.autocomplete.modelToTree = function (model, events) {
        var tree = {};
        var index = fluid.find(model.matches, function (match, index) {
            if (cspace.autocomplete.matchTerm(match.label, model.term)) {
                return index;
            }
        });
        if (index === undefined) {
            tree.addToPanel = {};
            tree.addTermTo = {
                messagekey: "addTermTo",
                args: {term: "${term}"}
            };
            tree.authorityItem = cspace.autocomplete.makeSelectionTree(model, "authorities", "fullName");
        }
        if (model.matches.length === 0) {
            tree.noMatches = {
                messagekey: "noMatches"
            };
        }
        else {
            tree.matches = {};
            tree.longestMatch = cspace.autocomplete.longest(model.matches);
            tree.matchItem = cspace.autocomplete.makeSelectionTree(model, "matches", "label");
        }
        return tree;
    };
    
    cspace.autocomplete.popup = function (container, options) {
        var that = fluid.initRendererComponent("cspace.autocomplete.popup", container, options);
        that.events = that.options.events;
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
                that.events[decoded.type === "authorities" ? "selectAuthority" : "selectMatch"].fire(decoded.index);
            }
        };
        that.container.click(activateFunction);
        
        that.open = function () {
            var tree = that.treeBuilder();
            that.render(tree);
            
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
                    that.events.revertState.fire();
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
                that.events.revertState.fire();
            }
        };
        // We trigger only on KEYUP since at least Firefox has a totally unpreventable
        // default effect in between keypress and keyup of returning the field to its
        // old value.
        that.union.keyup(that.escapeHandler);
        
        that.events.selectAuthority.addListener(that.closeWithFocus);
        that.events.selectMatch.addListener(that.closeWithFocus);
       
        fluid.initDependents(that);
        
        return that;
    };
    
    fluid.defaults("cspace.autocomplete.popup", {
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
        invokers: {
            treeBuilder: {
                funcName: "cspace.autocomplete.modelToTree",
                args: ["{popup}.model", "{popup}.events"]
            }  
        },
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
    
    var makeButtonAdjustor = function (closeButton, model) {
        return function (hide) {
            closeButton[model.term === model.baseRecord.label || hide ? "hide": "show"]();
        };
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
        var buttonAdjustor = makeButtonAdjustor(that.closeButton, that.model);
       
        that.autocomplete.events.onSearch.addListener(
            function (newValue, permitted) {
                that.model.term = newValue; // TODO: use applier and use "double wait" in "flapjax style"
                if (permitted) {
                    buttonAdjustor(true); // hide the button to show the "loading indicator"
                    that.matchesSource.get(that.model, function (matches) {
                        that.model.matches = matches;
                        buttonAdjustor();
                        that.popup.open();
                        that.autocomplete.events.onSearchDone.fire(newValue);
                    });
                }
                else {
                    if (newValue === "") { // CSPACE-1651
                        var blankRec = cspace.autocomplete.urnToRecord("");
                        updateAuthoritatively(that, blankRec);
                    }
                    buttonAdjustor();
                    that.popup.closeWithFocus();
                }
            });
        
        that.events.selectMatch.addListener(
            function (key) {
                var match = that.model.matches[key];
                updateAuthoritatively(that, match);
                buttonAdjustor();
            });
            
        that.events.selectAuthority.addListener(
            function (key) {
                var authority = that.model.authorities[key];
                that.newTermSource.put({fields: {displayName: that.model.term}}, {termUrl: authority.url}, 
                    function (response) {
                        updateAuthoritatively(that, response);
                        buttonAdjustor();
                    });
            });
        that.events.revertState.addListener(
            function () {
                updateAuthoritatively(that, that.model.baseRecord);
                buttonAdjustor();
                that.popup.close();              
            });

        // TODO: risk of asynchrony
        that.authoritiesSource.get(null, function (authorities) {
            that.model.authorities = authorities;
        });

        that.closeButton.button.click(function () {
            that.events.revertState.fire();
            return false;
        });
        
        return that;
    };
    


    fluid.demands("fluid.autocomplete.autocompleteView", "cspace.autocomplete", 
      ["{autocomplete}.autocompleteInput", fluid.COMPONENT_OPTIONS]);
      
          
    fluid.demands("cspace.autocomplete.popup", "cspace.autocomplete", 
      ["{autocomplete}.popupElement", fluid.COMPONENT_OPTIONS]);
      
    fluid.demands("cspace.autocomplete.closeButton", "cspace.autocomplete", 
      ["{autocomplete}.autocompleteInput", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.autocomplete", {
        termSaverFn: cspace.autocomplete.ajaxTermSaver,
        minChars: 3,
        delay: 500,
        components: {
            autocomplete: {
                type: "fluid.autocomplete.autocompleteView",
                options: {
                    minChars: "{autocomplete}.options.minChars",
                    delay: "{autocomplete}.options.delay"
                }
            },
            popup: {
                type: "cspace.autocomplete.popup",
                options: {
                    model: "{autocomplete}.model",
                    events: "{autocomplete}.events",
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
        },
        events: {
            revertState: null,
            selectAuthority: null,
            selectMatch: null
        }
    });
    
    fluid.demands("cspace.autocomplete", "cspace.recordEditor", ["@0", fluid.COMPONENT_OPTIONS]);
})(jQuery, fluid);
