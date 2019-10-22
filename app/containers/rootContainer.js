import React, { Component} from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'
import * as AppOption from '@actions/app-option'
import RootNavigator from '@navigators/root'
import RootAuthNavigator from '@navigators/auth-root'
import { StyleSheet, Text, View, AsyncStorage, Alert, DeviceEventEmitter, Linking } from 'react-native';

import Authenticate from '@components/authentication/authenticate';
import LoadingScreen from '@components/other/loading-screen'; 
import OneSignal from 'react-native-onesignal'; 
import Introduce from '@components/signup/introduce'

import { UserHelper, StorageData, NotificationHelper, ChatHelper, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import { getApi } from '@api/request';
import {notification_data} from '@api/response';
import DeviceInfo from 'react-native-device-info'
import _ from 'lodash'


import ImagePickerCrop from 'react-native-image-crop-picker';

const FBSDK = require('react-native-fbsdk');
const { LoginButton, AccessToken, LoginManager } = FBSDK;

// ignore some warning yellow box you want
console.ignoredYellowBox = ['Remote debugger','source.uri', 'Can only update a mounted', 'Task orphaned for request'];  
// console.disableYellowBox = true;

// Trigger if the app mount more than once when click android back button, and start app again.
let count = 0;

class Root extends Component {

    constructor(props){
        super(props);
        //your codes ....

        this.state = {  
            userData: null,
            isLoading: true,
            deviceId: null,
            isVisitedTutorialScreen: false,
        }

        this.onIds = this.onIds.bind(this);
        // console.log('Main Props: ', this.props);
        console.log = () => {};
        // console.log('Main Props: ', this.props);
    }

    // For Notification (OneSignal)
    componentWillMount() {
        // count ++;
        // console.log('Panhna Seng ====================== Will Mount', count);
        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('registered', this.onRegistered);
        OneSignal.addEventListener('ids', this.onIds);
    }
 
    
    componentWillUnmount() {
        // console.log('Panhna Seng ====================== Will UnMount', count);
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('registered', this.onRegistered);
        OneSignal.removeEventListener('ids', this.onIds);
    }
    
    onReceived(notification) {
        console.log('======================== RECEIVED NOTIFICATION ========================');
        console.log("Notification received: ", notification);
    }

    onOpened(openResult) {
        console.log('======================== OPEN NOTIFICATION ========================');
        // console.log('Message: ', openResult.notification.payload.body);
        // console.log('Data: ', openResult.notification.payload.additionalData);
        // console.log('isActive: ', openResult.notification.isAppInFocus);
        console.log('openResult: ', openResult);

        // if(openResult.notification.isAppInFocus){
        //     console.log('do nothing');
        //     return;
        // } 
        
        // if(openResult.notification.payload.additionalData.action == 'apply-job'){
        //     let obj = {
        //         'type': 'apply-job',
        //         'data': openResult.notification.payload.additionalData
        //     }
        //     notification_data.push(obj);
        //     console.log('Go to view post job with data.', notification_data);
        // }

        let obj = {
            'type': openResult.notification.payload.additionalData.action,
            'data': openResult.notification.payload.additionalData
        }
        notification_data.push(obj);
        
        // Once the app is not in background (cleared) the event not worked because the app is started, the rootContainer worked befored emit function.
        DeviceEventEmitter.emit('OpenNotificationDetail', {'notificationData': 'any-data'});
    }

    onRegistered(notifData) {
        console.log("Device had been registered for push notifications!", notifData);
    }

    onIds(device) {
		// console.log('Device info: ', device);
        // if(UserHelper._isLogIn()){
            if(device.userId){
                // NotificationHelper._registerDeviceToApi(device.userId)
                this.setState({
                    deviceId: device.userId
                }, function(){
                    // console.log('Device ID: ', device.userId);
                })
            }
        // }
        // else{

        // }
    }

    // register device for push notification to api 
    _registerDeviceToApi = () => {
        if(UserHelper._isLogIn()){
            if(this.state.deviceId){
                NotificationHelper._registerDeviceToApi(this.state.deviceId)
            }
        }
    }


    // login or register sendbird
    _sendBirdLoginRegister = () => {
        // check user login
        // try to login sendbird to store instand sendbird 
        // to make message process faster when click
        if(UserHelper._isLogIn()){
            console.log('starting login or register send bird'); 
            ChatHelper._sendBirdLogin(function(_sb){
                console.log('Send Bird Login or Register');
            })
            getApi('/api/devices/version').then((result) => {

                if(Helper._isDEV()) return;

                if(result.code == 200 && result.result){

                    if(Helper._isIOS()?result.result.ios_version > DeviceInfo.getVersion():result.result.android_version > DeviceInfo.getBuildNumber()){
                        Alert.alert('Update Available','A new update of Talentora is available. Please update to the lastest version.',
                        [{
                            text: 'Next time',
                        },{
                            text:'Update', 
                            onPress:() => {
                                let url = 'https://play.google.com/store/apps/details?id=co.talentora.app'
                                if(Helper._isIOS()){
                                    url = 'https://itunes.apple.com/app/talentora/id1164383007'
                                }
                                Linking.openURL(url)
                        }}]);
                    }

                } 
            });
        }
    }

    // for testing 
    // no use for prod
    // _removeStorage = () => {
    //     StorageData._removeStorage('TolenUserData');
    // } 

    _loadInitialState = () => {
        // StorageData._removeStorage('IntroScreenVisited');
        let that = this;
        let _userData =  StorageData._loadInitialState('TolenUserData');

        // let _chkIntroScreen =  StorageData._loadInitialState('IntroScreenVisited'); 
         
        // _chkIntroScreen.then(function(result){
        //     console.log('_chkIntroScreen', result);

        //     if(result){
        //         that.setState({
        //             isVisitedTutorialScreen: true
        //         })
        //     }

        // });

        _userData.then(function(result){ 

            // console.log('result', result);

            // if has user login data
            if(!_.isEmpty(result)){
                UserHelper.UserInfo = JSON.parse(result);

                // console.log('lol : ',UserHelper.UserInfo);

                // delay 500ms to show loading screen
                setTimeout(function() {
                    // check expire user token
                    if(UserHelper._checkUserExpiredToken()){ // true = not expire, false expired
                        console.log('======== User Login ========');
                        that.props.authenticate(that);
                    }
                    else{
                        console.log('========= User Expired Delete Data ========');
                        if(UserHelper._chkFacebookAcc()){
                            LoginManager.logOut();
                        }

                        // remove storage data
                        StorageData._removeStorage('TolenUserData'); 
                        UserHelper.UserInfo = null; // assign null to user info obj. so it auto set autheticate data = null too
                        that.props.authenticate(that);
                    }


                }, 0); 
                
            }
            else{
                that.setState({  
                    isLoading: false,
                })
            }

            // console.log(that.props);
        });
        // console.log(that.props);
    }

    // test load signup process
    _loadInitialStateSignUpProcess = () => {
        let that = this;
        let _userData =  StorageData._loadInitialState('SignUpProcess');
        _userData.then(function(result){ 
            // console.log('SignUpProcess :', result);
        });
    }

    componentDidMount() {
        this._loadInitialState();  
        // this._loadInitialStateSignUpProcess();  

        // Calling clearOneSignalNotifications
        if(Helper._isAndroid())
            OneSignal.clearOneSignalNotifications();
            
    }

    // when state change we try to paused the video that playing by event emitter
    checkToPausedVideo = (prevState, currentState) => {
        try{
            console.log('PrevState: ', prevState, ' === ', 'CurrentState: ', currentState);
            const _prevState = _.head(prevState.routes);
            
            const _prevStateSelected = _prevState.routes[_prevState.index];
            console.log('Route Name: ', _prevStateSelected.routeName);

            const _subPrevState = _prevStateSelected.routes[_prevStateSelected.index];
            console.log('Sub Route Name: ', _subPrevState.routeName);

            if(_subPrevState.routeName == 'Discovery'){
                DeviceEventEmitter.emit('PausedAllVideos', {});
            }

            if(_subPrevState.routeName == 'Profile'){
                DeviceEventEmitter.emit('PausedAllVideosProfile', {});
            }

            else if( _subPrevState.routeName == 'EditProfile'){
                DeviceEventEmitter.emit('PausedAllVideosSetting', {});                    
            }

        }catch(e){
            console.log('Error Check To Paused Video: ', e);
        }

    }

    render() {
        // console.log(this.props.user, this.state.userData);
        // show login form on first load
        // console.log(this.props);
        console.log('this.props.appOption', this.props);  
        if(this.state.isLoading){
            return (
                <LoadingScreen/>
            ) 
        }
        else{
            if (this.props.user){

                // after user login or complete signup 
                // need register new device with user id
                this._registerDeviceToApi();

                ImagePickerCrop.clean().then(() => {
                    console.log('removed all tmp images from tmp directory');
                }).catch(e => {
                    console.log('cannot removed all tmp images from tmp directory');
                });

                // register user in google analytic
                if(this.props.user._id){
                    // console.log('user id : ',this.props.user._id);
                    GoogleAnalyticsHelper._setUser(this.props.user._id);        
                }
                

                // login or register send bird user
                this._sendBirdLoginRegister();


                return (<RootNavigator onNavigationStateChange={(prevState, currentState) => {
                    
                                            // uncomment to enable paused video after state change
                                            {/* this.checkToPausedVideo(prevState, currentState); */}
                    
                                        }} />)   // onNavigationStateChange={null} no console navigation change

                
                // if(!this.props.appOption && !this.state.isVisitedTutorialScreen)

                //     return (<Introduce onNavigationStateChange={(prevState, currentState) => {

                //         // uncomment to enable paused video after state change
                //         {/* this.checkToPausedVideo(prevState, currentState); */}

                //     }} />)   // onNavigationStateChange={null} no console navigation change

                // else

                //     return (<RootNavigator onNavigationStateChange={(prevState, currentState) => {

                //         // uncomment to enable paused video after state change
                //         {/* this.checkToPausedVideo(prevState, currentState); */}

                //     }} />)   // onNavigationStateChange={null} no console navigation change

            }
            else

                return (
                    
                    <RootAuthNavigator onNavigationStateChange={null} /> // onNavigationStateChange={null} no console navigation change
                    
                );
        }
        
    }
}

function mapStateToProps(state) {
    // console.log('root state: ',state);
    return {
        appOption: state.app_option,
        user: state.user,
        navigation: state.navigation,
    }
}

export default connect(mapStateToProps, AuthActions)(Root)
