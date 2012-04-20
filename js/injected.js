chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	// If we had access to Google Docs JS, this would kill saving...	
	// Don't lose this...
	// Pq.prototype.send = function(){ };

	var message = request.message;
	
	$(".kix-zoomdocumentplugin-outer").replaceWith(message);
});

