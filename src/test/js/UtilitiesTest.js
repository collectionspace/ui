/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var utilitiesTester = function ($) {
    
    var uispec, expectedBase, schema;
    
    var repeatable = {
        decorators: [
            {
                func: "cspace.makeRepeatable",
                type: "fluid",
                options: {
                    "elPath": "fields.responsibleDepartments",
                    "protoTree": {
                        ".csc-object-identification-other-number": "${fields.otherNumbers.0.otherNumber}",
                        ".csc-object-identification-other-number-type": {
                            optionnames: [
                                "Lender",
                                "Obsolete"
                            ],
                            optionlist: [
                                "lender",
                                "obsolete"
                            ],
                            selection: "${fields.otherNumbers.0.otherNumberType}" 
                        }
                    }
                }
            }
        ]
    };
    
    var nestedRepeatable = {
        decorators: [
            {
                func: "cspace.makeRepeatable",
                type: "fluid",
                options: {
                    "elPath": "fields.responsibleDepartments",
                    "protoTree": {
                        ".csc-object-identification-other-number": "${fields.otherNumbers.0.otherNumber.0.nestedNumber}",
                        ".csc-object-identification-other-number-type": {
                            optionnames: [
                                "Lender",
                                "Obsolete"
                            ],
                            optionlist: [
                                "lender",
                                "obsolete" 
                            ],
                            selection: "${fields.otherNumbers.0.otherNumber.0.nestedNumberType}"
                        }
                    }
                }
            }
        ]
    };
    
    var schemaForPerms = schema = {
        "loanout": {
            "type": "object",
            "properties": {
                "fields": {
                    "type": "object",
                    "properties": {
                        "role": {
                            "type": "object",
                            "properties": {
                                "account": {
                                    "type": "object"
                                },
                                "role": {
                                    "type": "array",
                                    "default": [{
                                        "roleName": "ROLE_ADMINISTRATOR",
                                        "roleId": "1",
                                        "roleGroup": "Museum staff",
                                        "roleAssigned": true
                                    }]
                                }
                            }
                        }
                    }
                }
            }
        },
        "acquisition": {
            "type": "object",
            "properties": {
                "fields": {
                    "type": "object",
                    "properties": {
                        "role": {
                            "type": "object",
                            "properties": {
                                "account": {
                                    "type": "object"
                                },
                                "role": {
                                    "type": "array",
                                    "default": [{
                                        "roleName": "ROLE_ADMINISTRATOR",
                                        "roleId": "1",
                                        "roleGroup": "Museum staff",
                                        "roleAssigned": true
                                    }]
                                }
                            }
                        }
                    }
                }
            }
        },
        "recordlist": {
            "default": ["person", "intake", "location", "loanin", "loanout", "contact", "acquisition", "organization", "objects", "movement", "objectexit"],
            "type": "array"
        }
    };
    
    var readOnlyMovementSpec = {
        ".csc-movement-movementReferenceNumber-label": {
            "messagekey": "movement-movementReferenceNumberLabel"
        },
        ".csc-movement-movementNote": "${fields.movementNote}",
        ".csc-movement-plannedRemovalDate-label": {
            "messagekey": "movement-plannedRemovalDateLabel"
        },
        ".csc-movement-movementMethod-label": {
            "messagekey": "movement-movementMethodLabel"
        },
        ".csc-movement-tenantID": "${fields.tenantID}",
        ".csc-movement-locationDate-label": {
            "messagekey": "movement-locationDateLabel"
        },
        ".csc-movement-plannedRemovalDate": {
            "value": "${fields.plannedRemovalDate}"
        },
        ".csc-movement-movementContact": {
            "value": "${fields.movementContact}",
            "decorators": [
                {
                    "func": "cspace.util.urnToStringFieldConverter",
                    "type": "fluid"
                }
            ]
        },
        ".csc-movement-currentLocationHeader-label": {
            "messagekey": "movement-currentLocationHeaderLabel"
        },
        ".csc-movement-reasonForMove-label": {
            "messagekey": "movement-reasonForMoveLabel"
        },
        ".csc-movement-summary-label": {
            "messagekey": "movement-summaryLabel"
        },
        ".csc-movement-movementMethods": {
            "decorators": [
                {
                    "func": "cspace.makeRepeatable",
                    "type": "fluid",
                    "options": {
                        "disablePrimary": true,
                        "elPath": "fields.movementMethods",
                        "protoTree": {
                            "expander": {
                                "tree": {
                                    "expander": {
                                        "repeatID": "repeat:",
                                        "tree": {
                                            ".csc-movement-movementMethods": {
                                                "value": "${{row}.movementMethod}",
                                                "decorators": [
                                                    {
                                                        "func": "cspace.util.nameForValueFinder",
                                                        "type": "fluid",
                                                        "options": {
                                                            "list": [
                                                                "",
                                                                "forklift",
                                                                "handcarried",
                                                                "trolley"
                                                            ],
                                                            "names": [
                                                                "Please select a value",
                                                                "Forklift",
                                                                "Handcarried",
                                                                "Trolley"
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        "type": "fluid.renderer.repeat",
                                        "pathAs": "row",
                                        "controlledBy": "fields.movementMethods"
                                    }
                                },
                                "type": "fluid.noexpand"
                            }
                        }
                    }
                }
            ]
        },
        ".csc-movement-normalLocation": {
            "value": "${fields.normalLocation}",
            "decorators": [
                {
                    "func": "cspace.util.urnToStringFieldConverter",
                    "type": "fluid"
                }
            ]
        },
        ".csc-movement-number-label": {
            "messagekey": "movement-numberLabel"
        },
        ".csc-movement-currentLocationNote": "${fields.currentLocationNote}",
        ".csc-movement-currentLocation-label": {
            "messagekey": "movement-currentLocationLabel"
        },
        ".csc-movement-updatedAt": "${fields.updatedAt}",
        ".csc-movement-currentLocationFitness-label": {
            "messagekey": "movement-currentLocationFitnessLabel"
        },
        ".csc-movement-removalDate": {
            "value": "${fields.removalDate}"
        },
        ".csc-movement-createdAt-label": {
            "messagekey": "movement-createdAtLabel"
        },
        ".csc-movement-tenantID-label": {
            "messagekey": "movement-tenantIDLabel"
        },
        ".csc-movement-movementNote-label": {
            "messagekey": "movement-movementNoteLabel"
        },
        ".csc-movement-currentLocation": {
            "value": "${fields.currentLocation}",
            "decorators": [
                {
                    "func": "cspace.util.urnToStringFieldConverter",
                    "type": "fluid"
                }
            ]
        },
        ".csc-movement-movementControlInformation-label": {
            "messagekey": "movement-movementControlInformationLabel"
        },
        ".csc-movement-removalDate-label": {
            "messagekey": "movement-removalDateLabel"
        },
        ".csc-movement-locationDate": {
            "value": "${fields.locationDate}"
        },
        ".csc-movement-currentLocationFitness": {
            "value": "${fields.currentLocationFitness}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "dangerous",
                            "suitable",
                            "temporary",
                            "unsuitable"
                        ],
                        "names": [
                            "Please select a value",
                            "Dangerous",
                            "Suitable",
                            "Temporary",
                            "Unsuitable"
                        ]
                    }
                }
            ]
        },
        ".csc-movement-locationMovementInformation-label": {
            "messagekey": "movement-locationMovementInformationLabel"
        },
        ".csc-movement-updatedAt-label": {
            "messagekey": "movement-updatedAtLabel"
        },
        ".csc-movement-createdAt": "${fields.createdAt}",
        ".csc-movement-movementReferenceNumber": "${fields.movementReferenceNumber}",
        ".csc-movement-reasonForMove": {
            "value": "${fields.reasonForMove}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "conservation",
                            "exhibition",
                            "inventory",
                            "loan",
                            "newstoragelocation",
                            "photography",
                            "research"
                        ],
                        "names": [
                            "Please select a value",
                            "Conservation",
                            "Exhibition",
                            "Inventory",
                            "Loan",
                            "New Storage Location",
                            "Photography",
                            "Research"
                        ]
                    }
                }
            ]
        },
        ".csc-movement-movementContact-label": {
            "messagekey": "movement-movementContactLabel"
        },
        ".csc-movement-normalLocation-label": {
            "messagekey": "movement-normalLocationLabel"
        },
        ".csc-movement-currentLocationNote-label": {
            "messagekey": "movement-currentLocationNoteLabel"
        },
        ".csc-movement-movementMethods-label": {
            "messagekey": "movement-movementMethodsLabel"
        }
    };
    
    var readOnlyAcquisitionSpec = {
        ".csc-acquisition-object-purchase-price-currency": {
            "value": "${fields.objectPurchasePriceCurrency}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "swedishkrona",
                            "swissfranc",
                            "danishkrone",
                            "gbp",
                            "eur",
                            "usd",
                            "canadiandollar"
                        ],
                        "names": [
                            "Please select a value",
                            "Swedish Krona",
                            "Swiss Franc",
                            "Danish Krone",
                            "Pound Sterling",
                            "Euro",
                            "US Dollar",
                            "Canadian Dollar"
                        ]
                    }
                }
            ]
        },
        ".csc-acquisition-creditLine": "${fields.creditLine}",
        ".csc-acquisition-acquisitionFunding": {
            "decorators": [
                {
                    "func": "cspace.makeRepeatable",
                    "type": "fluid",
                    "options": {
                        "disablePrimary": true,
                        "elPath": "fields.acquisitionFunding",
                        "protoTree": {
                            "expander": {
                                "tree": {
                                    "expander": {
                                        "repeatID": "repeat:",
                                        "tree": {
                                            ".csc-acquisition-acquisitionFundingSourceProvisos": "${{row}.acquisitionFundingSourceProvisos}",
                                            ".csc-acquisition-acquisitionFundingSource": {
                                                "value": "${{row}.acquisitionFundingSource}",
                                                "decorators": [
                                                    {
                                                        "func": "cspace.util.urnToStringFieldConverter",
                                                        "type": "fluid"
                                                    }
                                                ]
                                            },
                                            ".csc-acquisition-acquisitionFundingValue": "${{row}.acquisitionFundingValue}",
                                            ".csc-acquisition-acquisitionFundingCurrency": {
                                                "value": "${{row}.acquisitionFundingCurrency}",
                                                "decorators": [
                                                    {
                                                        "func": "cspace.util.nameForValueFinder",
                                                        "type": "fluid",
                                                        "options": {
                                                            "list": [
                                                                "",
                                                                "swedishkrona",
                                                                "swissfranc",
                                                                "danishkrone",
                                                                "gbp",
                                                                "eur",
                                                                "usd",
                                                                "canadiandollar"
                                                            ],
                                                            "names": [
                                                                "Please select a value",
                                                                "Swedish Krona",
                                                                "Swiss Franc",
                                                                "Danish Krone",
                                                                "Pound Sterling",
                                                                "Euro",
                                                                "US Dollar",
                                                                "Canadian Dollar"
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        "type": "fluid.renderer.repeat",
                                        "pathAs": "row",
                                        "controlledBy": "fields.acquisitionFunding"
                                    }
                                },
                                "type": "fluid.noexpand"
                            }
                        }
                    }
                }
            ]
        },
        ".csc-acquisition-acquisition-reason": "${fields.acquisitionReason}",
        ".csc-acquisition-owners-label": {
            "messagekey": "acquisition-ownersLabel"
        },
        ".csc-acquisition-objectPurchaseOfferPriceValue-label": {
            "messagekey": "acquisition-objectPurchaseOfferPriceValueLabel"
        },
        ".csc-acquisition-acquisitionAuthorizer": {
            "value": "${fields.acquisitionAuthorizer}",
            "decorators": [
                {
                    "func": "cspace.util.urnToStringFieldConverter",
                    "type": "fluid"
                }
            ]
        },
        ".csc-acquisition-acquisitionFundingCurrency-label": {
            "messagekey": "acquisition-acquisitionFundingCurrencyLabel"
        },
        ".csc-acquisition-ownersource-label": {
            "messagekey": "acquisition-ownersourceLabel"
        },
        ".csc-acquisition-acquisitionFunding-label": {
            "messagekey": "acquisition-acquisitionFundingLabel"
        },
        ".csc-acquisition-acquisitionSources-label": {
            "messagekey": "acquisition-acquisitionSourcesLabel"
        },
        ".csc-acquisition-createdAt": "${fields.createdAt}",
        ".csc-acquisition-objectCollectionInformation-label": {
            "messagekey": "acquisition-objectCollectionInformationLabel"
        },
        ".csc-acquisition-summary-label": {
            "messagekey": "acquisition-summaryLabel"
        },
        ".csc-acquisition-tenantID-label": {
            "messagekey": "acquisition-tenantIDLabel"
        },
        ".csc-acquisition-acquisition-method": {
            "value": "${fields.acquisitionMethod}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "gift",
                            "purchase",
                            "exchange",
                            "transfer",
                            "treasure"
                        ],
                        "names": [
                            "Gift",
                            "Purchase",
                            "Exchange",
                            "Transfer",
                            "Treasure"
                        ]
                    }
                }
            ]
        },
        ".csc-acquisition-accession-date": {
            "value": "${fields.accessionDate}"
        },
        ".csc-acquisition-owner": {
            "decorators": [
                {
                    "func": "cspace.makeRepeatable",
                    "type": "fluid",
                    "options": {
                        "disablePrimary": true,
                        "elPath": "fields.owners",
                        "protoTree": {
                            "expander": {
                                "tree": {
                                    "expander": {
                                        "repeatID": "repeat:",
                                        "tree": {
                                            ".csc-acquisition-owner": {
                                                "value": "${{row}.owner}",
                                                "decorators": [
                                                    {
                                                        "func": "cspace.util.urnToStringFieldConverter",
                                                        "type": "fluid"
                                                    }
                                                ]
                                            }
                                        },
                                        "type": "fluid.renderer.repeat",
                                        "pathAs": "row",
                                        "controlledBy": "fields.owners"
                                    }
                                },
                                "type": "fluid.noexpand"
                            }
                        }
                    }
                }
            ]
        },
        ".csc-acquisition-acquisitionProvisos-label": {
            "messagekey": "acquisition-acquisitionProvisosLabel"
        },
        ".csc-acquisition-group-purchase-price-currency": {
            "value": "${fields.groupPurchasePriceCurrency}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "swedishkrona",
                            "swissfranc",
                            "danishkrone",
                            "gbp",
                            "eur",
                            "usd",
                            "canadiandollar"
                        ],
                        "names": [
                            "Please select a value",
                            "Swedish Krona",
                            "Swiss Franc",
                            "Danish Krone",
                            "Pound Sterling",
                            "Euro",
                            "US Dollar",
                            "Canadian Dollar"
                        ]
                    }
                }
            ]
        },
        ".csc-acquisition-objectPurchasePriceCurrency-label": {
            "messagekey": "acquisition-objectPurchasePriceCurrencyLabel"
        },
        ".csc-acquisition-group-purchase-price-value": "${fields.groupPurchasePriceValue}",
        ".csc-acquisition-acquisitionAuthorizer-label": {
            "messagekey": "acquisition-acquisitionAuthorizerLabel"
        },
        ".csc-acquisition-groupPurchasePriceValue-label": {
            "messagekey": "acquisition-groupPurchasePriceValueLabel"
        },
        ".csc-acquisition-updatedAt": {
            "value": "${fields.updatedAt}"
        },
        ".csc-acquisition-acquisitionDates-label": {
            "messagekey": "acquisition-acquisitionDatesLabel"
        },
        ".csc-acquisition-acquisitionAuthorizerDate": {
            "value": "${fields.acquisitionAuthorizerDate}"
        },
        ".csc-acquisition-fieldCollectionEventNames-label": {
            "messagekey": "acquisition-fieldCollectionEventNamesLabel"
        },
        ".csc-acquisition-object-purchase-offer-price-value": "${fields.objectPurchaseOfferPriceValue}",
        ".csc-object-acquisition-ownersource": "${fields.ownersource}",
        ".csc-acquisition-acquisitionFundingSourceProvisos-label": {
            "messagekey": "acquisition-acquisitionFundingSourceProvisosLabel"
        },
        ".csc-acquisition-transferOfTitleNumber-label": {
            "messagekey": "acquisition-transferOfTitleNumberLabel"
        },
        ".csc-acquisition-originalObjectPurchasePriceValue-label": {
            "messagekey": "acquisition-originalObjectPurchasePriceValueLabel"
        },
        ".csc-acquisition-fieldCollectionEventName-label": {
            "messagekey": "acquisition-fieldCollectionEventNameLabel"
        },
        ".csc-acquisition-creditLine-label": {
            "messagekey": "acquisition-creditLineLabel"
        },
        ".csc-acquisition-acquisitionMethod-label": {
            "messagekey": "acquisition-acquisitionMethodLabel"
        },
        ".csc-acquisition-acquisitionSource-label": {
            "messagekey": "acquisition-acquisitionSourceLabel"
        },
        ".csc-acquisition-objectPurchasePriceValue-label": {
            "messagekey": "acquisition-objectPurchasePriceValueLabel"
        },
        ".csc-acquisition-original-object-purchase-price-value": "${fields.originalObjectPurchasePriceValue}",
        ".csc-acquisition-objectPurchaseOfferPriceCurrency-label": {
            "messagekey": "acquisition-objectPurchaseOfferPriceCurrencyLabel"
        },
        ".csc-acquisition-object-purchase-price-value": "${fields.objectPurchasePriceValue}",
        ".csc-acquisition-acquisition-provisos": "${fields.acquisitionProvisos}",
        ".csc-acquisition-object-offer-price-value": "${fields.objectOfferPriceValue}",
        ".csc-acquisition-updatedAt-label": {
            "messagekey": "acquisition-updatedAtLabel"
        },
        ".csc-acquisition-number-label": {
            "messagekey": "acquisition-numberLabel"
        },
        ".csc-acquisition-objectOfferPriceValue-label": {
            "messagekey": "acquisition-objectOfferPriceValueLabel"
        },
        ".csc-acquisition-owner-label": {
            "messagekey": "acquisition-ownerLabel"
        },
        ".csc-acquisition-acquisitionReason-label": {
            "messagekey": "acquisition-acquisitionReasonLabel"
        },
        ".csc-acquisition-numberPatternChooser-reference-number": "${fields.acquisitionReferenceNumber}",
        ".csc-acquisition-acquisitionFundingValue-label": {
            "messagekey": "acquisition-acquisitionFundingValueLabel"
        },
        ".csc-acquisition-acquisitionAuthorizerHeader-label": {
            "messagekey": "acquisition-acquisitionAuthorizerHeaderLabel"
        },
        ".csc-acquisition-acquisitionInformation-label": {
            "messagekey": "acquisition-acquisitionInformationLabel"
        },
        ".csc-acquisition-tenantID": "${fields.tenantID}",
        ".csc-acquisition-object-offer-price-currency": {
            "value": "${fields.objectOfferPriceCurrency}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "swedishkrona",
                            "swissfranc",
                            "danishkrone",
                            "gbp",
                            "eur",
                            "usd",
                            "canadiandollar"
                        ],
                        "names": [
                            "Please select a value",
                            "Swedish Krona",
                            "Swiss Franc",
                            "Danish Krone",
                            "Pound Sterling",
                            "Euro",
                            "US Dollar",
                            "Canadian Dollar"
                        ]
                    }
                }
            ]
        },
        ".csc-acquisition-originalObjectPurchasePriceCurrency-label": {
            "messagekey": "acquisition-originalObjectPurchasePriceCurrencyLabel"
        },
        ".csc-acquisition-object-purchase-offer-price-currency": {
            "value": "${fields.objectPurchaseOfferPriceCurrency}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "swedishkrona",
                            "swissfranc",
                            "danishkrone",
                            "gbp",
                            "eur",
                            "usd",
                            "canadiandollar"
                        ],
                        "names": [
                            "Please select a value",
                            "Swedish Krona",
                            "Swiss Franc",
                            "Danish Krone",
                            "Pound Sterling",
                            "Euro",
                            "US Dollar",
                            "Canadian Dollar"
                        ]
                    }
                }
            ]
        },
        ".csc-acquisition-fieldCollectionEventName": {
            "decorators": [
                {
                    "func": "cspace.makeRepeatable",
                    "type": "fluid",
                    "options": {
                        "disablePrimary": true,
                        "elPath": "fields.fieldCollectionEventNames",
                        "protoTree": {
                            "expander": {
                                "tree": {
                                    "expander": {
                                        "repeatID": "repeat:",
                                        "tree": {
                                            ".csc-acquisition-fieldCollectionEventName": "${{row}.fieldCollectionEventName}"
                                        },
                                        "type": "fluid.renderer.repeat",
                                        "pathAs": "row",
                                        "controlledBy": "fields.fieldCollectionEventNames"
                                    }
                                },
                                "type": "fluid.noexpand"
                            }
                        }
                    }
                }
            ]
        },
        ".csc-acquisition-groupPurchasePriceCurrency-label": {
            "messagekey": "acquisition-groupPurchasePriceCurrencyLabel"
        },
        ".csc-acquisition-acquisitionDate-label": {
            "messagekey": "acquisition-acquisitionDateLabel"
        },
        ".csc-acquisition-domaindata-label": {
            "messagekey": "acquisition-domaindataLabel"
        },
        ".csc-acquisition-original-object-purchase-price-currency": {
            "value": "${fields.originalObjectPurchasePriceCurrency}",
            "decorators": [
                {
                    "func": "cspace.util.nameForValueFinder",
                    "type": "fluid",
                    "options": {
                        "list": [
                            "",
                            "swedishkrona",
                            "swissfranc",
                            "danishkrone",
                            "gbp",
                            "eur",
                            "usd",
                            "canadiandollar"
                        ],
                        "names": [
                            "Please select a value",
                            "Swedish Krona",
                            "Swiss Franc",
                            "Danish Krone",
                            "Pound Sterling",
                            "Euro",
                            "US Dollar",
                            "Canadian Dollar"
                        ]
                    }
                }
            ]
        },
        ".csc-acquisition-accessionDate-label": {
            "messagekey": "acquisition-accessionDateLabel"
        },
        ".csc-acquisition-acquisitionReferenceNumber-label": {
            "messagekey": "acquisition-acquisitionReferenceNumberLabel"
        },
        ".csc-acquisition-acquisitionFundingSource-label": {
            "messagekey": "acquisition-acquisitionFundingSourceLabel"
        },
        ".csc-acquisition-acquisitionSource": {
            "decorators": [
                {
                    "func": "cspace.makeRepeatable",
                    "type": "fluid",
                    "options": {
                        "disablePrimary": true,
                        "elPath": "fields.acquisitionSources",
                        "protoTree": {
                            "expander": {
                                "tree": {
                                    "expander": {
                                        "repeatID": "repeat:",
                                        "tree": {
                                            ".csc-acquisition-acquisitionSource": {
                                                "value": "${{row}.acquisitionSource}",
                                                "decorators": [
                                                    {
                                                        "func": "cspace.util.urnToStringFieldConverter",
                                                        "type": "fluid"
                                                    }
                                                ]
                                            }
                                        },
                                        "type": "fluid.renderer.repeat",
                                        "pathAs": "row",
                                        "controlledBy": "fields.acquisitionSources"
                                    }
                                },
                                "type": "fluid.noexpand"
                            }
                        }
                    }
                }
            ]
        },
        ".csc-acquisition-acquisitionNote-label": {
            "messagekey": "acquisition-acquisitionNoteLabel"
        },
        ".csc-acquisition-createdAt-label": {
            "messagekey": "acquisition-createdAtLabel"
        },
        ".csc-acquisition-acquisition-note": "${fields.acquisitionNote}",
        ".csc-acquisition-date": {
            "decorators": [
                {
                    "func": "cspace.makeRepeatable",
                    "type": "fluid",
                    "options": {
                        "disablePrimary": true,
                        "elPath": "fields.acquisitionDates",
                        "protoTree": {
                            "expander": {
                                "tree": {
                                    "expander": {
                                        "repeatID": "repeat:",
                                        "tree": {
                                            ".csc-acquisition-date": {
                                                "value": "${{row}.acquisitionDate}"
                                            }
                                        },
                                        "type": "fluid.renderer.repeat",
                                        "pathAs": "row",
                                        "controlledBy": "fields.acquisitionDates"
                                    }
                                },
                                "type": "fluid.noexpand"
                            }
                        }
                    }
                }
            ]
        },
        ".csc-acquisition-transfer-of-title-number": "${fields.transferOfTitleNumber}",
        ".csc-acquisition-objectOfferPriceCurrency-label": {
            "messagekey": "acquisition-objectOfferPriceCurrencyLabel"
        },
        ".csc-acquisition-acquisitionAuthorizerDate-label": {
            "messagekey": "acquisition-acquisitionAuthorizerDateLabel"
        }
    };
    
    var baserUtilitiesTest = new jqUnit.TestCase("Utilities Tests", function () {
        cspace.util.isTest = true;
        uispec = {
            recordEditor: {}
        };        
        expectedBase = {            
            fields: {                
                otherNumbers: []
            }
        };
        schema = {
            "fields": {
                "type": "object",
                "properties": {
                    "role": {
                        "type": "object",
                        "properties": {
                            "account": {
                                "type": "object"
                            },
                            "role": {
                                "type": "array",
                                "default": [{
                                    "roleName": "ROLE_ADMINISTRATOR",
                                    "roleId": "1",
                                    "roleGroup": "Museum staff",
                                    "roleAssigned": true
                                }]
                            }
                        }
                    }
                }
            }
        };
    });
    
    var utilitiesTest = cspace.tests.testEnvironment({testCase: baserUtilitiesTest});
    
    var setExpectedSchemaBasedModel = function () {
        expectedBase.fields = {
            role: {
                account: {},
                role: [{
                    "roleName": "ROLE_ADMINISTRATOR",
                    "roleId": "1",
                    "roleGroup": "Museum staff",
                    "roleAssigned": true
                }]
            }
        };
    };
    
    var perms = {
        "person": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "loanin": ["read", "list"],
        "acquisition": [],
        "organization": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "objectexit": ["create", "read", "update", "delete", "list"],
        "objects": ["create", "read", "update", "delete", "list"]
    };
    
    utilitiesTest.test("Full model from schema with getBeanValue", function () {        
        setExpectedSchemaBasedModel();
        var model = cspace.util.getBeanValue({}, "new", {
            "new": {
                type: "object",
                properties: schema
            }
        });
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase, model);
    });
    
    utilitiesTest.test("Model from schema with getBeanValue", function () {        
        setExpectedSchemaBasedModel();
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Model from schema with getBeanValue empty array", function () {        
        setExpectedSchemaBasedModel();
        schema.fields.properties.role.properties.role = {
            type: "array"
        };
        expectedBase.fields.role.role = [];
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Model from schema with getBeanValue with nesting", function () {
        schema.fields.properties.role.properties.newRoleArray = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    nestedRole: {
                        type: "array",
                        "default": [{
                            roleName: "ROLE_ADMINISTRATOR",
                            roleId: "1",
                            roleGroup: "Museum staff",
                            roleAssigned: true
                        }]
                    }
                }
            }
        };
        setExpectedSchemaBasedModel();
        expectedBase.fields.role.newRoleArray = [{
            nestedRole: [{
                roleName: "ROLE_ADMINISTRATOR",
                roleId: "1",
                roleGroup: "Museum staff",
                roleAssigned: true
            }]
        }];
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Create a model from schema with simple defaults", function () {
        schema.fields.properties.newProperty = {
            type: "string",
            "default": "This is a default"
        };
        setExpectedSchemaBasedModel();        
        expectedBase.fields.newProperty = "This is a default";
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Get a model with schema and existing model", function () {
        var model = {
            fields: {
                role: {
                    role: []
                }
            }
        }; 
        var fields = cspace.util.getBeanValue(model, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            model.fields, fields);
    });
    
    utilitiesTest.test("Create a model from schema with string fields", function () {
        schema.fields.properties.newProperty = {
            type: "string"
        };
        schema.fields.properties.newPropertyWithDefault = {
            type: "string",
            "default": "blabla"
        };
        setExpectedSchemaBasedModel();
        expectedBase.fields.newPropertyWithDefault = "blabla";
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("GetBeanValue inside the default in schema", function () {        
        setExpectedSchemaBasedModel();
        schema.fields.properties.role["default"] = {
            role: [{
                roleId: 1
            }]
        };
        var roleId = cspace.util.getBeanValue({}, "fields.role.role.0.roleId", schema);
        jqUnit.assertEquals("The correct value should be drawn from default", 1, roleId);
    });
    
    utilitiesTest.test("cspace.util.buildUrl", function () {        
        var args = [[
            "fetch", "base", "someType", "123", ""
        ], [
            "fetch", "base/", "someType", "123", ""
        ], [
            "fetch", "base/", "someType", "123", ".json"
        ], [
            "fetch", "base/", "someType"
        ], [
            "addRelations", "base/"
        ], [
            "addRelations", "base/", "ignore_stuff"
        ]];
        var expected = [
            "base/someType/123",
            "base/someType/123",
            "base/someType/123.json",
            "base/someType/",
            "base/relationships/",
            "base/relationships/"
        ];
        for (var i in args) {
            jqUnit.assertEquals("Built url value is equal to the expected", 
                expected[i], cspace.util.buildUrl.apply(null, args[i]));
        }
    });

    utilitiesTest.test("cspace.util.UISpecToReadOnly Movement", function() {
        //expect(1);
        fluid.fetchResources({ 
            uispecs: {
                href: "../uispecs/movement.json",
                options: {
                    dataType: "json"
                }               
            }
         }, function (fetched) {
             var convertedUISpec = cspace.util.resolveReadOnlyUISpec(fetched.uispecs.resourceText.recordEditor, true);
             jqUnit.assertDeepEq("Checking whether converted UISpec looks as expected", readOnlyMovementSpec, convertedUISpec);
             start();
         });
         stop();
    });
    
    
    utilitiesTest.test("cspace.util.UISpecToReadOnly Acquisition", function() {
        //expect(1);
        fluid.fetchResources({ 
            uispecs: {
                href: "../uispecs/acquisition.json",
                options: {
                    dataType: "json"
                }               
            }
         }, function (fetched) {
             var convertedUISpec = cspace.util.resolveReadOnlyUISpec(fetched.uispecs.resourceText.recordEditor, true);
             // Output read-only UISpec to Firebug's Console
             // console.log(JSON.stringify(convertedUISpec));
             jqUnit.assertDeepEq("Checking whether converted UISpec looks as expected", readOnlyAcquisitionSpec, convertedUISpec);
             start();
         });
         stop();
    });
        
    utilitiesTest.test("cspace.util.getDefaultSchemaURL", function () {
        cspace.util.getDefaultSchemaURL("intake");
        jqUnit.assertEquals("Default URL should be", "../uischema/intake.json", 
            fluid.invoke("cspace.util.getDefaultSchemaURL", "intake"));
    });
    
    utilitiesTest.test("cspace.util.urnToStringFieldConverter", function () {
        var selector = ".urnToStringTest";
        cspace.util.urnToStringFieldConverter(selector);
        jqUnit.assertEquals("Deurned text should be", "The Big Lebowsky", $(selector).text());
    });
    
    utilitiesTest.test("cspace.util.nameForValueFinder", function () {
        var selector = ".nameForValueFinderTest";
        cspace.util.nameForValueFinder(selector, {
            list: ["foo", "test"],
            names: ["FOO NAME", "TEST NAME"]
        });
        jqUnit.assertEquals("Value should be converted to the following text", "TEST NAME", $(selector).text());
    });
    
    utilitiesTest.test("cspace.recordTypes", function () {
        var recTypes = cspace.recordTypes({
            schema: cspace.tests.sampleSchema
        });
        jqUnit.assertDeepEq("all should contain", [
            "person",
            "intake",
            "loanin",
            "loanout",
            "acquisition",
            "organization",
            "cataloging",
            "movement",
            "objectexit",
            "media"
        ], recTypes.all);
        jqUnit.assertDeepEq("cataloging should contain", [
            "cataloging"
        ], recTypes.cataloging);
        jqUnit.assertDeepEq("procedures should contain", [
            "intake",
            "loanin",
            "loanout",
            "acquisition",
            "movement",
            "objectexit",
            "media"
        ], recTypes.procedures);
        jqUnit.assertDeepEq("vocabularies should contain", [
            "person",
            "organization"
        ], recTypes.vocabularies);
    });
    
    utilitiesTest.test("Loading Indicator basic", function () {
        var selector = ".loadingIndicator";
        var indicator = cspace.util.loadingIndicator(selector);
        jqUnit.notVisible("Indicator is invisible", indicator.indicator);
        indicator.events.showOn.fire();
        jqUnit.isVisible("Indicator is visible", indicator.indicator);
        indicator.events.hideOn.fire();
        jqUnit.notVisible("Indicator is invisible", indicator.indicator);
    });
};

(function () {
    utilitiesTester(jQuery);
}());
