package edu.berkeley.cspace.it.botgarden;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.openqa.selenium.WebElement;

import edu.berkeley.cspace.it.MovementIT;

public class BotGardenMovementIT extends MovementIT {
	public static final Logger logger = Logger.getLogger(BotGardenMovementIT.class);

	public static final String ACTION_CODE_FIELD_CLASSNAME = "csc-movement-reasonForMove";

	@Override
	public Map<String, Object> getTestFieldValues() {
		// For the botgarden Current Location (Movement) record,
		// selecting a value of "Dead" in the Action Code (Reason for Move) field
		// causes an event handler to set the current location to null, and
		// to soft delete the record after save. For this test we just want
		// to test that a value saves successfully in a normal case, so 
		// we need to avoid picking "Dead" for the Action Code. A different
		// test will check that the dead functionality is working properly.
		
		Map<String, Object> fieldValues = new HashMap<String, Object>();	
		WebElement actionCodeField = driver.findField(ACTION_CODE_FIELD_CLASSNAME);
		
		String actionCodeValue = null;
		
		do {
			actionCodeValue = driver.generateSelectValue(actionCodeField);
		}
		while (actionCodeValue.equals("Dead"));

		fieldValues.put(ACTION_CODE_FIELD_CLASSNAME, actionCodeValue);
		
		return fieldValues;
	}
}
