import { AsyncStorage, Platform, Dimensions } from 'react-native';
import { SEND_BRID_APP_ID, GoogleAnalyticsID } from '@constants/env';
import { ImageCache } from "react-native-img-cache";
import DeviceInfo from 'react-native-device-info';

const FBSDK = require('react-native-fbsdk');
const { LoginButton, AccessToken, LoginManager } = FBSDK;
import SocketIOClient from 'socket.io-client';

import SendBird from 'sendbird'; 
import { postApi } from '@api/request';
import { DEVICE_ID, DEVICE_ID_IOS, SOCKET_URL, ENV_STATUS } from '@constants/env';

import _ from 'lodash'

import moment from 'moment'

const {width, height} = Dimensions.get('window');

// You have access to three classes in this module:
import {
    GoogleAnalyticsTracker,
    GoogleTagManager,
    GoogleAnalyticsSettings
  } from 'react-native-google-analytics-bridge';

const EMPLOYER_TYPE = 'employer';
const USER_TYPE = 'user';


const genderOption = [{
    id: 1,
    value : 'M',
    label : 'Male',

},{
    id: 2,
    value : 'F',
    label : 'Female',
},{
    id: 3,
    value : 'B',
    label : 'Both (Male & Female)',
}];
 
class UserHelperCls{

    constructor(){
        this.token = '';
        this.UserInfo = {}; 
        this.UserChatPartners = [];
        isLoadingOnHeader=false;
        isEditing=false;
    }

    _setLoading = (_loading) => {
        this.isLoadingOnHeader = _loading;
        console.log('isLoadingOnHeader', this.isLoadingOnHeader);
    }   

    _setEditing = (_editing) => {
        this.isEditing = _editing;
    }   

    _getFirstRole = () => {
        return _.head(this.UserInfo.activeUserRoles)
    }

    _getUserFullName = () => {
        if(this._isLogIn())
             return this.UserInfo.profile.attributes.first_name.value + ' ' + this.UserInfo.profile.attributes.last_name.value;
        else
            return '';
    }

    _getUserInfo = () => {
        return this.UserInfo;
    }

    // get talent or talent-seeker category (Director, singer ...)
    _getKind = (_kindsObj) => {
        // console.log('_kindsObj: ', _kindsObj);
        
        let _tmpKinds = [];
        const _kinds = _kindsObj || _.cloneDeep(this.UserInfo.profile.attributes.kind.value);
        
        if(!_kinds)
            return _tmpKinds;

        _.each(_kinds.split(','), function(v,k){
            _tmpKinds.push({
                id: k,
                display_name: v
            })
        });
        // console.log()
        return _tmpKinds;
    }
 
    _getCover = (_type) => {
        // console.log('This is user cover: ', this.UserInfo);
        // console.log('and zoom url: ', this.UserInfo.cover.zoom_url_link);
        // return this.UserInfo.cover ? (this.UserInfo.cover.zoom_url_link ? this.UserInfo.cover.zoom_url_link : this.UserInfo.cover.)
        if(_type)
            return this.UserInfo.cover ? this.UserInfo.cover[_type] : ''
        else
            return this.UserInfo.cover ? this.UserInfo.cover.zoom_url_link : '';
    }

    _getToken = ()  => {
        // return 'kQzBzAlIYYVFDzSZaVn/t1/aXEZ0JGUY7/pVwth91kA=';
        // this.token = 'skdfh23jk4hk32h4jk234234kj23h';
        return this.UserInfo ? this.UserInfo.token : '';
    }

    _isLogIn = ()  => {

        if(_.isEmpty(this.UserInfo))
            return false;
        // console.log('user', this.UserInfo);
        return this.UserInfo.token && this.UserInfo.is_register_completed ? true : false;
    }

    _isEmployer = (_withNoLogin) => {
        if(this._isLogIn()){
            // console.log('_getFirstRole : ',this._getFirstRole().role.name,' == ',EMPLOYER_TYPE);
            return this._getFirstRole().role.name == EMPLOYER_TYPE;
        }
        else if(_withNoLogin){
            return this._getFirstRole().role.name == EMPLOYER_TYPE;
        }
        else
            return '';
    }

