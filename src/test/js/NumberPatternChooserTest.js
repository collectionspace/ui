/*global jQuery, jqUnit, cspace*/
(function ($) {
    
    $(document).ready(function () {

        var numberPatternChooserTest = new jqUnit.TestCase("NumberPatternChooser Tests");

//	    numberPatternChooserTest.test("Construction", function () {
            var chooser = cspace.numberPatternChooser(".info-value",
                                    {templateURL: "../../main/webapp/html/NumberPatternChooser.html"});
//	    });
    });
})(jQuery);