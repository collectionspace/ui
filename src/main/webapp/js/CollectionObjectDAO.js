/*global jQuery, fluid_0_8*/

var cspace = cspace || {};

(function ($, fluid) {
	var DATA_FORMAT = "json";
	
    var ajax = function (that, method, resourceUrl, onSuccess, onError, data, id) {
        jQuery.ajax({
            url: that.urlFactory(that.options.baseUrl, resourceUrl, id),
            type: method,
            dataType: DATA_FORMAT,
            data: data,
            success: onSuccess,
            error: onError
        });
    };
	
	var setupCollectionObjectDAO = function (that) {
		var isLocal = (document.location.protocol === "file:");
		that.urlFactory =  isLocal ? cspace.collectionObjectDAO.createFileSystemURLFactory(that.options.resources) : 
									 cspace.collectionObjectDAO.serverURLFactory;	
	};
	
	cspace.collectionObjectDAO = function (options) {
		var that = {};
		fluid.mergeComponentOptions(that, "cspace.collectionObjectDAO", options);
		
		that.fetchObjectSchema = function (onSuccess, onError) {
			ajax(that, "GET", that.options.resources.schema, onSuccess, onError);
		};
		
		that.fetchObjects = function (onSuccess, onError) {

		};
		
		that.fetchObjectForId = function (id, onSuccess, onError) {
			ajax(that, "GET", that.options.resources.objects, onSuccess, onError, null, id);
		};
		
		that.saveNewObject = function (collectionObject, onSuccess, onError) {
			ajax(that, "POST", that.options.resources.objects, onSuccess, onError, JSON.stringify(collectionObject), that.options.newObjectIDToken);
		};
		
		setupCollectionObjectDAO(that);
		return that;	
	};
	
	cspace.collectionObjectDAO.serverURLFactory = function (baseUrl, resourceUrl, id) {
		return baseUrl + resourceUrl + (id ? id : "");
    };
	
	cspace.collectionObjectDAO.createFileSystemURLFactory = function (resourceUrls) {
		return function (baseUrl, resourceUrl, id) {
			var serverUrl = cspace.collectionObjectDAO.serverURLFactory(baseUrl, resourceUrl, id);
			if (id) {
				return serverUrl + "." + DATA_FORMAT;
			}
			
			var resourceKey = fluid.findKeyInObject(resourceUrls, resourceUrl);
			return serverUrl + resourceKey + "." + DATA_FORMAT;
		};
	};
	
	fluid.defaults("cspace.collectionObjectDAO", {
		resources: {
			objects: "objects/",
			schema: "objects/schema/"
		},
		baseUrl: "./",
		newObjectIDToken: "NEW_ID"
	});
	
})(jQuery, fluid_0_8);
