var editor = null;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	$('#saveButton').click(saveDocument);

	var message = request.message;
	editor = $("#editor").val(message).wysiwyg({initialContent: ''});

	var key = request.key;
	var keyElement = $('#key').text(key).hide();

	$('#keyContainer > a').click(function(){
		if ($(this).text() === 'Show Key'){
			$(this).text('Hide Key');
			keyElement.show();
		}else{
			$(this).text('Show Key');
			keyElement.hide();
		}
	});
});

var saveDocument = function(){
	chrome.extension.sendRequest({type: 'save_doc', content: editor.wysiwyg('getContent')});
}

