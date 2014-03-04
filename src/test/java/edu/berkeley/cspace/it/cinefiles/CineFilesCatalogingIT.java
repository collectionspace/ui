package edu.berkeley.cspace.it.cinefiles;

import java.util.List;

import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;
import edu.berkeley.cspace.it.CatalogingIT;

public class CineFilesCatalogingIT extends CatalogingIT {

	/**
	 * Tests CineFiles customizations to the Cataloging form.
	 * <ul>
	 * <li>Identification Number should have CineFiles Document Number and PFA Stills Number patterns (BAMPFA-138)</li>
	 * <li>Collection should be a dynamic term list, and should have CineFiles and PFA Stills options (BAMPFA-137)</li>
	 * <li>Reference should be tied to Corporate Names (BAMPFA-131)</li>
	 * </ul>
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testFormCustomizations() {
		driver.navigateTo(CollectionSpacePage.CATALOGING);
		driver.expandAllSections();
		
		// Check Identification Number patterns.
		
		List<String> patternNames = driver.getNumberPatternNames("csc-object-identification-object-number");
		Assert.assertEquals(patternNames.size(), 2, "Incorrect number of Identification Number patterns:");
		Assert.assertEquals(patternNames.get(0), "CineFiles Document Number", "Incorrect first pattern for Identification Number");
		Assert.assertEquals(patternNames.get(1), "PFA Stills Number", "Incorrect second pattern for Identification Number");
		
		// Check options in the Collection term list.
		
		List<String> collectionOptions = driver.getOptionDataValues("csc-object-identification-collection");
		
		Assert.assertEquals(collectionOptions.size(), 3, "Incorrect number of Collection term list options:");
		Assert.assertEquals(collectionOptions.get(0), "", "Incorrect first option for Collection term list:");
		Assert.assertEquals(collectionOptions.get(1), "urn:cspace:cinefiles.cspace.berkeley.edu:vocabularies:name(collection):item:name(cinefiles)'CineFiles'", "Incorrect second option for Collection term list:");
		Assert.assertEquals(collectionOptions.get(2), "urn:cspace:cinefiles.cspace.berkeley.edu:vocabularies:name(collection):item:name(pfastills)'PFA Stills'", "Incorrect third option for Collection term list:");
	
		// Check reference field.
		
		List<String> vocabularyNames = driver.getAutocompleteVocabularyNames("csc-collection-object-reference");
		Assert.assertEquals(vocabularyNames.size(), 1, "Incorrect number of reference vocabularies:");
		Assert.assertEquals(vocabularyNames.get(0), "Corporate Names", "Incorrect first vocabulary for reference autocomplete:");
	}
}
