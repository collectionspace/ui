#Packages to login, retrieve results, etc:
use LWP::UserAgent;
use HTTP::Cookies;
use HTTP::Request::Common;
use File::Find;
use strict;

#set up user agent:
our $ua = new LWP::UserAgent;
$ua->cookie_jar(HTTP::Cookies->new);
$ua->agent("AgentName/0.1 " . $ua->agent);

##################
#General variables used by the program:
my $validatorurl="http://validator.w3.org/check"; #url to validator
my $basedir="."; #the basedir -- this will be set by mandatory parameter
my $failed = 0; #count number of failed validations
my $passed = 0; #count number of passed validations

##################
# If we are only validating a fragment, pre and postfix them
my $htmlprefix = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" .
	"<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en\">\n" .
  	"<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" />\n" .
    	"<title></title>\n".
  	"</head>\n<body>\n";
my $htmlpostfix = "</body>\n</html>";

###################
# main program
parseParameters(); #parse parameters
find(\&read_html, $basedir); #recursively go through files
print "-------------------------------------------\n";
print "SUMMARY: $failed/".($passed+$failed)." failed\n";
print "-------------------------------------------\n";
exit ($failed)?1:0; #exit code 1 if failed

###################
# functions used by script below here

#####
# Validates the html file passed by parameter
#####
sub validate_html ($$) {
	my ($filename, $contents) = @_;
	#if it's only a fragment, pre/post-fix with html tags
	if (!($contents =~ m/<html /i)) {
		$contents = $htmlprefix.$contents.$htmlpostfix;	
	}
	#connect to the site:
	my $res = $ua->request(POST $validatorurl, Content_Type => 'form-data', Content => 
		[ 
		  'fragment' => "$contents",
		  'fbd' => "1",
		  #'doctype' => "HTML 1.0 Strict",
		  'doctype' => "Inline",
		  'prefill_doctype' =>	"xhtml10",
		  'group' => 0 ]);
	#save content of result in $res
	$res = $res->content;
	#base whether valid on the title
	if ($res =~  m/<title>.*\[Valid\].*<\/title>/si) {
		print "valid: $filename\n";
		$passed++;
	} else {
		print "INVALID: $filename\n";
		$failed++;
	}
}

####
#this is called by file::Find. For each html file: open, read, close and call
#validate_html function
####
sub read_html {
	my $file = $_;
	#only read html files, ignore everything else
	if (-f $file && $file =~ m/\.html?$/i) {
		my $file_contents; #this will hold file contents
		#read the file contents
		open(FILE, "<$file"); 
		$file_contents = do { local $/; <FILE> }; #read content
		close(FILE);
		#print $file_contents;
		validate_html(substr($File::Find::name, length $basedir), $file_contents);
	}
}

#####
# Function for parsing the command line parameters
#####
sub parseParameters() {
	#accept command line parameters:
	my $arg = $ARGV[0];
	if ($#ARGV != 0) {
		printHelp();
		exit 0;
	} elsif ($#ARGV == 0) {
		$basedir = $arg;
		print "INFO: Setting basedir: $basedir as defined by parameter\n";
	}
	#pass and user args are mandatory:
	#if (!$user || !$pass) {
	#	print "ERROR: Username and password must be set via parameters\n";
	#	printHelp();
	#	exit 2;
	#}
}


#####
# function for printing help to the screen
#####
sub printHelp() {
	print "Usage:\n\tperl xhtml-validator.pl basedir\n";
	print "Mandatory arguments:\n";
	print "\tbasedir\n";
	print "\t\tThe basedir in which to look for html files to validate\n";
}
