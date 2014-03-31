package edu.berkeley.cspace.it.cinefiles;

import java.util.List;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.it.OrganizationIT;

public class CineFilesOrganizationIT extends OrganizationIT {
	public static final Logger logger = Logger.getLogger(CineFilesOrganizationIT.class);

	public static final String COUNTRY_REFNAME_PREFIX = "urn:cspace:cinefiles.cspace.berkeley.edu:vocabularies:name(country)";

	/**
	 * Tests CineFiles customizations to the Organization form.
	 * <ul>
	 * <li>The foundingPlace field should be tied to the country vocabulary (BAMPFA-31)</li>
	 * <li>The contact addressCountry term list should load (BAMPFA-37)</li>
	 * </ul>
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.ORGANIZATION);
		driver.expandAllSections();

		// foundingPlace should be tied to the country dynamic vocabulary.
		
		List<String> foundingPlaceOptions = driver.getOptionDataValues("csc-orgAuthority-foundingPlace");
		
		Assert.assertTrue(foundingPlaceOptions.size() > 1, "expected more than one option for foundingPlace:");
		Assert.assertEquals(foundingPlaceOptions.get(1).substring(0, COUNTRY_REFNAME_PREFIX.length()), COUNTRY_REFNAME_PREFIX, "incorrect refname for foundingPlace option:");

		// addressCountry should be tied to the country dynamic vocabulary.
		
		List<String> addressCountryOptions = driver.getOptionDataValues("csc-contact-addressCountry");

		Assert.assertTrue(addressCountryOptions.size() > 1, "expected more than one option for addressCountry:");
		Assert.assertEquals( addressCountryOptions.get(1).substring(0, COUNTRY_REFNAME_PREFIX.length()), COUNTRY_REFNAME_PREFIX, "incorrect refname for addressCountry option:");
	}
}
