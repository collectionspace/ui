package edu.berkeley.cspace.driver;


public class SaveFailedException extends CollectionSpaceDriverException {
	private static final long serialVersionUID = 1L;

	public SaveFailedException(String message) {
		super(message);
	}
	
	public SaveFailedException(String message, Throwable cause) {
		super(message, cause);
	}
}
