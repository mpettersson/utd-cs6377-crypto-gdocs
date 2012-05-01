
function init(){
	var hash = location.hash;
	if (hash == '#new'){
		$('#oldPassContainer').hide();
	}
	$('#saveButton').click(saveHandler);
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
