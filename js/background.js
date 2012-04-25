var testkey = 'fPUIRSZQ/+K9ydIcloMJOw=='
var documents = {};

function initDocForTest(){
	ct = _crypto.encrypt(testkey, 6, '<h1>Hello World!</h1>');	
	var obj = new _crypto.container(6,1,ct);
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

chrome.extension.onRequest.addListener(receiveMessage);

/*
var masterHash = localStorage.getItem("passwordHash");
var masterSalt = localStorage.getItem("passwordSalt");

if (masterHash == null){
	launchSetupPage();
}else{
	oauth.authorize(init);
}
*/
oauth.authorize(init);

function launchSetupPage(){
	chrome.tabs.create({url: chrome.extension.getURL('setup.html')});
}

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

function initializeCryptoDocs(tabId, url){

	// Show the icon
	chrome.pageAction.show(tabId);
	
	chrome.pageAction.onClicked.addListener(function(tab) {
		// Get the document id
		var reg = /^https:\/\/docs.google.com\/document\/d\/(.+)\//
		var result = reg.exec(url);
		var id = result[1];

		// Get the document
		gdocs.get_doc(id, 'txt', function(response){ initGetDocCallback(response,id); } );
	});
}

function initGetDocCallback(response, id){
	try {
		// If we have valid JSON
   		var resp = JSON.parse(response);
		
		if (resp._t === 'crypto-gdoc'){
			// Check to see if we generated the JSON, if so... decrypt it.
			try{
				var pt = _crypto.decrypt(testkey, resp.nonce, resp.payload);
				
				chrome.tabs.create({url: chrome.extension.getURL('editor.html')}, function(tab){
					// Let the content script know that we have done so by passing the plaintext to it.
					documents[tab.id] = {docId: id, nextNonce: resp.nonce + 1, alg: resp.alg};
					chrome.tabs.sendRequest(tab.id, {message: pt});
				});
			} catch (ex){
				if (ex instanceof _crypto.HMACError){
					alert(ex);
				}else{
					throw ex;				
				}
			};		
	
				
		}else{
			console.log('Not mine!');		
		}
		
	}
	catch (ex) {
		// Otherwise...
		console.log('BAD JSON!');   
	}
}

//Elliptic curves over reals
function receiveMessage(request, sender, sendResponse){
	if (request.type === 'save_doc'){
		processSaveMessage(request,sender,sendResponse);
	}else if (request.type === 'save_setup'){
		processSetupMessage(request, sender, sendResponse);
	}		

}

function processSaveMessage(request,sender, sendResponse){
	var docInfo = documents[sender.tab.id];

	var pt = request.content;
	ct = _crypto.encrypt(testkey, docInfo.nextNonce, pt);	

	var obj = new _crypto.container(docInfo.nextNonce,request.alg || docInfo.alg,ct);
	gdocs.update_doc(docInfo.docId, JSON.stringify(obj), function(){
		chrome.tabs.remove(sender.tab.id);
	});
}

function processSetupMessage(request, sender, sendResponse){
	var masterSalt = _crypto.random.key(4);
	var masterHash = _crypto.sha256(request.password + masterSalt);
	
	console.log(masterSalt);
	console.log(masterHash);
}

