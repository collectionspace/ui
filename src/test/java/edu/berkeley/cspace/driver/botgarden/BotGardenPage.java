package edu.berkeley.cspace.driver.botgarden;

import edu.berkeley.cspace.driver.Page;

public enum BotGardenPage implements Page {
	POTTAG		("pottag.html"),
	PROPAGATION	("propagation.html");
	
	private final String path;
	
	private BotGardenPage(String path) {
		this.path = path;
	}

	@Override
	public String getPath() {
		return path;
	}
}
