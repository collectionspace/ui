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

	}
}
