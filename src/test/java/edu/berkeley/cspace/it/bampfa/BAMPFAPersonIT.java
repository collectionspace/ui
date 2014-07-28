package edu.berkeley.cspace.it.bampfa;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.it.CollectionSpaceIT;

public class BAMPFAPersonIT extends CollectionSpaceIT {
	/**
	 * Tests BAM/PFA customizations to the Person form.
	 * <ul>
	 * <li>The dates active field should appear (BAMPFA-183)</li>
	 * <li>The birth city field should appear (BAMPFA-237)</li>
	 * </ul>
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.PERSON);
		driver.expandAllSections();

		List<WebElement> elements;

		// The dates active field should appear (BAMPFA-183)
		
		elements = driver.findElementsImmediately(By.className("csc-person-datesActive"));
		Assert.assertEquals(elements.size(), 1, "the dates active field should be found:");

		// The birth city field should appear (BAMPFA-237)
		
		elements = driver.findElementsImmediately(By.className("csc-person-birthCity"));
		Assert.assertEquals(elements.size(), 1, "the birth city field should be found:");
	}
}
