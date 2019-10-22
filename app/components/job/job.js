import React, { Component} from 'react'
import { connect } from 'react-redux'

// import {
//     addNavigationHelpers
// } from 'react-navigation';

import * as BadgeNotification from '@actions/notification'

import AllJobPosted from '@components/job/talent-seeker/post-job-list' // for talent seeker (employer)
import AvailableJobApplied from '@navigators/tabs/job-tabs' // for talent (user)

import { StyleSheet, Text, View, AsyncStorage, Alert, TouchableOpacity, DeviceEventEmitter, BackAndroid } from 'react-native';

import Authenticate from '@components/authentication/authenticate';
import LoadingScreen from '@components/other/loading-screen'; 
import OneSignal from 'react-native-onesignal'; 

import { getApi } from '@api/request';  
import {notification_data} from '@api/response';
import { ChatHelper, UserHelper, StorageData, Helper, GoogleAnalyticsHelper, SocketIOHelper } from '@helper/helper';

import _ from 'lodash'
import { Colors } from '@themes/index';

import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';

import BoxWrap from '@styles/components/box-wrap.style';
import Tabs from '@styles/tab.style';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'

import AvailableJob from '@components/job/talent/available-job'
import AppliedJob from '@components/job/talent/applied-job'

// var ScrollableTabView = require('react-native-scrollable-tab-view'); 

import ScrollableTabView from 'react-native-scrollable-tab-view';
import CustomizeTabBar from '@components/ui/scroll-tab-view-custom-tab/customize-tab-item';
// import {notification_data} from '@api/response';

import Tab from '@components/tabs/tab'

// import ImagePicker from 'react-native-image-crop-picker';

const dismissKeyboard = require('dismissKeyboard');
// import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge'

// const tracker = new GoogleAnalyticsTracker('UA-105076489-1')

let sb = null;

let _SELF = null;

class JobRoot extends Component {

    constructor(props){
        super(props);
        // console.log('=== create job start ===');
        //your codes ....
        this.state = {  
            selectedTab: 0,
            initPage: 0,
            userId: UserHelper.UserInfo._id,
        }
        // UserHelper.hideJobFilter = true;
    }

    static navigationOptions = ({ navigation }) => {
        // console.log('navigation : ', navigation);
        _SELF = navigation;
        // console.log('_SELF NAV: ',_SELF);
        return ({

            // headerVisible: true,
            // tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="job-icon" badgeNumber={typeof navigation.state.params === 'undefined' ? 0 : navigation.state.params.badgeCount} />),
            headerTitle: UserHelper._isEmployer() ? 'Posted Jobs' : 'Jobs',
            headerLeft: (<ButtonLeft
                icon="invite-icon"
                navigate={navigation.navigate}
                to="InviteFriend"
            />),
            headerRight: UserHelper._isEmployer() ? (
                
                <View style={[styles.flexVerMenu, styles.flexCenter]}>

                    <ButtonRight
                        icon="plus-black-icon"
                        style={{marginRight: 10}}   
                        navigate={navigation.navigate}
                        to="CreatePostJob"
                    />

                </View>
            ) : ( navigation.state.hasOwnProperty('params') ? 
                ( navigation.state.params.hasOwnProperty('hideFilter') &&  navigation.state.params.hideFilter ? null : 

                    <View style={[styles.flexVerMenu, styles.flexCenter]}>
                        <ButtonRight
                            icon={ navigation.state.hasOwnProperty('params') ? (navigation.state.hasOwnProperty('filtered') ? 'filter-active-icon' : 'filter-icon') : "filter-icon"}
                            style={{marginRight: 10}}   
                            navigate={navigation.navigate}
                            isFilter={true}
                            filterType={'job'}
                            to="Filters" 
                        />
                    </View>) : 
                    
                    <View style={[styles.flexVerMenu, styles.flexCenter]}>
                        <ButtonRight
                            icon={ navigation.state.hasOwnProperty('params') ? (navigation.state.hasOwnProperty('filtered') ? 'filter-active-icon' : 'filter-icon') : "filter-icon"}
                            style={{marginRight: 10}}   
                            navigate={navigation.navigate}
                            isFilter={true}
                            filterType={'job'}
                            to="Filters" 
                        />
                    </View>
                    
                     ),
        })};


