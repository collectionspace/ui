/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/
"use strict";

var fluid = fluid || {};

(function ($) {
    
    fluid.engage = fluid.engage || {};
    
    var tryFunc = function (func, value, defaultValue) {
        try {
            return func(value);
        } catch (e) {
            return defaultValue;
        }
    };
    
    var isString = function (value) {
        return typeof value === "string";
    };
    
    var getImage = function (value) {
        if (value.thumbnail) {
            return $.makeArray(value.thumbnail)[0].nodetext;
        }
        else {
            return $.makeArray(value.small)[0].nodetext;
        }
    };
    
    fluid.engage.specs = {
        mmi: {
            dataSpec: {
                "category": "Collection category",
                "linkTarget": "Accession number",
                "linkImage": {
                    "path": "Media file",
                    "func": "getImageFromMarkupWithDefaultImage"
                },
                "linkTitle": "Object Title",
                "linkDescription": "Creation date",
                "artifactTitle": "Object Title",
                "artifactImage": {
                    "path": "Media file",
                    "func": "getImageFromMarkup"
                },
                "artifactDate": "Creation date",
                "artifactAccessionNumber": "Accession number",
                "artifactDescription": {
                    "path": "Description",
                    "func": "getDescription"
                },
                "id": "Accession number"
            },
            mappers: {
                getDescription: function (value) {
                    var getDescr = function (value) {
                        if (isString(value)) {
                            return value;
                        }
                        else {
                            return value[0];
                        }
                    };
                    return tryFunc(getDescr, value);
                },
                getImageFromMarkup: function (value) {
                    var getImage = function (value) {
                        var img = $(value).each(function (index) {
                            if ($(value).eq(index).is("img")) {
                                return $(value).eq(index);
                            }
                        });
                        var imgSRC = img.eq(0).attr("src");
                        return imgSRC ? String(imgSRC) : undefined;
                    };
                    return tryFunc(getImage, value);
                },
                getImageFromMarkupWithDefaultImage: function (value) {
                    var getImage = function (value) {
                        var img = $(value).each(function (index) {
                            if ($(value).eq(index).is("img")) {
                                return $(value).eq(index);
                            }
                        });
                        var imgSRC = img.eq(0).attr("src");
                        return imgSRC ? String(imgSRC) : undefined;
                    };
                    
                    return tryFunc(getImage, value);
                }
            }
        },
        mccord: {
            dataSpec: {
                "artifactAccessionNumber": "value.accessnumber",                
                "artifactTitle": "value.title",
                "artifactImage": {
                    "path": "value.image",
                    "func": "getImage"
                }, 
                "artifactAuthor": "value.artist",
                "artifactDate": "value.dated",
                "artifactDescription": "value.description",
                "artifactComments": "value.comments",
                "artifactCommentsCount": "value.commentsCount",
                "artifactDimensions": "value.dimensions",
                "artifactMedia": "value.media",
                "artifactMediaCount": "value.mediaCount",
                "artifactMedium": "value.medium",
                "artifactMention": "value.mention",
                "artifactRelated": "value.relatedArtifacts",
                "artifactRelatedCount": "value.relatedArtifactsCount",
                "id": "value.accessnumber",
                "uuid": "id"
            },
            mappers: {
                getImage: function (value) {
                    var getArtifactImage = function (value) {
                        var images = {};
                        if (value) {
                            $.each($.makeArray(value), function (index, image) {
                                if (image.primarydisplay === "yes" && image.imagesfiles) {
                                     $.each(image.imagesfiles.imagefile, function (index, imagefile) {
                                         images[imagefile.format] = imagefile.nodetext;
                                     });
                                }
                            });
                        }
                        return images.large || images.medium || images.small || images.thumbnail || "";
                    };
                    return tryFunc(getArtifactImage, value);
                }
            }
        },
        mccord_exhibitions: {
            dataSpec: {
                "isCurrent": {
                    "path": "value.isCurrent",
                    "func": "makeBoolean"
                },
                "title": "value.title",
                "id": "value.id",
                "displayDate": "value.displayDate",
                "endDate": "value.endDate",
                "image": {
                    "path": "value.image",
                    "func": "getExhibitionImage"
                }
            },
            mappers: {
                getExhibitionImage: function (value) {
                    return tryFunc(getImage, value);
                },
                makeBoolean: function (value) {
                    var convert = function () {
                        return value === "yes";
                    };
                    return tryFunc(convert, value);
                }
            }
        },
        mccord_exhibitions_view: {
            dataSpec: {
                "isCurrent": {
                    "path": "value.isCurrent",
                    "func": "makeBoolean"
                },
                "id": "key.id",
                "title": "value.title",
                "displayDate": "value.displayDate",
                "endDate": "value.endDate",
                "image": {
                    "path": "value.image",
                    "func": "getExhibitionImage"
                },
                "introduction": "value.introduction",
                "content": "value.content",
                "catalogueSize": "value.catalogueSize",
                "shortDescription": "value.shortDescription",
                "cataloguePreview": {
                    "path": "value.cataloguePreview",
                    "func": "getCataloguePreview"
                }
            },
            mappers: {
                getCataloguePreview: function (value) {
                    var getPreview = function (value) {
                        return fluid.transform(value, function (artifact) {
                            return {
                                "media": artifact.hasMedia === "yes",
                                "title": artifact.title,
                                "image": $.makeArray(artifact.thumbnail)[0].nodetext,
                                "accessionNumber": artifact.accessnumber
                            };
                        });
                    };
                    return tryFunc(getPreview, value, []);
                },
                makeBoolean: function (value) {
                    var convert = function () {
                        return value === "yes";
                    };
                    return tryFunc(convert, value);
                },
                getExhibitionImage: function (value) {
                    return tryFunc(getImage, value);
                }
            }
        },
        mccord_exhibitions_catalogue: {
            dataSpec: {
                "id": "key.id",
                "title": "value.title",
                "numArtifacts": "value.catalogueSize",
                "themes": {
                    "path": "value.sections",
                    "func": "formatSections"
                }
            },
            mappers: {
                formatSections: function (value) {
                    var getArtifactInfo = function  (artifacts) {
                        return fluid.transform(artifacts, function (artifact) {
                            return {
                                "media": artifact.hasMedia === "yes",
                                "title": artifact.title,
                                "image": $.makeArray(artifact.thumbnail)[0].nodetext,
                                "accessionNumber": artifact.accessnumber,
                                "description": artifact.subtitle
                            };
                        });
                    };
                    var format = function (value) {
                        var sections = [];
                        fluid.transform(value, function (val) {
                            sections.push({
                                title: val.sectionTitle,
                                sectionID: val.sectionID,
                                numArtifacts: val.sectionSize,
                                artifacts: getArtifactInfo(val.sectionHighlights)
                            });
                        });
                        return sections;
                    };
                    return tryFunc(format, value);
                }
            }
        },
        mccord_exhibitions_catalogueArtifacts: {
            dataSpec: {
                "exhibitionID": "key.exhibitID",
                "sectionID": "key.sectionID",
                "exhibitionTitle": "value.exhibitTitle",
                "sectionTitle": "value.sectionTitle",
                "sectionSize": "value.sectionSize",
                "sectionArtifacts": {
                    "path": "value.sectionArtifacts",
                    "func": "formatSectionArtifacts"
                }
            },
            mappers: {
                formatSectionArtifacts: function (value) {
                    var format = function (value) {
                        var artifacts = [];
                        fluid.transform(value, function (val) {
                            artifacts.push({
                                "title": val.title,
                                "imageUrl": $.makeArray(val.thumbnail)[0].nodetext,
                                "accessionNumber": val.accessnumber,
                                "media": val.hasMedia === "yes",
                                "description": val.subtitle
                            });
                        });
                        return artifacts;
                    };
                    return tryFunc(format, value);
                }
            }
        }
    };
    
    fluid.engage.mapModel = function (model, dbName, spec) {
        
        spec = spec || fluid.engage.specs;
        
        var normalizedModel = {};
        
        var validatePathFunc = function (path, func) {
            return path && func;
        };
        
        var invokeSpecValueFunction = function (func, value, mappers) {
            if (isString(func)) {
                return mappers ? fluid.model.getBeanValue(mappers, func)(value) : fluid.invokeGlobalFunction(func, [value]);
            } else {
                return func(value);
            }
        };
                
        var dbSpec = spec[dbName].dataSpec;
        for (var key in dbSpec) {
            if (dbSpec.hasOwnProperty(key)) {
                var specValue = dbSpec[key];
                if (isString(specValue)) {
                    normalizedModel[key] = fluid.model.getBeanValue(model, specValue);
                }
                else {
                    var specValueFunc = specValue.func;
                    var specValuePath = specValue.path;
                    if (!validatePathFunc(specValuePath, specValueFunc) || !isString(specValuePath)) {
                        fluid.log("Model Spec Function or Path not found in: " + specValue);
                    } else {
                        normalizedModel[key] = invokeSpecValueFunction(specValueFunc, fluid.model.getBeanValue(model, specValuePath), spec[dbName].mappers);
                    }
                }
            }
        }
        
        return normalizedModel;
    };
    
})(jQuery);