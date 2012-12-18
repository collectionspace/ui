/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/

(function ($, fluid) {

    "use strict";

    fluid.log("Autocomplete.js loaded");

    // An autocomplete component that is used for term completion
    // in Collection Space.
    fluid.defaults("cspace.autocomplete", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        // Minimum number of character to activate the term completion.
        minChars: 3,
        model: {
            authorities: [],
            matches: []
        },
        // Delay before making a request to complete the term.
        delay: 500,
        invokers: {
            // Invoker that positions buttons etc.
            buttonAdjustor: {
                funcName: "cspace.autocomplete.buttonAdjustor",
                args: ["{autocomplete}.closeButton", "{autocomplete}.model", "{arguments}.0"]
            },
            // Invoker that is used when authority is selected.
            selectAuthority: {
                funcName: "cspace.autocomplete.selectAuthority",
                args: ["{autocomplete}", "{arguments}.0"]
            },
            // Invoker that reverts the current state of the autocomplete
            // widget to its original.
            revertState: {
                funcName: "cspace.autocomplete.revertState",
                args: ["{autocomplete}"]
            },
            // Invoker, used when matched term is selected.
            selectMatch: {
                funcName: "cspace.autocomplete.selectMatch",
                args: ["{autocomplete}", "{arguments}.0"]
            },
            // Invoker used to display error message via messageBar.
            displayErrorMessage: "cspace.util.displayErrorMessage"
        },
        components: {
            vocab: "{vocab}",
            // Autocomplete view subcomponents - autocomplete's actual UI.
            autocomplete: {
                type: "fluid.autocomplete.autocompleteView",
                options: {
                    minChars: "{cspace.autocomplete}.options.minChars",
                    delay: "{cspace.autocomplete}.options.delay"
                }
            },
            // Common even container.
            eventHolder: {
                type: "fluid.autocomplete.eventHolder",
                priority: "first"
            },
            // A popup widget subcomponent.
            popup: {
                type: "cspace.autocomplete.popup",
                options: {
                    model: "{autocomplete}.model",
                    applier: "{autocomplete}.applier",
                    inputField: "{autocomplete}.autocompleteInput",
                    elPaths: "{autocomplete}.options.elPaths"
                }
            },
            // Data source to get all available authorities for the
            // autocomplete.
            authoritiesSource: {
                type: "cspace.autocomplete.authoritiesDataSource"
            },
            // Data source to query for matches.
            matchesSource: {
                type: "cspace.autocomplete.matchesDataSource"
            },
            // Data source to create a new term.
            newTermSource: {
                type: "cspace.autocomplete.newTermDataSource"
            },
            // Close button subcomponent.
            closeButton: {
                type: "cspace.autocomplete.closeButton"
            }
        },
        urls: {
            vocab: "&vocab=%vocab",
            vocabSingle: "?vocab=%vocab"
        },
        parentBundle: "{globalBundle}",
        elPaths: {
            preferred: "preferred",
            displayName: "displayName",
            urn: "urn",
            baseUrn: "baseUrn",
            displayNames: "displayNames",
            matches: "matches",
            type: "type",
            csid: "csid",
            rowDisabled: "disabled",
            namespace: "namespace"
        },
        preInitFunction: "cspace.autocomplete.preInit",
        postInitFunction: "cspace.autocomplete.postInit",
        finalInitFunction: "cspace.autocomplete.finalInit"
    });

    fluid.demands("authoritiesSource", ["cspace.hierarchyAutocomplete", "cspace.autocomplete", "cspace.nonAuthority"], {
        funcName: "cspace.autocomplete.structuredObjectsAuthoritiesSource",
        options: {
            recordType: "{cspace.recordEditor}.options.recordType"
        }
    });

    // Data source used when autocomplete is used within the context of
    // structured objects (cataloging at the memomet but can be used anywhere).
    fluid.defaults("cspace.autocomplete.structuredObjectsAuthoritiesSource", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "cspace.autocomplete.structuredObjectsAuthoritiesSource.finalInit",
        permission: "create",
        components: {
            permissionsResolver: "{permissionsResolver}",
            recordTypeManager: "{recordTypeManager}",
            globalBundle: "{globalBundle}"
        }
    });

    cspace.autocomplete.structuredObjectsAuthoritiesSource.finalInit = function (that) {
        that.resolveUrl = function () {return "";};
        that.get = function (directModel, callback) {
            var permitted = cspace.permissions.getPermissibleRelatedRecords(that.options.recordType, that.permissionsResolver, that.recordTypeManager, that.options.permission),
                togo = [];
            fluid.each(permitted, function (recordType) {
                togo.push({
                    type: recordType,
                    fullName: that.globalBundle.resolve("hierarchy-createNew")
                });
                togo.push({
                    type: recordType,
                    fullName: that.globalBundle.resolve("hierarchy-createFromExisting"),
                    createFromExisting: true
                });
            });
            callback(togo);
        };
    };

    // Expand urls based on vocab info.
    cspace.autocomplete.preInit = function (that) {
        fluid.each(["vocab", "vocabSingle"], function (url) {
            var urls = that.options.urls;
            if (!that.model.vocab) {
                urls[url] = "";
                return;
            }
            urls[url] = fluid.stringTemplate(urls[url], {
                vocab: that.model.vocab
            });
        });
    };

    cspace.autocomplete.postInit = function (that) {
        // Hide actual input field bound to a model.
        that.hiddenInput = that.container.is("input") ? that.container : $("input", that.container.parent());
        that.hiddenInput.hide();
        that.parent = that.hiddenInput.parent();

        // Create an input that will be used by autocomplete.
        var autocompleteInput = $("<input/>");
        autocompleteInput.insertAfter(that.hiddenInput);
        that.autocompleteInput = autocompleteInput;

        // Create a coantiner for a popup.
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

    cspace.autocomplete.finalInit = function (that) {
        var authUrl;
        that.resolveMessage = that.options.parentBundle.resolve;
        that.closeButton.button.attr("title", that.resolveMessage("autocomplete-closeButton"));
        // Add a listener to the onSearch event.
        that.autocomplete.events.onSearch.addListener(function (newValue, permitted) {
            that.applier.requestChange("term", newValue);
            if (permitted) {
                that.buttonAdjustor(true); // hide the button to show the "loading indicator"
                var matchesUrl = that.matchesSource.resolveUrl(that.model);
                // Fetch matches if available.
                that.matchesSource.get(that.model, function (matches) {
                    if (!matches) {
                        that.displayErrorMessage(fluid.stringTemplate(that.resolveMessage("emptyResponse"), {
                            url: matchesUrl
                        }));
                        return;
                    }
                    if (matches.isError === true) {
                        fluid.each(matches.messages, function (message) {
                            that.displayErrorMessage(message);
                        });
                        return;
                    }
                    that.applier.requestChange("matches", matches);
                    // Adjust buttons and show popup.
                    that.buttonAdjustor();
                    that.popup.open();
                    that.autocomplete.events.onSearchDone.fire(newValue);
                }, cspace.util.provideErrorCallback(that, matchesUrl, "errorFetching"));
            }
            else {
                // If invalid term, revert.
                if (newValue === "") { // CSPACE-1651
                    var blankRec = cspace.autocomplete.urnToRecord("");
                    updateAuthoritatively(that, blankRec);
                }
                that.buttonAdjustor();
                that.popup.closeWithFocus();
            }
        });

        // Bind several events to appropriate autocomplete's invokers.
        that.eventHolder.events.selectMatch.addListener(that.selectMatch);
        that.eventHolder.events.selectAuthority.addListener(that.selectAuthority);
        that.eventHolder.events.revertState.addListener(that.revertState);

        // TODO: risk of asynchrony
        authUrl = that.authoritiesSource.resolveUrl();
        that.authoritiesSource.get(null, function (authorities) {
            // After autocomplete authorities (configuration) is fetched,
            // do the rest of the setup. Handler permissions, sort authorities
            // based on vocab.
            if (!authorities) {
                that.displayErrorMessage(fluid.stringTemplate(that.resolveMessage("emptyResponse"), {
                    url: authUrl
                }));
                return;
            }
            if (authorities.isError === true) {
                fluid.each(authorities.messages, function (message) {
                    that.displayErrorMessage(message);
                });
                return;
            }
            that.applier.requestChange("authorities", authorities);
            if (that.handlePermissions) {
                that.handlePermissions();
            }
            that.model.authorities.sort(function (auth1, auth2) {
                return cspace.autocomplete.compareAuthorities(that.vocab, auth1, auth2);
            });
        }, cspace.util.provideErrorCallback(that, authUrl, "errorFetching"));

        // If closed revert state.
        that.closeButton.button.click(function () {
            that.eventHolder.events.revertState.fire();
            return false;
        });
    };

    // Sorting algo for authorities and their vocabularies.
    cspace.autocomplete.compareAuthorities = function (vocab, auth1, auth2) {
        var vocabType1 = auth1.type.split("-"),
            vocabType2 = auth2.type.split("-"),
            type1 = vocabType1[0],
            type2 = vocabType2[0],
            vocab1 = vocabType1[1],
            vocab2 = vocabType2[1],
            order;
        if (type1 !== type2) {
            return 0;
        }
        if (!vocab.hasVocabs(type1)) {
            return 0;
        }
        order = vocab.authority[type1].order.vocabs;
        return order.indexOf(vocab1) - order.indexOf(vocab2);
    };

    // Basic event holder component.
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

    // TODO: temporary conversion function whilst we ensure that all records are transmitted faithfully
    // from application layer with a reliable encoding (probably JSON itself)
    cspace.autocomplete.urnToRecord = function (string) {
        if (!string) {
            return {
                urn: "",
                displayName: ""
            };
        }
        else if (string.substring(0, 4) === "urn:") {
            return {
                urn: string,
                displayName: cspace.util.urnToString(string)
            };
        }
        else {
            return {
                urn: "urn:error:in:application:layer:every:autocomplete:field:must:have:an:urn",
                displayName: string
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
    
    /** A vestigial "autocomplete component" which does nothing other than track keystrokes
     * and fire events. It also deals with styling of a progress indicator attached to the
     * managed element, probably an <input>. */ 

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
            that.outFirer = setTimeout(that.search, that.options.delay);
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

        // ====== Bind some of the autocomplete events and their listeners.
        that.events.onSearch.addListener(function (term, permitted) {
            if (permitted) {
                container.addClass(that.options.styles.loadingStyle);
            }
        });
        
        that.events.onSearchDone.addListener(function () {
            container.removeClass(that.options.styles.loadingStyle);
        });

        that.events.onSearchDone.addListener(function () {
            delete that.searching;
            if (that.newValue) {
                that.search(that.newValue);
            }
        }, undefined, undefined, "last");
        
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
        // ================================================================

        // Handler search, taking care of timeouts based on delay and user
        // input.
        that.search = function (newValue) {
            var permitted;
            newValue = newValue || that.container.val();
            permitted = newValue.length >= that.options.minChars;

            if (newValue === that.oldValue) {
                return;
            }

            if (permitted) {
                if (that.searching) {
                    that.newValue = newValue;
                    return;
                }
                that.searching = true;
                that.oldValue = newValue;
                if (that.newValue) {
                    delete that.newValue;
                }
            } else {
                delete that.newValue;
                delete that.searching;
            }

            that.events.onSearch.fire(newValue, permitted);
        };
        
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
            if (fluid.find(item.displayNames, function (displayName) {
                if (displayName.toLowerCase().indexOf(lowterm) !== -1) {
                    return displayName;
                }
            })) {
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
    
    cspace.autocomplete.testNewTermDataSource = function () {
        var url = "%tenant/%tname/%termUrl";
        return {
            options: {
                url: url
            },
            resolveUrl: function () {
                var expander = fluid.invoke("cspace.urlExpander");
                var replaced = url;
                replaced = expander(replaced);
                return replaced;
            },
            set: function (model, directModel, callback) {
                fluid.log("Post of new term record " + JSON.stringify(model) + " to URL " + directModel.termURL);
                callback({urn: "urn:" + fluid.allocateGuid(), displayName: model.fields.displayName});
            }
        };
    };
    /**** End testing definitions ****/
    
    // Basic close button component that takes care of its positioning
    // and appropriate events.
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

    var buildValueBinding = function (fieldName) {
        return "${" + fluid.model.composeSegments("{row}", fieldName) + "}";
    };

    // Build part of the autocomplete's popup tree that represents,
    // authoity selection for a new term.
    cspace.autocomplete.makeAuthoritySelectionTree = function (tree, repeatID, listPath, fieldName) {
        tree.expander = fluid.makeArray(tree.expander);
        tree.expander.push({
            repeatID: repeatID,
            type: "fluid.renderer.repeat",
            pathAs: "row",
            controlledBy: listPath,
            tree: buildValueBinding(fieldName)
        });
    };

    // Build part of the tree responsible for rendering Preferred -
    // Non-Preferred authority names.
    cspace.autocomplete.makePNPSelectionTree = function (elPaths, styles, tree, repeatID) {
        var preferred = elPaths.preferred,
            displayName = elPaths.displayName,
            rowDisabled = elPaths.rowDisabled;
        
        tree.expander = fluid.makeArray(tree.expander);
        
        tree.expander.push({
            repeatID: repeatID,
            type: "fluid.renderer.repeat",
            pathAs: "row",
            valueAs: "rowValue",
            controlledBy: "matches",
            tree: {
                expander: [{
                    type: "fluid.renderer.condition",
                    condition: buildValueBinding(preferred),
                    trueTree: {
                        matchItemContent: {
                            value: buildValueBinding(displayName)
                        }
                    },
                    falseTree: {
                        expander: [{
                            type: "fluid.renderer.condition",
                            condition: buildValueBinding(rowDisabled),
                            trueTree: {
                                matchItemContent: {
                                    value: buildValueBinding(displayName),
                                    decorators: {
                                        type: "addClass",
                                        classes: styles.nonPreferredDisabled
                                    }
                                }
                            },
                            falseTree: {
                                matchItemContent: {
                                    value: buildValueBinding(displayName),
                                    decorators: {
                                        type: "addClass",
                                        classes: styles.nonPreferred
                                    }
                                }
                            }
                        }]
                    }
                }]
            }
        });
    };

    // Generic authocomplete popup produceTree function.
    cspace.autocomplete.produceTree = function (that) {
        var tree = {},
            model = that.model;
        if (model.authorities.length > 0) {
            tree.addToPanel = {};
            tree.addTermTo = {
                messagekey: "autocomplete-addTermTo",
                args: ["${term}"]
            };
            cspace.autocomplete.makeAuthoritySelectionTree(tree, "authorityItem", "authorities", "fullName");
        }
        if (model.matches.length < 1) {
            tree.noMatches = {
                messagekey: "autocomplete-noMatches"
            };
        }
        else {
            tree.matches = {};
            cspace.autocomplete.makePNPSelectionTree(that.options.elPaths, that.options.styles, tree, "matchItem");
        }
        return tree;
    };

    // Creator function for popup subcomponent.
    cspace.autocomplete.popup = function (container, options) {
        var that = fluid.initRendererComponent("cspace.autocomplete.popup", container, options);
        fluid.initDependents(that);
        that.union = $(container).add(fluid.unwrap(that.options.inputField));
        
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

        that.activateFunction = function (item) {
            var decoded = decodeItem(item.target);
            if (decoded.type) {
                that.eventHolder.events[decoded.type === "authorities" ? "selectAuthority" : "selectMatch"].fire(decoded.index);
            }
        };
        that.container.click(that.activateFunction);
        
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

        // Handle keyboard selection and activation.
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
        return that;
    };
    
    cspace.autocomplete.popup.preInit = function (that) {
        // Process the popup model before rendering.
        cspace.util.preInitMergeListeners(that.options, {
            prepareModelForRender: function (model, applier, that) {
                var matches = [],
                    preferred = that.options.elPaths.preferred,
                    displayName = that.options.elPaths.displayName,
                    displayNames = that.options.elPaths.displayNames,
                    urn = that.options.elPaths.urn,
                    baseUrn = that.options.elPaths.baseUrn,
                    csid = that.options.elPaths.csid,
                    type = that.options.elPaths.type,
                    rowDisabled = that.options.elPaths.rowDisabled,
                    matchesPath = that.options.elPaths.matches,
                    namespace = that.options.elPaths.namespace;
                fluid.each(fluid.get(model, matchesPath), function (match) {
                    var recordCSID = fluid.get(that.options, "recordModel.csid");
                    if (recordCSID && recordCSID === match[csid]) {
                        return;
                    }
                    var vocab = cspace.vocab.resolve({
                        recordType: match.type,
                        model: match,
                        vocab: that.vocab
                    }), displayNameList = fluid.get(match, displayNames), disabled = false;

                    if (!that.vocab.isNptAllowed(vocab, match.type)) {
                        disabled = true;
                    }

                    // Builde "matches" structure with all data, necessary for rendering.
                    matches = matches.concat(fluid.transform(displayNameList, function (thisDisplayName, index) {
                        var elem = {};
                        elem[urn] = match[baseUrn].concat("'", thisDisplayName, "'");
                        elem[displayName] = thisDisplayName;
                        elem[preferred] = index === 0;
                        elem[type] = match.type;
                        elem[csid] = match.csid;
                        elem[rowDisabled] = (!elem[preferred] && (disabled === true));
                        elem[namespace] = match.namespace;
                        return elem;
                    }));
                });
                that.applier.requestChange("matches", matches);
            }
        });
    };

    // Produce tree function specific to structured objects.
    cspace.autocomplete.produceTreeStructuredObjects = function (that) {
        var tree = cspace.autocomplete.produceTree(that);
        fluid.merge({
            addTermTo: "replace"
        }, tree, {
            addTermTo: {},
            newTermNamePrefix: {
                messagekey: "autocomplete-newTermNamePrefix"
            },
            newTermName: {
                value: "${term}"
            },
            newTermNamePostfix: {
                messagekey: "autocomplete-newTermNamePostfix"
            }
        });
        return tree;
    };
    
    /* miniView component */
    fluid.defaults("cspace.autocomplete.popup.miniView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        events: {
            onModel: null,
            onHide: null,
            onShow: null,
            onContext: null,
            onRender: null,
            onReady: null
        },
        listeners: {
            onContext: "{that}.onContext",
            onModel: "{that}.onModel",
            onHide: "{that}.hide",
            onShow: "{that}.show",
            onReady: "{that}.onReady"
        },
        components: {
            // Holds context of which recordType is hilighted.
            context: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: "{cspace.autocomplete.popup.miniView}.options.context"
                },
                createOnEvent: "onContext"
            },
            // Data source to fetch the data to be rendered in miniview.
            dataSource: {
                type: "cspace.autocomplete.popup.miniView.dataSource",
                createOnEvent: "onContext"
            },
            // OVerridable component that extracts correct CSID based on record
            // type, vocab.
            urnToCSID: {
                type: "cspace.autocomplete.popup.miniView.urnToCSID",
                createOnEvent: "onContext"
            },
            // Actual component that does the rendering.
            renderer: {
                container: "{cspace.autocomplete.popup.miniView}.container",
                type: "cspace.autocomplete.popup.miniView.renderer",
                createOnEvent: "onRender",
                options: {
                    model: "{cspace.autocomplete.popup.miniView}.model.basic",
                    recordType: "{cspace.autocomplete.popup.miniView}.model.attributes.type",
                    vocab: "{cspace.autocomplete.popup.miniView}.model.attributes.namespace",
                    urn: "{cspace.autocomplete.popup.miniView}.model.attributes.urn"
                }
            }
        },
        // Delay to display the miniView.
        delay: 1000,
        showTimer: undefined,
        model: null,
        preInitFunction: "cspace.autocomplete.popup.miniView.preInit"
    });

    // Component that handles correct CSID extraction from the urn.
    fluid.defaults("cspace.autocomplete.popup.miniView.urnToCSID", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        preInitFunction: "cspace.autocomplete.popup.miniView.urnToCSID.preInit"
    });

    cspace.autocomplete.popup.miniView.urnToCSID.preInit = function (that) {
        that.convert = function (urn) {
            fluid.invokeGlobalFunction(that.options.toCSID, [urn]);
        };
    };

    // Mini view renderer comopnent.
    fluid.defaults("cspace.autocomplete.popup.miniView.renderer", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "slowTemplate",
                        url: "%webapp/html/components/MiniViewTemplate.html"
                    }
                }
            }
        },
        renderOnInit: true,
        parentBundle: "{globalBundle}",
        strings: {},
        listeners: {
            prepareModelForRender: "{that}.prepareModelForRender"
        },
        selectors: {
            displayName: ".csc-autocomplete-popup-miniView-displayName",
            field1: ".csc-autocomplete-popup-miniView-field1",
            field2: ".csc-autocomplete-popup-miniView-field2",
            field3: ".csc-autocomplete-popup-miniView-field3",
            field4: ".csc-autocomplete-popup-miniView-field4",
            field1Label: ".csc-autocomplete-popup-miniView-field1Label",
            field2Label: ".csc-autocomplete-popup-miniView-field2Label",
            field3Label: ".csc-autocomplete-popup-miniView-field3Label",
            field4Label: ".csc-autocomplete-popup-miniView-field4Label"
        },
        url: cspace.componentUrlBuilder("%webapp/html/%recordType.html?csid=%csid&vocab=%vocab"),
        toCSID: "cspace.util.shortIdentifierToCSID",
        preInitFunction: "cspace.autocomplete.popup.miniView.renderer.preInit"
    });

    cspace.autocomplete.popup.miniView.renderer.preInit = function (that) {
        // Process mini view model for quick render.
        that.prepareModelForRender = function () {
            var link = fluid.stringTemplate(that.options.url, {
                recordType: that.options.recordType,
                vocab: that.options.vocab,
                csid: fluid.invokeGlobalFunction(that.options.toCSID, [
                    that.options.urn
                ])
            });
            that.applier.requestChange("miniView-link", link);
        };
    };

    fluid.fetchResources.primeCacheFromResources("cspace.autocomplete.popup.miniView.renderer");

    cspace.autocomplete.popup.miniView.preInit = function (that) {
        that.onContext = function () {
            that.options.context = that.model.attributes.type + "-miniView";
        };
        that.onModel = function (attributes) {
            that.applier.requestChange("attributes", attributes);
            that.events.onContext.fire();
            that.events.onReady.fire();
        };
        that.onReady = function () {
            that.dataSource.get({
                csid: that.options.toCSID ?
                    that.urnToCSID.convert(that.model.attributes.urn) :
                    that.model.attributes.csid,
                recordType: that.model.attributes.type,
                vocab: that.model.attributes.namespace
            }, function (basic) {
                that.applier.requestChange("basic", basic);
            });
        };
        that.applier.modelChanged.addListener("basic", function () {
            that.events.onRender.fire();
            that.events.onShow.fire();
        });
        that.hide = function () {
            clearTimeout(that.options.showTimer);
            that.container.hide();
        };
        that.show = function () {
            var options = that.options,
                showTimer = that.options.showTimer;
            if (showTimer) {
                clearTimeout(showTimer);
            }
            that.options.showTimer = setTimeout(function () {
                that.container.show();
            }, options.delay || 1);
        };
    };
    /* miniView component */

    // Autocomple popup component.
    fluid.defaults("cspace.autocomplete.popup", {
        gradeNames: "fluid.rendererComponent",
        selectors: {
            addToPanel: ".csc-autocomplete-addToPanel",
            authorityItem: ".csc-autocomplete-authorityItem",
            noMatches: ".csc-autocomplete-noMatches",
            matches: ".csc-autocomplete-matches",
            matchItem: ".csc-autocomplete-matchItem",
            matchItemContent: ".csc-autocomplete-matchItem-content",
            addTermTo: ".csc-autocomplete-addTermTo"
        },
        invokers: {
            open: "cspace.autocomplete.popup.open",
            addRowHover: "cspace.autocomplete.popup.addRowHover"
        },
        styles: {
            authoritiesSelect: "cs-autocomplete-authorityItem-select",
            matchesSelect: "cs-autocomplete-matchItem-select",
            nonPreferred: "cs-autocomplete-nonPreferred",
            nonPreferredDisabled: "cs-autocomplete-nonPreferredDisabled"
        },
        repeatingSelectors: ["matchItem", "authorityItem"],
        preInitFunction: "cspace.autocomplete.popup.preInit",
        produceTree: "cspace.autocomplete.produceTree",
        // Template for popup component.
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
            // Same old event holder.
            eventHolder: "{eventHolder}",
            vocab: "{vocab}",
            miniView: {
                type: "cspace.autocomplete.popup.miniView",
                container: ".cs-autocomplete-popup-miniView",
                createOnEvent: "afterRender"
            }
        },
        strings: {},
        parentBundle: "{globalBundle}"
    });

    fluid.demands("cspace.autocomplete.popup.open", "cspace.autocomplete.popup", {
        funcName: "cspace.autocomplete.popup.open",
        args: "{cspace.autocomplete.popup}"
    });

    fluid.demands("cspace.autocomplete.popup.open", ["cspace.autocomplete.popup", "cspace.hierarchyAutocomplete", "cspace.nonAuthority"], {
        funcName: "cspace.autocomplete.popup.open",
        args: ["{cspace.autocomplete.popup}", "newTermName"]
    });

    cspace.autocomplete.popup.open = function (that, extraSelectables) {
        // Render the popup view.
        // Attach all keyboard related abilities.
        that.renderer.refreshView();
        
        var input = fluid.unwrap(that.options.inputField),
            container = that.container,
            activatables, selectables,
            matchItemContent = that.locate("matchItemContent");
        activatables = that.locate("authorityItem").add(matchItemContent);
        fluid.activatable(activatables, that.activateFunction);
        selectables = $(activatables).add(input);
        if (extraSelectables) {
            selectables = selectables.add(that.locate(extraSelectables));
        }

        that.selectable.selectables = selectables;
        that.selectable.selectablesUpdated();
        container.show();
        container.dialog("open");
        // NB: on IE8, the above creates a cyclically linked DOM structure! The following
        // or variant may help with styling issues container.appendTo(document.body);
        container.position({
            my: "left top",
            at: "left bottom",
            of: that.options.inputField,
            collision: "none"
        });
        
        // Add hover for all the elements
        that.addRowHover(that.miniView, matchItemContent, that.model.matches, that.container.find(".inner").width());
    };
    
    cspace.autocomplete.popup.addRowHover = function (miniView, elements, matches, left) {
        // Add hoever, focus functionality related to the mini view.
        var timeout,
            openMiniView = function (el) {
                var currentTarget = $(el.currentTarget),
                    index = currentTarget.attr("id").split(":")[1];
                
                index = (index === "") ? 0 : index * 1;
                miniView.container.css({
                    top: currentTarget.position().top,
                    left: left + 10
                });
                miniView.events.onModel.fire(matches[index]);
            },
            closeMiniView = function () {
                miniView.events.onHide.fire();
            };

        miniView.container
            .mouseenter(function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
            }).mouseleave(function (el) {
                closeMiniView(el);
            });

        elements
            .focusin(function (el) {
                openMiniView(el);
            }).focusout(function (el) {
                closeMiniView(el);
            }).hover(function (el) {
                clearTimeout(timeout);
                closeMiniView(el);
                openMiniView(el);
            }, function (el) {
                timeout = setTimeout(function () {
                    closeMiniView(el);
                }, 500);
            });
    };

    fluid.fetchResources.primeCacheFromResources("cspace.autocomplete.popup");

    function updateAuthoritatively(that, termRecord) {
        // Handle update of the actual hidden model-bound field when
        // the autocomplete value is set.
        if (that.hiddenInput.val() && 
            termRecord.urn === that.hiddenInput.val() && 
            that.autocompleteInput.val() === termRecord.displayName) {
            return;
        }
        if (that.hiddenInput.val() !== termRecord.urn) {
            that.hiddenInput.val(termRecord.urn);
            that.hiddenInput.change();
        }
        fluid.log("New value " + termRecord.displayName);
        that.autocompleteInput.val(termRecord.displayName);
        that.applier.requestChange("baseRecord", fluid.copy(termRecord));
        that.applier.requestChange("term", termRecord.displayName);
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
    
    cspace.autocomplete.handlePermissions = function (applier, model, resolve, options, permission) {
        // Filter authorities from configuration based on permissions.
        var types = fluid.transform(model.authorities, function (auth) {
            // We only need an authority not the vocabulary.
            return auth.type.split("-")[0];
        });
        options.oneOf = types;

        var authorities = fluid.remove_if(fluid.copy(model.authorities), function (auth) {
            return !cspace.permissions.resolve({
                resolver: options.resolver,
                permission: permission,
                // We only need an authority not the vocabulary.
                target: auth.type.split("-")[0]
            });
        });
        applier.requestChange("authorities", authorities);
    };
    
    cspace.autocomplete.buttonAdjustor = function (closeButton, model, hide) {
        closeButton[model.term === model.baseRecord.displayName || hide ? "hide": "show"]();
    };

    var selectAuthority = function (that, model, directModel, newTermUrl) {
        // Common select authority functionality used by all autocompletes.
        fluid.merge(null, model, {
            fields: {
                displayName: that.model.term
            },
            _view: "autocomplete"
        });
        that.buttonAdjustor(true); // Hide the button. It will be replaced by the spinnder to indicate selection is being saved (CSPACE-2091).
        that.newTermSource.set(model, directModel, function (response) {
            if (!response) {
                that.displayErrorMessage(fluid.stringTemplate(that.resolveMessage("emptyResponse"), {
                    url: newTermUrl
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
        }, cspace.util.provideErrorCallback(that, newTermUrl, "errorWriting"));
    };

    // Generic select authority invoker implementation.
    cspace.autocomplete.selectAuthority = function (that, key) {
        var authority = that.model.authorities[key],
            directModel = {termUrl: authority.url},
            newTermUrl = that.newTermSource.resolveUrl(directModel),
            model = {};
        selectAuthority(that, model, directModel, newTermUrl);
    };

    // Select authority specific to structured objects.
    cspace.autocomplete.selectAuthorityStructuredObjects = function (that, recordModel, changeTracker, messageBar, fieldsToIgnore, schema, key) {
        var authority = that.model.authorities[key],
            directModel = {termUrl: authority.type},
            newTermUrl = that.newTermSource.resolveUrl(directModel),
            model;
        if (!that.model.term) {
            that.revertState();
            messageBar.show(that.options.parentBundle.resolve("autocomplete-structuredObjects-enterName"), null, true);
            that.eventHolder.events.afterSelectAuthority.fire();
            return;
        }
        if (authority.createFromExisting) {
            if (changeTracker.unsavedChanges) {
                that.revertState();
                messageBar.show(that.options.parentBundle.resolve("autocomplete-structuredObjects-save"), null, true);
                that.eventHolder.events.afterSelectAuthority.fire();
                return;
            }
            model = fluid.copy(recordModel);
            fluid.each(fieldsToIgnore, function (fieldPath) {
                fluid.set(model, fieldPath);
            });
        } else {
            model = cspace.util.getBeanValue({}, authority.type, schema);
        }
        selectAuthority(that, model, directModel, newTermUrl);
    };

    // Revert autocomplete value to its original.
    cspace.autocomplete.revertState = function (that) {
        updateAuthoritatively(that, that.model.baseRecord);
        that.buttonAdjustor();
        that.popup.close();
    };

    // Select a match from the list of queried matches.
    cspace.autocomplete.selectMatch = function (that, key) {
        var match = that.model.matches[key],
            rowDisabled = that.options.elPaths.rowDisabled;
        if (match[rowDisabled]) {
            return;
        }
        updateAuthoritatively(that, match);
        that.buttonAdjustor();
        that.eventHolder.events.afterSelectMatch.fire();
    };

    // Select a match from the list of queried matches, specific to te case
    // where confirmation is needed (e.g. picking narrower that has different
    // broader).
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
                termMap: [
                    match["label"],
                    response.broader["label"]
                ],
                model: {
                    messages: [ "autocomplete-dialog-primaryMessage" ],
                    messagekeys: {
                        actText: "autocomplete-dialog-actText",
                        actAlt: "autocomplete-dialog-actAlt",
                        cancelText: "autocomplete-dialog-cancelText",
                        cancelAlt: "autocomplete-dialog-cancelAlt"
                    }
                },
                parentBundle: that.options.parentBundle
            });
        });
    };
        
})(jQuery, fluid);