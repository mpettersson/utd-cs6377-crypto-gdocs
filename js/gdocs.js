var gdocs = {};

// Get a list of Google Docs
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

// Update a specific doc with the specified id
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

// Get the metadata associated with a particular doc
gdocs.get_doc_info = function(id, callback){

	var request = {
		'method': 'GET',
		'parameters': {
			'alt': 'json',
			'v': '3'
		},
		'headers': { }
	};
	var url = "https://docs.google.com/feeds/default/private/full/document%3A" + id;

	oauth.sendSignedRequest(
		url, 
		function(response, xhr){ gdocs._get_doc_callback(response, xhr, callback); }, 
		request
	);
}

// Retrieve a particular doc
gdocs.get_doc = function(id, format, callback){
	format = format || 'html';

	var request = {
		'method': 'GET',
		'parameters': {
			'alt': 'json',
			'v': '3',
			'docId': id,
			'exportFormat': format,
			'format': format
		},
		'headers': { }
	};

	var url = "https://docs.google.com/feeds/download/documents/Export";

	oauth.sendSignedRequest(
		url, 
		function(response, xhr){ gdocs._get_doc_callback(response, xhr, callback); }, 
		request
	);
}


// This function logs the response from edit_doc and then executes the callback.
gdocs._get_doc_callback = function(response, xhr, callback){
	console.log('GET Response',response);
	if (typeof(callback) === "function"){
		callback(response);	
	}
}

// This function logs the response from edit_doc and then executes the callback.
gdocs._edit_doc_callback = function(response, xhr, callback){
	console.log('EDIT Response',response);
	if (typeof(callback) === "function"){
		callback(response);	
	}
}