    _isUser = (_withNoLogin) => {
        if(this._isLogIn())
            return this._getFirstRole().role.name == USER_TYPE;
        else if(_withNoLogin)
            return this._getFirstRole().role.name == USER_TYPE;
        else
            return '';
    }

    _isMe = (_userId) => {  
        // console.log('is Me:', _userId, ' == ', this.UserInfo.profile._id);
        if(this.UserInfo)
            return _userId == this.UserInfo._id;
        else
            return false;
    }

    _chkFacebookAcc = () => {

        let _tmpSocial =  _.filter(this.UserInfo.socialAccounts,function(v,k){
            return v.type == 'facebook'
        })

        return _tmpSocial.length>0;
    }

    _checkUserExpiredToken = () => {

        if(!UserHelper._isLogIn())
            return true;

        let _dataExpired = this.UserInfo.expires;
        
        // console.log('Expired On :', _dataExpired, ', Today : ', moment());
        // let _toDay = new Date('2017-6-30T03:47:41.251Z');
        let _toDay = new Date(_dataExpired);
        let _afterSubtract = moment(_toDay).subtract(1,'day'); // clear token & take user to login again before token expired 1 day
        // console.log('subtract : ' , moment(_afterSubtract).format('YYYY MM DD'));
        // console.log('Is After: ', moment().isBefore(_toDay));
 
        return moment(_afterSubtract).isAfter(moment()); // true = not yet expire, false = expire

    }

    _logOutApi = () => {
        let API_URL = '/api/users/log-out';
        postApi(API_URL,
            JSON.stringify({
            })
        ).then((response) => {
            console.log('LogOut Api: ', response);
        });
    }

    _logOut = (that) => {

        if(!UserHelper._isLogIn())
            return;

        console.log('LOG OUT: ', that);

        // remove storage data
        StorageData._removeStorage('SignUpProcess'); 
        StorageData._removeStorage('TolenUserData'); 

        if(that){
            setTimeout(function() {
                that.props.authenticate(null);
            }, 0);
        }

        this._logOutApi();

        // check if user has login ask facebook acc log out
        if(UserHelper._chkFacebookAcc()){
            console.log('logout from facebook');
            LoginManager.logOut();
        }


        UserHelper.UserInfo = null; // assign null to user info obj. so it auto set autheticate data = null too

        // disconnet sendbird if user no longer to received message
        let sb = SendBird.getInstance();
        sb.disconnect(function(){
            // You are disconnected from SendBird.
            console.log('Send Bird Now Disconnected')
        });

    }

}

class StorageDataCls{

    _removeStorage = async (_keyVal) => {
        try {
            // console.log('loading ...');
            const value = await AsyncStorage.removeItem('@'+_keyVal+':key');  
            console.log('Success Remove AsyncStorage ('+ _keyVal +')',value);
            if (value !== null){

                return true;

            }
        } catch (error) {
            // Error retrieving data
            console.log(error);
        }
    }

    _loadInitialState = async (_keyVal) => {
        try {
            // console.log('loading ...');
            const value = await AsyncStorage.getItem('@'+_keyVal+':key');  
            // console.log('Get AsyncStorage : ',value);
            if (value !== null){

                // We have data!!
                // console.log(JSON.parse(value));

                // console.log(this.state.userData);

                return JSON.parse(value)
    
                

            }
        } catch (error) {
            // Error retrieving data
            console.log(error);
        }
    }


    _saveUserData = async (_keyVal, response) => {
        try {
            await AsyncStorage.setItem('@'+_keyVal+':key', JSON.stringify(response));
            // this._successLogin(this);
            return true;
        } catch (error) {
            // Error saving data        
            console.log(error);
        }
    }

}


// chat class
// chat helper with sendbird
class ChatCls{

    constructor(){
        this.UserChatPartners = [];
    }

