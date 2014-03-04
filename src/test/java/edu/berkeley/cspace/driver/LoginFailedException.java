package edu.berkeley.cspace.driver;


public class LoginFailedException extends CollectionSpaceDriverException {
	private static final long serialVersionUID = 1L;

	public LoginFailedException(String message) {
		super(message);
	}
	
	public LoginFailedException(String message, Throwable cause) {
		super(message, cause);
	}
}
