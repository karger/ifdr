let unsubscribe=false;

function watchRequests(sid,eid) {
    if (console) {console.log(Mavo.value(sid), eid);}
    function parseQuery(querySnapshot) {
	/* object structure: 
	   requests = {
              label...: {
	         count:
	         names: []
	         uids: {
	            uid... : true
	         }
	      }
	   }
	*/
	let requestMap={}, requestList=[]
	, node=Mavo.Node.get(document.getElementById(eid));

	querySnapshot.forEach(function(doc) {
	    let uid = doc.id;
	    let name = doc.data().name;
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
	for (r in requestMap) {
	    requestList.push({label: r, count: requestMap[r].count, names: requestMap[r].names});
	}
	node.render({requests: requestList});
	return {};
    };

    sid=Mavo.value(sid);
    Promise.all([Mavo.inited,fireAuth]).then(() => {
	if (unsubscribe) {
	    unsubscribe();
	}
	if (!sid || !eid) return;
	
	let query = firebase.firestore().collection('ifdr-user')
	    .where('mysid','==',sid)
	    .where('lastActive','>',Date.now()-4*60*60*1000); //4 hours
 	unsubscribe = query.onSnapshot(parseQuery);
    });
    return [];
}

/*
Idea: create a function f whose first argument is used for signaling.
an invocation of f(null, x) tells f that the relevant mavo args have changed, meaning that f should reinitialize the observer and then signal an update (by rendering a new value on signal)
an invocation of f(signal,x) is telling f that when its observed value changes, it should update signal.  f should also return the observed value 

start with a function g(callback,...args) where the args initialize the observer and the callback is invoked with the new value whenever there is a change.
*/
function observer(init) {
    let changes=0;
    let currentValue;
    let cache=null;
    let signal=null;
    
    function callback(result) {
    }
    function observeFn(...args) {
	if (args[0] == null) {
	    init(callback,...args);
	} else {
	}
    }
}
