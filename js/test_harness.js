function initTestHarness(){
	$('#linkEncrypt').click(encryptClickHandler);
	$('#linkDecrypt').click(decryptClickHandler);
	$('#linkGenKey').click(generateKeyClickHandler);

	var ctrField = $('#ctr');

	if (ctrField.val() === ""){
		ctrField.val(_crypto.random.counter());
	}
}

function encryptClickHandler(){
	var key = $('#key').val();
	var ctr = $('#ctr').val()
	var plaintext = $('#pt').val();

	var result = _crypto.encrypt(key,ctr,plaintext);
	$('#ct').val(result);
}

function decryptClickHandler(){
	var key = $('#key').val();
	var ctr = $('#ctr').val();
	var cryptotext = $('#ct').val();
	
	var result = _crypto.decrypt(key, ctr, cryptotext);
	$('#pt').val(result);
}

function generateKeyClickHandler(){
	var key = _crypto.random.key(4);
	$('#key').val(key);
}