    // on first load app get all photo & save with storage
    // photo will update next time user edit cover or add more photo
    _getAndUpdatePhoto = () => {

        let _SELF = this;

        let API_URL = '/api/media?type=photo';
        console.log(API_URL);

        let _userObj = _.cloneDeep(UserHelper.UserInfo);

        getApi(API_URL).then((_response) => {
            console.log('Get All Photo : ', _response);
            if(_response.code == 200){
                let _allImg = _response.result;

                const _cover = _.filter(_allImg, function(v,k){
                    return v.is_featured;
                });
                console.log('Cover Only: ',_cover);
                let userInfoWithPhoto = _.extend({
                    cover: _.head(_cover),
                    photos: _allImg,
                },_userObj)

                _SELF.setState({
                    reloadHeader: true,
                })

                let _userData =  StorageData._saveUserData('TolenUserData',JSON.stringify(userInfoWithPhoto)); 
                UserHelper.UserInfo = userInfoWithPhoto; // assign for tmp user obj for helper
                // _userData.then(function(result){
                //     console.log('complete final save sign up'); 
                // });

                console.log('Photo & Cover: ', userInfoWithPhoto);
            }

        });
    }

    updateAppOption = () =>{
        let _updateAppOption =  StorageData._saveUserData('IntroScreenVisited',JSON.stringify({
            isReadTutorialScreen: true
        })); 

        _updateAppOption.then(function(result){

            console.log('complete login : ', result);

        });
    }

    componentDidMount() {

        let that = this;
        
        this.props.setNotification({
            job: 0,
            discover: 0,
            chat: 0,
            noti: 0
        });

        console.log('JOB MAIN PROPS: ', this.props);

        let _SELF = this;
        
        // this.props.navigation.setParams({
        //     badgeCount: 0
        // })

        // console.log('ImagePicker : ', ImagePicker);

        // setTimeout(function() {
        //     _SELF.props.navigation.setParams({
        //         badgeCount: 20
        //     })
        // }, 4000);

        // track screen
        GoogleAnalyticsHelper._trackScreenView('Job');


        // update app option 
        this.updateAppOption();

        SocketIOHelper._socketConnectInit(function(args){
            
            // return;
            
            console.log('args : ', args);

            let _notiOption = {
                job: that.props.notification.job,
                discover: that.props.notification.discover,
                chat: that.props.notification.chat,
                noti: that.props.notification.noti
            }
            
            console.log('that.props.notification :', that.props.notification);

            if(args.action == 'new-job'){
                _notiOption.job++;
            }
            else if(args.action == 'new-user'){
                _notiOption.discover++;
            }
            else if(args.action == 'send-text'){
                _notiOption.chat++;
            }
            // 'remove-job',
            else if(['cancel-job', 'apply-job', 'shortlist-job'].indexOf(args.action) != -1){
                _notiOption.noti++;
            }

            console.log('_notiOption :', _notiOption);
            
            that.props.setNotification(_notiOption);

        });

        // get unread noti
        this._getUnreadNotification();

        ChatHelper._sendBirdLogin(function(_sb){
            
            if(!_sb){
                console.log('cannot login to send bird')
                return;
            }

            // console.log('_sb : ', _sb);

            sb = _sb;

            _SELF._getUnreadMessage();

        })

        
        // tracker.trackScreenView('Job')
        // get first photo
        if(!UserHelper.UserInfo.cover)
            this._getAndUpdatePhoto();

        // When the app not in background (cleared) and start by click notitication
        if(notification_data.length > 0){
            // console.log('This is notification: ', notification_data);
            this.triggerNotificationDetail();
        }
    }


    // get un read notification to show dot below icon tab
    _getUnreadNotification = () =>{
        let _SELF = this;
        let API_URL = '/api/notifications/unseen/count';

        getApi(API_URL).then((_response) => {

            console.log('All Notification : ', _response);

            if(_response.code == 200){
                let _result = _response.result;
                // _result = 2;
                if(_result>0){

                    let _notiOption = {
                        job: _SELF.props.notification.job,
                        discover: _SELF.props.notification.discover,
                        chat: _SELF.props.notification.chat,
                        noti: _result
                    }

                    _SELF.props.setNotification(_notiOption);
            
                }
                console.log('Noti Result: ', _result);

            }

        });
    }

