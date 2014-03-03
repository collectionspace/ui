package edu.berkeley.cspace.it;

import java.util.Arrays;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;

public class IntakeIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(IntakeIT.class);
	
	public IntakeIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-intake-returnDate",
			"csc-intake-entry-date",
			"csc-intake-insurance-renewal-date",
			"csc-intake-location-date",
			"csc-intake-condition-check-date"
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
		testAllFields(CollectionSpacePage.INTAKE);
	}
}
