(async function () {
    await Mavo.ready;
    
    Mavo.DOMExpression.special.event("$user", {
	type: "mv-login mv-logout",
	update: (evt) => evt.backend.user
    });
})();

let requestInput = document.getElementById("request-input");
if (requestInput) {
    requestInput.addEventListener("keyup",e => {
	if (e.keyCode==13) {
	    let datalist=document.getElementById("dancelist")
	    , options=datalist.getElementsByTagName("option")
	    , input = requestInput.value.toLowerCase()
	    , matches = 0
	    , match = null;

	    for (i=0; i<options.length; i++) {
		if (options[i].value.toLowerCase()
		    .includes(input)) {
		    match = options[i].value;
		    matches++;
		}
	    }
	    if (matches < 2) {
		if (matches == 1) {
		    requestInput.value=match;
		}
	    }
	}
    });
}
