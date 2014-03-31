package edu.berkeley.cspace.it.cinefiles;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;
import edu.berkeley.cspace.it.WorkIT;

public class CineFilesWorkIT extends WorkIT {
	public static final Logger logger = Logger.getLogger(CineFilesWorkIT.class);

	public static final String TERM_QUALIFIER_FIELD = "csc-workAuthority-termQualifier";
	public static final String TERM_NAME_FIELD = "csc-workAuthority-termName";
	public static final String TERM_DISPLAY_NAME_FIELD = "csc-workAuthority-termDisplayName";
	
	public static final String INCORRECT_DISPLAY_NAME_MESSAGE = "incorrect computed display name";

	/**
	 * Tests CineFiles customizations to the Work form.
	 * <ul>
	 * <li>Display name should be computed from the article and title</li>
	 * </ul>
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {		
		driver.navigateTo(CollectionSpacePage.WORK);

		// If the article is undefined, the display name should just be the title.
		
		driver.fillField(TERM_NAME_FIELD, "Moon");
		Assert.assertEquals("Moon", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.navigateTo(CollectionSpacePage.WORK);

		// If the title is undefined, the display name should just be the article (plus whitespace).
		// For most articles, there should be a space between the article and the title.

		driver.fillField(TERM_QUALIFIER_FIELD, "The");
		Assert.assertEquals("The ", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.fillField(TERM_NAME_FIELD, "Shining");
		Assert.assertEquals("The Shining", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		// For articles ending in apostrophe, there should be no space.

		driver.fillField(TERM_QUALIFIER_FIELD, "L'");
		Assert.assertEquals("L'Shining", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.clearField(TERM_NAME_FIELD);
		driver.fillField(TERM_NAME_FIELD, "eau froide");
		Assert.assertEquals("L'eau froide", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		// For articles ending in dash, there should be no space.

		driver.fillField(TERM_QUALIFIER_FIELD, "El-");
		Assert.assertEquals("El-eau froide", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.clearField(TERM_NAME_FIELD);
		driver.fillField(TERM_NAME_FIELD, "Gazaeria");
		Assert.assertEquals("El-Gazaeria", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.navigateTo(CollectionSpacePage.WORK);

		// If the title is empty, the display name should just be the article (plus whitespace).

		driver.fillField(TERM_QUALIFIER_FIELD, "An");
		Assert.assertEquals("An ", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.fillField(TERM_NAME_FIELD, "");
		Assert.assertEquals("An ", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		driver.fillField(TERM_NAME_FIELD, "Education");
		Assert.assertEquals("An Education", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);

		// If the article is empty, the display name should just be the title.

		driver.fillSelectFieldByValue(TERM_QUALIFIER_FIELD, "");
		Assert.assertEquals("Education", driver.getFieldValue(TERM_DISPLAY_NAME_FIELD), INCORRECT_DISPLAY_NAME_MESSAGE);
	}
}
