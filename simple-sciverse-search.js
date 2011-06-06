/*

  Copyright (c) 2011 Remko Caprio (@sciversedev and r.caprio@elsevier.com)
  See https://github.com/sciversedev
  With thanks to Sam Adams (sea36@cam.ac.uk)


  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

*/

/**
* In your gadget specification xml include:
*    <UserPref name="contentApiKey" datatype="hidden" default_value="your-api-key-here" />
*    <UserPref name="secureAuthtoken" datatype="hidden" />
*    
* Example:
*	myclient = new ContentApiClient();
*	myclient.setSearchCluster("SCIDIR");
*	myclient.setView("COMPLETE");
*	myclient.setResultCount(5);
*	myclient.setSearchCompleteCallback(contentApiCallback);
*	myclient.setDivId(divid);
*	myclient.execute(searchterms);
*/

/**
 * Creates a JavaScript object ContentApiClient
 */  
function ContentApiClient() {
	// use OpenSocial UserPref properties specified in the gadget specification file
	// User must include UserPref name="contentApiKey" datatype="hidden" default_value="your-api-key-goes-here" 
	var prefs = new gadgets.Prefs();
	this.apikey = prefs.getString("contentApiKey");
    this.authtoken = prefs.getString("secureAuthtoken");
}

/**
 * execute method for the ContentApiClient. 
 * The prototype keyword is used to create a singleton essentially    
 */
ContentApiClient.prototype.execute = function(searchterms) {
	
	var url = "http://api.elsevier.com/content/search/index:"+this.searchcluster;  
    	
	url = url + "?count="+this.resultcount;
	url = url + "&view="+this.view
	var query = encodeURIComponent(searchterms);
    url = url + "&query=" + query;      
    
    var requestHeaders = {};
  	requestHeaders['X-ELS-APIKey'] = this.apikey;
    requestHeaders['X-ELS-Authtoken'] = this.authtoken;
  	var params = {};
    params[gadgets.io.RequestParameters.HEADERS] = requestHeaders;
    
    var sciverse = this;
    gadgets.sciverse.makeRequest(url, function(response) {
    	sciverse.response = response;
    	sciverse.error = response.errors;
    	if (response.data) {
        	sciverse.data = response.data;
        }
        if (sciverse.callback) {
        	sciverse.callback();
    	}
    }, params); 
}
/**
 * Setter methods
 */
ContentApiClient.prototype.setSearchCompleteCallback = function(callback) {
    this.callback = callback;
}
ContentApiClient.prototype.setSearchCluster = function(searchcluster) {
    this.searchcluster = searchcluster;
}
ContentApiClient.prototype.setResultCount = function(resultcount) {
    this.resultcount = resultcount;
}
ContentApiClient.prototype.setView = function(view) {
    this.view = view;
}
ContentApiClient.prototype.setDivId = function(divid) {
    this.divid = divid;
}

/**
 * Callback function for the Content API Request
 */
function contentApiCallback(){
	
	var output = "";
	
	if(myclient.data == null){
    	var display = "<b><font color='red'>return object == null</font></b>"
        document.getElementById(myclient.divid).innerHTML = output;
        return;
    }
    
    var textJson = gadgets.json.parse(myclient.data);
    if(!textJson){
        var display = "<b><font color='red'>parsing results returned nothing</font></b>"
        document.getElementById(myclient.divid).innerHTML = output;
        return;
    }
    
    var entries = textJson['search-results']['entry'];
    
	$.each(entries, function(i1, entry){
    	var title = entry['dc:title'];
    	output = output + (i1+1) + ". " + title + "<br>";
    });
    
    document.getElementById(myclient.divid).innerHTML = "Search results:<br>"+output;
}