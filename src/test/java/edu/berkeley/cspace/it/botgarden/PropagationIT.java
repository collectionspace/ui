package edu.berkeley.cspace.it.botgarden;

import java.util.Arrays;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.SaveFailedException;
import edu.berkeley.cspace.driver.botgarden.BotGardenPage;
import edu.berkeley.cspace.it.CollectionSpaceIT;

public class PropagationIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(PropagationIT.class);

	public PropagationIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-propagation-germinationDate"
		));
	}
	
	/**
	 * Tests that all editable fields are successfully saved.
	 * <ul>
	 * <li>All fields should retain their value after saving</li>
	 * </ul>
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testAllFields() throws SaveFailedException {
		testAllFields(BotGardenPage.PROPAGATION);
	}
}