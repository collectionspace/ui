package edu.berkeley.cspace.it.cinefiles;

import java.util.List;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.it.PersonIT;

public class CineFilesPersonIT extends PersonIT {
	public static final Logger logger = Logger.getLogger(CineFilesPersonIT.class);

	public static final String COUNTRY_REFNAME_PREFIX = "urn:cspace:cinefiles.cspace.berkeley.edu:vocabularies:name(country)";

	/**
	 * Tests CineFiles customizations to the Person form.
	 * <ul>
	 * <li>The birthPlace field should be tied to the country vocabulary (BAMPFA-30)</li>
	 * <li>The contact addressCountry term list should load (BAMPFA-37)</li>
	 * </ul>
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.PERSON);
		driver.expandAllSections();

		// birthPlace should be tied to the country dynamic vocabulary.
		
		List<String> birthPlaceOptions = driver.getOptionDataValues("csc-personAuthority-birthPlace");
		
		Assert.assertTrue(birthPlaceOptions.size() > 1, "expected more than one option for birthPlace:");
		Assert.assertEquals(birthPlaceOptions.get(1).substring(0, COUNTRY_REFNAME_PREFIX.length()), COUNTRY_REFNAME_PREFIX, "incorrect refname for birthPlace option:");

		// addressCountry should be tied to the country dynamic vocabulary.
		
		List<String> addressCountryOptions = driver.getOptionDataValues("csc-contact-addressCountry");

		Assert.assertTrue(addressCountryOptions.size() > 1, "expected more than one option for addressCountry:");
		Assert.assertEquals(addressCountryOptions.get(1).substring(0, COUNTRY_REFNAME_PREFIX.length()), COUNTRY_REFNAME_PREFIX, "incorrect refname for addressCountry option:");
	}

}
