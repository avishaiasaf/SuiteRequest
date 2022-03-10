import { cred } from "./credentials.js";
import { makeRequest } from "./utils.js";

const lines = [];
for(let i=0;i<1;i++){
    lines.push({
        account: '1623',
        debit: 1,
    });
    lines.push({
        account: '1621',
        credit: 1,
    });
}

const body = {
    type: 'journalentry',
    body: {
        subsidiary: '2',
        currency: '1',
        exchangerate: '3.1629874',
        date: new Date(),
        memo: 'Test',
        approvalstatus: '2',
        nextapprover: '-5'
    },
    lines:lines
}

const del = {
    transactions: [
        2237460
    ]
}

const method = 'DELETE';
const limit = 10;
const deployments = 2;

makeRequest(cred, del, method);
//
// for(let i=0;i<limit;i++) {
//     (async () => {
//         const res = await makeRequest(cred, body, method);
//         while (!res.newJournal && cred.deployId<deployments) {
//             cred.deployId++;
//             console.log('Moving to next deployment', cred.deployId);
//             const res = await makeRequest(cred, body, method);
//         }
//         if (res.newJournal) console.log(res);
//     })();
// }


