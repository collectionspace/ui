package edu.berkeley.cspace.it.botgarden;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.SaveFailedException;
import edu.berkeley.cspace.driver.botgarden.BotGardenPage;
import edu.berkeley.cspace.it.CollectionSpaceIT;

public class PotTagIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(PotTagIT.class);

	/**
	 * Tests that all editable fields are successfully saved.
	 * <ul>
	 * <li>All fields should retain their value after saving</li>
	 * </ul>
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testAllFields() throws SaveFailedException {
		testAllFields(BotGardenPage.POTTAG);
	}
}
