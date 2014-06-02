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

/**
 * Tests BAM/PFA customizations to the Acquisition form.
 * <ul>
 * <li>The acquisition method field should be a dynamic term list (BAMPFA-189)</li>
 * <li>The legal status field should appear (BAMPFA-190)</li>
 * <li>The status date field should appear (BAMPFA-190)</li>
 * <li>The for field should appear (BAMPFA-190)</li>
 * <li>The appraisal info field should appear (BAMPFA-190)</li>
 * <li>The current value fields should appear (BAMPFA-190)</li>
 * <li>The initial value fields should appear (BAMPFA-190)</li>
 * <li>The acquisition source field should not be an autocomplete field (BAMPFA-190)</li>
 * </ul>
 */
public class BAMPFAAcquisitionIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(BAMPFAAcquisitionIT.class);

	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.ACQUISITION);
		driver.expandAllSections();

		List<WebElement> elements;

		// The acquisition method field should be a dynamic term list (BAMPFA-189)

		elements = driver.findElementsImmediately(By.className("csc-acquisition-acquisition-method"));
		Assert.assertEquals(elements.size(), 1, "the acquisition method field should be found:");

		WebElement acquisitionMethodElement = elements.get(0);
		
		elements = driver.findElementsImmediately(acquisitionMethodElement, By.cssSelector("option"));
		Assert.assertTrue(elements.size() > 0, "the acquisition method field should contain options:");
		
		String value = "";
		
		for (int i=0; i<elements.size(); i++) {
			String candidateValue = elements.get(i).getAttribute("value");
			
			if (StringUtils.isNotEmpty(candidateValue)) {
				value = candidateValue;
				break;
			}
		}
		
		Assert.assertTrue(value.startsWith("urn:cspace:bampfa.cspace.berkeley.edu:vocabularies:name(acquisitionmethod):item:name"), "the acquisition method field should be tied to the acquisitionmethod vocabulary:");

		// The legal status field should appear (BAMPFA-190)
		
		elements = driver.findElementsImmediately(By.className("csc-acquisition-legalStatus"));
		Assert.assertEquals(elements.size(), 1, "the legal status field should be found:");
		
		// The status date field should appear (BAMPFA-190)

		elements = driver.findElementsImmediately(By.className("csc-acquisition-legalStatusDateGroup"));
		Assert.assertEquals(elements.size(), 1, "the status date field should be found:");
		
		// The for field should appear (BAMPFA-190)
		
		elements = driver.findElementsImmediately(By.className("csc-acquisition-bampfaAcquisitionReason"));
		Assert.assertEquals(elements.size(), 1, "the for field should be found:");
		
		// The appraisal info field should appear (BAMPFA-190)
		
		elements = driver.findElementsImmediately(By.className("csc-acquisition-appraisalInfo"));
		Assert.assertEquals(elements.size(), 1, "the appraisal info field should be found:");
		
		// The current value fields should appear (BAMPFA-190)
		
		elements = driver.findElementsImmediately(By.className("csc-acquisition-currentValue"));
		Assert.assertEquals(elements.size(), 1, "the current value field should be found:");

		elements = driver.findElementsImmediately(By.className("csc-acquisition-currentValueSource"));
		Assert.assertEquals(elements.size(), 1, "the current value source field should be found:");

		elements = driver.findElementsImmediately(By.className("csc-currentValueGroup-currentValueDateGroup"));
		Assert.assertEquals(elements.size(), 1, "the current value date field should be found:");

		// The initial value fields should appear (BAMPFA-190)
		
		elements = driver.findElementsImmediately(By.className("csc-acquisition-initialValue"));
		Assert.assertEquals(elements.size(), 1, "the initial value field should be found:");

		elements = driver.findElementsImmediately(By.className("csc-acquisition-initialValueSource"));
		Assert.assertEquals(elements.size(), 1, "the initial value source field should be found:");

		elements = driver.findElementsImmediately(By.className("csc-acquisition-initialValueDateGroup"));
		Assert.assertEquals(elements.size(), 1, "the initial value date field should be found:");

		// The acquisition source field should not be an autocomplete field (BAMPFA-190)
		
		elements = driver.findElementsImmediately(By.className("csc-acquisition-acquisitionSource"));
		Assert.assertEquals(elements.size(), 1, "the acquisition source field should be found:");
		
		WebElement sourceField = elements.get(0);
		Assert.assertTrue(!driver.isAutocomplete(sourceField), "the acquisition source field should not be an autocomplete field");
	}
}
