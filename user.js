fireAuth = new Promise((resolve,reject) => {
    (function loop () {
        if (typeof(firebase)!='undefined' && firebase.auth &&
	    firebase.apps.length > 0 && firebase.auth()) {
            resolve(firebase.auth());
        } else {
            setTimeout(loop, 100)
        }
    })();
});

function getUid(trigger) {
    try {
	return firebase.auth().currentUser.uid;
    }
    catch (e) {
	return "";
    }
}

function getUname(trigger) {
    try {
	return firebase.auth().currentUser.displayName;
    }
    catch (e) {
	return ""
    }
}

(function () {

    Promise.all([Mavo.inited,fireAuth])
	.then(([m,auth])=>auth.onAuthStateChanged((user)=> {
            if (user) {
		Mavo.Node.get(document.getElementById("name"))
		    .render(user.displayName);
		document.body.classList.remove('logged-out');
		document.body.classList.add('logged-in');
            } else {
		document.body.classList.remove('logged-in');
		document.body.classList.add('logged-out');
            }}))

})();
