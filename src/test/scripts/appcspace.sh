#!/bin/sh

# settings. Set your variables here

# SET THIS  :   Location where you have your github instance of APP layer code
# Example   :   CSPACE_APP_LOCATION="/Users/alexn/Documents/github/cspace-app"
CSPACE_APP_LOCATION=""

# SET THIS  :   Location where you keep your tomcat folder
# Example   :   TOMCAT_INSTALLATION_PATH="/usr/local"
TOMCAT_INSTALLATION_PATH=""

# SET THIS  :   Your tomcat folder name in your TOMCAT_INSTALLATION folder
# Example   :   TOMCAT_VERSION="apache-tomcat-6.0.35"
TOMCAT_VERSION=""

# script part ---------------------

echo "-> Script start"

rm -rf $TOMCAT_INSTALLATION_PATH/$TOMCAT_VERSION/webapps/collectionspace*
echo "- Removed existing war files."

cd $CSPACE_APP_LOCATION
echo "-> Switched folder to: $CSPACE_APP_LOCATION"

mvn clean install -Dmaven.test.skip=true
echo "-> Created and deployed new war file."

cp -R tomcat-main/src/main/resources $TOMCAT_INSTALLATION_PATH/$TOMCAT_VERSION/lib/
echo "-> Copied resources"

cd $TOMCAT_INSTALLATION_PATH/$TOMCAT_VERSION/lib/
echo "-> Switched folder to: $TOMCAT_INSTALLATION_PATH/$TOMCAT_VERSION/lib/"

PREFIX="core"

cp $PREFIX-tenant.xml cspace-config-$PREFIX.xml
cp tenants/$PREFIX/nightly-settings.xml tenants/$PREFIX/local-settings.xml
echo "-> Copied $PREFIX files"

PREFIX="lifesci"

cp $PREFIX-tenant.xml cspace-config-$PREFIX.xml
cp tenants/$PREFIX/nightly-settings.xml tenants/$PREFIX/local-settings.xml
echo "-> Copied $PREFIX files"

echo "-> Script end."

# To add this file to the list of existing bash commands on MAC OS:
# 1. Copy the script somewhere outsife of the gitlocation so it won't be overwritten
# 2. Ensure that script works as intended after it is set up
# 3. Add the following line in your ~/.bash_profile without double quotes "alias appcspace='/path to your script file/appcspace.sh'"
# 4. Run this command without double quotes "source ~/.bash_profile"
# 5. Now any new terminal window with bash will recognize appcspace as a command pointing to our useful .sh script
