package edu.berkeley.cspace.it.botgarden;

import java.util.Arrays;

import org.apache.log4j.Logger;

import edu.berkeley.cspace.it.TaxonIT;

public class BotGardenTaxonIT extends TaxonIT {
	public static final Logger logger = Logger.getLogger(BotGardenTaxonIT.class);

	public BotGardenTaxonIT() {
		setCalendarDateFieldNames(Arrays.asList(
			"csc-taxon-attributeDate"
		));
	}
}
