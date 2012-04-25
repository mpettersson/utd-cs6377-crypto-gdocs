/*
 * These are the crypto functions that we wrote to actually
 * perform our AES encryption and HMAC
 */

var _crypto = {}

_crypto.container = function (nonce, alg, message){
	this._t = 'crypto-gdoc';
	this.nonce = nonce;
	this.alg = alg;
 	this.payload = message;
}

_crypto.random = {};

// This generates a single random integer to use 
_crypto.random.counter = function(){
	var rand = new Int32Array(1);
	window.crypto.getRandomValues(rand);
	return rand[0];
}

// This generates a random 128-bit key for use with AES
_crypto.random.key = function(len){
	var key = new Int32Array(len);
	window.crypto.getRandomValues(key);

	var keyString = sjcl.codec.base64.fromBits(key);
	return keyString;
}

_crypto.hmac = {};

// This generates an HMAC for a specific message.
_crypto.hmac.generate = function(key, messageBits){
	var hmac = new sjcl.misc.hmac(key, sjcl.hash.sha256);
	return hmac.encrypt(messageBits)
}

// This verifies an HMAC from a specific message
_crypto.hmac.verify = function(key, hmacBits, messageBits){
	var calcString = sjcl.codec.base64.fromBits(_crypto.hmac.generate(key, messageBits));
	var hmacString = sjcl.codec.base64.fromBits(hmacBits);

	return (calcString === hmacString);
}

// This encrypts the specified string using AES and HMAC with the
// specified key and ctr values.
_crypto.encrypt = function(keystr,ctr,textstr){	

	var cryptotext = [];

	// Convert plaintext to bit array
	var plaintext = sjcl.codec.utf8String.toBits(textstr);
	
	_crypto.fixBits(plaintext);

	// Convert the key to bits and initialize AES
	var key = sjcl.codec.base64.toBits(keystr);
	var aes = new sjcl.cipher.aes(key);

	// Calculate the amount of padding on the end of the cryptotext 
	// and include this in the message
	var aesPadding = ((plaintext.length + 1) % 4 == 0) ? 0 : 4 - (plaintext.length + 1) % 4;
	plaintext.splice(0, 0, aesPadding);

	// Calculate the HMAC
	var hmac= _crypto.hmac.generate(key,plaintext);

	// Concat the result of HMAC onto the end of plaintext to make our cryptosource
	var cryptosource = plaintext.concat(hmac);
	
	// Add the appropriate AES padding on the end of the cryptosource.
	for (i = 0; i < aesPadding; i++){ cryptosource.push(0); }

	// For each group of four blocks in our cryptosource...
	for (i = 0; i < cryptosource.length; i = i + 4){
		var blocks = cryptosource.slice(i, i + 4);

		// Encrypt the CTR value with AES
		var enc = aes.encrypt([ctr++, ctr++, ctr++, ctr++]);
		
		// For each of the blocks in this section of the cryptosource...
		$.each(blocks, function(idx, item){
			// XOR the block with the appropriate encrypted CTR
			blocks[idx] = item ^ enc[idx];
			cryptotext.push(blocks[idx]);
		});

	}
	
	// Convert our cryptoresult to Base 64
	var cryptoresult = sjcl.codec.base64.fromBits(cryptotext);
	
	return cryptoresult;
}

// This function decrypts a message using
_crypto.decrypt = function(keystr, ctr, cryptostr){	

	var cryptosource = [];

	// Convert plain text and key to bit arrays
	var cryptotext = sjcl.codec.base64.toBits(cryptostr);
	var key = sjcl.codec.base64.toBits(keystr);
	var aes = new sjcl.cipher.aes(key);

	// For each group of four blocks in our cryptosource...
	for (i = 0; i < cryptotext.length; i = i + 4){
		var blocks = cryptotext.slice(i, i + 4);

		// Encrypt the CTR value with AES
		var enc = aes.encrypt([ctr++, ctr++, ctr++, ctr++]);
		
		// For each of the blocks in this section of the cryptosource...
		$.each(blocks, function(idx, item){
			// XOR the block with the appropriate encrypted CTR
			blocks[idx] = item ^ enc[idx];
			cryptosource.push(blocks[idx]);
		});
	}

	// Remove the padding from the mesage
	var aesPadding = cryptosource[0];
	cryptosource.splice(cryptosource.length - aesPadding);
	
	// Get the included HMAC from the message
	var hmacMessageResult = cryptosource.splice(cryptosource.length - 8);

	// Verify the HMAC
	if (!_crypto.hmac.verify(key, hmacMessageResult, cryptosource)){
		throw new _crypto.HMACError("The HMAC of the message is invalid. Message integrity has been compromised.");
	}

	cryptosource.splice(0,1);

	var plaintext = sjcl.codec.utf8String.fromBits(cryptosource);
	return plaintext;
}

_crypto.sha256 = function(data){
	var hash = sjcl.hash.sha256.hash(data);
	return sjcl.codec.utf8String.fromBits(hash);
}

_crypto.deriveKey = function(password,salt,length){
	return sjcl.misc.pbkdf2(password, salt, 2000, length)
}

_crypto.HMACError = function(message){
	this.name = 'HMACError';
	this.message = message || 'The HMAC is invalid.'
}

_crypto.fixBits = function(bitArray){

	// Workaround to fix issues with 64-bit numbers showing up when converting from utf8 to bits
	// Essentially, the XOR with 0 flattens everything to 32-bit numbers so HMAC doesn't get angry
	// https://developer.mozilla.org/en/JavaScript/Reference/Operators/Bitwise_Operators
	$.each(bitArray, function(idx,itm){
		bitArray[idx] = itm ^ 0;
	});
}

_crypto.HMACError.prototype = new Error();
_crypto.HMACError.constructor = _crypto.HMACError;
	
