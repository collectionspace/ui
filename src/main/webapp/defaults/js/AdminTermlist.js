/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("AdminTermList.js loaded");

    fluid.defaults("cspace.adminTermlist", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        produceTree: "cspace.adminTermlist.produceTree",
        renderOnInit: true,
        recordType: "termlist",
        components: {
            termlistListEditor: {
                type: "cspace.listEditor"
            }
        },
        selectors: {
            termlistListHeader: ".csc-termlist-listHeader",
            addTermlist: ".csc-termlist-addTermlist",
            detailsHeader: ".csc-termlist-detailsHeader",
            detailsNone: ".csc-termlist-detailsNone",
            detaulsNoneSelected: ".csc-termlist-detailsNoneSelected"
        },
        strings: {
            termlistListHeader: "Term Lists",
            addTermlist: "+",
            detailsHeader: "Term list details",
            detailsNone: "Please select a term list from the list, or create a new term list.",
            detaulsNoneSelected: "No term list selected."
        }
    });
    
    cspace.adminTermlist.produceTree = function (that) {
        return {
            termlistListHeader: {
                messagekey: "termlistListHeader"
            },
            detailsHeader: {
                messagekey: "detailsHeader"
            },
            detailsNone: {
                messagekey: "detailsNone"
            },
            detaulsNoneSelected: {
                messagekey: "detaulsNoneSelected"
            },
            addTermlist: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.addTermlist
                    }
                }
            }
        };
    };

})(jQuery, fluid);
