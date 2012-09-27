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

    fluid.defaults("cspace.autocomplete", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        minChars: 3,
        model: {
            authorities: [],
            matches: []
        },
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
            displayErrorMessage: "cspace.util.displayErrorMessage"
        },
        components: {
            autocomplete: {
                type: "fluid.autocomplete.autocompleteView",
                options: {
                    minChars: "{cspace.autocomplete}.options.minChars",
                    delay: "{cspace.autocomplete}.options.delay"
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
                    applier: "{autocomplete}.applier",
                    inputField: "{autocomplete}.autocompleteInput",
                    elPaths: "{autocomplete}.options.elPaths"
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
            rowDisabled: "disabled"
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

    cspace.autocomplete.finalInit = function (that) {
        var authUrl;
        that.resolveMessage = that.options.parentBundle.resolve;
        that.closeButton.button.attr("title", that.resolveMessage("autocomplete-closeButton"));
        that.autocomplete.events.onSearch.addListener(function (newValue, permitted) {
            that.applier.requestChange("term", newValue);
            if (permitted) {
                that.buttonAdjustor(true); // hide the button to show the "loading indicator"
                var matchesUrl = that.matchesSource.resolveUrl(that.model);
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
                    that.buttonAdjustor();
                    that.popup.open();
                    that.autocomplete.events.onSearchDone.fire(newValue);
                }, cspace.util.provideErrorCallback(that, matchesUrl, "errorFetching"));
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
        authUrl = that.authoritiesSource.resolveUrl();
        that.authoritiesSource.get(null, function (authorities) {
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
        }, cspace.util.provideErrorCallback(that, authUrl, "errorFetching"));

        that.closeButton.button.click(function () {
            that.eventHolder.events.revertState.fire();
            return false;
        });
    };
    
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
    
    cspace.autocomplete.testNewTermDataSource = function (options) {
        var url = "%tenant/%tname/%termUrl";
        return {
            options: {
                url: url
            },
            resolveUrl: function (directModel) {
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
                    matchesPath = that.options.elPaths.matches;
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

                    matches = matches.concat(fluid.transform(displayNameList, function (thisDisplayName, index) {
                        var elem = {};
                        elem[urn] = match[baseUrn].concat("'", thisDisplayName, "'");
                        elem[displayName] = thisDisplayName;
                        elem[preferred] = index === 0;
                        elem[type] = match.type;
                        elem[csid] = match.csid;
                        elem[rowDisabled] = (!elem[preferred] && (disabled === true));
                        return elem;
                    }));
                });
                that.applier.requestChange("matches", matches);
            }
        });
    };

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
            open: "cspace.autocomplete.popup.open"
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
            eventHolder: "{eventHolder}",
            vocab: "{vocab}"
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
        var input = fluid.unwrap(that.options.inputField),
            container = that.container,
            activatables, selectables;
        that.renderer.refreshView();
        activatables = that.locate("authorityItem").add(that.locate("matchItemContent"));
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
    };

    fluid.fetchResources.primeCacheFromResources("cspace.autocomplete.popup");

    function updateAuthoritatively(that, termRecord) {
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
    
    cspace.autocomplete.handlePermissions = function (applier, model, resolve, options, permission, selector) {
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

    cspace.autocomplete.selectAuthority = function (that, key) {
        var authority = that.model.authorities[key],
            directModel = {termUrl: authority.url},
            newTermUrl = that.newTermSource.resolveUrl(directModel),
            model = {};
        selectAuthority(that, model, directModel, newTermUrl);
    };

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
    
    cspace.autocomplete.revertState = function (that) {
        updateAuthoritatively(that, that.model.baseRecord);
        that.buttonAdjustor();
        that.popup.close();
    };
    
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
