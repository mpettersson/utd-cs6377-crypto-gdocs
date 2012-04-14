
var get_url = function(id){ return "https://docs.google.com/feeds/download/documents/export/Export";};
var edit_url = function(id){ return "https://docs.google.com/feeds/default/private/full/document%3A{id}".replace('{id}', id); }

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://docs.google.com/feeds/',
  'app_name': 'CS 6377 Crypto Google Docs'
});

function log_result(result){
	console.log(JSON.parse(result));
}

// Thsi function gets a list of the docs
function get_doc_list(){
	var request = {
		'method': 'GET',
		'parameters': {
			'alt': 'json',
			'v': '3'
		}
	};

	var url = 'https://docs.google.com/feeds/default/private/full';

	oauth.sendSignedRequest(url, log_result, request);
}

// This method edits the doc with the specified id, replaces it with text, and then executes the callback
function edit_doc(id,text, callback){
	var request = {
		'method': 'PUT',
		'parameters': {
			'alt': 'json',
			'v': '3'
		},
		'headers': { 'If-Match': '*' },
		'body': text
		
	};

	var url = "https://docs.google.com/feeds/upload/file/default/private/full/document%3A" + id;

	oauth.sendSignedRequest(
		url, 
		function(response, xhr){ edit_doc_callback(response, xhr, callback); }, 
		request
	);
}

// This function logs the response from edit_doc and then executes the callback.
function edit_doc_callback(response, xhr, callback){
	console.log(response);
	if (typeof(callback) === "function"){
		callback();	
	}

}

oauth.authorize(function(){
	edit_doc('1fHyxSmi0s1t56nz-Gt1pFrfQFwpHLTkijo4oizZ2xio', 'Test 1 2 3!');
});

//function() {
/*
	var request = {
		'method': 'PUT',
		'parameters': {
			'alt': 'json',
			'v': '3'
		},
		'headers': { 'X-Upload-Content-Type': 'text/plain' },
		'body': 'Awesome! Awesome!'
	};

	

	oauth.sendSignedRequest('https://docs.google.com/feeds/upload/create-session/default/private/full/document%3A1fHyxSmi0s1t56nz-Gt1pFrfQFwpHLTkijo4oizZ2xio', function(response, xhr) { 
			var newURL = xhr.getResponseHeader('location');
			$.ajax(newURL, { type: 'PUT', headers: request.headers, processData: false, data: request.body, success: function(data, textStatus, xhr){
				console.log(xhr);
			}});
			
	  }, request);
	
/*
	  var request = {
		'method': 'GET',
		'parameters': {
			'alt': 'json',
			'docId': '1fHyxSmi0s1t56nz-Gt1pFrfQFwpHLTkijo4oizZ2xio',
			'exportFormat': 'txt',
			'format': 'txt',
			'v': '3'
		 },
		 'headers': null,
		 'body': null
	  };

	var url = get_url();

  oauth.sendSignedRequest(url, function(response, xhr) { 
		response = response + " Isn't this great???";
		request.method = 'PUT';
		url = edit_url(request.parameters.docId);
		request.parameters = { 'v': '3', 'alt': 'json' };
		request.body = response;
		//request.headers = { 'Content-Type': 'text/plain' };
		oauth.sendSignedRequest(url, function(response, xhr){
			console.log(response);
		}, request);
  }, request);

*/


//});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (typeof(changeInfo.url) !== "undefined"){
		if (changeInfo.url.indexOf('https://docs.google.com/document/') > -1){
			alert(tabId);
			initializeCryptoDocs(tabId);
		}else{
			deactivate(tabId);
		}
	}

});

function deactivate(tabId){

}

function initializeCryptoDocs(tabId){
	chrome.pageAction.show(tabId);
}

