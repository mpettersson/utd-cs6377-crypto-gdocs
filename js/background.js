var testkey = 'fPUIRSZQ/+K9ydIcloMJOw=='
var currentTabId = null;

function initDocForTest(){
	var obj = new _crypto.container(6,1,'RmZ0jSxsjba25qF8givIS1AhbS/ScJ61uxdUWXWfwUWW+VEc4ZSAGfiUkwe8HA7V');
	gdocs.update_doc('1fHyxSmi0s1t56nz-Gt1pFrfQFwpHLTkijo4oizZ2xio', JSON.stringify(obj));
}

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://docs.google.com/feeds/',
  'app_name': 'CS 6377 Crypto Google Docs'
});

function init(){
	// Add a listener to identify when we come to a Google Doc page
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (typeof(changeInfo.url) !== "undefined"){
			if (changeInfo.url.indexOf('https://docs.google.com/document/') > -1){
				initializeCryptoDocs(tabId, changeInfo.url);
			}
		}
	});
}

oauth.authorize(init);

function initializeCryptoDocs(tabId, url){
	currentTabId = tabId;

	// Show the icon
	chrome.pageAction.show(tabId);
	
	// Get the document id
	var reg = /^https:\/\/docs.google.com\/document\/d\/(.+)\//
	var result = reg.exec(url);
	var id = result[1];

	// Get the document
	gdocs.get_doc(id, 'txt', initGetDocCallback);

}

function initGetDocCallback(response){
	try {
		// If we have valid JSON
   		var resp = JSON.parse(response);
		
		if (resp._t === 'crypto-gdoc'){
			// Check to see if we generated the JSON, if so... decrypt it.

			var pt = _crypto.decrypt(testkey, resp.nonce, resp.payload);
			
			// Let the content script know that we have done so by passing the plaintext to it.
			chrome.tabs.sendRequest(currentTabId, {message: pt});
		}else{
			console.log('Not mine!');		
		}
		
	}
	catch (ex) {
		// Otherwise...
		console.log('BAD JSON!');   
	}
	

}