    // get un read message to show dot below icon tab
    _getUnreadMessage = () => {
        // query all user group-channel relate with user login in tolentora with id
    
        // console.log('Get All User Chat With Now');
        let _SELF = this;
        
        try{

            let totalCount = 0;

            // channel handler 
            var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
            var userIds = [];
            channelListQuery.includeEmpty = false; // true will get all channel that create with no message chat (just create group but never chat together)
            channelListQuery.limit = 100; // pagination limit could be set up to 100
            userIds.push(this.state.userId);
            // userIds.push("Jay");

            channelListQuery.userIdsFilter = userIds;

            if (channelListQuery.hasNext) {
                channelListQuery.next(function(channelList, error){
                    if (error) {
                        console.log(error);
                        return;
                    }

                    // returns channelA only.
                    // console.log('All Channel List : ', channelList); 

                    _.each(channelList, function(v,k){
                        if (v.memberCount == 2)
                            totalCount = totalCount + v.unreadMessageCount;
                    })

                    // console.log('totalCount :', totalCount);

                    let _notiOption = {
                        job: _SELF.props.notification.job,
                        discover: _SELF.props.notification.discover,
                        chat: totalCount,
                        noti: _SELF.props.notification.noti
                    }
                    
                    _SELF.props.setNotification(_notiOption);

                });
            }

        }catch(e){
            console.log('unmount chat list error :', e);
        }
    
    }

    componentWillMount() {
        let that = this;
        DeviceEventEmitter.addListener('clearBadgeNumber', (data) => {

            // that.props.navigation.setParams({
            //     badgeCount: 0
            // })

            // console.log('Tap Type: ', data);

            let _notiOption = {
                job: this.props.notification.job,
                discover: this.props.notification.discover,
                chat: this.props.notification.chat,
                noti: this.props.notification.noti
            }
            
            if(data.tabType == 'JobList'){
                _notiOption.job = 0;
            }
            else if(data.tabType == 'Discovery'){
                _notiOption.discover = 0;
            }
            else if(data.tabType == 'MessageList'){
                _notiOption.chat = 0;
            }
            else if(data.tabType == 'Notification'){
                _notiOption.noti = 0;
            }

            // console.log('_notiOption :', _notiOption);

            this.props.setNotification(_notiOption);

        })

        DeviceEventEmitter.addListener('OpenNotificationDetail', (data) => {
            that.triggerNotificationDetail();
        })

    }

    triggerNotificationDetail = (notif_data) => {
        if(notification_data.length > 0){
            console.log('Notification Data: ', notification_data);
            
            let REQ_API;
            switch (notification_data[0].type){
               
                case 'apply-job':
                    // console.log('request job detail and link to job detail (seeker)');
                    REQ_API = '/api/posts/' + notification_data[0].data.id;
                    getApi(REQ_API).then((_response) => {
                        if(_response.code == 200){
                            notification_data.splice(0,1);
                            const { navigate, goBack } = this.props.navigation;
                            navigate('ViewPostJob', {job: _response.result});
                        }
                    });
                    break;
                
                case 'send-text':
                    // console.log('Direct to message detail');
                    let data = notification_data[0].data;
                    REQ_API = '/api/contacts/' + data.chat_id + '?type=user&attributes=1&public=1';
                    getApi(REQ_API).then((response) => {
                        // console.log('USER PROFILE: ', response);
                        if(response.code == 200){
                            notification_data.splice(0,1);
                            const { navigate, goBack, state } = this.props.navigation;
                            navigate('Message', { message_data: data,
                                direct_chat: true,
                                user_info: response.result
                            });
                        }
                    });
                    break;
                
                case 'shortlist-job':
                    // console.log('Go to the job detail (talent)');
                    // Populate userActiveRoles.
                    REQ_API = '/api/jobs/' + notification_data[0].data.id;
                    getApi(REQ_API).then((_response) => {
                        // console.log('Response Job: ', _response)
                        if(_response.code == 200){
                            notification_data.splice(0,1);
                            const { navigate, goBack } = this.props.navigation;
                            navigate('JobDetail', { job: _response.result, view_only: true, can_remove: false });
                        }
                    });
                    break;

                case 'cancel-job':
                    // console.log('');
                    REQ_API = '/api/jobs/' + notification_data[0].data.id;
                    getApi(REQ_API).then((_response) => {
                        // console.log('Response Job: ', _response)
                        if(_response.code == 200){
                            notification_data.splice(0,1);
                            const { navigate, goBack } = this.props.navigation;
                            navigate('JobDetail', { job: _response.result, view_only: true, can_remove: false });
                        }
                    });
                    break;
            }
        }
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('clearBadgeNumber');
        DeviceEventEmitter.removeListener('OpenNotificationDetail');
    }

