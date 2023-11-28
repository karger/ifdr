(function () {
    
    Mavo.inited.then((m) => {
		let session = Mavo.get(document.querySelector('[mv-app=session]'));
		afterNap(()=>{console.log('woke '+(new Date()).toLocaleTimeString()); session.load()})
    });

    let requestInput = document.getElementById("request-input")
    if (requestInput) {//request app
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
		    document.getElementById("request-button").click();
		}
	    }
	}
			 );
    }

    let afterNap = function(f, nap = 10000) {
	let lastTime = Date.now();
	let inner = function() {
	    if (Date.now()-lastTime > nap) {
		f();
	    }
	    lastTime=Date.now();
	}
	setInterval(inner, 100);
    }

    watchLoginState = function(uid) {
	if (Mavo.value(uid)) {
	    document.body.classList.remove('logged-out');
	    document.body.classList.add('logged-in');
	} else {
	    document.body.classList.remove('logged-in');
	    document.body.classList.add('logged-out');
	}
    }

    watchFont = function(size) {
	document.body.style.fontSize=Mavo.value(size)+"%";
    }
    
    notify = false;
    notifying = false;
    watchNotify = function(n) {
	notify = (n==true); //! operator fails on proxy object
	if (notify && Notification.permission=='default') {
	    Notification.requestPermission();
	}
    }
    sendNotify = function(msg) {
	if (notify && !notifying && Notification.permission=='granted') {
	    /*notifying = true;*/
	    n = new Notification(msg);
	    /*
	    setTimeout(() => {
		notifying = false;
		n.close();
	    }, 4000);*/
	}
    }

    makeIndex = function(list,key) {
	let map={};
	if (key) { //indexing objects
	    list.forEach(o => {
		if (o[key]) {
		    map[o[key]] = o;
		}
	    });
	} else { //indexing strings
	    list.forEach(s=> {
		map[s]=true;
	    })
	}
	return map;
    }
    
    lookup = function(index, key, def) {
	if (!!index && index.hasOwnProperty(key)) {
	    return index[key]
	} else {
	    return undefined
	}
    }

    rest = function(n, arr=n) {
	return arr.slice(arguments.length > 1 ? n : 1);
    }

    warn = function(condition,text) {
	if (condition) {
	    console.log(text);
	}
    }

    
    window.addEventListener('load', ()=> {
	document.body.addEventListener('focusin', (e)=> {
	    if (e.target.matches('.pending-delete')) {
		e.target.select();
	    }
	});
    });
})();

document.body.addEventListener("mv-login",() => {
	document.body.classList.remove('logged-out');
	document.body.classList.add('logged-in');
});

document.body.addEventListener("mv-logout",() => {
	document.body.classList.remove('logged-in');
	document.body.classList.add('logged-out');
});


(async function () {
    await Mavo.ready;
    
    Mavo.DOMExpression.special.event("$user", {
				type: "mv-login mv-logout",
				update: (evt) => {
						return evt.backend.user
				}
    });
})();