	_createChannel(sb, _item, _channelURL = null, _callBack) {
        // console.log('userObj: ', _item, '_channelURL :', _channelURL)
        let userIds = [_item.id]; 

        console.log(' ID : ', userIds);
        // return;

        let _chkExistInChannel = _.head(this._checkExistUserInChennel(_item.id));

        console.log('_chkExistInChannel: ', _chkExistInChannel);
        
        if(!_.isEmpty(_chkExistInChannel)){

            // open channel that already existed
            sb.GroupChannel.getChannel(_chkExistInChannel.channelUrl, function (channel, error) {


                console.log('Open Channel 1-1 : ', channel); 

                if (error) {
                    console.log('User Not Found Or Has been delete from sendbird', error)
                    return;
                }


                // mark as read message to clear badge number of message list for partner that user selected
                // channel.markAsRead();

                // userChannel = channel;
                // _SELF._getPreviousMessage(channel);

                _callBack(channel);


            });
        }
        else{

            let name = _item.full_name;
            let _channelURL = '';
            let coverFile = _item.cover;
            let data = '{}';
            let customType = ''; 

            // For typical 1-to-1 chat which is unique between two users
            // if user already make channel it will return data as openChannel
            // open the new one
            sb.GroupChannel.createChannelWithUserIds(userIds, true, name, coverFile, data, customType, function (createdChannel, error) { 

            // open channel that already existed
            // sb.GroupChannel.getChannel(_channelURL, function (channel, error) {


                console.log('Create Channed 1-to-1 : ', createdChannel); 

                if (error) {
                    console.log('User Not Found Or Has been delete from sendbird', error)
                    return;
                }

                _callBack(createdChannel);

                // mark as read message to clear badge number of message list for partner that user selected
                // channel.markAsRead();

                // userChannel = channel;
                // _SELF._getPreviousMessage(channel);


            });

        }

	}


    _getUserPartnerProfile = (userId, channel) => {
        // if(userId)
        let _tmp = _.filter(channel.members, function(v,k){
            return v.userId != userId;
        })
        // console.log('user partner profile: ', _tmp);
        return _.head(_tmp);

    }

    // store all chat members to check we need to create new channel group or open channel it
    _storeAllChatMembers = (channelList) => {
        // console.log(' UserHelper.UserInfo',  UserHelper.UserInfo);
        // console.log('_storeAllChatMembers channelList',  channelList);
        let _tmpMembers = [];
        _.each(channelList, function(v,k){
            _.each(v.members, function(v_sub,k_sub){
                if(v_sub.userId != UserHelper.UserInfo._id){
                    _tmpMembers.push({
                        user_name: v_sub.nickname,
                        userId: v_sub.userId,
                        channelUrl: v.url
                    })
                }
            })
        })
        // console.log('_tmpMember: ', _tmpMembers);
        this.UserChatPartners = _tmpMembers;

    }

    _checkExistUserInChennel = (_userId) => {
        let _tmp = _.filter(this.UserChatPartners,function(v,k){
            return v.userId == _userId;
        })
        console.log('_checkExistUserInChennel: ', this.UserChatPartners);
        return _tmp.length>0 ? _tmp : [];
    }

    _getLastMessage = (lastMessage, isSendJob = false) =>{

        // console.log('Last message: ', lastMessage);

        if(!lastMessage)
            return 'No conversation yet.';

        if(lastMessage && lastMessage.messageType == 'file'){
            if(lastMessage._sender.userId == UserHelper.UserInfo._id)
                return 'you has sent an image';
            else
                return 'has sent you an image';
        }
        else{

            if(isSendJob){
                let _customDataMessage = lastMessage.message;
                try{
                    _customDataMessage = JSON.parse(lastMessage.data);
                }catch(e){
                    console.log('error get last message of send-job type',e);
                }

                return _customDataMessage.job.title;
            }
            else{
                return lastMessage.message;
            }
        }
    }

 
    _verifyUserInRoom = (_userChannel, _chatId) => {
        return _userChannel.memberMap[_chatId];
    }

    // getSendBirdInstance = () => {
    //     return SendBird.getInstance();
    // }

