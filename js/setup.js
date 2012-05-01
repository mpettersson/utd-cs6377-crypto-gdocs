
function init(){
	var hash = location.hash;
	if (hash == '#new'){
		$('#oldPassContainer').hide();
		$('#resetContainer').hide();
	}
	$('#saveButton').click(saveHandler);
	$('#resetButton').click(resetHandler);
}

function saveHandler(){
	var oldpw = $('#oldPassword').val();
	var pw = $('#password').val();
	var pwConfirm = $('#passwordConfirm').val();

	if (pw === pwConfirm){
		chrome.extension.sendRequest({'type': 'save_setup', 'password': pw, 'oldPassword': oldpw}, 
			function(response){
				if (!response){
					alert('Your old password was incorrect. Please try again.');
				}
			}
	);

	}else{
		alert('Your passwords do not match.');	
	}
	
}

function resetHandler(){
	if (window.confirm('Warning!!! This will delete all of your local encryption keys. You may not be able to recover encrypted documents if you do not have extra copies of your keys.')){
		chrome.extension.sendRequest({'type': 'reset'});
	}
}
