let init = true;
let query;
let watchers = {};
let unsubscribe=false;

function watchRequests(sid,eid) {
    if (console) {console.log(Mavo.value(sid), eid);}
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
	let requests={}, results=[], node=Mavo.Node.get(document.getElementById(eid));
	querySnapshot.forEach(function(doc) {
	    let uid = doc.id;
	    let name = doc.data().name;
	    let theirs = doc.data().pick;
	    theirs.forEach(pick => {
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
	    results.push({label: r, count: requests[r].count, names: requests[r].names});
	}
	node.render({requests: results});
	return results;
    };

    sid=Mavo.value(sid);
    Mavo.inited
	.then(() =>
	      onFireAuth(() =>
			 {
			     if (unsubscribe) {
				 unsubscribe();
			     }
			     if (!sid || !eid) return;
			     
			     let query = firebase.firestore().collection('ifdr-user').where('mysid','==',sid)
				 .where('lastActive','>',Date.now()-4*60*60*1000); //4 hours
			     let node = document.getElementById(eid);
 			     unsubscribe = query.onSnapshot(parseQuery);
			 }));
    return [{label: 'test', count: 1, names: ['someone']}]
}