    // send bird login
	_sendBirdLogin = (_callBack = null) => {
        let sb = null;

        try{
            sb = SendBird.getInstance();
        }catch(e){
            console.log('Send Bird Get Instance : ',e);
        }
        // console.log('Instance SB :', _.cloneDeep(sb));
        try{
            if(sb && sb.currentUser){
                if(_callBack){
                    // console.log('SB :', _.cloneDeep(sb));
                    _callBack(sb);
                }
            }
            else{
                sb = new SendBird({ appId: SEND_BRID_APP_ID });
                // console.log('UserHelper.UserInfo._id', UserHelper.UserInfo._id);
                if(sb && sb.connect){
                    sb.connect(UserHelper.UserInfo._id, function (user, error) {
                        if (error) {
                            console.log(error);
                            return;
                        }

                        if (Helper._isIOS()) {
                            // console.log('sb.getPendingAPNSToken()', sb);
                            if (sb.getPendingAPNSToken()){
                                sb.registerAPNSPushTokenForCurrentUser(sb.getPendingAPNSToken(), function(result, error){
                                    // console.log("APNS TOKEN REGISTER AFTER LOGIN");
                                    // console.log(result);
                                });
                            }
                        } else {
                            if (sb.getPendingGCMToken()){
                                sb.registerGCMPushTokenForCurrentUser(sb.getPendingGCMToken(), function(result, error){
                                    // console.log("GCM TOKEN REGISTE_getCoverR AFTER LOGIN");
                                    // console.log(result);
                                });
                            }
                        }

                        try{
                            sb.updateCurrentUserInfo(UserHelper._getUserFullName(), UserHelper.UserInfo.cover ? UserHelper.UserInfo.cover.thumbnail_url_link : '', function(response, error) {

                                // console.log('Update Sendbird Info & Cover Picture : ', response);

                            });
                        }catch(e){
                            console.log('error update send profile');
                        }

                        if(_callBack){
                            _callBack(sb);
                        }

                    });
                }
            }
        }
        catch(e){
            console.log('error login-sendbird');
        }
	}

}

class HelperCls{

    constructor(){
        this.token = '';
        this.UserInfo = {};

    }

    // get cover profile with obj provide 
    _getCover = (_userProfile, _type = 'thumbnail_url_link') => {
        // console.log('User Profile: ', _userProfile);
        // console.log('Thumbnail URL: ', _userProfile.profile.photo.thumbnail_url_link);
        if(_userProfile.profile)
            return _userProfile.profile.photo ?  _userProfile.profile.photo[_type] : '';
        else
            return _userProfile.photo ?  _userProfile.photo[_type] : '';
    }   

    _getUserFullName = (_userProfile) => {
        // console.log('_userProfile :', _userProfile);
        if(_userProfile.profile)
            return _userProfile.profile.attributes.first_name ? _userProfile.profile.attributes.first_name.value + ' ' + _userProfile.profile.attributes.last_name.value : '';
        else if(_userProfile.owner_profile)
            return _userProfile.owner_profile.attributes.first_name.value + ' ' + _userProfile.owner_profile.attributes.last_name.value;
        else{
            if(_userProfile.first_name && _userProfile.last_name)
                return _userProfile.first_name.value + ' ' + _userProfile.last_name.value;
            else
                return '';
        }
            
    }

    _getGender = (_val) => {

        if(_.isEmpty(_val)) 
            return ''; 
        // console.log(genderOption);
        // let _tmp = _.find(genderOption, {'label' : _val});
        let _tmp = _.filter(genderOption, function(v,k){
            return v.label == _val;
        });
        // console.log(_.head(_tmp));
        return _.head(_tmp) ? _.head(_tmp).value : '';
    }

    _getGenderLabel = (_val) => {

        if(_.isEmpty(_val)) 
            return '';
        // console.log(genderOption);
        // let _tmp = _.find(genderOption, {'label' : _val});
        let _tmp = _.filter(genderOption, function(v,k){
            return v.value == _val;
        });
        // console.log(_.head(_tmp));
        return _.head(_tmp) ? _.head(_tmp).label : '';
    }

    _getGenderJob = (_val) => {
        if(_val == 'B')
            return 'Both';
        else if(_val == 'M')
            return 'Male';
        else if(_val == 'F')
            return 'Female';
        else
            return 'N/A';
    }

    _getAgeByYear=(_year)=>{
        today_date=new Date();
        today_year=today_date.getFullYear();
        return (today_year-_year).toString();
    }

    _getBirthDateByAge = (_age) => {

        today_date=new Date();
        today_year=today_date.getFullYear();
        return today_year-_age;

    }

