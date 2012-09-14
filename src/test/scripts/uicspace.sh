#!/bin/sh

# settings. Set your variables here

# SET THIS  :   Location where you have your github instance of UI layer code
# EXAMPLE   :   CSPACE_UI_LOCATION="/Users/alexn/Documents/github/ui"
CSPACE_UI_LOCATION=""

# SET THIS  :   Location where you keep your tomcat folder
# EXAMPLE   :   TOMCAT_INSTALLATION_PATH="/usr/local"
TOMCAT_INSTALLATION_PATH=""

# SET THIS  :   Your tomcat folder name in your TOMCAT_INSTALLATION folder
# EXAMPLE   :   TOMCAT_VERSION="apache-tomcat-6.0.35"
TOMCAT_VERSION=""

# script part ---------------------

echo "-> Script start"

rm -rf $TOMCAT_INSTALLATION_PATH/$TOMCAT_VERSION/webapps/cspace-ui*
echo "- Removed existing war files."

cd $CSPACE_UI_LOCATION
echo "-> Switched folder to: $CSPACE_UI_LOCATION"

mvn clean install
echo "-> Created and deployed new war file."

rm -rf $CSPACE_UI_LOCATION/target
echo "-> Removed target folder."

echo "-> Script end."


# To add this file to the list of existing bash commands on MAC OS:
# 1. Copy the script somewhere outsife of the gitlocation so it won't be overwritten
# 2. Ensure that script works as intended after it is set up
# 3. Add the following line in your ~/.bash_profile without double quotes "alias uicspace='/path to your script file/uicspace.sh'"
# 4. Run this command without double quotes "source ~/.bash_profile"
# 5. Now any new terminal window with bash will recognize uicspace as a command pointing to our useful .sh script
