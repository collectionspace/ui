To build a war file for deployment, run:

    mvn -Dmaven.test.skip=true install

This will build "cspace-ui.war" in a "target" folder and then install that war file
into your local maven repository with the version number:

	 ~/.m2/repository/org/collectionspace/ui/0.1-SNAPSHOT/cspace-ui-0.1-SNAPSHOT.war