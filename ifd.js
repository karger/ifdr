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
	let n=document.querySelector('[mv-app="ifdr"]'),
	    storage='https://mavo-cd7c3.firebaseio.com/ifdr-user/'
	//	    n.getAttribute('mv-storage');

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

    username = function() {
	try {
	    return firebase.auth().currentUser.displayName;
	}
	catch (e) {
	    return "";
	}
    }
    
    let unsubscribe=false
    , users = [];
    watchUsers = function(sid, backTime) {
	fireAuth.then(() => {
	    sid = Mavo.value(sid);
	    console?.log("session: "+sid);

	    function parseQuery(querySnapshot) {
		let requestMap={};
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
		if (!sid) return;
		
		let query = firebase.firestore().collection('ifdr-user')
		    .where('mysid','==',sid)
		    .where('checkInTime','>',Date.now()-backTime); //4 hours
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
