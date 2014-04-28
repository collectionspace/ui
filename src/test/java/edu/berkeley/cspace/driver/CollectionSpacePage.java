package edu.berkeley.cspace.driver;

public enum CollectionSpacePage implements Page {
	LOGIN 			("index.html"),
	FIND_EDIT		("findedit.html"),
	CATALOGING  	("cataloging.html"),
	PERSON			("person.html"),
	CONCEPT			("concept.html"),
	LOCATION		("location.html"),
	ORGANIZATION	("organization.html"),
	PLACE			("place.html"),
	TAXON			("taxon.html"),
	WORK			("work.html"),
	CITATION		("citation.html"),
	LOANOUT			("loanout.html"),
	MOVEMENT		("movement.html"),
	OBJECTEXIT		("objectexit.html"),
	INTAKE			("intake.html"),
	GROUP			("group.html"),
	MEDIA			("media.html"),
	ADVANCED_SEARCH ("advancedsearch.html");
	
	private final String path;
	
	private CollectionSpacePage(String path) {
		this.path = path;
	}
	
	@Override
	public String getPath() {
		return path;
	}
}
