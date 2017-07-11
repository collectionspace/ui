/*
 * Usage:
 * js jslintrun.js [--plusplus] "`cat js_file.js`"
 *
 * Uses the spidermonkey command-line Javascript interpreter, and 
 * Douglas Crockford's jslint (see http://jslint.com).
 *
 * If --plusplus is used, then use the ++ operator will cause an error.
 */
load('fulljslint.js');

function getInput() {
    var input="";  
    var line="";  
    var blankcount=0;  
    while (blankcount < 50){  
        line=readline();  
     
        blankcount = (line=="") ? blankcount+1 : 0;  
	if (line === null) break;
        input += line;  
        input += "\n";  
    }  
    //print (input.substring(0, input.length-blankcount));
    return input.substring(0, input.length-blankcount);
}

var body = getInput();
var result = JSLINT(body);
if (result) {
    print('Passed');
} else {
    print('Failed');
}


