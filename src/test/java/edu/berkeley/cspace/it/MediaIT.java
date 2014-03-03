package edu.berkeley.cspace.it;

import java.util.Arrays;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;

public class MediaIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(MediaIT.class);

	public MediaIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-dimension-valueDate"
		));
	}
	
	/**
	 * Tests that all editable fields are successfully saved,
	 * excluding the Upload Media and Link to External Media
	 * fields.
	 * <ul>
	 * <li>All fields should retain their value after saving</li>
	 * </ul>
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testAllFields() throws SaveFailedException {
		testAllFields(CollectionSpacePage.MEDIA);
	}
	
	public void testUploadFile() throws SaveFailedException {
		// TODO
	}
	
	public void testLinkToExternalFile() throws SaveFailedException {
		// TODO
	}
}
