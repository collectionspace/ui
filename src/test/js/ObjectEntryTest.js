/*global jQuery, jqUnit, cspace*/
(function ($) {
	
	var objectEntryTest = new jqUnit.TestCase("ObjectEntry Tests");

    // this tests a modal dialog - it might have to remain last in the file
    objectEntryTest.test("showSchemaErrorMessage", function () {
        jqUnit.notVisible("Error dialog should not be visible to start", ".csc-error-dialog");

        var objEntry = cspace.objectEntry("#main");

        jqUnit.isVisible("Error dialog should be visible", ".csc-error-dialog");
        var errorMessage = $(".csc-error-message").text();
        jqUnit.assertTrue("Error string should contain schemaFetchError", (errorMessage.indexOf(objEntry.options.strings.schemaFetchError) > -1));
        jqUnit.assertTrue("Error string should contain errorRecoverySuggestion", (errorMessage.indexOf(objEntry.options.strings.errorRecoverySuggestion) > -1));
    });
})(jQuery);
