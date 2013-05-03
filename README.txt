To build a .war file for deployment, run:

    mvn clean install

This will build "cspace-ui.war" in a "target" folder and then install that war file
into your local maven repository with the version number:

	 ~/.m2/repository/org/collectionspace/cspace-ui/1.0/cspace-ui-1.0.war