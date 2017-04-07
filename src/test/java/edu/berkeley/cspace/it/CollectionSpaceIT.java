package edu.berkeley.cspace.it;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.CollectionSpaceDriver;
import edu.berkeley.cspace.driver.LoginFailedException;
import edu.berkeley.cspace.driver.Page;
import edu.berkeley.cspace.driver.SaveFailedException;


/**
 * The base CollectionSpace integration test. All integration tests
 * should extend this class.
 */
public abstract class CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(CollectionSpaceIT.class);
	
	public static final String TENANT_NAME_PROPERTY = "tenantName";
	public static final String USER_PROPERTY = "user";
	public static final String PASSWORD_PROPERTY = "password";
	
	protected CollectionSpaceDriver driver;
	
	private List<String> calendarDateFieldNames = new ArrayList<String>();
	
	@BeforeClass
	public void setUp() {
		driver = new CollectionSpaceDriver();
		
		Properties properties = System.getProperties();

		if (properties.containsKey(TENANT_NAME_PROPERTY)) {
			driver.setTenantName(System.getProperty(TENANT_NAME_PROPERTY));
		}
		
		if (properties.containsKey(USER_PROPERTY)) {
			driver.setUser(System.getProperty(USER_PROPERTY));
		}

		if (properties.containsKey(PASSWORD_PROPERTY)) {
			driver.setPassword(System.getProperty(PASSWORD_PROPERTY));
		}
	}

	@AfterClass
	public void finish() {
		driver.close();
	}
	
	/**
	 * Logs in to the tenant.
	 * <ul>
	 * <li>Login should succeed</li>
	 * </ul>
	 */
	@Test
	public void testLogin() {
		try {
			driver.login();
		}
		catch(LoginFailedException e) {
			Assert.fail(e.getMessage());
		}
	}

	public void testAllFields(Page page) throws SaveFailedException {
		driver.navigateTo(page);

		Map<String, Object> testFieldValues = getTestFieldValues();
		Map<String, Object> beforeSaveFieldValues = driver.fillAllFields(testFieldValues);
		assertContainsNoEmptyValues(beforeSaveFieldValues);
		
		driver.save();
		
		Map<String, Object> afterSaveFieldValues = driver.getAllFieldValues();
		Map<String, Object> expectedAfterSaveFieldValues = getExpectedAfterSaveFieldValues(beforeSaveFieldValues);
		
		assertContainsNoEmptyValues(afterSaveFieldValues);
		assertFieldValuesAreEqual(afterSaveFieldValues, expectedAfterSaveFieldValues);
	}
	
	public Map<String, Object> getExpectedAfterSaveFieldValues(Map<String, Object> beforeSaveValues) {
		Map<String, Object> fieldValues = copyFieldValues(beforeSaveValues);
		
		for (String fieldName : getCalendarDateFieldNames()) {
			if (fieldValues.containsKey(fieldName)) {
				String calendarDateValue = (String) fieldValues.get(fieldName);
			
				fieldValues.put(fieldName, getExpectedCalendarDate(calendarDateValue));
			}
		}
		
		return fieldValues;
	}

	public void assertContainsNoEmptyValues(Map<String, Object> fieldValues) {
		for (String className : fieldValues.keySet()) {
			Object value = fieldValues.get(className);
			
			Assert.assertNotNull(value, "value of " + className + " should not be empty:");
			
			if (value instanceof Map) {
				Map<String, Object> nestedValues = (Map<String, Object>) value;
				
				assertContainsNoEmptyValues(nestedValues);
			}
			else if (value instanceof String) {
				String valueString = (String) value;
				
				Assert.assertNotEquals(valueString, "", "value of " + className + " should not be empty");
			}
		}
	}
	
	public void assertFieldValuesAreEqual(Map<String, Object> actualValues, Map<String, Object> expectedValues) {
		Assert.assertEquals(actualValues.size(), expectedValues.size(), "incorrect number of fields:");
		
		for (String className : expectedValues.keySet()) {
			Object expectedValue = expectedValues.get(className);
			Object actualValue = actualValues.get(className);
						
			if (expectedValue instanceof Map) {
				Assert.assertTrue(actualValue instanceof Map, "value of " + className + " should be a map:");
				
				Map<String, Object> actualNestedValues = (Map<String, Object>) actualValue;
				Map<String, Object> expectedNestedValues = (Map<String, Object>) expectedValue;
				
				assertFieldValuesAreEqual(actualNestedValues, expectedNestedValues);
			}
			else if (expectedValue instanceof String) {
				Assert.assertTrue(actualValue instanceof String, "value of " + className + " should be a string:");
				
				String actualString = (String) actualValue;
				String expectedString = (String) expectedValue;
				
				Assert.assertEquals(actualString, expectedString, "incorrect value for " + className + ":");
			}
		}	
	}
	
	public Map<String, Object> copyFieldValues(Map<String, Object> fieldValues) {
		Map<String, Object> copy = new LinkedHashMap<String, Object>();
		
		for (String className : fieldValues.keySet()) {
			Object value = fieldValues.get(className);
			
			if (value instanceof Map) {
				Map<String, Object> nestedValues = (Map<String, Object>) value;
				
				copy.put(className, copyFieldValues(nestedValues));
			}
			else {
				copy.put(className, value);
			}
		}
		
		return copy;
	}
	
	public Map<String, Object> getTestFieldValues() {
		return Collections.emptyMap();
	}
	
	public String getExpectedCalendarDate(String calendarDate) {
		final String timeSuffix = "T00:00:00Z";
		
		if (!calendarDate.endsWith(timeSuffix)) {
			calendarDate += timeSuffix;
		}
		
		return calendarDate;
	}
	
	public List<String> getCalendarDateFieldNames() {
		return calendarDateFieldNames;
	}
	
	public void setCalendarDateFieldNames(List<String> calendarDateFieldNames) {
		this.calendarDateFieldNames = calendarDateFieldNames;
	}
}
