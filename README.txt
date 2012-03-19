To build a war file for deployment, run:

    mvn clean install

This will build "cspace-ui.war" in a $CATALINA_HOME directory.

UPDATE: March 19, 2012: Place-authority branch created. Merged with current code. 
HOWEVER, DOES NOT WORK PROPERLY YET.
Record loads and functions properly, but header, tabs, sidebar (AJAX bits) do not appear;
delete/cancel changes/save buttons do not function, either.