    _getDeviceID() {
        let _deviceId = '';

        if (DeviceInfo.isEmulator())
            _deviceId =  this._isIOS() ? DEVICE_ID_IOS : DEVICE_ID;
        else
            _deviceId = DeviceInfo.getUniqueID() || (this._isIOS() ? DEVICE_ID_IOS : DEVICE_ID);

        console.log('_deviceId :', _deviceId, ' == ', DeviceInfo.isEmulator(), ' === ',DeviceInfo.getUniqueID());
        
        return _deviceId;
    }

    _getBirthDateFullByAge = (_age) => {

        today_date = this._getBirthDateByAge(_age);
        return today_date + '-01-01';

    }

    _isAndroid(){
        return Platform.OS == 'android';
    }

    _isIOS(){
        return Platform.OS == 'ios';        
    }

    // timesteam
    _getTimeFromNow = (_time) => {
        return moment(_time).fromNow();
    }

    _capitalizeText = (_txt) => {
        return _txt.charAt(0).toUpperCase() + _txt.slice(1);
    }

    _getFileExtenstion = (_str) => {
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(_str)[1]; 
        try{
            if(!ext)
                return '';
                
            ext = ext.toLocaleLowerCase();

            return ext == 'jpg' || ext == 'jpeg' || ext == 'png' ? true : false;
        }
        catch(e){
            return '';
        }
    }

    _isOtherUser = (user_profile_id) => {
        if(user_profile_id == UserHelper.UserInfo.profile._id)
            return true;

        return false;
    }

    _chkEmail = (_email) => {
        
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(_email);
    }

    _getFullVideoURL = (item, version="hls720p") =>{
        // return  item.local_url || item.s3_url + item.formatted_sd_video_url;

        let _urlName = item.formatted_video_version_url.replace('{{FILE_NAME}}',item.file_name)
        _urlName = _urlName.replace('{{VIDEO_VERSION}}',version)
        let _videoUri = item.local_url || item.s3_url + _urlName;
        console.log('_videoUri ', _videoUri);
        return _videoUri;
        // return  item.local_url || item.s3_url + _urlName;
    }

    _getVideoCover = (item) => {

        // fromVideoUpload
        let coverURL = '';

        try{
            if(item.localVideoThum)
                coverURL = item.localVideoThum;
            else
                coverURL = item.s3_url + item.formatted_video_thumbnail_url.replace('{{FILE_KEY}}',item.file_key);
        }catch(e){
            
        }
        // console.log('coverURL: ', coverURL);
        return coverURL;
    }

    // re-download & cache image again
    _bustImageCache = (_imageObj) => {
        const _imageType = ['small_url_link','thumbnail_url_link','preview_url_link','zoom_url_link','original_url_link'];
        try{
            _.each(_imageType,function(v,k){
                if(_imageObj[v]){
                    ImageCache.get().bust(_imageObj[v]);
                }
            })
        }catch(e){
            console.log('re-download image error (bust)', e);
        }
    }

    _consoleData(title){
        // return;
        // console.log('my arguments: ', arguments.length);
        let str = [].slice.apply(arguments);
        let itemsProcessed = 0;
        str.forEach(function(val){
            itemsProcessed++;
            console.log(val);
            if(itemsProcessed === str.length) {
                console.log('========================================== FINISH CONSOLE LOGS ==========================================')
            }
        });
    }

    _consoleStr(){
        // return;
        // console.log('my arguments: ', arguments.length);
        let str = [].slice.apply(arguments);
        console.log(str.toString().replace(/,/g, ' '));
    }

    _getSizeCrop = (imgData, isLandscape=false) => {
        
        if(imgData.width > 745 && imgData.height > 1330)
            return {width: 750, height: isLandscape ? 500 : 1334};
        else
            return {width: width, height: isLandscape ? 300 : height};
    }

    _isDEV = () => {
        return  ENV_STATUS == '_DEV'
    }
    
    _isPROD = () => {
        return  ENV_STATUS == '_PROD'        
    }

