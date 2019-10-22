import React from 'react';

import { StyleSheet, 
	Text, 
	View, 
	TextInput, 
	TouchableOpacity, 
	TouchableNativeFeedback,
	Alert, 
	StatusBar, 
	Platform, 
	Image, 
	RefreshControl, 
	DeviceEventEmitter, 
	ActionSheetIOS,
	AppState } from 'react-native';

import { Colors } from '@themes/index';
import { GiftedChat } from 'react-native-gifted-chat';

import { connect } from 'react-redux'
import * as MessageActions from '@actions/authentication'
import * as BadgeNotification from '@actions/notification'

import IconMeterial from 'react-native-vector-icons/MaterialIcons';

import ButtonBack from '@components/header/button-back'
import ButtonTextRight from '@components/header/button-text-right'

import Chat from '@components/message/chat/chat'
import JobSend from '@components/message/comp/job-box'

import ChatInputBox from '@styles/components/chatInputBox.style'; 

import ImagePicker from 'react-native-image-picker';
import ImagePickerCrop from 'react-native-image-crop-picker';

// import { NavigationActions } from 'react-navigation';

import { postApi, getApi } from '@api/request';

import { UserHelper, StorageData, Helper, ChatHelper, GoogleAnalyticsHelper } from '@helper/helper';

import { IconCustom } from '@components/ui/icon-custom';
import Utilities from '@styles/extends/ultilities.style'; 

import SendBird from 'sendbird';
import _ from 'lodash'
import uuid from 'react-native-uuid';

// Assign for leave chat function
var YES_INDEX = 0;
var NO_INDEX = 1;
var BUTTON_WARNING = [
    'Yes',
    'No',
];

let sb = null;
let userChannel = null;
let _uuidChannelHandle = 'MessageDetail';

let ipOptions = {
  title: 'Select Image File To Send',  
  mediaType: 'photo',
  noData: true 
};

let that = null;

function mapStateToProps(state) {
    // console.log(state)
    return {
        messageObj: state.message,
		user: state.user,
		notification: state.notification,        		
        // navigation: state.navigation
    }
}

class Message extends React.Component {

	constructor(props) {
		super(props);

		userChannel = null;
		sb = null;
		that = this;

		// sb = SendBird.getInstance();

		// console.log('SB: ', sb);
		const _time = new Date();

		const { navigate, goBack, state } = this.props.navigation;
		// console.log('MESSAGE GLOBAL OBJ: ',this.props);
		// console.log('state : ',state);

		this.state = {
			// userId: '12345',
			// userName: 'Panhna',
			// userId: '5904393039e84e228c60598c',
			// userName: 'Nuon Promsopheak',
			limit: 20,
			isFirstLoad: false,
			userId: UserHelper.UserInfo._id,
			userName: UserHelper._getUserFullName(),
			messages: [],
			selectPartner:  state.params ? state.params.message_data : '',
			isUserTyping: false,
			loadEarlier: false,
			isLoadingEarlier: false,
			chat_text_input: '',
			last_message_timestamp: _time.getTime(),
			// Direct to this page, without go through profile page.
			is_direct_chat: state.params.direct_chat ? true : false,
			isUploadImage: false,
		};

		this._isMounted = false;

		this.onSend = this.onSend.bind(this);

		this.renderFooter = this.renderFooter.bind(this);
		this.onLoadEarlier = this.onLoadEarlier.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.renderCustomActions = this.renderCustomActions.bind(this);
		
		// console.log('message state :', state.params.message_data);
		console.log('props :', this.props);
	}

	static navigationOptions = ({ navigation }) => ({
		// headerTitle: navigation.state.params ? 
		// 	<TouchableOpacity activeOpacity={.5} onPress={ () => {
		// 			that.onHeaderTitlePress()
		// 		}}>
		// 		{console.log('This is sis:', navigation.state.params)}
		// 		<Text style={[ {fontWeight: 'bold', fontSize: 16, color: Colors.textBlack} ]}>{ navigation.state.params.message_data.name }</Text> 
		// 	</TouchableOpacity>
		// : '',

		headerTitle: navigation.state.params ? (navigation.state.params.myTitle ? 
			<TouchableOpacity activeOpacity={.5} onPress={ () => {
					that.onHeaderTitlePress()
				}}>
				<Text style={[ {fontWeight: 'bold', fontSize: 16, color: Colors.textBlack} ]}> { navigation.state.params.myTitle }</Text> 
			</TouchableOpacity> : '')
		: '',

        headerLeft: (<ButtonBack
			// colBtn={ {color: Colors.primaryColDark }}
			isGoBack={ navigation }
			screen={'message_detail'}
			// btnLabel= "Back"
		/>),

		headerRight: (<ButtonTextRight
			btnLabel={'Delete'}
			callBack={ that }
		/>),
	});

