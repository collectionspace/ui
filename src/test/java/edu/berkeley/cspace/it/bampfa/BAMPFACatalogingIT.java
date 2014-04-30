package edu.berkeley.cspace.it.bampfa;

import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.it.CollectionSpaceIT;

public class BAMPFACatalogingIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(BAMPFACatalogingIT.class);

	/**
	 * Tests object number computation (BAMPFA-166).
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
	
	/**
	 * Tests BAM/PFA customizations to the Cataloging form.
	 * <ul>
	 * <li>The collectionobjects_common collection field should not appear (BAMPFA-167)</li>
	 * <li>The collectionobjects_bampfa collection field should appear, should be repeatable,
	 *     and should be tied to the collection vocabulary (BAMPFA-167)</li>
	 * <li>The cataloger name and catalog date fields should appear (BAMPFA-169)</li>
	 * <li>The condition/conservation fields should appear (BAMPFA-170)</li>
	 * <li>The style field should be tied to the periodorstyle vocabulary (BAMPFA-176)</li>
	 * <li>The item class field should appear, and should be tied to the itemclass vocabulary (BAMPFA-175)</li>
	 * </ul>
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.CATALOGING);
		driver.expandAllSections();
		
		List<WebElement> elements;
		
		// The collectionobjects_common collection field should not appear (BAMPFA-167)
		
		elements = driver.findElementsImmediately(By.className("csc-object-identification-collection"));
		Assert.assertEquals(elements.size(), 0, "the collectionobjects_common collection should not be found:");
		
		// The collectionobjects_bampfa collection field should appear, should be repeatable,
		// and should be tied to the collection vocabulary (BAMPFA-167)
		
		elements = driver.findElementsImmediately(By.className("csc-collection-object-bampfaCollection"));
		Assert.assertEquals(elements.size(), 1, "the collectionobjects_bampfa collection field should be found:");
		
		WebElement collectionElement = elements.get(0);
		Assert.assertEquals(driver.isRepeatable(collectionElement), true, "the collection field should be repeatable:");
		
		elements = driver.findElementsImmediately(collectionElement, By.cssSelector("option"));
		Assert.assertTrue(elements.size() > 0, "the collectionobjects_bampfa collection field should contain options:");
		
		String value = "";
		
		for (int i=0; i<elements.size(); i++) {
			String candidateValue = elements.get(i).getAttribute("value");
			
			if (StringUtils.isNotEmpty(candidateValue)) {
				value = candidateValue;
				break;
			}
		}
		
		Assert.assertTrue(value.startsWith("urn:cspace:bampfa.cspace.berkeley.edu:vocabularies:name(collection):item:name"), "the collectionobjects_bampfa collection field should be tied to the collection vocabulary:");

		// The cataloger name and catalog date fields should appear (BAMPFA-169)
		
		elements = driver.findElementsImmediately(By.className("csc-collection-object-catalogerName"));
		Assert.assertEquals(elements.size(), 1, "the cataloger name field should be found:");
		
		elements = driver.findElementsImmediately(By.className("csc-collection-object-catalogDate"));
		Assert.assertEquals(elements.size(), 1, "the catalog date field should be found:");
		
		// The condition/conservation fields should appear (BAMPFA-170)
		
		elements = driver.findElementsImmediately(By.className("csc-collection-object-conditionNote"));
		Assert.assertEquals(elements.size(), 1, "the condition note field should be found:");
		
		elements = driver.findElementsImmediately(By.className("csc-collection-object-conservationNote"));
		Assert.assertEquals(elements.size(), 1, "the conservation note field should be found:");

		elements = driver.findElementsImmediately(By.className("csc-collection-object-conditionCheckBy"));
		Assert.assertEquals(elements.size(), 1, "the condition checker field should be found:");

		elements = driver.findElementsImmediately(By.className("csc-collection-object-conditionCheckDate"));
		Assert.assertEquals(elements.size(), 1, "the condition check date field should be found:");

		// The style field should be tied to the periodorstyle vocabulary (BAMPFA-176)

		WebElement styleElement = driver.findElementImmediately(By.className("csc-object-description-style"));

		elements = driver.findElementsImmediately(styleElement, By.cssSelector("option"));
		Assert.assertTrue(elements.size() > 0, "the style field should contain options:");
		
		value = "";
		
		for (int i=0; i<elements.size(); i++) {
			String candidateValue = elements.get(i).getAttribute("value");
			
			if (StringUtils.isNotEmpty(candidateValue)) {
				value = candidateValue;
				break;
			}
		}
		
		Assert.assertTrue(value.startsWith("urn:cspace:bampfa.cspace.berkeley.edu:vocabularies:name(periodorstyle):item:name"), "the style field should be tied to the periodorstyle vocabulary:");
		
		// The item class field should appear, and should be tied to the itemclass vocabulary (BAMPFA-175)
		
		WebElement itemClassElement = driver.findElementImmediately(By.className("csc-collection-object-itemClass"));

		elements = driver.findElementsImmediately(itemClassElement, By.cssSelector("option"));
		Assert.assertTrue(elements.size() > 0, "the item class field should contain options:");
		
		value = "";
		
		for (int i=0; i<elements.size(); i++) {
			String candidateValue = elements.get(i).getAttribute("value");
			
			if (StringUtils.isNotEmpty(candidateValue)) {
				value = candidateValue;
				break;
			}
		}
		
		Assert.assertTrue(value.startsWith("urn:cspace:bampfa.cspace.berkeley.edu:vocabularies:name(itemclass):item:name"), "the item class field should be tied to the itemclass vocabulary:");

	}
	
	/**
	 * Tests BAM/PFA customizations to the Cataloging advanced search form.
	 * <ul>
	 * <li>The collectionobjects_common collection field should not appear (BAMPFA-167)</li>
	 * <li>The collectionobjects_bampfa collection field should appear (BAMPFA-167)</li>
	 * <li>The style field should be a dropdown (BAMPFA-176)</li>
	 * <li>The item class field should appear, and should be a dropdown (BAMPFA-175)</li>
	 * </ul>
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testAdvancedSearchFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.ADVANCED_SEARCH);
		List<WebElement> elements;
		
		// The collectionobjects_common collection field should not appear (BAMPFA-167)
		
		elements = driver.findElementsImmediately(By.className("csc-object-identification-collection"));
		Assert.assertEquals(elements.size(), 0, "the collectionobjects_common collection should not be found:");
		
		// The collectionobjects_bampfa collection field should appear (BAMPFA-167)
		
		elements = driver.findElementsImmediately(By.className("csc-collection-object-bampfaCollection"));
		Assert.assertEquals(elements.size(), 1, "the collectionobjects_bampfa collection field should be found:");
		
		// The style field should be a dropdown (BAMPFA-176)
		
		WebElement styleElement = driver.findElementImmediately(By.className("csc-object-description-style"));

		elements = driver.findElementsImmediately(styleElement, By.cssSelector("option"));
		Assert.assertTrue(elements.size() > 0, "the style field should contain options:");

		// The item class field should appear, and should be a dropdown (BAMPFA-175)
		
		WebElement itemClassElement = driver.findElementImmediately(By.className("csc-collection-object-itemClass"));

		elements = driver.findElementsImmediately(itemClassElement, By.cssSelector("option"));
		Assert.assertTrue(elements.size() > 0, "the item class field should contain options:");
	}
}
