package edu.berkeley.cspace.it.botgarden;

import java.util.Arrays;
import java.util.Map;

import org.apache.log4j.Logger;

import edu.berkeley.cspace.it.CatalogingIT;

public class BotGardenCatalogingIT extends CatalogingIT {
	public static final Logger logger = Logger.getLogger(BotGardenCatalogingIT.class);
	
	public BotGardenCatalogingIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-collection-object-accessionDate",
			// Weird, the annotation date field doesn't get a timestamp after save like other dates.
			// "csc-collection-object-annotationDate",
			"csc-collection-object-requestDate",
			"csc-collection-object-filledDate"
		));
	}

	@Override
	public Map<String, Object> getExpectedAfterSaveFieldValues(Map<String, Object> beforeSaveValues) {
		Map<String, Object> fieldValues = super.getExpectedAfterSaveFieldValues(beforeSaveValues);

		// The rare flag is set by an event handler, based on the taxonomic determination
		// of this cataloging record. Since this test will set the taxonomic determination
		// to a stub taxon record that has a null conservation code, the rare flag will be
		// set to "No" by the event handler, even if its value is set to "Yes" on the record
		// editor. The expected value is therefore always "No".
		
		fieldValues.put("csc-collection-object-rare", "No");

		return fieldValues;
	}
}
