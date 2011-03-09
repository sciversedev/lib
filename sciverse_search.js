/*

  Copyright (c) 2011 Sam Adams (sea36@cam.ac.uk)

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

// Sciverse Search API

/*
 *  User prefs must be initialised by including the following in the
 *  gadget configuration, and specifying the gadget's API Key.

    <Module>
        <ModulePrefs ... </ModulePrefs>

        <UserPref name="secureAuthtoken" datatype="hidden" />
        <UserPref name="contentApiKey" datatype="hidden" default_value="-- put api key here --" />

        ...

    Usage example:

    // initialise search object
    sciverse = new SciverseSearch();
    sciverse.setSearchCluster(SciverseSearch.Cluster.SCIDIR);
    //sciverse.setView(SciverseSearch.View.COMPLETE);
    sciverse.setSearchCompleteCallback(sciverseCallback);
    sciverse.setResultCount(150); 
    //sciverse.setStartOffset(0);
    sciverse.execute(query);
    if (sciverse.errors && sciverse.errors.length) {
        ...
    }
    for (var i = 0; i < sciverse.results.length; i++) {
    ...

 *
 *
 */

function SciverseSearch() {

    // Retrieve API key and auth token from Prefs
    var prefs = new gadgets.Prefs();
	this.apiKey = prefs.getString("contentApiKey");
    this.authToken = prefs.getString("secureAuthtoken");

    // View required - set default
    this.view = SciverseSearch.View.STANDARD;

}

SciverseSearch.Cluster = {
    HUB: 			'HUB',
    SCIDIR: 		'SCIDIR',
    SCOPUS: 		'SCOPUS',
    AUTHOR:			'AUTHOR',
    AFFILIATION: 	'AFFILIATION'
}

SciverseSearch.View = {
    STANDARD:	'STANDARD',
    COMPLETE:	'COMPLETE'
}

SciverseSearch.prototype.execute = function(query) {
    var params = {};
    params[gadgets.io.RequestParameters.HEADERS] = {
        'X-ELS-APIKey': this.apiKey,
        'X-ELS-Authtoken': this.authToken,
        'Accept': 'application/json'
    };
    params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;

    var url = 'http://api.elsevier.com/content/search/index:'+this.cluster+'?query='+encodeURIComponent(query);
    if (this.start) {
        url = url + "&start="+this.start;
    }
    if (this.count) {
        url = url + "&count="+this.count;
    }
    if (this.sort) {
        url = url + "&sort="+encodeURIComponent(this.sort);
    }
    if (this.subscribed) {
        url = url + "&subscribed="+this.subscribed;
    }
    if (this.view) {
        url = url + "&view="+this.view;
    }

    var sciverse = this;
    gadgets.io.makeRequest(url, function(response) {
        sciverse.response = response;
        sciverse.data = response.data;
        sciverse.error = response.errors;
        if (response.data && response.data['search-results']) {
            sciverse.results = response.data['search-results'].entry;
            sciverse.links = {};
            var link = response.data['search-results'].link;
            for (var i = 0; i < link.length; i++) {
                var ref = link[i]['@ref'];
                sciverse.links[ref] = link[i];
            }
        } else {
            sciverse.results = {};
            sciverse.links = {};
        }

        if (sciverse.callback) {
            sciverse.callback();
        }
    }, params);

}


SciverseSearch.prototype.getSearchCluster = function() {
    return this.cluster;
}

SciverseSearch.prototype.setSearchCluster = function(cluster) {
    this.cluster = cluster;
}


SciverseSearch.prototype.getResultCount = function() {
    return this.count;
}

SciverseSearch.prototype.setResultCount = function(count) {
    this.count = count;
}


SciverseSearch.prototype.getStartOffset = function() {
    return this.start;
}

SciverseSearch.prototype.setStartOffset = function(start) {
    this.start = start;
}


SciverseSearch.prototype.getSortFields = function() {
    return this.sort;
}

SciverseSearch.prototype.setSortFields = function() {
    this.sort = arguments.join(",");
}


SciverseSearch.prototype.getLimitToSubscribed = function() {
    return this.subscribed;
}

SciverseSearch.prototype.setLimitToSubscribed = function(limit) {
    this.subscribed = limit;
}


SciverseSearch.prototype.getView = function() {
    return this.view;
}

SciverseSearch.prototype.setView = function(view) {
    this.view = view;
}


SciverseSearch.prototype.setSearchCompleteCallback = function(callback) {
    this.callback = callback;
}
