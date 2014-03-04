package edu.berkeley.cspace.it;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;

import edu.berkeley.cspace.driver.LoginFailedException;

public class LoginIT extends CollectionSpaceIT {
	public static final Logger logger = Logger.getLogger(LoginIT.class);

	/**
	 * Tests logging in to the tenant with a correct password.
	 * <ul>
	 * <li>The landing page should be correct</li>
	 * <li>The password should not be "Administrator"</li>
	 * </ul>
	 */
	@Test
	public void testLogin() {
		super.testLogin();

		Assert.assertEquals(driver.getCurrentUrl(), driver.getLandingPageUrl(), "incorrect landing page:");
		Assert.assertNotEquals(driver.getPassword(), "Administrator", "password should not be \"Administrator\"");
	}
	
	/**
	 * Tests logging in to the tenant with an incorrect password.
	 * <ul>
	 * <li>Login should fail</li>
	 * <li>Error message should say "Invalid email/password"</li>
	 * </ul>
	 */
	@Test
	public void testInvalidLogin() {
		String message = null;
		
		try {
			driver.login(driver.getUser(), driver.getPassword() + "x");
		}
		catch(LoginFailedException e) {
			message = e.getMessage();
		}

		Assert.assertNotNull(message, "invalid login should result in error message:");
		Assert.assertTrue(message.contains("Invalid email/password"), "error message for invalid login should contain \"Invalid email/password\":");
	}
}
