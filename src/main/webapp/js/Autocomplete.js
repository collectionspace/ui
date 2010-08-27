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

    cspace.autocomplete = function() {
        cspace.autocompleteImpl.apply(null, arguments);
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
                label: string.slice(string.indexOf("'") + 1, string.length - 1).replace("+", " ")
            };
        }
        else {
            return {
                urn: "urn:error:in:application:layer:every:autocomplete:field:must:have:an:urn",
                label: string
            };
        }
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
            baseStyle: "ui-autocomplete-input",
            loadingStyle: "ui-autocomplete-loading"
        }
    });

    fluid.autocomplete.bindListener = function(container, options, onSearch) {
        var outFirer;
        var oldValue = container.val();
        container.keydown(function() {
            clearTimeout(outFirer);
            outFirer = setTimeout(function() {
                var newValue = container.val();
                if (newValue !== oldValue) {
                    oldValue = newValue;
                    onSearch.fire(newValue, newValue.length >= options.minChars);
                }
            }, options.delay);
        });
    };


    fluid.autocomplete.autocompleteView = function(container, options) {
        var that = fluid.initView("fluid.autocomplete.autocompleteView", container, options);
        that.container.addClass(that.options.styles.baseStyle);
        
        fluid.autocomplete.bindListener(container, that.options, that.events.onSearch);
        
        that.events.onSearch.addListener(function(term, permitted) {
            if (permitted) {
                container.addClass(that.options.styles.loadingStyle);
            }
        });
        
        that.events.onSearchDone.addListener(function() {
            container.removeClass(that.options.styles.loadingStyle);
        });
        
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
        url: "data/autocomplete/authorities.json"
        }
    );
    cspace.autocomplete.testAuthoritiesDataSource = cspace.URLDataSource;
   
    fluid.demands("cspace.autocomplete.authoritiesDataSource",  ["cspace.localData", "cspace.autocomplete"],
        {funcName: "cspace.autocomplete.testAuthoritiesDataSource"});


    cspace.autocomplete.testMatchesParser = function(data, directModel) {
        var togo = [];
        var lowterm = directModel.term.toLowerCase();
        fluid.each(data, function(item) {
            if (item.label.toLowerCase().indexOf(lowterm) !== -1) {
                togo.push(item);
            }
        });
        return togo;
    };


    fluid.defaults("cspace.autocomplete.testMatchesDataSource", {
        url: "data/autocomplete/matches.json",
        responseParser: cspace.autocomplete.testMatchesParser
        }
    );
    cspace.autocomplete.testMatchesDataSource = cspace.URLDataSource;
        
    fluid.demands("cspace.autocomplete.matchesDataSource", ["cspace.localData", "cspace.autocomplete"],
        {funcName: "cspace.autocomplete.testMatchesDataSource"});
    
    fluid.demands("cspace.autocomplete.newTermDataSource",  ["cspace.localData", "cspace.autocomplete"],
        {funcName: "cspace.autocomplete.testNewTermDataSource"});
    
    cspace.autocomplete.testNewTermDataSource = function(options) {
        return {
            put: function(model, directModel, callback) {
                fluid.log("Post of new term record " + JSON.stringify(model) + " to URL " + directModel.termURL);
                callback({ urn: "urn:"+fluid.allocateGuid(), label: model.fields.displayName});
            }
        };
    };
    /**** End testing definitions ****/
    
    
    fluid.defaults("cspace.autocomplete.closeButton", {
        styles: {
            button: "cs-autocomplete-closebutton"
        },
        buttonUrl: "../images/icnDelete.png"
    });
    
    cspace.autocomplete.closeButton = function(container, options) {
        var that = fluid.initView("cspace.autocomplete.closeButton", container, options);
        var button = $("<a href=\"#\"><img /></a>");
        $("img", button).attr("src", that.options.buttonUrl);
        button.addClass(that.options.styles.button);
        that.container.append(button);
        button.hide();
        that.button = button;
        return that;
    };
    
    cspace.autocomplete.makeSelectionTree = function(list, event, fieldName) {
        return {
            children: 
                fluid.transform(list, function(value, key) {
                    return {
                        value: value[fieldName],
                        decorators: {
                            jQuery: ["click", function() {
                                    event.fire(key);
                               }
                            ]
                        }
                    };
                }
            )
        };
    };
    
    cspace.autocomplete.matchTerm = function(label, term) {
        return label.toLowerCase() === term.toLowerCase();
    };
    
    cspace.autocomplete.modelToTree = function(model, events) {
        var tree = {};
        var index = fluid.find(model.matches, function(match, index) {
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
            tree.authorityItem = cspace.autocomplete.makeSelectionTree(model.authorities, events.selectAuthority, "fullName");
        }
        if (model.matches.length === 0) {
            tree.noMatches = {};
        }
        else {
            tree.matches = {};
            tree.match = cspace.autocomplete.makeSelectionTree(model.matches, events.selectMatch, "label");
        }
        return tree;
    };
    
    cspace.autocomplete.popup = function(container, options) {
        var that = fluid.initRendererComponent("cspace.autocomplete.popup", container, options);
        that.events = that.options.events;
        
        that.open = function() {
            var tree = cspace.autocomplete.modelToTree(that.model, that.events);
            that.render(tree);
            that.container.dialog("open");
            cspace.util.globalDismissal(that.container, function() {
                that.close();
            });
        };
        
        that.close = function() {
            cspace.util.globalDismissal(that.container);
            that.container.dialog("close");
            that.container.html("");
        };
        
        that.events.selectAuthority.addListener(that.close);
        that.events.selectMatch.addListener(that.close);
        
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
            match: ".csc-autocomplete-match",
            addTermTo: ".csc-autocomplete-addTermTo"
            },
        repeatingSelectors: ["match", "authorityItem"],
        strings: {
            noMatches: "- No matches -",
            addTermTo: "Add \"%term\" to:"
        },
        resources: {
            template: {
                forceCache: true,
                url: "../html/AutocompleteAddPopup.html"
            }
        }
    });
    
    // prime the cache for our template as early as possible
    fluid.fetchResources(fluid.copy(fluid.defaults("cspace.autocomplete.popup").resources));


    function updateAuthoritatively(that, termRecord) {
        that.hiddenInput.val(termRecord.urn);
        that.hiddenInput.change();
        that.autocompleteInput.val(termRecord.label);
        that.model.baseRecord = fluid.copy(termRecord);
        that.model.term = termRecord.label;
    }

    var setupAutocomplete = function (that) {
        that.hiddenInput = that.container.is("input") ? that.container : $("input", that.container.parent());
        that.hiddenInput.hide();
        that.parent = that.hiddenInput.parent();
        var autocompleteInput = $("<input/>");
        autocompleteInput.insertAfter(that.hiddenInput);
        that.autocompleteInput = autocompleteInput;
        
        var popup = $("<div></div>");
        popup.insertAfter(autocompleteInput);
        that.popup = popup;

        var initialRec = cspace.autocomplete.urnToRecord(that.hiddenInput.val());
        updateAuthoritatively(that, initialRec);
    };
    
    var makeButtonAdjustor = function(closeButton, model) {
        return function(hide) {
            closeButton.button[model.term === model.baseRecord.label || hide? "hide": "show"] ();
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
       
        var buttonAdjustor = makeButtonAdjustor(that.closeButton, that.model);
       
        that.autocomplete.events.onSearch.addListener(
            function(newValue, permitted) {
                that.model.term = newValue; // TODO: use applier and use "double wait" in "flapjax style"
                if (permitted) {
                    buttonAdjustor(true); // hide the button to show the "loading indicator"
                    that.matchesSource.get(that.model, function(matches) {
                        that.model.matches = matches;
                        that.autocomplete.events.onSearchDone.fire(newValue);
                        buttonAdjustor();
                        that.popup.open();
                        });
                }
                else {
                   if (newValue === "") { // CSPACE-1651
                       var blankRec = cspace.autocomplete.urnToRecord("");
                       updateAuthoritatively(that, blankRec);
                   }
                   buttonAdjustor();
                   that.popup.close();
                }
            });
        
        that.events.selectMatch.addListener(
            function(key) {
                var match = that.model.matches[key];
                updateAuthoritatively(that, match);
                buttonAdjustor();
            });
            
        that.events.selectAuthority.addListener(
            function(key) {
                var authority = that.model.authorities[key];
                that.newTermSource.put({fields: {displayName: that.model.term}}, {termUrl: authority.url}, 
                    function(response) {
                        updateAuthoritatively(that, response);
                        buttonAdjustor();
                    });
            });

        // TODO: risk of asynchrony
        that.authoritiesSource.get(null, function(authorities) {
            that.model.authorities = authorities;
        });

        that.closeButton.button.click(function() {
            updateAuthoritatively(that, that.model.baseRecord);
            buttonAdjustor();
            that.popup.close();
            return false;
        });

        return that;
    };
    


    fluid.demands("fluid.autocomplete.autocompleteView", "cspace.autocomplete", 
      ["{autocomplete}.autocompleteInput", fluid.COMPONENT_OPTIONS]);
      
          
    fluid.demands("cspace.autocomplete.popup", "cspace.autocomplete", 
      ["{autocomplete}.popup", fluid.COMPONENT_OPTIONS]);
      
    fluid.demands("cspace.autocomplete.closeButton", "cspace.autocomplete", 
      ["{autocomplete}.parent", fluid.COMPONENT_OPTIONS]);
    
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
                    events: "{autocomplete}.events"
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
        events: {
            selectAuthority: null,
            selectMatch: null
        }
    });
})(jQuery, fluid);
