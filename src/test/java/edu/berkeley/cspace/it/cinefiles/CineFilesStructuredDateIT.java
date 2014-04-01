package edu.berkeley.cspace.it.cinefiles;

import java.util.Map;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.it.CollectionSpaceIT;

public class CineFilesStructuredDateIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(CineFilesStructuredDateIT.class);
	
	public static final String STRUCTURED_DATE_FIELD = "csc-objectProductionDateGroup-objectProductionDate";

	/**
	 * Tests structured date parsing.
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testStructuredDateParsing() {
		Map<String, String> popupValues;
		
		driver.navigateTo(CollectionSpacePage.CATALOGING);

		// Entering a valid date in the parent display date field should result in the
		// popup display date being filled, the popup structured fields being computed,
		// and no warning message.
		
		driver.fillField(STRUCTURED_DATE_FIELD, "March 5, 2000");
		popupValues = (Map<String, String>) driver.getFieldValue(STRUCTURED_DATE_FIELD);
		
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateDisplayDate"), "March 5, 2000");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleYear"), "2000");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleMonth"), "3");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleDay"), "5");
		Assert.assertFalse(driver.isStructuredDateParseWarningVisible(STRUCTURED_DATE_FIELD));
		
		// Clearing the parent display date field should clear the popup fields.
		
		driver.clearField(STRUCTURED_DATE_FIELD);
		popupValues = (Map<String, String>) driver.getFieldValue(STRUCTURED_DATE_FIELD);
		
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateDisplayDate"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleYear"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleMonth"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleDay"), "");
		Assert.assertFalse(driver.isStructuredDateParseWarningVisible(STRUCTURED_DATE_FIELD));
	
		// Entering an invalid date in the parent display date field should result in the
		// popup display date being filled, none of the popup structured fields being computed,
		// and a warning message.
		
		driver.fillField(STRUCTURED_DATE_FIELD, "Hello, world");
		popupValues = (Map<String, String>) driver.getFieldValue(STRUCTURED_DATE_FIELD);
		
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateDisplayDate"), "Hello, world");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleYear"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleMonth"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleDay"), "");
		Assert.assertTrue(driver.isStructuredDateParseWarningVisible(STRUCTURED_DATE_FIELD));
		
		// Clearing the popup display date field should clear the popup fields, and the warning message.

		driver.clearField("csc-structuredDate-dateDisplayDate");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleYear"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleMonth"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleDay"), "");
		Assert.assertFalse(driver.isStructuredDateParseWarningVisible(STRUCTURED_DATE_FIELD));
		
		// Entering a valid date in the popup display date field should result in the
		// popup structured fields being computed, and no warning message.
		
		driver.fillField("csc-structuredDate-dateDisplayDate", "1999");
		popupValues = (Map<String, String>) driver.getFieldValue(STRUCTURED_DATE_FIELD);

		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleYear"), "1999");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleMonth"), "1");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleDay"), "1");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateLatestYear"), "1999");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateLatestMonth"), "12");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateLatestDay"), "31");
		Assert.assertFalse(driver.isStructuredDateParseWarningVisible(STRUCTURED_DATE_FIELD));
		
		// Entering an invalid date in the popup display date field should result in none of 
		// the popup structured fields being computed, and a warning message.
		
		driver.clearField("csc-structuredDate-dateDisplayDate");
		driver.fillField("csc-structuredDate-dateDisplayDate", "Something weird");
		popupValues = (Map<String, String>) driver.getFieldValue(STRUCTURED_DATE_FIELD);

		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleYear"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleMonth"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateEarliestSingleDay"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateLatestYear"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateLatestMonth"), "");
		Assert.assertEquals(popupValues.get("csc-structuredDate-dateLatestDay"), "");
		Assert.assertTrue(driver.isStructuredDateParseWarningVisible(STRUCTURED_DATE_FIELD));
	}
}
