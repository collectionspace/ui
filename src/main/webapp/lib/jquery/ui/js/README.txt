The jQuery autocomplete JavaScript file included here are not part of the released UI library yet.
They were taken from jQuery's SVN repository:
    http://jquery-ui.googlecode.com/svn/branches/labs/autocomplete
r3680

When the autocomplete widget is formally included in jQuery UI (likely v1.8) and the Fluid Infusion
library is upgraded to use that version of jQuery UI, we should upgrade CollectionSpace to that
version of Infusion and remove this copy of the autocomplete widget.


2010/01/14
==========
This copy of the autocomplete widget was patched to support a 'nothing found' callback. The patch was
small, and is reproduced below. An email was sent to the jquery-ui group regarding this functionality,
and the following JIRA was filed related to this patch:

    http://issues.collectionspace.org/browse/CSPACE-748


------------------------------- begin patch -----------------------------
Index: src/main/webapp/lib/jquery/ui/js/ui.autocomplete.js
===================================================================
--- src/main/webapp/lib/jquery/ui/js/ui.autocomplete.js	(revision 1231)
+++ src/main/webapp/lib/jquery/ui/js/ui.autocomplete.js	(revision 1232)
@@ -309,6 +309,9 @@
 				select.show();
 			} else {
 				hideResultsNow();
+                                if (options.nothingFoundCallback) {
+                                    options.nothingFoundCallback(q);
+                                }
 			}
 		};
-------------------------------- end patch -------------------------------