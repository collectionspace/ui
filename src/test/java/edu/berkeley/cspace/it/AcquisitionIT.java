package edu.berkeley.cspace.it;

import java.util.Arrays;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;

public class AcquisitionIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(AcquisitionIT.class);

	public AcquisitionIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-acquisition-acquisitionAuthorizerDate"
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
		testAllFields(CollectionSpacePage.ACQUISITION);
	}
}
