// KeyManager implementation that uses a master key derived from a password to protect
// subordinate document keys.

// Constructor
KeyManager = function(storage){
	this.storage = storage || localStorage;
	this.hash = this.storage.getItem("_passwordHash");
	this.salt = this.storage.getItem("_passwordSalt");
	this.masterkey = this.storage.getItem("_masterKey");
}

// Checks to see if a master password exists
KeyManager.prototype.isSetup = function(){
	return this.hash !== null;
}

// Sets the current password for the key manager to try and use
KeyManager.prototype.setCurrentPassword = function(password){
	this.currentPassword = password;
}

// Verifies the current password with the stored password
KeyManager.prototype.verifyPassword = function(password){
	password = password || this.currentPassword;
	var passwordHash = _crypto.sha256(password + this.salt);
	return (passwordHash === this.hash);
}

// Changes the password that protects the master key
// Also sets current password to be the new passwor
KeyManager.prototype.changePassword = function(newpass){
	var newSalt = _crypto.random.key(4);
	var newHash = _crypto.sha256(newpass + newSalt);

	var pwkey = _crypto.deriveKey(newpass, newSalt);
	
	var masterkey = null;

	if (typeof(this.currentPassword) !== 'undefined'){
		var oldpwkey = _crypto.deriveKey(this.currentPassword, this.salt);
		var oldctr = sjcl.codec.base64.toBits(this.salt)[0];
		var oldencrypted = this.masterkey;
		masterkey = _crypto.decrypt(oldpwkey, oldctr, oldencrypted, true);
	}else{
		masterkey = _crypto.random.key(4);
	}

	var ctr = sjcl.codec.base64.toBits(newSalt)[0];

	var encrypted = _crypto.encrypt(pwkey,ctr,masterkey, true);
	
	this.storage.setItem('_masterKey', encrypted);
	this.storage.setItem('_passwordHash', newHash);
	this.storage.setItem('_passwordSalt', newSalt);

	this.hash = newHash;
	this.salt = newSalt;	
	this.masterkey = encrypted;
	this.setCurrentPassword(newpass);
}

// Retrieve the value of the master key
KeyManager.prototype.getMasterKey = function(){
	var pwkey = _crypto.deriveKey(this.currentPassword, this.salt);
	var ctr = sjcl.codec.base64.toBits(this.salt)[0];
	var encrypted = this.masterkey;
	var	masterkey = _crypto.decrypt(pwkey, ctr, encrypted, true);
	
	return masterkey;
}

// Set the key used by a particular document
KeyManager.prototype.setDocumentKey = function(docId, key){
	var ctr = _crypto.random.counter();
	var masterkey = this.getMasterKey();
	var encrypted = _crypto.encrypt(this.getMasterKey(), ctr, key, true);
	var container = new _crypto.key_container(ctr, 1, encrypted);

	this.storage.setItem('docKey-' + docId, JSON.stringify(container));
}

// Retrieve the key used by a particular document
KeyManager.prototype.getDocumentKey = function(docId){
	var key_enc = this.storage.getItem('docKey-' + docId);
	
	if (!key_enc){
		return null;
	}	

	var key_container = JSON.parse(key_enc);
	var key = _crypto.decrypt(this.getMasterKey(), key_container.nonce, key_container.payload, true);
	
	return key;
}
