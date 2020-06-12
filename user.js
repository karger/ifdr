(function () {
    let mavoElts = new WeakMap();

    let userizeAll = function () {
	let uid = firebase.auth().currentUser.uid;
        function userize (elt) {
            mavoElts.set(elt, elt.cloneNode(true));
	    elt.setAttribute('mv-app',elt.dataset.userApp);
            elt.setAttribute('mv-storage',
			     elt.getAttribute('mv-storage')+elt.dataset.userStorage+"/"+uid);
            new Mavo(elt);
        }
        document.querySelectorAll("[data-user-app]").forEach(userize);
    };

    let unUserizeAll = function() {
        document.querySelectorAll("[data-user-app]").forEach(function(elt) {
            if (Mavo.get(elt)) {
                Mavo.get(elt).root.destroy();
            }
            if (mavoElts.get(elt)) {
                elt.replaceWith(mavoElts.get(elt));
                mavoElts.delete(elt);
            }
        });
    };

    function onFireAuth (f) {
        (function loop () {
            if (typeof(firebase)!='undefined' && firebase.auth && firebase.auth()) {
                firebase.auth().onAuthStateChanged(f);
            } else {
                setTimeout(loop, 100)
            }
        })();
    }

    function watchUserData(path, callback, filter = (x=>x)) {
	function aggregate(querySnapshot) {
	    let data = [];
	    querySnapshot.forEach(docSnapshot => data.push(docuSnapshot.data()));
	    callback(data);
	}
	let observer = filter(firebase.firestore().collection(path)).onSnapShot({next: aggregate});
    }
    
    onFireAuth(function(user) {
        if (user) {
            userizeAll();
            document.body.classList.remove('logged-out');
            document.body.classList.add('logged-in');
        } else {
            document.body.classList.remove('logged-in');
            document.body.classList.add('logged-out');
            unUserizeAll();
        }})

})();