    _chkVideoExtension = (videoUrl) => {

        let _splitStr = (videoUrl.toLocaleLowerCase()).split('.');

        if(_splitStr.length>0){
            _splitStr = _splitStr[_splitStr.length -1];
        
            let _extension = [];

            if(this._isAndroid()){
                _extension = ['mp4'];
            }
            else{
                _extension = ['mp4','mov'];
            }
            console.log('_splitStr: ', _splitStr, ' == ', _extension);
            // else if(['cancel-job', 'remove-job', 'apply-job', 'apply-job'].indexOf(args.action) != -1){
            return _extension.indexOf(_splitStr) != -1;

        }

        return false;
    }

    _geParamsUrl = (name, url) => {
        
        if (!url) {
            return '';
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
        
    }

    formatVideoDuration = (_val) => {
        // let _val = _val.toFixed(2);
        //return  _val.toFixed(2).replace('.',':'); 
        return _val.toFixed(0);
    }

    getVideoLocalPath = (videoUri) => {
        // if(Helper._isIOS())
            // return 
    }

}

class NotificationCls{

    constructor(){
        
    }

    _registerDeviceToApi = (_pushToken) => {
        postApi('/api/devices',
            JSON.stringify({
                'push_token': _pushToken,
            })
        ).then((response) => {
            // console.log('response: ', response);
            if(response.status=="success"){
                // console.log('Response Object: ', response); 
                // console.info('Device Successfully Registered');
            }
            else{
                // console.info('Device Can Not Or Already Register');                
            }
        })
    }

}

class GoogleAnalyticsCls{

    constructor(){
        this.tracker =  new GoogleAnalyticsTracker(GoogleAnalyticsID, {});

        //Events, screen views, etc, are sent in batches to your tracker. 
        // This function allows you to configure how often (in seconds) the batches are sent to your tracker. 
        // Recommended to keep this around 20-120 seconds to preserve battery and network traffic. 
        // This is set to 20 seconds by default.
        GoogleAnalyticsSettings.setDispatchInterval(30);

        // console.log(' TRackker : ', this.tracker);
    }

    _trackScreenView = (_screenName) => {
        // let tracker1 =  new GoogleAnalyticsTracker(GoogleAnalyticsID);        
        this.tracker.trackScreenView(_screenName);
    }

    _trackEvent = (_eventName, _eventVal, _data = {}) => {
        this.tracker.trackEvent(_eventName,_eventVal,_data);        
    }

    _trackSocialInteraction = (_socialName, _action) => {
        this.tracker.trackSocialInteraction(_socialName,_action);        
    }

    _setUser = (_userID) => {
        this.tracker.setUser(_userID);        
    }

    _trackException = (type, isFatal=false) => {
        this.tracker.trackException(type, isFatal);   
    }

}

class SocketIOCls{
    
    constructor(){
        
    }

    _initSocketIO = () => {
        try{
            const socket = SocketIOClient(SOCKET_URL,{
                transports: ['websocket']
            });
            console.log('socket: ', socket);
            return socket;
        }catch(e){
            console.log('Socket Error: ', e);
            return null;
        }
    }

    _socketConnectInit = (_callBack) => {
        const socket = this._initSocketIO();

        socket.on('connect', () => {
            console.log('connected!');
        }).on('ready', (args) => {
            console.log('Ready: ', args);
        }).on('authorization', (ack) => {

            // console.log('authorization: ', ack);

            // acknowledgement to authorization with server side
            if(UserHelper.UserInfo){
                const dataAck = {
                    token: UserHelper.UserInfo.token,
                    sessionId: Helper._getDeviceID(),
                }
                console.log('Data Ack : ', dataAck);
                ack(dataAck);
            }

        }).on('receive', (args) => {

            console.log('receive: ', args);

            _callBack(args);

        });

    }

}

const UserHelper = new UserHelperCls();
const StorageData = new  StorageDataCls();
const Helper = new  HelperCls();
const ChatHelper = new  ChatCls();
const NotificationHelper = new  NotificationCls();
const GoogleAnalyticsHelper = new  GoogleAnalyticsCls();
const SocketIOHelper = new  SocketIOCls();

export { UserHelper, StorageData, Helper, ChatHelper, NotificationHelper, GoogleAnalyticsHelper, SocketIOHelper };
