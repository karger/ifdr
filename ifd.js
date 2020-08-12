(function () {

    fireAuth = new Promise((resolve,reject) => {
	(function loop () {
            if (typeof(firebase)!='undefined' &&
		firebase?.apps?.length > 0 && firebase?.auth?.()) {
		resolve(firebase.auth());
            } else {
		setTimeout(loop, 100)
            }
	})();
    });

    Promise.all([Mavo.inited,fireAuth]).then(([m,auth])=> {
	auth.onAuthStateChanged((user)=> {
	    if (user) {
		document.body.classList.remove('logged-out');
		document.body.classList.add('logged-in');
	    } else {
		document.body.classList.remove('logged-in');
		document.body.classList.add('logged-out');
	    }
	    signal();
	});
    });

    
    let signal =function () {
	if (signal.ready) {
	    signal.ready=false;
	    setTimeout(() => {
		signal.node?.render(signal.counter++);
		signal.ready=true;
	    },
		       100);
	}
    }
    signal.counter=0;
    signal.ready=true;

    setSignal = function(id) {
	signal.node = Mavo.Node.get(document.getElementById(Mavo.value(id)));
	return signal.counter;
    }
    
    
    getUid = function() {
	try {
	    return firebase.auth().currentUser.uid;
	}
	catch (e) {
	    return undefined;
	}
    }

    updateURLParam = function(name,value,title) {
	var u = new URL(window.location);
	var s = url.searchParams;
	s.set(name,value);
	url.search=s.toString;
	history.pushState("",title,url);
    }
    
    username = function() {
	try {
	    return firebase.auth().currentUser.displayName;
	}
	catch (e) {
	    return "";
	}
    }

    notify = false;
    notifying = false;
    watchNotify = function(n) {
	notify = (n==true); //! operator fails on proxy object
	if (n && Notification.permission=='default') {
	    Notification.requestPermission();
	}
    }
    sendNotify = function(msg) {
	console.log("send notify " + notify + "/" + notifying);
	if (notify && !notifying && Notification.permission=='granted') {
	    console.log("do notify");
	    notifying = true;
	    n = new Notification(msg);
	    setTimeout(() => {
		notifying = false;
		n.close();
	    }, 4000);
	}
    }
    
    let unsubscribe=false
    , users = []
    watchUsers = function(sid, backTime) {
	fireAuth.then(() => {
	    sid = Mavo.value(sid);

	    function parseQuery(querySnapshot) {
		let requestMap={};

		sendNotify("Requests have changed");
		users = [];
		
		querySnapshot.forEach(function(doc) {
		    let uid = doc.id;
		    let {name, checkInTime, picks} = doc.data();
		    users.push({uid: uid, name: name, checkInTime: checkInTime, picks: picks});
		});
		signal();
		return 0;
	    };

	    fireAuth.then(() => {
		if (unsubscribe) {
		    unsubscribe();
		}

		if (!sid || !Number.isInteger(1*backTime)) return;
		
		let query = firebase.firestore().collection('ifdr-user')
		    .where('mysid','==',sid)
		    .where('checkInTime','>',Date.now()-1*backTime); //prune ancient checkins
 		unsubscribe = query.onSnapshot(parseQuery);
	    });
	    return [];
	})
    };

    getUsers = function() {
	return users;
    }

    mergePicks = function(users) {
	let requestMap = {};
	users.forEach((u) => {
	    if (u) {
		let {name, uid, picks=[]}=u;
		picks.forEach(({label}) => {
		    if (!requestMap[label]) {
			requestMap[label] = {label: label, count: 0, names: [], uids: {}};
		    }
		    let r=requestMap[label];
		    if (!r.uids[uid]) {
			r.count++;
			r.names.push(name);
			r.uids[uid]=true;
		    }
		});
	    }
	});
	return Object.values(requestMap);
    }
    
    let sessions=[];
    watchSessions = function() {
	fireAuth.then(() => {
	    let count=0;
	    firebase.firestore().collection('ifdr-session').onSnapshot(shot=>{
		sessions = [];
		shot.forEach(doc => {
		    let s=doc.data();
		    s.id = doc.id;
		    sessions.push(s);
		    sessions.sort((a,b) => a.name > b.name);
		});
		signal();
	    });
	});
    }

    getSessions = function() {
	console.log('getSessions');
 	return JSON.parse(JSON.stringify(sessions));
    }

    makeIndex = function(list,key) {
	let map={};
	if (key) { //indexing objects
	    list.forEach(o => {
		map[o[key]] = o;
	    });
	} else { //indexing strings
	    list.forEach(s=> {
		map[s]=true;
	    })
	}
	return map;
    }

})();
