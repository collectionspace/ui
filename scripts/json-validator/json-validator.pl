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
my $validatorurl="http://www.jsonlint.com/ajax/validate"; #url to validator
my $basedir="."; #the basedir -- this will be set by mandatory parameter
my $failed = 0; #count number of failed validations
my $passed = 0; #count number of passed validations

###################
# main program
parseParameters(); #parse parameters
find(\&read_json, $basedir); #recursively go through files
print "-------------------------------------------\n";
print "SUMMARY: $failed/".($passed+$failed)." failed\n";
print "-------------------------------------------\n";
if ($failed) {
	exit 1;
} else {
	exit 0;
}
#exit $failed?1:0; #exit code 1 if failed

###################
# functions used by script below here

#####
# Validates the html file passed by parameter
#####
sub validate_json ($$) {
	my ($filename, $contents) = @_;
	#connect to the site:
	my $res = $ua->request(POST $validatorurl, Content_Type => 'form-data', Content => 
		[ 
		  'json' => "$contents",
		  'reformat' => 'yes'
		]);
	#save content of result in $res
	$res = $res->content;
	#base whether valid on the title
	if ($res =~  m/^\{"result":"Valid JSON"/si) {
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
sub read_json {
	my $file = $_;
	#only read html files, ignore everything else
	if (-f $file && $file =~ m/\.json$/i) {
		my $file_contents; #this will hold file contents
		#read the file contents
		open(FILE, "<$file"); 
		$file_contents = do { local $/; <FILE> }; #read content
		close(FILE);
		#print $file_contents;
		validate_json(substr($File::Find::name, length $basedir), $file_contents);
	}
}

#####
# Function for parsing the command line parameters
#####
sub parseParameters() {
	#accept command line parameters:
	my $arg = $ARGV[0];
	if ($arg =~ /--help/ || $#ARGV != 0) {
		printHelp();
		exit 0;
	} elsif ($#ARGV == 0) {
		$basedir = $arg;
		print "INFO: Setting basedir: $basedir as defined by parameter\n";
	}
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
