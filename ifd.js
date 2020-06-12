let init = true;
let query;
let watchers = {};
let unsubscribe=false;

function watchRequests(sid,eid) {
    function parseQuery(querySnapshot) {
	/* object structure: 
	   requests = {
           *label*: {
	   count:
	   names: []
	   uids: {
	   *uid* : true
	   }
	   }
	   }
	*/
	let requests={}, results=[];
	querySnapshot.forEach(function(doc) {
	    let uid = doc.id;
	    let name = doc.data().name;
	    let theirs = doc.data().pick;
	    theirs.foreach(pick => {
		if (!requests[pick.label]) {
		    requests[pick.label] = {count: 0, names: [], uids: {}};
		}
		let r=requests[pick.label];
		if (!r.uids[uid]) {
		    r.count++;
		    r.names.push(name);
		    r.uids[uid]=true;
		}
	    });
	});
	for (r in requests) {
	    results.push({label: r, count: requests[r].count, names: names[r].names});
	}
	return r;
    };

    Mavo.inited
	.then(() => {
	    let query = firebase.firestore().collection('ifdr-user').where('mysid','==',sid)
		.where('lastActive','>',Date.now()-4*60*60*1000); //4 hours
	    let node = document.getElementById(eid);
	    if (unsubscribe) {
		unsubscribe();
	    }
	    unsubscribe = query.onSnapshot(parseQuery)
	});
    return [{label: 'test', count: 1, names: ['someone']}];
}