    onTabPress = (_tabIndex) => {
        this.setState({
            selectedTab: _tabIndex,
        })
        // console.log('hideJobFilter: ',_tabIndex);
    }

    _triggerSelectedTab = (_tabIndex) => {
        this.refs.scrollableTabView.goToPage(_tabIndex);
        
        // this.setState({
        //     initPage: _tabIndex
        // })
        // console.log('_tabIndex: ', _tabIndex);
    }

    onChangeTab = (_tab) => {
        // console.log(_tab)
        dismissKeyboard();

        if(_tab.i == 1){
            _tab.ref.props.navigation.setParams({
                hideFilter: true
            })
        }
        else{
            _tab.ref.props.navigation.setParams({
                hideFilter: false
            })
        }

        // setTimeout(function() {
        //     console.log('SELF', _SELF);
        // }, 2000);
    }

    goToJobDetail = () => {  
        /* 
        console.log('Notification Data: ', notification_data);
        // console.log('Notification Data: ', notification_data[0].data.id);

        let API_URL = '/api/posts/' + notification_data[0].data.id;
        // console.log(API_URL);
        getApi(API_URL).then((_response) => {
            console.log('GET JOB BY ID : ', _response);
            if(_response.code == 200){
                const { navigate, goBack } = this.props.navigation;
                // navigate('ViewPostJob', {job: _job_info});
                navigate('ViewPostJob', {job: _response.result});
            }
        });
        */
    }

    render() {
        // console.log(this.props.user, this.state.userData);
        if (UserHelper._isEmployer())
            return(<AllJobPosted navigation={_SELF} />)
        else
            return (
                <View style={[ styles.justFlexContainer, styles.mainScreenBg ]}>
                    <ScrollableTabView
                        style={[{marginTop: 0}]}  
                        //renderTabBar={() => <ScrollableTabBar tabsContainerStyle={[ styles.tabItem, {padding: 0}, styles.tabsContainer ]} tabStyle={[styles.scrollableTabBar]} style={[{ borderColor: Colors.lineColor } ]} />} 
                        //tabBarUnderlineStyle={[{ backgroundColor: Colors.primaryColor,height:2 }, styles.tabBarUnderline]}                    
                        renderTabBar={() => <CustomizeTabBar containerWidth={300} style={[{ borderColor: Colors.componentBackgroundColor } ]} />} 
                        tabBarUnderlineStyle={[{ backgroundColor: Colors.primaryColor,height:2 }]}
                        tabBarBackgroundColor='white'
                        tabBarPosition='overlayTop'
                        tabBarActiveTextColor={ Colors.primaryColor }
                        tabBarInactiveTextColor={ Colors.textBlack }
                        scrollWithoutAnimation={false}
                        tabBarTextStyle={{fontSize: 16}} 
                        onChangeTab={this.onChangeTab}
                        prerenderingSiblingsNumber={1} // load content in all tav
                        ref={'scrollableTabView'}
                        locked={ Helper._isIOS() ? false : true }
                    >
                        <AvailableJob  tabLabel='Available' navigation={_SELF}/>
                        <AppliedJob triggerTab={this._triggerSelectedTab} tabLabel='Applied' navigation={_SELF}/>
                    </ScrollableTabView>
                </View>
            
            );
        
    }
}

function mapStateToProps(state) {
    // console.log('main state',state);
    return {
        notification: state.notification,
        // navigation: state.navigation,
        // nav: state.navigation
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...Tabs, ...BoxWrap,
    boxWithShadow: {  

    },
    tabItem: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    tabsContainer:{
        justifyContent: 'center'
    },
    scrollableTabBar: {
        width: 120,
        height: 64,
        marginLeft: 20,
        marginRight: 20,
        paddingBottom: 10 
        // paddingTop: 20
    },
    tabBarUnderline: {
        //  height: 4,
        //  bottom: 5,
        //  borderRadius: 5,
         marginLeft: 50,
         width: 60,
        //  backgroundColor: '#57a8f5'
    },
})

export default connect(mapStateToProps, BadgeNotification)(JobRoot)
