import React from 'react';
import { StyleSheet, Text, View, RefreshControl, TextInput, ListView, TouchableOpacity, Alert, StatusBar, Platform, AppState, DeviceEventEmitter, ActionSheetIOS } from 'react-native';
import { Colors } from '@themes/index';

import { connect } from 'react-redux' 
import * as MessageActions from '@actions/message'
import * as BadgeNotification from '@actions/notification'

import MessageRowItem from '@components/message/comp/message-row-item';
import Utilities from '@styles/extends/ultilities.style';

import SendBird from 'sendbird'; 
import _ from 'lodash'
import uuid from 'react-native-uuid';
import IconMeterial from 'react-native-vector-icons/MaterialIcons';

import { UserHelper, StorageData, Helper, ChatHelper, GoogleAnalyticsHelper } from '@helper/helper';

import SearchBox from '@components/ui/search'
import { getApi, postApi } from '@api/request';


import MessageDataMockUpLoading from '@components/other/message-data-mock-up-loading'  
import ModalCustomHeader from '@components/header/modal-custom-header';

import Tab from '@components/tabs/tab'

// import Notifications from 'react-native-push-notification';


// import { GiftedChat } from 'react-native-gifted-chat';


// import Chat from '@components/message/chat/chat' 


function mapStateToProps(state) {
    // console.log(state)
    return {
        notification: state.notification,        
        // messageObj: state.message,
        // user: state.user
        // navigation: state.navigation
    }
}


let sb = null;
let userChannel = null;
let _uuidChannelHandle = 'MessageList';

let _THAT = null;

var BUTTONS = [
    'Send Now',
    'Cancel',
  ];
  var DESTRUCTIVE_INDEX = 0;
  var CANCEL_INDEX = 1;

