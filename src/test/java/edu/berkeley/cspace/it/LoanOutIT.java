package edu.berkeley.cspace.it;

import java.util.Arrays;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;

public class LoanOutIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(LoanOutIT.class);

	public LoanOutIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-loanOut-loanOutDate"
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
		testAllFields(CollectionSpacePage.LOANOUT);
	}
}
