#packages
use File::Find;
use Cwd;
use FindBin qw($Bin);
use strict;

##################
#General variables used by the program:
my $validatorscript="jslintrun.js";
my $dir_to_validate="."; #the basedir -- this will be set by mandatory parameter
my $script_dir=$Bin; #directory of the perl-script
my $failed = 0; #count number of failed validations
my $passed = 0; #count number of passed validations

###################
# main program
parseParameters(); #parse parameters
find(\&read_js, $dir_to_validate); #recursively go through files
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
sub validate_js ($$) {
	my ($filename, $fullfilename) = @_;
	my $workingdir = cwd(); 
	#print "working dir: $workingdir\n";
	#chdir to the dir of the script (File::Find changes this)
	chdir $script_dir;
	my $res = `js $validatorscript < $fullfilename`;
	#save content of result in $res
	#print $res."ljkadkljafdjkladfsjkldafs\n";
	#base whether valid on the title
	if ($res =~ m/^Passed/si) {
		print "valid: $filename\n";
		$passed++;
	} else {
		print "INVALID: $filename\n";
		$failed++;
	}
	chdir $workingdir;
	#print "switched to ".cwd();
#	exit 0;
}

####
#this is called by file::Find. For each html file: open, read, close and call
#validate_html function
####
sub read_js {
	my $file = $_;
	#only read javascript files, ignore everything else
	if (-f $file && $file =~ m/\.js$/i) {
		validate_js(substr($File::Find::name, length $dir_to_validate), $File::Find::name); #$file_contents);
		#print $file."\n";
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
		$dir_to_validate = $arg;
		print "INFO: Setting basedir: $dir_to_validate as defined by parameter\n";
	}
}


#####
# function for printing help to the screen
#####
sub printHelp() {
	print "Usage:\n\tperl xhtml-validator.pl dir_to_validate\n";
	print "Mandatory arguments:\n";
	print "\tdir_to_validate\n";
	print "\t\tThe basedir in which to look for js files to validate\n";
}
