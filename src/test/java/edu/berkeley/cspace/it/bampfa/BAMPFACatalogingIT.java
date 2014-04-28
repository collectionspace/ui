package edu.berkeley.cspace.it.bampfa;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.it.CatalogingIT;

public class BAMPFACatalogingIT extends CatalogingIT {
	public static final Logger logger = Logger.getLogger(BAMPFACatalogingIT.class);

	/**
	 * Tests object number computation.
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testObjectNumber() {
		driver.navigateTo(CollectionSpacePage.CATALOGING);
		
		// object number should be read-only
		
		WebElement objectNumberInput = driver.findElementImmediately(By.className("csc-object-identification-object-number"));
		Assert.assertEquals(objectNumberInput.getAttribute("disabled"), "true", "object number should be read-only:");
		
		// Parts should be joined with "."
		
		driver.fillField("csc-collection-object-accNumberPrefix", "PREFIX");
		driver.fillField("csc-collection-object-accNumberPart1", "2014");
		driver.fillField("csc-collection-object-accNumberPart2", "1");
		driver.fillField("csc-collection-object-accNumberPart3", "2");
		driver.fillField("csc-collection-object-accNumberPart4", "3");
		driver.fillField("csc-collection-object-accNumberPart5", "a");

		String computedObjectNumber;
		
		computedObjectNumber = (String) driver.getFieldValue("csc-object-identification-object-number");
		
		Assert.assertEquals(computedObjectNumber, "PREFIX.2014.1.2.3.a", "incorrect computed object number:");
		
		// Empty parts should be ignored
		
		driver.clearField("csc-collection-object-accNumberPrefix");
		computedObjectNumber = (String) driver.getFieldValue("csc-object-identification-object-number");
		
		Assert.assertEquals(computedObjectNumber, "2014.1.2.3.a", "incorrect computed object number:");
		
		driver.clearField("csc-collection-object-accNumberPart5");
		computedObjectNumber = (String) driver.getFieldValue("csc-object-identification-object-number");

		Assert.assertEquals(computedObjectNumber, "2014.1.2.3", "incorrect computed object number:");

		driver.clearField("csc-collection-object-accNumberPart3");
		computedObjectNumber = (String) driver.getFieldValue("csc-object-identification-object-number");

		Assert.assertEquals(computedObjectNumber, "2014.1.3", "incorrect computed object number:");

		// Whitespace should be trimmed
		
		driver.fillField("csc-collection-object-accNumberPart3", " 2 ");
		computedObjectNumber = (String) driver.getFieldValue("csc-object-identification-object-number");

		Assert.assertEquals(computedObjectNumber, "2014.1.2.3", "incorrect computed object number:");

		driver.fillField("csc-collection-object-accNumberPrefix", " ");
		computedObjectNumber = (String) driver.getFieldValue("csc-object-identification-object-number");

		Assert.assertEquals(computedObjectNumber, "2014.1.2.3", "incorrect computed object number:");
	}
}
