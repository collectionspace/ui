package edu.berkeley.cspace.it.cinefiles;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpacePage;
import edu.berkeley.cspace.driver.SaveFailedException;
import edu.berkeley.cspace.it.CatalogingIT;

public class CineFilesCatalogingIT extends CatalogingIT {
	public static final Logger logger = Logger.getLogger(CineFilesCatalogingIT.class);

	public static final List<String> CHECKBOX_FIELDS = Arrays.asList(
			"hasCastCr", "hasTechCr", "hasBoxInfo", "hasFilmog", "hasBiblio", "hasDistCo", "hasProdCo", "hasCostInfo", "hasIllust");

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
	
	/**
	 * Tests creating cataloging records, each with a single checkbox checked.
	 * This ensures that each checkbox is wired correctly.
	 * 
	 * @throws SaveFailedException 
	 */
	@Test(dependsOnMethods = { "testLogin" })
	public void testCheckboxes() throws SaveFailedException {
		for (String checkedField : CHECKBOX_FIELDS) {
			driver.navigateTo(CollectionSpacePage.CATALOGING);

			Map<String, Object> fieldValues = new HashMap<String, Object>();
			fieldValues.put("csc-object-identification-object-number", "Test Checkboxes " + driver.getTimestamp());
			fieldValues.put("csc-collection-object-docTitle", "Test Checkboxes");
			fieldValues.put("csc-object-identification-number-objects", "1");

			for (String field : CHECKBOX_FIELDS) {
				String className = "csc-collection-object-" + field;
				
				fieldValues.put(className, field.equals(checkedField) ? "true" : "false");
			}

			driver.fillFields(fieldValues);
			driver.save();
			
			for (String field : CHECKBOX_FIELDS) {
				String className = "csc-collection-object-" + field;
				String expectedSavedValue = (String) fieldValues.get(className);
				String actualSavedValue = (String) driver.getFieldValue(className);
				
				Assert.assertEquals(actualSavedValue, expectedSavedValue, "incorrect value for " + className);
			}
		}
	}
}
