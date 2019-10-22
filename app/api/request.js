import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
const FBSDK = require('react-native-fbsdk');
const { LoginButton, AccessToken, LoginManager } = FBSDK;
import RNFetchBlob from 'react-native-fetch-blob';
import { DEVICE_ID, DEVICE_ID_IOS, API_URL, APP_KEY } from '@constants/env';
import { UserHelper, StorageData } from '@helper/helper';

const baseUrl = API_URL;
// const baseUrl = 'http://localhost:3000';   // Local 
// console.log('DeviceId', device_id);

let _deviceId;
if (DeviceInfo.isEmulator())
    // console.log('DeviceId', Platform.OS);
    // console.log('DeviceId', Platform.OS == 'android');
    _deviceId = Platform.OS == 'android' ? DEVICE_ID : DEVICE_ID_IOS;
else
    _deviceId = DeviceInfo.getUniqueID() || _;

const postApi = (url, body) => {
    url = baseUrl + url; 
    let auth = UserHelper._getToken();          // get user access token after login or register.
    // console.log('user token (post): ', auth);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'appKey': APP_KEY,
            'Content-Type': 'application/json',
            'sessionId': _deviceId,
            'auth': auth,
        },
        body: body
        
    }).then((response) => response.json()).then((responseJson) => {
        // console.log('Response: ', responseJson);
        return responseJson;
    }).catch((error) => {
        // console.error(error);
        return error;
    });
}

const getApi = (url, that = null) =>{
    url = baseUrl + url;
    let auth = UserHelper._getToken();          // get user access token after login or register.
    // console.log('user token (get) : ', auth);

    return fetch(url, {
        method: 'GET',
        headers: {
            'appKey':APP_KEY,
            'sessionId' : _deviceId,
            'auth': auth,
        }
    }).then((response) => response.json()).then((responseJson) => {
        // console.log('GET RESULT: ', responseJson.code);   
        // UserHelper._logOut(that);
        
        if(responseJson.code == 401){
            // console.log('ERROR GET : ', responseJson);
            UserHelper._logOut(that);
        }
        return responseJson;
    }).catch(function(err) {
        // Error :(
        console.log('ERROR GET : ', err);
        return err;
    });
}

const deleteApi = (url) =>{ 
    url = baseUrl + url;
    let auth = UserHelper._getToken();          // get user access token after login or register.
    // console.log('user token (get) : ', auth);

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'appKey':APP_KEY,
            'sessionId' : _deviceId,
            'auth': auth,
        }
    }).then((response) => response.json()).then((responseJson) => {
        // console.log('GET RESULT: ', responseJson);
        return responseJson;
    }).catch(function(err) {
        // Error :(
        return err;
    });
}

const putApi = (url, body) => {
    url = baseUrl + url;
    let auth = UserHelper._getToken();          // get user access token after login or register.
    // console.log('user token (put) : ', auth);

    return fetch(url, {
        method: 'PUT',
        headers: {
            'appKey': APP_KEY,
            'Content-Type': 'application/json',
            'sessionId': _deviceId,
            'auth': auth,
        },
        body: body
        
    }).then((response) => response.json()).then((responseJson) => {
        // console.log('Response: ', responseJson);
        return responseJson;
    }).catch((error) => {
        // console.error(error);
        return error;
    });
}

const loginFacebook = () => {
    let fburl = baseUrl + '/api/users/facebook-authenticate';

    return LoginManager.logInWithReadPermissions(['public_profile', 'user_birthday', 'email']).then(  
        function(result) {
            if (result.isCancelled) {
                console.log('Log in canceled');
            } else {
                return AccessToken.getCurrentAccessToken().then((data) => {
                    console.log('this data ', data);
                    return fetch(fburl, {
                        method: 'POST',
                        headers: {
                            'appKey': APP_KEY,
                            'Content-Type': 'application/json',
                            'sessionId': _deviceId,
                        },
                        body: JSON.stringify({
                            'access_token': data.accessToken
                        })
                        
                    }).then((response) => response.json()).then((responseJson) => {
                        console.log('Response FB Login: ', responseJson);
                        return responseJson;
                    }).catch((error) => {
                        console.error(error);
                        return error;
                    });
                })
            }
        },function(error) {
            console.log('Login failed with error: ' , error);
        }
    );
}

const postMedia = (url, data, uploadProgress) => {
    url = baseUrl + url;
    let auth = UserHelper._getToken();          // get user access token after login or register.
    // console.log('user token (media) : ', auth);

    return RNFetchBlob.fetch('POST', url, {
        'Content-Type' : 'multipart/form-data',
        'appKey': APP_KEY,
        'sessionId': _deviceId,
        'auth': auth,
    
    }, data).uploadProgress((written, total) => {
        //console.log('uploaded', written / total)
        if(uploadProgress)
            uploadProgress(written / total);
        return (written / total);

    }).then((response) => response.json()).then((responseJson) => {
        return responseJson;
        
    }).catch(function(err) {
        return err;
    });
}

export {postApi, getApi, putApi, deleteApi, loginFacebook, postMedia};