	leaveMessage = () => {
		const { navigate, goBack, state } = this.props.navigation;

		userChannel.leave(function(response, error) {

			if (error) {
				console.error(error);
				return;
			}

			goBack();
		});
	}

	handleFunc = () => {

		let _SELF = this;
		// console.log('it work');
		// return;
		if(Helper._isIOS()){
			// popup message from bottom with ios native component
			ActionSheetIOS.showActionSheetWithOptions({

				message: 'Do you want to delete this message?',
				options: BUTTON_WARNING,
				cancelButtonIndex: NO_INDEX,
				destructiveButtonIndex: YES_INDEX,

			},
			(buttonIndex) => {

				// If
				if(buttonIndex==0){
					_SELF.leaveMessage();
				}

			});
		}
		else{
			
			// for android ask with alert message with button
			// Works on both iOS and Android
			Alert.alert(
				'Do you want to delete this message?',
				'',
				[
					// {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
					{text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
					{text: 'Yes', onPress: () => _SELF.leaveMessage() },
				],{ cancelable: false }
			)
		}
	}

	onHeaderTitlePress = () => {


		const { navigate, goBack, state } = this.props.navigation;

		let _isSendFromAdmin = false;

		if(state.params.message_data.data.role){
			if(state.params.message_data.data.role == 'admin'){
				_isSendFromAdmin = true;
			}
		}

		if(this.state.is_direct_chat && !_isSendFromAdmin){
			
			try{
				GoogleAnalyticsHelper._trackEvent('View Profile', 'Chat Room', {user_id: state.params.user_info.userId, user_name: Helper._getUserFullName(state.params.user_info.attributes) });                                                 			
			}catch(err){
				GoogleAnalyticsHelper._trackException('Error Event User Tab On Title Message To View User == ');			
			}
			// console.log('State: ', state);

			this.updateStateUserExitChatRoom();

			this.props.navigation.navigate('Profile', 
			{ 	user_info: state.params.user_info,
				is_direct_chat : state.params.direct_chat
			}); 
		}else{
			this.props.navigation.goBack();
		}
	}


	_getAllChannel = () => {
		var openChannelListQuery = sb.OpenChannel.createOpenChannelListQuery();

		openChannelListQuery.next(function (channels, error) {
			if (error) {
				console.log(error);
				return;
			}

			// console.log('All Channel : ', channels);
		});
	}

	_createChannel() {
		let _SELF = this;
		const { navigate, goBack, state, setParams } = this.props.navigation;

		// let name = state.params.message_data.name;
		let _channelURL = state.params.message_data.channelUrl ? state.params.message_data.channelUrl : state.params.message_data.channel_url;
		// let userIds = [state.params.message_data.chat_id];
		// let coverFile = '';
		// let data = '{}';
		// let customType = '';

		// For typical 1-to-1 chat which is unique between two users
		// if user already make channel it will return data as openChannel
		// open the new one
		// sb.GroupChannel.createChannelWithUserIds(userIds, true, name, coverFile, data, customType, function (createdChannel, error) { 

        // const userObj = {
        //     id : this.props.userId,
        //     cover : this.props.cover, 
        //     full_name : this.props.title, 
        // }

		// console.log('state.params :', state.params)

		if(state.params.userObj){
			ChatHelper._createChannel(sb, state.params.userObj, null, function(_channel){

				_SELF.getChannelInfo(_channel.url);

			})
		}
		else{
			this.getChannelInfo(_channelURL);
		}
		
	}


	getChannelInfo = (_channelURL) => {

		let _SELF = this;
		const { navigate, goBack, state, setParams } = this.props.navigation;

		// open channel that already existed
		sb.GroupChannel.getChannel(_channelURL, function (channel, error) {

			// console.log('Create Channed 1-to-1 : ', channel); 

			if (error) {
				console.log(error);
				return;
			}

			if(channel.unreadMessageCount>0){
                let _notiOption = {
                    job: this.props.notification.job,
                    discover: this.props.notification.discover,
                    chat: this.props.notification.chat > 0 ? this.props.notification.chat - channel.unreadMessageCount : 0,
                    noti: this.props.notification.noti
                }
                this.props.setNotification(_notiOption);
            }
            

			// mark as read message to clear badge number of message list for partner that user selected
			channel.markAsRead();

			userChannel = _.cloneDeep(channel);

			// store meta data to check both user inside one room at the same time to cut down send notification while they are chating
			userChannel.getMetaData(['chat_members'], function(response, error){
				if (error) {
					console.log(error);
					return;
				}
				console.log('success get meta data: ', response);

				let _members = _.cloneDeep(userChannel.memberMap);
				let _brokenData = false;

				if(response.chat_members){
					// console.log('chat members *** good data');
					try{
						_members = JSON.parse(response.chat_members);
					}catch(e){
						_brokenData = true;
						// console.log('data json save not correct :',e);
					}
				}

				// console.log('members : ', _members);
				
				// _members[UserHelper.UserInfo._id] = _.extend({
				// 	..._members[UserHelper.UserInfo._id],
				// 	isOnScreen : true
				// },_members[UserHelper.UserInfo._id]);

				_.each(_members, function(v,k){
					if(k == UserHelper.UserInfo._id){
						v.isOnScreen = true;
					}
				})
				
				// console.log('meta data: ',_members);

				// if first time create new meta data
				if(!response.chat_members || _brokenData){
					// console.log('success get meta data: ', JSON.parse(response.chat_members));
					console.log('create');
					userChannel.createMetaData({ chat_members : JSON.stringify(_members)} , function(response_create, error){
						if (error) {
							console.log(error);
							return;
						}
						// console.log('success create meta data: ', JSON.parse(response_create.chat_members));					
					});
				}
				else{ // update meta data
					// console.log('update'); 
					
					userChannel.updateMetaData({ chat_members : JSON.stringify(_members)}, false, function(response_update, error){
						// console.log('start update');
						if (error) {
							console.log(error);
							return;
						}
						// console.log('success update meta data: ', JSON.parse(response_update.chat_members));					
					});

				}

				setParams({
					message_members: _members,
					// message_channel: userChannel
				})

			});


			// if(userChannel.memberMap[state.params.message_data.chat_id].connectionStatus == 'online'){
			// 	console.log('user start typing')
			// 	userChannel.startTyping();
			// }

			_SELF._getPreviousMessage(channel);


		});

	}


	// get previouse message with limite
	// also get pre message by timestam
	// first start from today by 20 message and then it keep prev page when click on load eaily message
	// when user scroll the top of message
	_getPreviousMessage = (channel, _time=null, isReload=false) => {
		let _SELF = this;

		// var messageListQuery = channel.createPreviousMessageListQuery();
		try{
			var messageListQuery = channel.createMessageListQuery();
			// console.log("messageListQuery : ",messageListQuery);
			messageListQuery.prev(_time || _SELF.state.last_message_timestamp, this.state.limit, true, function (messageList, error) {
				
				if (error) {
					console.log(error);
					return;
				}

				console.log('Prev Message: ', messageList);
					
				if(!_.isEmpty(messageList)){
					// console.log('Prev Message: ', messageList[messageList.length-1]);
					// console.log('message not empty')
					// store last timestam of last prev message
					_SELF.setState({
						last_message_timestamp: messageList[messageList.length-1].createdAt
					})

					// console.log('Last Message: ',messageList[messageList.length-1]);
					

					_SELF._parseGiftedChatObj(messageList, _.isEmpty(_SELF.state.messages) ?  false : true, isReload);

					if(messageList.length<_SELF.state.limit){
						_SELF.setState({
							loadEarlier: false,
							isLoadingEarlier: false,
						});
					}
				}
				else{
					// console.log('message empty or the same');
					// it mean no more message to load
					_SELF.setState({
						loadEarlier: false,
						isLoadingEarlier: false,
					});
				}

				_SELF.setState({
					isFirstLoad: true
				})
			});
		}
		catch(e){

			GoogleAnalyticsHelper._trackException('Error Get Message List Query (May be cannot get channel)');			

		}
	}

	_sendMessage = (messages) => {
		let _SELF = this;
		console.log(messages);
		

		// let _msg = _.head(messages); // default gifted give 1 array. so need get message is: messages.text

		let _data = {
			// env: 'development',
			// wroking_type: 'sendbird integrate',
			// job: {
			// 	cover: 'https://talentora-rn.s3.amazonaws.com/resources/clouds/59a68a74a761d91c911ec88a/photos/thumbnail/6ae403a0-8d69-11e7-a3bf-6d4d85b6c4b1.jpg',
			// 	id: '59a68baca761d91c911ec8d4',
			// 	title: 'Ho Ya',
			// }
		}
		// let customType = 'send-job';
		// messages = '';
		let customType = '';
		
		// clear textbxo
		this.setState({
			chat_text_input: ''
		})

		GoogleAnalyticsHelper._trackEvent('Chat', 'Send Message');

		try{

			userChannel.sendUserMessage(messages, JSON.stringify(_data), customType, function (message, error) {
				if (error) {
					console.log(error);
					return;
				}

				// parse gifted obj to sendbird obj 
				// append to gifted chat
				_SELF._parseGiftedChatObj([message]);

				// clear textbxo
				_SELF.setState({
					chat_text_input: ''
				})

				// this code will refresh & return to that route
				// const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'MessageList'}], key: null })
				// _SELF.props.navigation.dispatch(resetAction); 
				//_SELF._notifyToUser(message); // send notification to user

				// get meta data for detech both user online + stay on chat room or not
				// if online + stay on chat room both user no need to send notification. coz user already  saw the message
				userChannel.getMetaData(['chat_members'], function(response, error){
					if (error) {
						console.log(error);
						return;
					}

					let _metaData = response;

					try{

						if(_metaData.chat_members){
							let _objMembers = JSON.parse(_metaData.chat_members);
							let _chkEnablePush = false;

							_.each(_objMembers, function(v,k){
								if(!v.isOnScreen)
									_chkEnablePush = true;
							})
							console.log('_check Online: ', _chkEnablePush);
							if(_chkEnablePush)
								_SELF._notifyToUser(message); // send notification to user			
						}
						else{
							_SELF._notifyToUser(message); // send notification to user
						}

					}catch(err){
						GoogleAnalyticsHelper._trackException('Error Get Chat Members');	
					}

				});


				// onSent
				console.log('Send To : ',message); 

			});

		}catch(e){

			GoogleAnalyticsHelper._trackException('Error Chat - Send Message');	

		}
	}

	onSend(messages = []) {

		if (userChannel && !_.isEmpty(this.state.chat_text_input))
			this._sendMessage(this.state.chat_text_input);

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
			user: state.params.message_data.chat_id,
			name: UserHelper.UserInfo.profile.attributes.first_name.value + ' ' + UserHelper.UserInfo.profile.attributes.last_name.value, 
			channel_url: state.params.message_data.channelUrl, 
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

	_parseGiftedChatObj = (messageObj, isLoadMore=false, isReload=false) => {
		let _SELF = this;
		let _tmpObj = [];
		let _nextIndexListItem = -1;
		try{
			if(!_.isEmpty(this.state.messages)){
				// _nextIndexListItem = this.state.messages[this.state.messages.length-1]._id+1;
				_nextIndexListItem = this.state.messages.length+1;
			}

			console.log('_index: ',_nextIndexListItem, ' === ', this.state.messages.length);

			_.each(messageObj, function (v, k) {

				
				let _partnerCover = null;
				try{
					const _tmpMembers = _.cloneDeep(userChannel.memberMap);
					_partnerCover = _tmpMembers[v._sender.userId].profileUrl;
				}catch(e){
					console.log('error get cover other partner: ', e);
				}
				// console.log('partner cover: ',_partnerCover);
				let _iconCover = Helper._getFileExtenstion(v._sender.profileUrl) ? _partnerCover || v._sender.profileUrl : 'https://dxstmhyqfqr1o.cloudfront.net/images/icon_profile.png';

				let _customData = {};
			
				try{
					
					_customData = JSON.parse(v.data);

				}catch(e){

				}

				let giftedObj = {
					_id: _nextIndexListItem>-1 ? _nextIndexListItem : k,
					messageId: v.messageId,
					text: v.message,
					customData: _customData,
					customType: v.customType || '',
					createdAt: new Date(v.createdAt),
					user: {
						_id: v._sender.userId,
						name: v._sender.nickname,
						avatar: _iconCover,
					},
				}

				// if sender is user logging no need to show image
				if (v._sender.userId == _SELF.state.userId) {
					giftedObj.user.avatar = null;
				}

				// add image lightbox if message type == file or can be video (for next step)
				if (v.messageType == 'file') {
					_.extend(giftedObj, {
						image: v.url,
					})
				}

				if(isLoadMore)
					_nextIndexListItem++;

				_tmpObj.push(giftedObj);
			})

			console.log('sendbirt to gifted data : ', _tmpObj);	

			_tmpObj = _.uniqBy(_tmpObj,'messageId');

			if(!_.isEmpty(this.state.messages)){
				if(!isReload){
					this.setState((previousState) => {
						// console.log('previousState.messages : ',previousState.messages); 

						let allMsg = [];

						let _chkUnqi = _.filter(previousState.messages, function(v,k){
							return v.messageId == _.head(_tmpObj).messageId;
						})

						if(_chkUnqi.length<=0)
							return {
								messages: isLoadMore ? GiftedChat.prepend(previousState.messages, _tmpObj) :  GiftedChat.append(previousState.messages, _.head(_tmpObj)),
								// messages: GiftedChat.prepend(previousState.messages, _tmpObj) :  GiftedChat.append(previousState.messages, _.head(_tmpObj)),
								loadEarlier: true,
								isLoadingEarlier: false,
							};
					});
				}
				else{
					this.setState({
						loadEarlier: true,
						messages: _tmpObj
					});
				}
			}
			else{
				this.setState({
					loadEarlier: true,
					messages: _tmpObj
				});
			}

		}catch(err){
			GoogleAnalyticsHelper._trackException('Error Render Message == ');			
		}
	}

	componentDidMount() {
		// return;
		// console.log('UserHelper.UserInfo._id', UserHelper.UserInfo._id);

		GoogleAnalyticsHelper._trackScreenView('Chat Room');        
		

		// To set header tittle for navigationOptions
		let title = this.props.navigation.state.params ? (this.props.navigation.state.params.message_data ? this.props.navigation.state.params.message_data.name : ''): '';
		this.props.navigation.setParams({
			testPassObj: '** set update value **',
			myTitle: title
		})
		let _SELF = this;
		
		ChatHelper._sendBirdLogin(function(_sb){
			sb = _sb;
			_SELF._createChannel(); // create or open channel
			
			// channel handler 
			var ChannelHandler = new sb.ChannelHandler();
			ChannelHandler.onMessageReceived = function(channel, message){
				console.log('onMessageReceived : ',channel, message);

				// check send exist in this room 
				try{
					if(ChatHelper._verifyUserInRoom(userChannel, message._sender.userId)){

						// mark as read
						// to prevent user back to message list & refresh 
						// and they still badge number show up
						userChannel.markAsRead();

						// parse gifted obj to sendbird obj 
						// append to gifted chat
						if(UserHelper.UserInfo._id != message._sender.userId)
							_SELF._parseGiftedChatObj([message]);


					}
				}
				catch(err){
					GoogleAnalyticsHelper._trackException('onMessageReceived Error == '); 					
				}

			};

			ChannelHandler.onUserJoined = function (groupChannel, user) {
				console.log('onUserJoined :', groupChannel, ' user: ', user);
			};

			ChannelHandler.onChannelChanged = function (groupChannel) {
				console.log('onChannelChanged :', groupChannel);			
			};

			ChannelHandler.onReadReceiptUpdated = function(channel, message){

				channel.getMetaData(['chat_members'], function(response, error){
					if (error) {
						console.log(error);
						return;
					}
					console.log('channel change meta data: ', JSON.parse(response.chat_members));
				});

			};


			ChannelHandler.onTypingStatusUpdated = function(channel){
				// console.log(channel);
				// console.log('onTypingStatusUpdated: ',channel.getTypingMembers());
				
			};
			
			// _uuidChannelHandle is a unique identifier to register multiple concurrent handlers.
			sb.addChannelHandler(_uuidChannelHandle, ChannelHandler);
		})
	}

	componentWillMount() {

		// console.log('will mount');
		// this.setState({
		// 	messages: [
		// 		{
		// 		_id: 1,
		// 		text: 'Hello developer',
		// 		createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
		// 		user: {
		// 			_id: 1,
		// 			name: 'React Native',
		// 			avatar: 'https://facebook.github.io/react/img/logo_og.png',
		// 		},
		// 		},
		// 		{
		// 			_id: 2,
		// 			text: 'My message',
		// 			createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
		// 			user: {
		// 				_id: 1,
		// 				name: 'React Native',
		// 				avatar: 'https://facebook.github.io/react/img/logo_og.png',
		// 			},
		// 			image: 'https://facebook.github.io/react/img/logo_og.png',
		// 			// additional custom parameters
		// 		},
		// 		{
		// 			_id: 3,
		// 			text: 'Yes, and I use Gifted Chat!',
		// 			createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
		// 			user: {
		// 				_id: 1,
		// 				name: 'Developer',
		// 			},
		// 			sent: true,
		// 			received: true,
		// 			location: {  
		// 				latitude: 48.864601,
		// 				longitude: 2.398704
		// 			},
		// 		},
		// 	],
		// });

		const _SELF = this;
		// update user exit or enter chat room on backround or forceground (lock-screen, hide app , ...)
        AppState.addEventListener('change', function(currentAppState){
			if (currentAppState === 'active') { // using app
				// alert('hey i get pre message');
				// setTimeout(function() {
				const _time = new Date();
					
				_SELF._getPreviousMessage(userChannel, _time.getTime(), true);
				
				// }, 2000);
				_SELF.updateStateUserExitChatRoom(true);
                // console.log('foreground');
				// sb.setForegroundState();

            } else if (currentAppState === 'background') { // hide app
				// console.log('background');
				_SELF.updateStateUserExitChatRoom();
                // sb.setBackgroundState();
			}
			else{
				// console.log('other app state event', currentAppState);
				// user kill app also update 
				if(!_SELF.state.isUploadImage){
					_SELF.updateStateUserExitChatRoom();				
				}
			}
        });

		// create event emitter for easy access from /navigator/tab/index.js
        DeviceEventEmitter.addListener('UpdateUserEnterExitChatRoom', (data) => {
			// console.log('data UpdateUserEnterExitChatRoom: ', data);
            this.updateStateUserExitChatRoom(data.status || false);
		})
		
		DeviceEventEmitter.addListener('NavigateToJobDetail', (data) => {
			// console.log('This is job id: ', data.job_id);
			if(data.job_id){
				let REQ_API = '/api/jobs/' + data.job_id;
				//console.log(REQ_API)
				getApi(REQ_API).then((_response) => {
					console.log('Job info: ', _response);
					if(_response.code == 200){
						const { navigate, goBack } = this.props.navigation;
						navigate('JobDetail', { 
                            job: _response.result, 
                            // View only true mean can do nothing, false can apply / remove. 
                            view_only: _response.result.status == 'cancel' ? (_response.result.removable ? false : true) : false,
                            can_remove:_response.result.status == 'cancel' ? 
                                (_response.result.removable ? true : false) : (_response.result.applicable ? false : true)
                        });
					}
				});
			}
		})

		this._isMounted = true;
	}
 
	componentWillUnmount() {
		// console.log('wow view did unmount');

		// if user click on back button 
		this.updateStateUserExitChatRoom();

		this._isMounted = false;

		// remove the channel handler when the UI is no longer valid.
		var ChannelHandler = new sb.ChannelHandler();
		sb.removeChannelHandler(_uuidChannelHandle, ChannelHandler); 

		DeviceEventEmitter.emit('reloadMesssageList', {});		

		DeviceEventEmitter.removeListener('refreshApplyList');
		DeviceEventEmitter.removeListener('NavigateToJobDetail');
		AppState.removeEventListener('change');

		// clear tmp for crop & upload image
		ImagePickerCrop.clean().then(() => {
			console.log('removed all tmp images from tmp directory');
		}).catch(e => {
			console.log('cannot removed all tmp images from tmp directory');
		});

	}

	updateStateUserExitChatRoom = (_status=false) =>{

		const { navigate, goBack, state, setParams } = this.props.navigation;		

        let _members = _.cloneDeep(state.params.message_members);

		// console.log('update my meta data: ',_.cloneDeep(_members));
		
		try{

			_members[UserHelper.UserInfo._id].isOnScreen = _status;
			
			// console.log('update my meta data: ',_members);

			userChannel.updateMetaData({ chat_members : JSON.stringify(_members)}, false, function(response, error){
				
				if (error) {
					console.log(error);
					return;
				}

				// console.log('success update meta data: ', JSON.parse(response.chat_members));					
				
				if(userChannel.markAsRead)
					userChannel.markAsRead();

			});

		}catch(e){
			console.log('error updateStateUserExitChatRoom :', e);
		}
	
	}

	onChangeVisibleRow(){
		// console.log('it work', this);
	}

	// load more message when scroll top
	onLoadEarlier() {
		this.setState((previousState) => {
			return {
				isLoadingEarlier: true,
			};
		});

		GoogleAnalyticsHelper._trackEvent('Chat', 'Load Earlier Messages');
		
		this._getPreviousMessage(userChannel);
	}

	renderFooter(props) {
		// console.log('props: ', props);

		if (_.isEmpty(this.state.messages) && this.state.isFirstLoad) {
			return (
                <View  style={[ styles.justFlexContainer, {paddingTop: 50} ]}>
					<View style={[ styles.defaultContainer ]}>

						<Text style={[styles.blackText, styles.btFontSize]}>
							You not yet have a conversation. 
						</Text>

					</View>
				</View>
			);
		}

		if (this.state.isUserTyping) {
			return (
				<View style={styles.footerContainer}>
					<Text style={styles.footerText}>
						typing chat ...
              		</Text>
				</View>
			);
		}
		return null;
	}

	renderCustomActions(props) {
		console.log('custom props :', props);
	}

	renderCustomView(props){
		
		// console.log('render customer view: ', props,);

		if(props.currentMessage.customType == 'send-job'){
			return (
				<JobSend {...props} />
			)
		}
		else{
			return null;
		}
	}

	renderInput(props) {

		// console.log('props :', props, ' == this : ', this);
		
		return (
			
			<View style={[ styles.chatInputContainer,{height:this.state.height}]}>

				<View style={[ styles.chatInputContainer, { alignItems: 'center', height: 50 } ]}>
					
					<View style={[ styles.uploadContainer ]}>
						<TouchableOpacity activeOpacity={.8} onPress={() => { this._onPhoto() } }>
							<IconCustom
								/*name={'control-point'}*/
								name={'plus-black-icon'}
								style={[ styles.chatInputIcon, {fontSize: 20} ]}
							/>
						</TouchableOpacity>
					</View> 

					<View style={[ styles.inputContainer, { flex: 1, alignItems: 'stretch', justifyContent: 'center', paddingTop: (Helper._isIOS() ? 10 : 0 )} ]}>
						<TextInput 
							onChangeText={(txtMessage) => {
									this.setState({
										chat_text_input: txtMessage  
									});
									{/*props.text = this.chat_text_input ;*/}
								}
							}
							value={ this.state.chat_text_input }
							placeholder="Type a chat ..." 
							placeholderTextColor={ Colors.placeHolder } 
							style={[ { flex: 1, paddingRight:35, fontSize: 16} ]}
							ref={(input) => this.chat_text_input =  input} 
							underlineColorAndroid = 'transparent'
							textAlignVertical = 'center'
							multiline={true}
							numberOfLines = {4} 
						/>
						<TouchableOpacity activeOpacity={.8} style={[ styles.chatInputBtnSend ]} onPress={() => this.onSend() }>
							<IconMeterial
								name={'send'}
								style={[ styles.chatInputIconSend ]}
							/>
						</TouchableOpacity>
					</View>

				</View>
			</View>
		);

	}

	renderLoading(){
		return(
			<View style={[ {flex: 1} ]}>
				<Text>Message Loading ...</Text>
			</View>
		)
	}

	// on photo 
	_onPhoto() {
		var _SELF = this;

		if (Platform.OS === 'android'){
			sb.disableStateChange();
		}

		_SELF.setState({
			isUploadImage: true
		})

		// return; 2098472, 6581432		
        ImagePickerCrop.openPicker({
			mediaType: 'photo',
			compressImageQuality: 0.5, // 50% compress image quality
			compressImageMaxWidth: 745, // width for iPhone plus
			compressImageMaxHeight: 1330, // height for iPhone plus
            // cropping: true,
            // includeBase64: true,
        }).then(response => {
			console.log('Image B4 Crop: ', response);


			let source = {uri: 'file://' + response.path};
			
			if (response.filename){
				source['name'] = response.filename
			} else{
				paths = response.path.split("/")
				source['name'] = paths[paths.length-1];
			}

			if (response.type){
				source['type'] = response.type; 
			}
			
			// console.log('upload source: ', source);
			// return;

			const CHECK_IMAGE_URI_INTERVAL = Platform.OS === 'android' ? 300 : 100;

			// This is needed to ensure that a file exists
			// setTimeout(() => {
				// Use getSize as a proxy for when the image exists
				// Image.getSize( response.uri, () => {

						_SELF.setState({
							isUploadImage: false
						})

						GoogleAnalyticsHelper._trackEvent('Chat', 'Upload Image');                                                 						

						userChannel.sendFileMessage(source, function(message, error){

							if (error) {
								console.log(error);
								return;
							}

							// parse gifted obj to sendbird obj 
							// append to gifted chat
							_SELF._parseGiftedChatObj([message]);


						});

					// });

			// }, CHECK_IMAGE_URI_INTERVAL);
			
		}).catch(e => {
            console.log('error : ', e);
		});
		
		return;
		ImagePicker.showImagePicker(ipOptions, (response) => {   

			if (Platform.OS === 'android'){
				sb.enableStateChange();
			}
			if (response.didCancel) {
				console.log('User cancelled image picker');
			}
			else if (response.error) { 
				console.log('ImagePicker Error: ', response.error);
			}
			else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				let source = {uri:response.uri};
				
				if (response.name){
					source['name'] = response.fileName
				} else{
					paths = response.uri.split("/")
					source['name'] = paths[paths.length-1];
				}

				if (response.type){
					source['type'] = response.type; 
				}
				console.log('upload source: ', source);
				return;

				const CHECK_IMAGE_URI_INTERVAL = Platform.OS === 'android' ? 300 : 100;

				// This is needed to ensure that a file exists
				setTimeout(() => {
					// Use getSize as a proxy for when the image exists
					Image.getSize( response.uri, () => {

							_SELF.setState({
								isUploadImage: false
							})

							GoogleAnalyticsHelper._trackEvent('Chat', 'Upload Image');                                                 						

							userChannel.sendFileMessage(source, function(message, error){

								if (error) {
									console.log(error);
									return;
								}
								

								// parse gifted obj to sendbird obj 
								// append to gifted chat
								_SELF._parseGiftedChatObj([message]);

								// var _messages = [];
								// _messages.push(message);
								// if (_SELF.state.lastMessage && message.createdAt - _SELF.state.lastMessage.createdAt  > (1000 * 60 * 60)) {
								//   _messages.push({isDate: true, createdAt: message.createdAt});
								// }

								// var _newMessageList = _messages.concat(_SELF.state.messages);
								// _SELF.setState({
								//   messages: _newMessageList,
								//   dataSource: _SELF.state.dataSource.cloneWithRows(_newMessageList)
								// });

								// _SELF.state.lastMessage = message;
								// _SELF.state.channel.lastMessage = message;

							});

						});

				}, CHECK_IMAGE_URI_INTERVAL);

			};
			
		});


	}

	// may be the only way to check scroll position
	// follow by: https://github.com/FaridSafi/react-native-gifted-chat/issues/321
	onChangeVisibleRow(event){
		// console.log('event : ', event.s1);
		// if(event.s1['19']){ // 19 is the number of item row in listview (0,1,2,3,4 ..... 100)
			// console.log('header obj: ',_.head(event.s1));
		// }

	}

	render() {


		if(_.isEmpty(this.state.messages) && !this.state.isFirstLoad)

			return (
                <View  style={[ styles.justFlexContainer, {paddingTop: 50} ]}>
					<View style={[ styles.defaultContainer ]}>

						<Text style={[styles.blackText, styles.btFontSize]}>
							Loading... 
						</Text>

					</View>
				</View>
			)
			
		// else if(_.isEmpty(this.state.messages) && this.state.isFirstLoad)

		// 	return (
        //         <View  style={[ styles.justFlexContainer, {paddingTop: 50} ]}>
		// 			<View style={[ styles.defaultContainer ]}>

		// 				<Text style={[styles.blackText, styles.btFontSize]}>
		// 					You not yet have a conversation. 
		// 				</Text>

		// 			</View>
		// 		</View>
		// 	)

		else
			return (

				<GiftedChat
					ref={"chatBox"}
					keyboardShouldPersistTaps={'handled'}
					messages={this.state.messages}
					onSend={this.onSend}
					user={{  
						_id: this.state.userId,
					}}
					
					listViewProps={{onChangeVisibleRows: this.onChangeVisibleRow.bind(this), removeClippedSubviews: false }} 

					renderInputToolbar={this.renderInput}
					minInputToolbarHeight={50}
					loadEarlier={this.state.loadEarlier}
					//loadEarlier={true}
					onLoadEarlier={this.onLoadEarlier}
					isLoadingEarlier={this.state.isLoadingEarlier}
					renderCustomView={this.renderCustomView}
					bottomOffset={ (Helper._isIOS() ? 50 : -5 )}
					isAnimated={true}
					//renderActions={this.renderCustomActions}

					//renderComposer={() => {}}
					//renderLoading={this.renderLoading}
					//renderFooter={this.renderFooter}
				/>

			);
	}

}

var styles = StyleSheet.create({
	...ChatInputBox, 
	...Utilities,
});

export default connect(mapStateToProps, [MessageActions, BadgeNotification])(Message)


