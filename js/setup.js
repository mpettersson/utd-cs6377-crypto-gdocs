
function init(){
	$('#saveButton').click(saveHandler);
}

function saveHandler(){
	var pw = $('#password').val();
	var pwConfirm = $('#passwordConfirm').val();

	if (pw === pwConfirm){
		chrome.extension.sendRequest({'type': 'save_setup', 'password': pw});
	}else{
		alert('Your passwords do not match.');	
	}
	
}