class MessageList extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            loading: false,
            refreshing: false,
            extraData: [{_id : 1}],
            isFocused: false,
            isFirstLoad: false,
			// userId: '5904393039e84e228c60598c',
			// userName: 'Nuon Promsopheak',
			userId: UserHelper.UserInfo._id,
            userName: UserHelper._getUserFullName(),
            searchText: '',
            options: {
                isLoadingTail: false,
                isShowReviewApp : false,
                applicationCount : 0,
                dataSource: ds.cloneWithRows([]),
                dataSourceCount: 0,
                allChannelData: []
            }
        }

        // const { navigate, goBack, state } = this.props.navigation;
        // console.log('this.props.navigation : ', this.props.navigation);
        // console.log('GLOBAL OBJ: ',this.props);
    }

    static navigationOptions = ({ navigation }) => {
        // console.log('This Props: ', navigation);
        // if(_THAT){
        //     _THAT._getAllUserChatWith();
        // }



        let _navOptions ={
            headerTitle: 'Chat',
        };

        if(typeof navigation.state.params !== 'undefined'){
            if(typeof navigation.state.params.shareJob !== 'undefined'){
                _navOptions = {
                    header: () =>  <ModalCustomHeader {...navigation} self={_THAT} title={'Share job with your friends'} noLeftBtn={true} />
                }
            }
        }

        return (_navOptions)

    };

    _isSendJob = () => {
        const { navigate, goBack, state } = this.props.navigation;
        let _sendJob = false;
        if(typeof state.params !== 'undefined'){
            if(typeof state.params.shareJob !== 'undefined'){
                console.log('send job info : ', state.params.shareJob);
                _sendJob = true
            }
        }
        return _sendJob;
    }

    _updateStatusSelectedItem = (itemSelected) => {
        let _stateData = _.cloneDeep(this.state.options);

        _.each(_stateData.allChannelData,function(v,k){
            if(itemSelected.chat_id == v.chat_id){
                v.selected = !v.selected;
                v.isSendJob = true;
            }
        });

        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        
        _stateData.dataSource = ds.cloneWithRows(_stateData.allChannelData);

        this.setState({
            options: _stateData,
        }, function(){
            console.log('State after update : ',this.state);
        });
    }

    _sendJobInChat = (itemSelected) => {

        let _itemSelected = _.filter(this.state.options.allChannelData, function(v,k){
            return v.selected;
        })

        console.log('_itemSelected: ', _itemSelected);

        // return;

        const _SELF = this;
        const { navigate, goBack, state } = this.props.navigation;

        if(_itemSelected.length>0){

            let _data = {
                job: state.params.shareJobInfo
            }
            let customType = 'send-job';

            _.each(_itemSelected, function(v_user_selected,k){


                ChatHelper._createChannel(sb, {id: v_user_selected.chat_id}, null, function(_channel){
                    
                    // console.log('send job in chat channel : ', _channel)
                    // _SELF.getChannelInfo(_channel.url);
        
                    // return;
        
                    console.log('data: ', _data);
                    // return;
        
                    _channel.sendUserMessage('', JSON.stringify(_data), customType, function (message, error) {
                        if (error) {
                            console.log(error);
                            return;
                        }
        
                        const _message = {
                        
                            message: state.params.shareJobInfo.title,
                            messageType: 'send-job',
                            chat_id: v_user_selected.chat_id,
                            channelUrl: v_user_selected.channelUrl,
                    
                        };
        
                        console.log('Message Obj Notify : ', _message);
        
                        // get meta data for detech both user online + stay on chat room or not
                        // if online + stay on chat room both user no need to send notification. coz user already  saw the message
                        _channel.getMetaData(['chat_members'], function(response, error){
                            if (error) {
                                console.log(error);
                                return;
                            }
        
                            let _metaData = response;
                            if(_metaData.chat_members){
                                let _objMembers = JSON.parse(_metaData.chat_members);
                                let _chkEnablePush = false;
        
                                _.each(_objMembers, function(v,k){
                                    if(!v.isOnScreen)
                                        _chkEnablePush = true;
                                })
                                // console.log('_check Online: ', _chkEnablePush);
                                if(_chkEnablePush)
                                    _SELF._notifyToUser(_message); // send notification to user			
                            }
                            else{
                                _SELF._notifyToUser(_message); // send notification to user
                            }


                            if(k == _itemSelected.length-1){
                                goBack();
                            }
                            

                        });
        
        
                    });
        
                })


            })
        }


    }

	// this function not 
	// coz every message will add to notification item list (notification tab)
	_notifyToUser = (_messsage) => {
		// console.log('_notifyToUser :', _messsage);
		// return;
		const { navigate, goBack, state } = this.props.navigation;
		let _data = {
			text: _messsage.message, 
			action: _messsage.messageType  == 'file' ? 'send-photo' : 'send-text', //'send-text' or 'send-photo',
			user: _messsage.chat_id,
			name: UserHelper.UserInfo.profile.attributes.first_name.value + ' ' + UserHelper.UserInfo.profile.attributes.last_name.value, 
			channel_url: _messsage.channelUrl, 
			chat_id: UserHelper.UserInfo._id
		}
		console.log('_data: ', _data);
		// return;
		let API_URL = '/api/notifications/customs';
		postApi(API_URL,
			JSON.stringify(_data)
		).then((response) => {

			console.log('Response Save Job: ', response);

			if(response.code== 200){
				console.log('Message Notification Send.');
			}
			else{
				console.log('Message Notification Send Error');
			}

		});
	}

    sendJobNow = () => {
        let _SELF = this;
        // console.log('Helper._isIOS() :', Helper._isIOS());
        if(Helper._isIOS()){
            // popup message from bottom with ios native component
            ActionSheetIOS.showActionSheetWithOptions({

                message: 'You want to send now?',
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,

            },
            (buttonIndex) => {

                // console.log(buttonIndex);
                //   this.setState({ clicked: BUTTONS[buttonIndex] });
                if(buttonIndex==0){
                    _SELF._sendJobInChat()
                }

            });
        }
        else{

            // for android ask with alert message with button

            // Works on both iOS and Android
            Alert.alert(
            'You want to send now?',
            '', 
            [
                // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Send Now', onPress: () =>  _SELF._sendJobInChat() },
            ],
            { cancelable: false }
            )
        }
    }

    // go to message detail page
    _goToMessageDetail = (itemSelected) => {
        console.log('itemSelected: ', itemSelected);
        // const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'MessageList'}], key: null })
        // this.props.navigation.dispatch(resetAction);
 
        if(this._isSendJob()){
            // console.log('itemSelected: ', itemSelected);
            // this._sendJobInChat(itemSelected);
            // console.log('allChannelData: ',this.state.options.allChannelData);
            this._updateStatusSelectedItem(itemSelected);
            // return;
        }
        else{

            // clear bagde number & after go to detail message it will clear unreadmessage with sendbird api
            this._updateChannel({url: itemSelected.channelUrl},itemSelected, true);
            
            GoogleAnalyticsHelper._trackEvent('Chat', 'Chat Button Click From Chat', {
                user_id: itemSelected.chat_id,
                full_name: itemSelected.full_name
            });  

            // this.props.message(itemSelected); 
            
            console.log('item selected: ', itemSelected);

            // check to clear dot below icon tab
            if(itemSelected.unreadMessageCount>0){
                let _notiOption = {
                    job: this.props.notification.job,
                    discover: this.props.notification.discover,
                    chat: this.props.notification.chat > 0 ? this.props.notification.chat - itemSelected.unreadMessageCount : 0,
                    noti: this.props.notification.noti
                }
                this.props.setNotification(_notiOption);
            }
            

            // console.log('chat_ obj : ',this.props.chat_obj); 
            // let _that = this;
            // setTimeout(function() {
            //     console.log('prods message :', _that.props);
            // }, 1000);

            let url = '/api/contacts/' + itemSelected.chat_id + '?type=user&attributes=1&public=1';
            // let url = '/api/contacts/' + '59477a82d1d19d489e5b8e0e' + '?type=user&attributes=1&public=1';
            // console.log('Url: ', url);
            getApi(url).then((response) => {
                // console.log(response);
                if(response.code == '200'){
                    const { navigate, goBack, state } = this.props.navigation;
                    navigate('Message', { message_data: itemSelected, 
                        _callBack: this._reloadChannel,
                        direct_chat: true,
                        user_info: response.result
                    });
                }
            });

        }
    }

    _reloadChannel = () => {
        // console.log('===== WOW Reload Data =====');
    }

    onEndReached = () => {

        // console.log(this.state.options);

        // We're already fetching
        if (this.state.options.isLoadingTail) {
            return;
        }
        var _options = _.extend({}, this.state.options);
        _options.isLoadingTail = true;
        this.setState({
            options: _options,
        });

        setTimeout(function(){

            _options.isLoadingTail = false;
            this.setState({
                options: _options,
            });

        }, 3000)

        // this.fetchPets();
    }

    // query all user group-channel relate with user login in tolentora with id
    _getAllUserChatWith = () =>{
        // console.log('Get All User Chat With Now');
        let _SELF = this;
        
        try{
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
                    console.log('All Channel List : ', channelList); 

                    ChatHelper._storeAllChatMembers(channelList);

                    _SELF._parseObjSendBirdToMessageList(channelList);

                    setTimeout(function() {
                        _SELF.setState({
                            refreshing: false
                        })
                    }, 500);

                });
            }

        }catch(e){
            console.log('unmount chat list error :', e);
        }
    }

    // cover obj get from sendbirt & pass to list view obj
    _parseObjSendBirdToMessageList = (allChannel) => {
		let _SELF = this;
        
        // console.log('allChannel: ',allChannel)
        
        let msgListDataSource = [];
        _.each(allChannel, function(v,k){
            let userPartnerProfile = ChatHelper._getUserPartnerProfile(_SELF.state.userId, v);
            // console.log('userPartnerProfile: ',userPartnerProfile)
            if(!_.isEmpty(userPartnerProfile)){
                let _tmp = {
                    id: k,
                    selected: false,
                    chat_id: userPartnerProfile.userId,
                    channelUrl: v.url,
                    name: userPartnerProfile.nickname,
                    photo: userPartnerProfile.profileUrl,
                    lastMessage: v.lastMessage,
                    unreadMessageCount: v.unreadMessageCount,
                    data: JSON.parse(v.data)
                }
                msgListDataSource.push(_tmp);
            }
        })

        // console.log('msgListDataSource :', msgListDataSource);

        let _tmpOption = this.state.options;

        _tmpOption.dataSource = _tmpOption.dataSource.cloneWithRows(msgListDataSource);
        _tmpOption.dataSourceCount = msgListDataSource.length; 
        _tmpOption.allChannelData = msgListDataSource;
        // console.log('DS : ',_tmpOption);

        // console.log('Slice DS : ', this.state.options.dataSource.slice());

        this.setState({
            options: _tmpOption,
        }, function(){
            setTimeout(function() {
                _SELF.setState({
                    isFirstLoad: true
                })
            }, 1000);

        });
        // console.log('All Channel : ',this.state.options.allChannelData);

    }

    // check who that user chating with
    // we need to know to clear the bagde number on  message list to prevent it continue increase number
    // so if we need to set unreadmessage (badge number) to 0 if other user send message to user while they are chatting 
    // in the same channel

    _checkUserChatingWithWho = (channel, messageChatingWith) => {
        // console.log('xxxx channel : ', channel, ' == ', messageChatingWith);
        let _SELF = this;
        if(channel.chat_id == messageChatingWith.chat_id)
            return true;
        else
            return false;

    }

    // update lastmessage, badge number when socket change value of channel
    _updateChannel = (channel, _message=null, isCleaBadge=false) => {
        let _SELF = this;
        let _allChannelData = this.state.options.allChannelData;
        // console.log('All Channel Data Slice : ',_allChannelData.slice());
        let _channelNeedToUpdate = [];
        const messageChatingWith = this.props.messageObj;
        _.each(_allChannelData.slice(), function(v,k){
            
            if(v.channelUrl == channel.url){

                let _isChatingWith = false;

                // check if user chatting with together, set unreadmessage to 0
                if(!_.isEmpty(messageChatingWith))
                    _isChatingWith = _SELF._checkUserChatingWithWho(v, messageChatingWith);

                // console.log('_isChatingWith message: ', _isChatingWith);
                if(!isCleaBadge){

                    if(_message){
                        v.lastMessage = _message;
                    }

                    if(channel.unreadMessageCount){
                        v.unreadMessageCount = channel.unreadMessageCount;
                    }

                }
                else{
                    v.unreadMessageCount = 0;
                }  

                if(_isChatingWith){ 
                    v.unreadMessageCount = 0;                    
                }

            }
            _channelNeedToUpdate.push(v);
        })

        let _tmpOption = this.state.options;

        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        _tmpOption.dataSource = ds.cloneWithRows(_channelNeedToUpdate);
        _tmpOption.dataSourceCount = _channelNeedToUpdate.length;        
        _tmpOption.allChannelData = _channelNeedToUpdate;
        this.setState({
            options: _tmpOption
        }, function(){
            console.log('_tmpOption : ', this.state.options)
        });
        // console.log('_allChannelData : ', _channelNeedToUpdate);

    }

    // if any state is update this func will fire
    componentWillUpdate(){
        // console.log('componentWillUpdate');
        // return true;
    }


    _initPushConfig = () => {
        AppState.addEventListener('change', function(currentAppState){
            if (currentAppState === 'active') {
                console.log('foreground');
                sb.setForegroundState();
            } else if (currentAppState === 'background') {
                console.log('background');
                sb.setBackgroundState();
            }
        });
        // var PushNotification = require('react-native-push-notification');
        // Notifications.configure({
        //     onRegister: function(token) {
        //         if (Platform.OS === 'ios') {
        //         sb.registerAPNSPushTokenForCurrentUser(token['token'], function(result, error){
        //             console.log("registerAPNSPushTokenForCurrentUser");
        //             console.log(result);
        //         });
        //         } else {
        //         sb.registerGCMPushTokenForCurrentUser(token['token'], function(result, error){
        //             console.log("registerAPNSPushTokenForCurrentUser");
        //             console.log(result);
        //         });
        //         }
        //     },

        //     onNotification: function(notification) {
        //         console.log( 'NOTIFICATION:', notification );
        //     },

        //     // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications) 
        //     senderID: "984140644677",

        //     // IOS ONLY (optional): default: all - Permissions to register.
        //     permissions: {
        //         alert: true,
        //         badge: true,
        //         sound: true
        //     },

        //     // Should the initial notification be popped automatically
        //     // default: true
        //     popInitialNotification: true,

        //     /**
        //      * (optional) default: true
        //      * - Specified if permissions (ios) and token (android and ios) will requested or not,
        //      * - if not, you must call PushNotificationsHandler.requestPermissions() later
        //      */
        //     requestPermissions: true,
        // });
    }

    // component finished load
    // init SendBird
	componentDidMount() {

        if(this._isSendJob())
            GoogleAnalyticsHelper._trackScreenView('Chat');        
        else
            GoogleAnalyticsHelper._trackScreenView('Chat');        
        
		let _SELF = this;

        _THAT = this;

		// init send bird
		// sb = new SendBird({ appId: SEND_BRID_APP_ID });
		// console.log('SendBird', sb);

        // this._initPushConfig();

        // this._sendBirdLogin();

        ChatHelper._sendBirdLogin(function(_sb){

            if(!_sb){
                console.log('cannot login to send bird')
                return;
            }

            console.log('_sb : ', _sb);

            sb = _sb;

            _SELF._getAllUserChatWith();


            // no need func below if on send job modal
            if(_SELF._isSendJob())
                return;


            // channel handler 
            var ChannelHandler = new sb.ChannelHandler();


            ChannelHandler.onMessageReceived = function(channel, message){
                // console.log('onMessageReceived Channel : ', channel);
                console.log('onMessageReceived Message : ', message);

                // console.log('Action : ', _SELF.props);

                // parse gifted obj to sendbird obj   
                // append to gifted chat
                if(channel.unreadMessageCount>0) 
                    _SELF._updateChannel(channel, message);
            };

            // ChannelHandler.onMessageUpdated = function (channel, message) {
            // 	// console.log('onMessageUpdated : ',channel, message);
            // }; 

            ChannelHandler.onReadReceiptUpdated = function(channel, message){

                // console.log('onReadReceiptUpdated : ',channel, message);

                // parse gifted obj to sendbird obj 
                // append to gifted chat
                if(channel.unreadMessageCount>0)
                    _SELF._updateChannel(channel);

            };
            // ChannelHandler.onUserEntered = function (openChannel, user) {
            // 	console.log('onUserEntered : ',openChannel);
                
            // }; 

            // ChannelHandler.onChannelChanged = function (channel) {
            // 	console.log('onChannelChanged : ',channel);            
            // }; 

            // _uuidChannelHandle is a unique identifier to register multiple concurrent handlers.
            sb.addChannelHandler(_uuidChannelHandle, ChannelHandler);

        })
	}

	componentWillMount() {

        // no need func below if on send job modal
        if(this._isSendJob())
            return;

        this._initPushConfig();        

        // reload all user again after user start first chat 
        DeviceEventEmitter.addListener('reloadMesssageList', (data) => {
            // console.log('data: ', data);
            this._getAllUserChatWith();
        })

    }

	componentWillUnmount() {
        // console.log('will unmount');

        // no need func below if on send job modal
        if(this._isSendJob())
            return;

		this._isMounted = false;

        // remove the channel handler when the UI is no longer valid.
        if(sb && sb.ChannelHandler){
            var ChannelHandler = new sb.ChannelHandler();
            sb.removeChannelHandler(_uuidChannelHandle, ChannelHandler); 
        }
        
        AppState.removeEventListener('change');
        DeviceEventEmitter.removeListener('reloadMesssageList');
        
	}

    _onRowPress = (_item) => {
        // console.log('row selected :', _item);
    }   

    renderFooter = () => {
        // if (!this.state.options.isLoadingTail) {
        //     return <View style={styles.scrollSpinner} />;
        // }

        if(this._isSendJob()){
            return(
                <View style={[ {height: 30} ]} />
            )
        }

        if (this.state.options.isLoadingTail) {
            return <ActivityIndicator style={styles.scrollSpinner} />;
        }
    }

    renderHeader = () => { 
        return (
            <View style={[ styles.justFlexContainer, styles.paddingBotNavSM]}>
                <SearchBox style={[ styles.marginBotMD ]} prevText={this.state.searchText} margBot={true} placeholder={'Search'} onSubmit={this.searchNow} isLoading={this.state.isLoading} />
            </View>
        )
    }

    searchNow = (txtSearch) => {

        let _SELF = this;
        console.log('Search Text: ', txtSearch);
        // this._getPeopleList(false, txtSearch, true);

        GoogleAnalyticsHelper._trackEvent('Chat', 'Search',{text_search: txtSearch});
        
        this.setState({
            searchText: txtSearch ,
            isLoading: true,
        })
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        console.log('this.state.allChannelData : ', this.state.options.allChannelData);

        let _dataFilter = _.filter(this.state.options.allChannelData,function(v,k){
            // return _.includes(v.name, txtSearch);
            // console.log(v.name,' == ', txtSearch, ' == ',_.includes(v.name.toLowerCase(), txtSearch.toLowerCase()));
            return _.includes(v.name.toLowerCase(), txtSearch.toLowerCase());
            // return v.name.indexOf(txtSearch) != -1;
        })

        console.log('_dataFilter :', _dataFilter);

        _tmpOption = _.cloneDeep(this.state.options);
 
        _tmpOption.dataSource = ds.cloneWithRows(_dataFilter);
        // _tmpOption.allChannelData = _dataFilter;
        _tmpOption.dataSourceCount = _dataFilter.length;
        this.setState({
            options: _tmpOption,
        }, function(){
            // console.log('State: ', this.state.options)
        });
        setTimeout(function(){
            _SELF.setState({
                isLoading: false,
            });
        },200)
    }

    onRefresh = () => {
        console.log('onRefresh');
        this.setState({
            refreshing: true
        }, function(){
            this._getAllUserChatWith();
        })
        
    }

    render() {

        // console.log('this.props.isFocused', this.props.isFocused);

        const { navigate, goBack, state } = this.props.navigation;

        if(this.state.options.allChannelData.length<=0 && !this.state.isFirstLoad)
            return (
                <MessageDataMockUpLoading />
            )
        else{

            if(this.state.options.dataSourceCount <= 0 )
                return (
                    
                    <View style={[ styles.justFlexContainer ]}>

                        <View style={[ styles.defaultContainer ]}>
                            <ListView
                                renderHeader={this.renderHeader}
                                refreshControl={
                                    <RefreshControl
                                        //refreshing={false}
                                        refreshing={this.state.refreshing}
                                        onRefresh={ () => this.onRefresh() }
                                    />
                                }
                                dataSource={this.state.options.dataSource}
                                renderRow={(rowData) => <MessageRowItem { ...rowData } rowPress={ this._onRowPress } messageDetail={ this._goToMessageDetail } /> }
                                enableEmptySections={true}
                                width = {'100%'}
                            />
                            <Text style={[styles.blackText, styles.btFontSize, {position:'absolute', alignSelf:'center'}]}>
                                { !this.state.searchText ?  'You don`t have any messages yet.' : 'No user has been found. ' }
                            </Text>
                        </View>


                    </View>
                );
            else
                return (    
                    <View style={[ {flex: 1} ]}>
                        <ListView
                            refreshControl={
                            <RefreshControl
                                //refreshing={this.state.refreshing}
                                //onRefresh={this._onRefresh.bind(this)}
                                refreshing={this.state.refreshing}
                                onRefresh={ () => this.onRefresh() }
                            />
                            }
                            dataSource={this.state.options.dataSource} 
                            renderHeader={this.renderHeader}
                            renderFooter={this.renderFooter}
                            onEndReachedThreshold={10}
                            onEndReached={() => { 
                                {/*console.log("fired"); // keeps firing*/}
                            }}
                            renderRow={(rowData) => <MessageRowItem { ...rowData } isSendJob={this._isSendJob()} rowPress={ this._onRowPress } messageDetail={ this._goToMessageDetail } /> }
                            enableEmptySections={true}
                            automaticallyAdjustContentInsets={false}
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="never" 
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={false}
                        />
                        { this._isSendJob() && <TouchableOpacity onPress={() => this.sendJobNow()} activeOpacity={.9} style={[ styles.btnSendJobToFriend, styles.shadowBox ]}>
                            <IconMeterial style={[ { color: 'white', fontSize: 22 } ]} name={'send'} />
                        </TouchableOpacity> }
                    </View>
                );
        }
    }

}

var styles = StyleSheet.create({

    ...Utilities,

    btnSendJobToFriend: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        height: 50,
        width: 50,
        backgroundColor: Colors.primaryColor,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },

});

export default connect(mapStateToProps, BadgeNotification)(MessageList)