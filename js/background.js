


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



oauth.authorize(function(){
	gdocs.update_doc('1fHyxSmi0s1t56nz-Gt1pFrfQFwpHLTkijo4oizZ2xio', 'Test 1 2 3!');
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (typeof(changeInfo.url) !== "undefined"){
		if (changeInfo.url.indexOf('https://docs.google.com/document/') > -1){
			initializeCryptoDocs(tabId, changeInfo.url);
		}else{
			deactivate(tabId);
		}
	}

});

function deactivate(tabId){

}

function initializeCryptoDocs(tabId, url){
	var reg = /^https:\/\/docs.google.com\/document\/d\/(.+)\//
	var result = reg.exec(url);
	var id = result[1];
	alert(id);
	chrome.pageAction.show(tabId);
}

