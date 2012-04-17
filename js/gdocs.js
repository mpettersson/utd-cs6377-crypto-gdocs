var gdocs = {};

gdocs.get_doc_list = function(callback){
	var request = {
		'method': 'GET',
		'parameters': {
			'alt': 'json',
			'v': '3'
		}
	};

	var url = 'https://docs.google.com/feeds/default/private/full';

	oauth.sendSignedRequest(url, callback, request);
}

gdocs.update_doc = function(id, text, callback){

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
		function(response, xhr){ gdocs._edit_doc_callback(response, xhr, callback); }, 
		request
	);
}

// This function logs the response from edit_doc and then executes the callback.
gdocs._edit_doc_callback = function(response, xhr, callback){
	console.log(response);
	if (typeof(callback) === "function"){
		callback();	
	}
}



