CATALINA_HOME=/usr/local/apache-tomcat-6.0.35

perl -pi -w -e 's/qa./nightly./g;' $CATALINA_HOME/lib/tenants/core/local-settings.xml;$CATALINA_HOME/bin/catalina.sh stop;$CATALINA_HOME/bin/catalina.sh start;