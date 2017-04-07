package edu.berkeley.cspace.it.botgarden;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;
import edu.berkeley.cspace.it.CollectionSpaceIT;

/**
 * This class contains tests for the rare flag on cataloging records.
 * The rare flag is automatically set by an event handler, based on
 * the conservation code of the primary taxonomic determination.
 */
public class RareFlagIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(RareFlagIT.class);
	
	/**
	 * Tests that taxon conservation codes result in the
	 * expected rare flag.
	 * <ul>
	 * <li>If the conservation code is empty, the rare flag should be "No" (UCBG-139)</li>
	 * <li>If the conservation code starts with "LC ", the rare flag should be "No" (UCBG-139)</li>
	 * <li>If the conservation code starts with "DD ", the rare flag should be "No" (UCBG-139)</li>
	 * <li>If the conservation code is anything else, the rare flag should be "Yes" (UCBG-139)</li>
	 * </ul>
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testConservationCodes() throws SaveFailedException {
		// Create taxon records with various conservation codes.
		// Put the time in the display name, so it's reasonably certain to be unique.
		
		String hasNoConservationCodeTaxonName = "No CC " + driver.getTimestamp();
		String hasLCConservationCodeTaxonName = "LC " + driver.getTimestamp();
		String hasDDConservationCodeTaxonName = "DD " + driver.getTimestamp();
		String hasEndangeredConservationCodeTaxonName = "Endangered " + driver.getTimestamp();
				
		createTaxonWithConservationCode(hasNoConservationCodeTaxonName, "");
		createTaxonWithConservationCode(hasLCConservationCodeTaxonName, "LC - IUCN-2006");
		createTaxonWithConservationCode(hasDDConservationCodeTaxonName, "DD - IUCN-2006");
		createTaxonWithConservationCode(hasEndangeredConservationCodeTaxonName, "Endangered - CADFG");
		
		// Create cataloging records with the various taxons, and check
		// if the rare flag is set to the expected value.
		
		testRareFlagWithTaxon(hasNoConservationCodeTaxonName, "No");
		testRareFlagWithTaxon(hasLCConservationCodeTaxonName, "No");
		testRareFlagWithTaxon(hasDDConservationCodeTaxonName, "No");
		testRareFlagWithTaxon(hasEndangeredConservationCodeTaxonName, "Yes");
	}

	public void testRareFlagWithTaxon(String taxonDisplayName, String expectedRareFlag) throws SaveFailedException {
		driver.navigateTo(CollectionSpacePage.CATALOGING);

		driver.fillField("csc-object-identification-object-number", "RareFlagIT " + driver.getTimestamp());
		driver.fillField("csc-taxonomic-identification-taxon", taxonDisplayName);
		
		driver.save();
		
		String actualRareFlag = (String) driver.getFieldValue("csc-collection-object-rare");
		
		Assert.assertEquals(actualRareFlag, expectedRareFlag, "Incorrect rare flag:");
	}
	
	public void createTaxonWithConservationCode(String displayName, String conservationCode) throws SaveFailedException {
		driver.navigateTo(CollectionSpacePage.TAXON);
		
		driver.fillField("csc-taxonAuthority-termDisplayName", displayName);
		
		if (StringUtils.isNotEmpty(conservationCode)) {
			driver.fillField("csc-taxon-conservationCategory", conservationCode);
		}
		
		driver.save();
	}
}
