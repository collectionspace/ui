fluid.registerNamespace("cspace.georef");

(function ($, fluid) {
    "use strict";

    fluid.log("Georef.js loaded");

	/*
	 * Checks is a DMS string can be converted to a decimal.
	 */
	cspace.georef.isValidDMS = function(dmsString) {
		return dmsString.match(/\d/);
	}

	/*
	 * Wrap georefjs.dms2deg with some format checking.
	 */
	cspace.georef.dms2decimal = function(dmsString) {
		var result = "";

		if (dmsString) {
			if (!cspace.georef.isValidDMS(dmsString)) {
				throw new Error("The DMS value is incorrectly formatted");
			}

			result = georefjs.dms2deg(dmsString);
		}

		return result;
	};

	fluid.defaults("cspace.georef.dms2decimal", {
	});
})(jQuery, fluid);