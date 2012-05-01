function init(){
	chrome.extension.onRequest.addListener(receiveMessage);
	chrome.pageAction.onClicked.addListener(urlChangeHandler);


	var keys = new KeyManager();

	if (!keys.isSetup()){
		launchSetupPage();
	}else{
		oauth.authorize(init_extension);
	}

}

function launchSetupPage(){
	chrome.tabs.create({url: chrome.extension.getURL('setup.html') + '#new'});
}

function init_extension(){
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
}

function initGetDocCallback(response, id, keys){
	if (response != ""){	
		try {
			// If we have valid JSON
	   		var resp = JSON.parse(response);
		
			if (resp._t === 'crypto-gdoc-doc'){
				// Check to see if we generated the JSON, if so... decrypt it.
				try{
					var key = keys.getDocumentKey(id);

					if (!key){
						key = window.prompt('We do not seem to have the key for this document. Please enter it below to open the document.');
						if (!key){
							return;
						}

						keys.setDocumentKey(id, key);
					}

					var numBlocks = _crypto.countBlocks(resp.payload);

					var pt = _crypto.decrypt(key, resp.nonce, resp.payload);
					
					launchEditor(id, resp.nonce + numBlocks, resp.alg, pt, key);

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
			alert('This document does not appear to be a crypto doc. If you are trying to create a new crypto doc, remember that only blank documents can be used to create a new crypto doc.');
		}
	}else{
		// New document
		var key = _crypto.random.key(4);
		keys.setDocumentKey(id, key);
		launchEditor(id,null, 1, pt, key);
		
	}
}

function launchEditor(id, nonce, alg, pt, key){
	chrome.tabs.create({url: chrome.extension.getURL('editor.html')}, function(tab){
			// Let the content script know that we have done so by passing the plaintext to it.
			documents[tab.id] = {'docId': id, 'nonce': nonce, 'alg': alg, 'key': key};
			chrome.tabs.sendRequest(tab.id, {'message': pt, 'key': key});
	});
}

function urlChangeHandler(tab){
		// Get the document id
		var reg = /^https:\/\/docs.google.com\/document\/d\/(.+)\//
		var result = reg.exec(tab.url);
		var id = result[1];

		chrome.tabs.sendRequest(tab.id, {'type': 'get_password'}, function(response){
			if (!result){
				return;
			}

			var keys = new KeyManager();
			keys.setCurrentPassword(response);

			if (!keys.verifyPassword()){
				alert('Incorrect password!');
				return;
			}

			// Get the document
			gdocs.get_doc(id, 'txt', function(response){ initGetDocCallback(response,id, keys); } );
		});
		
		
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
	var nextNonce = docInfo.nonce || _crypto.random.counter();

	ct = _crypto.encrypt(docInfo.key, nextNonce, pt);

	var obj = new _crypto.container(
		nextNonce,
		docInfo.alg,
		ct
	);

	gdocs.update_doc(docInfo.docId, JSON.stringify(obj), function(){
		chrome.tabs.remove(sender.tab.id);
	});
}

function processSetupMessage(request, sender, sendResponse){
	var keymanager = new KeyManager();
	
	if (request.oldPassword){
		keymanager.setCurrentPassword(request.oldPassword);
		if (!keymanager.verifyPassword()){
			sendResponse(false);
			return;
		}
	}
	
	keymanager.changePassword(request.password);
	oauth.authorize(init_extension);
	chrome.tabs.remove(sender.tab.id);
}

// Let's go!

var documents = {};

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://docs.google.com/feeds/',
  'app_name': 'CS 6377 Crypto Google Docs'
});

init();
