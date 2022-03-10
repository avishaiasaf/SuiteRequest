import CryptoJS from "crypto-js/crypto-js.js";
import hmacSHA256 from 'crypto-js/hmac-sha256.js';
import fetch from "node-fetch";

export async function makeRequest(cred, body, method){
    const params = CreateOAuthRequest(cred.accountId, cred.scriptId, cred.deployId, cred.auth, body, method);

    let response;
    const init = {
        method: method.toLowerCase(),
        headers: params.header
    }

    if(method === 'POST' || method === 'DELETE')   init['body'] = params.body;

    // fetch(params.url, init)
    //     .then(res => res.json())
    //     .then(console.log)
    //     .then(res => response=res)
    //     .catch(e => console.log(e));

    return await fetch(params.url, init)
        .then(res => res.json())
        .catch(e => console.log(e));
}

export const CreateOAuthRequest = (accountId, scriptId, deployId , auth, reqBody, method) => {
    const NETSUITE_ACCOUNT_ID = accountId;
    const BASE_URL = 'https://' + NETSUITE_ACCOUNT_ID.toLowerCase().replace('_','-') + '.restlets.api.netsuite.com/app/site/hosting/restlet.nl';
    const HTTP_METHOD = method || 'POST';
    const SCRIPT_ID = scriptId;
    const OAUTH_VERSION = '1.0';
    const SCRIPT_DEPLOYMENT_ID = deployId || '1';
    const TOKEN_ID             = auth.tokenId;
    const TOKEN_SECRET         = auth.tokenSecret;
    const CONSUMER_KEY         = auth.consumerKey;
    const CONSUMER_SECRET      = auth.consumerSecret;
    let text                 = "";
    const length               = 32;
    const possible             = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {  text += possible.charAt(Math.floor(Math.random() * possible.length));     }

    const OAUTH_NONCE = text;
    const TIME_STAMP  = Math.round(+new Date() / 1000);

    let data = '';
    data = data + 'deploy='                 + SCRIPT_DEPLOYMENT_ID + '&';
    data = data + 'oauth_consumer_key='     + CONSUMER_KEY + '&';
    data = data + 'oauth_nonce='            + OAUTH_NONCE + '&';
    data = data + 'oauth_signature_method=' + 'HMAC-SHA256' + '&';
    data = data + 'oauth_timestamp='        + TIME_STAMP + '&';
    data = data + 'oauth_token='            + TOKEN_ID + '&';
    data = data + 'oauth_version='          + OAUTH_VERSION + '&';
    data = data + 'script='                 + SCRIPT_ID;
    const encodedData  = encodeURIComponent(data);
    const completeData = HTTP_METHOD + '&' + encodeURIComponent(BASE_URL) + '&' + encodedData;
    const hmacsha256Data = hmacSHA256(completeData, CONSUMER_SECRET + '&' + TOKEN_SECRET);
    const base64EncodedData = hmacsha256Data.toString(CryptoJS.enc.Base64);

    const oauth_signature = encodeURIComponent(base64EncodedData);

    let OAuth = 'OAuth oauth_signature="'  + oauth_signature + '",';
    OAuth = OAuth + 'oauth_version="1.0",';
    OAuth = OAuth + 'oauth_nonce="'        + OAUTH_NONCE + '",';
    OAuth = OAuth + 'oauth_signature_method="HMAC-SHA256",';
    OAuth = OAuth + 'oauth_consumer_key="' + CONSUMER_KEY + '",';
    OAuth = OAuth + 'oauth_token="'        + TOKEN_ID + '",';
    OAuth = OAuth + 'oauth_timestamp="'    + TIME_STAMP + '",';
    OAuth = OAuth + 'realm="'              + NETSUITE_ACCOUNT_ID + '"';

    const url          = BASE_URL + '?script=' + SCRIPT_ID + '&deploy=' + SCRIPT_DEPLOYMENT_ID;
    const header       = { "Authorization": OAuth, "Content-Type": 'application/json' };
    const body             = JSON.stringify(reqBody || {}, (key, value) =>{
        if (typeof value == "number" && !isFinite(value)){
            return String(value);
        }
        return value;
    });

    return {
        url,
        header,
        body
    }
}