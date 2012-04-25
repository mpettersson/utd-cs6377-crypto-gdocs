var editor = null;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	$('#saveButton').click(saveDocument);
	var message = request.message;
	editor = $("#editor").val(message).wysiwyg();
});

var saveDocument = function(){
	chrome.extension.sendRequest({type: 'save_doc', content: editor.wysiwyg('getContent')});
}
