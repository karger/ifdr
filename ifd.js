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

    let signalCounter=0
    , signalNode
    ;
    setSignal = function(id) {
	signalNode = Mavo.Node.get(document.getElementById(Mavo.value(id)));
	return signalCounter;
    }
    function signal () {
	if (signalNode) {
	    signalNode.render(signalCounter++);
	}
    }
    
    uid = function() {
	try {
	    return firebase.auth().currentUser.uid;
	}
	catch (e) {
	    return "";
	}
    }

    username = function() {
	try {
	    return firebase.auth().currentUser.displayName;
	}
	catch (e) {
	    return ""
	}
    }

    let excluded = {};
    setExclude = function(uid, state) {
	excluded[uid]=state;
	signal();
    }
    
    let unsubscribe=false
    , requests=[]
    , users = [];
    watchRequests = function(sid) {
	fireAuth.then(() => {
	    sid = Mavo.value(sid);
	    if (console) {console.log("session: "+sid);}

	    function parseQuery(querySnapshot) {
		let requestMap={};
		users = [];
		
		querySnapshot.forEach(function(doc) {
		    let uid = doc.id;
		    let name = doc.data().name;
		    users.push({uid: uid, name: name, lastActive: doc.data().lastActive});
		    if (excluded[uid]) return;

		    let theirs = doc.data().pick;
		    theirs.forEach(pick => {
			if (!requestMap[pick.label]) {
			    requestMap[pick.label] = {count: 0, names: [], uids: {}};
			}
			let r=requestMap[pick.label];
			if (!r.uids[uid]) {
			    r.count++;
			    r.names.push(name);
			    r.uids[uid]=true;
			}
		    });
		});
		requests=[];
		for (r in requestMap) {
		    requests.push({label: r,
				   count: requestMap[r].count,
				   names: requestMap[r].names});
		}
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
		    .where('lastActive','>',Date.now()-4*60*60*1000); //4 hours
 		unsubscribe = query.onSnapshot(parseQuery);
	    });
	    return [];
	})
    };

    getRequests = function (signal) {
	return requests;
    }

    getUsers = function() {
	users.forEach(u => {u.excluded=excluded[u.uid]});
	return users;
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

    getSessions = function(signal) {
	return sessions;
    }

    markPlayed = function(requests, played) {
	let map={}, result=[];

	try {
	    played.forEach(p=> {
		map[p.label]=true;
	    })
	    requests.forEach(r => {
//		let s=Object.assign([],r);  //breaks mavo for unknown reasons
		let s={label: Mavo.value(r.label),
		       count: Mavo.value(r.count),
		       names: Mavo.value(r.names)
		      }
		for (k in s) {
		    if (typeof s[k]=='undefined') {
			delete s[k]
		    }
		}
		s.played = map[r.label] ? true : false;
		result.push(s);
	    })
	    return result;
	} catch (e) {
	    return [];
	}
    }
})();
