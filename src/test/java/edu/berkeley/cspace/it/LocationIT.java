package edu.berkeley.cspace.it;

import java.util.Arrays;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;

public class LocationIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(LocationIT.class);

	public LocationIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-location-conditionNoteDate"
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
		testAllFields(CollectionSpacePage.LOCATION);
	}
}
