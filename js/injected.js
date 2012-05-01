chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.type === 'get_password'){
		var overlay = document.createElement('div');
		overlay.className = 'overlayPopup';
		
		
		var heading = document.createElement('p');
		heading.innerText = 'Enter your password';
		
		overlay.appendChild(heading);
		
		var field = document.createElement('input');
		field.type = 'password';
		overlay.appendChild(field);

		var button = document.createElement('input');
		button.type = 'submit';

		$(button).click(function(evt){
			evt.preventDefault();
			sendResponse($(field).val());
			$(overlay).remove();
		});
		
		var background = document.createElement('div');
		
		$(background)
			.addClass('overlayBackground')
			.appendTo('body')
			.click(function(){
				$(overlay).remove();
				$(background).remove();
			});;

		overlay.appendChild(button);
		
	
		document.body.appendChild(overlay);
		$(overlay).position({
			my: "top",
			at: "top",
			of: "#docs-editor-container"
		});	
		
	}
});

