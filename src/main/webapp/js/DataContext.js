var cspace = cspace || {};

(function ($, fluid) {
    
    // This isn't currently used, but might be useful in fuzzing over slashes.
    var addTrailingSlash = function (url) {
        return url + (url.chatAt(length -1) !== "/") ? "/" : "";
    };
    
    /**
     * The Data Context, an object that provides generic CRUD operations for models.
     * 
     * @param {Object} model the model that is bound to this data context
     * @param {Object} options configuration options
     */
    cspace.dataContext = function (model, options) {
        var that = {};
        fluid.mergeComponentOptions(that, "fluid.dataContext", options);
        
        that.fetch = function (modelPath, id) {
            
        };
        
        that.create = function (modelPath) {
            
        };
        
        that.update = function (modelPath) {
            
        };

        that.save = function (modelPath)  {
            
        };
            
        that.remove = function (modelPath) {
            
        };
        
        return that;
    };
    
    fluid.defaults("fluid.dataContext", {
        events: {
            afterSave: null,   // modelPath, oldData, newData
            afterDelete: null, // modelPath
            afterFetch: null,  // modelPath, data
            onError: null      // operation["save", "delete", "fetch"], modelPath, message
        }
    });
    
    /**
     * A UrlFactory is responsible for hiding away the variations between loading data locally for testing
     * and on the server in production
     * 
     * @param {Object} options configuration options for the url factory
     */
    cspace.dataContext.urlFactory = function (options) {
        var that = {};
        fluid.mergeComponentOptions(that, "flud.datacontext.urlFactory", options);
        fluid.initSubcomponent(that, "resourceMapper", [fluid.COMPONENT_OPTIONS]);
        
        var extension = function () {
            return that.options.resourceFormat ? "." + that.options.resourceFormat : "";
        };
        
        that.urlForModelPath = function (modelPath, model) {
            var resource = that.options.resourceMapper.map(modelPath, model);
            return that.options.protocol + that.options.baseUrl + resource + extension();
        };
        
        return that;    
    };
    
    fluid.defaults("fluid.dataContext.urlFactory", {
       resourceMapper: {
            type: "fluid.dataContext.staticResourceMapper"
        },
        protocol: (document.location.protocol === "file:") ? "file://" : "http://",
        baseUrl: "/",
        resourceFormat: undefined
    });
    
    /**
     * The StaticResourceMapper is the default strategy for mapping model paths to resource-oriented URLs.
     * 
     * @param {Object} options configuration options for the mapper, including the modelToResourceMap
     */
    cspace.dataContext.staticResourceMapper = function (options) {
        var that = {
            modelToResourceMap: (options && options.modelToResourceMap) ? options.modelToResourceMap : {}
        };
        
        that.map = function (modelPath, model) {
            // Implement the mapping function.            
        };
        
        return that;
    };
})(jQuery, fluid_1_1);
