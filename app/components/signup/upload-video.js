// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Image, ScrollView, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, ActivityIndicator,
ActionSheetIOS, Platform, DeviceEventEmitter } from 'react-native';

import SendBird from 'sendbird';
import { SEND_BRID_APP_ID} from '@constants/env';

import _ from 'lodash'

import ButtonBack from '@components/header/button-back'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';
import ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { postMedia, postApi, putApi, getApi, deleteApi } from '@api/request';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';
import Prompt from 'react-native-prompt';

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import YoutubePopup from '@components/user/comp/youtube-link-popup';

let sb = null;

const options = {
    title: 'Video Picker',
    takePhotoButtonTitle: 'Take Video...',
    mediaType: 'video',
    videoQuality: 'high'
};

var BUTTONS = [
  'Delete',
  'Cancel',
];
var DESTRUCTIVE_INDEX = 0;
var CANCEL_INDEX = 1;


var BUTTONS_UPLOAD_VIDEO = [
    'Upload Video',
    'Youtube URL',
    'Cancel',
  ];

var CANCEL_INDEX_UPLOAD = 2;

const pic = [

    // {
    //     id: 1,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-9/13690662_777391902401412_7742506644238257845_n.jpg?oh=88ea15a000a4ae04db0c72065af02abb&oe=59876F91',
    // },
    // {
    //     id: 2,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p160x160/17799245_820895741395836_893744169114306193_n.jpg?oh=9f5dbd67b6df76217571ec7b8804e6f1&oe=59993FD3',
    // },
    // {
    //     id: 3,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p200x200/16508988_1075299335933144_3547182206399928845_n.jpg?oh=c1e90ca0968e7175be239e9131799261&oe=594CE7FD',
    // },
    // {
    //     id: 4,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p160x160/14670629_106377253167543_2254683061619192365_n.jpg?oh=aa154b6e14368353322494cb048cc7f3&oe=597E1B1C',
    // },
];

let that;
let _userInfo;

function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        user_info: UserHelper.UserInfo,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class UploadVideo extends Component{
    constructor(props){
        super(props);
        //your codes ....

        const { navigate, goBack, state } = this.props.navigation;
        
        _userInfo = state.params.sign_up_info;
        let video_uploaded = 0;
        // console.log('user info video f: ', _userInfo);
        if(_userInfo.profile.video_uploaded_count)
            video_uploaded = _userInfo.profile.video_uploaded_count;

        that = this;
        this.state = {
            item_selected: -1,
            startUpload: false,
            tmpUUID: '',
            // video: [{'id':0, 'uri': 'https://talentora-rn.s3.amazonaws.com/resources/clouds/5906addab81611399dadd78b/videos/preview/367fda20-3176-11e7-b8f9-270be727ae37.mp4', 'paused':false}],
            // video: [{'id':0, 'uri': 'https://talentora-rn.s3.amazonaws.com/resources/clouds/5906addab81611399dadd78b/videos/preview/streaming/2b4f1a7b-a105-4dce-bf78-6c5c0d253913/hls720p/eae5ab90-317e-11e7-9615-59b0539b61c6.mp4', 'paused':false}],
            // video: [{'id':0, 'uri': 'https://talentora-rn.s3.amazonaws.com/resources/clouds/5906addab81611399dadd78b/videos/preview/9f6fee90-317f-11e7-9615-59b0539b61c6.mp4', 'paused':false}],
            video:[],
            videoFromApi: [], // store video from api for delete
            already_upload: video_uploaded,
            idx: 0,
            isFirstVideo: false,  
            disableSkip : false,
            isUploading : false,
            txtUploading: '',
            promptVisible: false,
            promptMessage: '',
            showYoutubePopup: false,
            youtube_link: {
                val: '',
                isErrRequired: false,
            },
            caption: {
                val: '',
                isErrRequired: false,
            },
            loadingSubmitLink: false,
        }
        // console.log('User Info : ',state.params);
        // console.log('Back button NWQ: ', this.props.navigation);
    }

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: true,
        headerLeft: navigation.state.params.noBackButton ? null : (<ButtonBack
            isGoBack={ navigation }
            btnLabel= "Upload your photos"
        />),
    });


    _createSendBirdUser = (_userInfo) => {
		// sb = SendBird.getInstance();
		var _SELF = this;

        const { navigate, goBack, state } = this.props.navigation;
        // _userInfo = state.params.sign_up_info;
        // console.log('Send Obj', sb, _userInfo._id);
		sb.connect(_userInfo._id, function (user, error) {
			if (error) { 
				_SELF.setState({
					userId: '',
					username: '',
					errorMessage: 'Login Error'
				});
				console.log(error);
				return;
			}

			console.log('create sendbrid user : ', user);

			// if (Platform.OS === 'ios') {
			//   if (sb.getPendingAPNSToken()){
			//     sb.registerAPNSPushTokenForCurrentUser(sb.getPendingAPNSToken(), function(result, error){
			//       console.log("APNS TOKEN REGISTER AFTER LOGIN");
			//       console.log(result);
			//     });
			//   }
			// } else {
			//   if (sb.getPendingGCMToken()){
			//     sb.registerGCMPushTokenForCurrentUser(sb.getPendingGCMToken(), function(result, error){
			//       console.log("GCM TOKEN REGISTER AFTER LOGIN");
			//       console.log(result);
			//     });
			//   }
			// }

			sb.updateCurrentUserInfo(UserHelper._getUserFullName(), state.params.sign_up_info.cover ? state.params.sign_up_info.cover.thumbnail_url_link : '', function(response, error) {

                if (error) { 
                    console.log(error);
                    return;
                }

			    console.log('updateCurrentUserInfo : ', response);
                _SELF.setState({
                    joining: false
                });
                // show home page 
                _SELF.props.authenticate(); 

			});

		});
    }

    getStarted = () => {
        // Alert.alert('login now');
        // dismissKeyboard();
        // const { navigate, goBack } = this.props.navigation;
        // navigate('WhatAreYou');
        // console.log(this.props); 
        // this.props.authenticate();

        if(this.state.isUploading){
            alert('Please wait till the video is uploaded')
            return;
        } 

        if(this.state.video.length>0){
            let _chkVideoFeatured = _.filter(_.cloneDeep(this.state.video), function(v,k){
                return v.is_featured;
            })
            if(_chkVideoFeatured.length<=0){
                alert('Please set your feature video.');
                return;
            }
        }

        this.setState({
            joining: true
        });

        let that = this;

        const { navigate, goBack, state } = this.props.navigation;
        

        let API_URL = '/api/users/register/completed';

        postApi(API_URL,
            JSON.stringify({})
        ).then((response) => {

            console.log('Response Object: ', response);
            if(response.status=="success"){

                let _result = response.result;


                let _userInfo = state.params.sign_up_info;

                _userInfo = _.extend({
                    is_register_completed : true,
                }, _userInfo)

                // remove tmp storage
                StorageData._removeStorage('SignUpProcess');

                console.log('Final Sign Up Process: ', _userInfo);
                

                // save to final strorage key
                let _userData =  StorageData._saveUserData('TolenUserData',JSON.stringify({_userInfo})); 
                UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                _userData.then(function(result){
                    console.log('complete final save sign up'); 

                    // create sendbird user
                    that._createSendBirdUser(_result);

                });

                

                console.log('the most final data : ', UserHelper.UserInfo);

                // navigate('UploadPhoto', { sign_up_info: signUpInfo});
            }

        })

    }

    checkActiveTag = (item) => {

        return item.is_featured;
    }

    selectedTag = (item) => {

        // console.log('item selected : ', item)

        if(this.state.item_selected != item.id){
            if(this.state.video.length>=1){
                this._setProfileVideoFeature(item.uuid);
            }
        }
    
    }

    // set feature photo
    _setProfileVideoFeature = (_id) => {
        let that = this;
        // let API_URL = '/api/users/me/picture';
        let API_URL = '/api/users/me/feature/video';
        postApi(API_URL,JSON.stringify({
            feature : _id
        })).then((_response) => {
            console.log('success set photo cover response: ', _response);
            let _tmp = _.cloneDeep(that.state.video);
            _.each(_tmp, function(v,k){
                console.log(v.upload_session_key,' == ', _id)
                if(v.uuid == _id){
                    v.is_featured = true;
                }
                else{
                    v.is_featured = false;
                }
            })
            console.log('_tmp : ', _tmp);
            this.setState({
                video: _tmp,
            })

        });
    }

    _prompt = () =>{
        return (
            <Prompt
                title=''
                placeholder="Title"
                //defaultValue="Hello"
                visible={ this.state.promptVisible }
                onCancel={ () => { 
                    // alert('You need to provide title');
                    this.state.video.splice(-1, 1);
                    this.setState({
                        video:this.state.video,
                        promptVisible:false
                    });
                    /* this.setState({
                        // promptVisible: false,
                        message: "Unnamed Video"
                    }).then(function(){
                        console.log('This is video name: ', this.state.promptMessage);
                        this._uploadVideo()
                    }) } */
                } }
                onSubmit={(value) => { 
                    if(value == '') return;
                    this.setState({
                        promptVisible: false,
                        isUploading: true,
                        promptMessage: value
                    })
                    
                    setTimeout(function(){
                        // console.log('This is video name: ', that.state.promptMessage);
                        that._uploadVideo(that.state.promptMessage);
                    }, 50)}
                }
            />
        );
    }

    chooseVideo () {

        if(this.state.isUploading){
            alert('Please wait till the video is uploaded')
            return;
        }

        ImagePicker.launchImageLibrary(options, (response) => {
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

                let _videoUri = Helper._isAndroid() ? response.path : response.uri
                
                if(!Helper._chkVideoExtension(_videoUri)){
                    if(Helper._isAndroid())
                        Alert.alert('Android only support mp4 extension');
                    else
                        Alert.alert('IOS only support mp4 or mov extension');
                }
                else{
                    const { navigate, goBack, state } = this.props.navigation;
                    navigate('VideoTrimScreen',{video_data: response}); 
                }
            }
        });
    }

    initStaticVideo = (response) => {

        console.log('Response: ', response);
        let source = { uri: response.uri };
        // console.log('The state: ', this.state);
        let arrVideo = this.state.video.slice();
        let _id =0;
        if(arrVideo.length > 0)
            _id = arrVideo.length;
        // console.log('fileName: ', response.fileName);
        let _photoUUID = uuid.v4();

        arrVideo.push(
            { 
                'id': _id, 
                'uuid': _photoUUID,
                'fileName': response.fileName ? response.fileName : '', 
                'uri': source.uri, 
                'paused': true,
                isLocal: true,
                'videoThum': response.videoThum,
                
            }
        );
        let vdo_idx = arrVideo.length + this.state.already_upload;

        this.setState({
            startUpload: true,
            tmpUUID: _photoUUID,
            video: arrVideo,
            idx: vdo_idx,
            // isUploading: true,
            promptVisible: true,
        });

    }

    youtubeVideo = (youtubeLink, youtubeCaption) => {
        console.log('youtubeLink : ', youtubeLink , ' == caption: ', youtubeCaption,' === ' ,Helper._geParamsUrl('v',youtubeLink));
        const _youtubeId = Helper._geParamsUrl('v',youtubeLink);
        if(_youtubeId){

            this._uploadVideo(youtubeCaption, _youtubeId);

        }else{
            alert('Youtube url is not correct!');
        }

    }

    hideShowYoutubePopup = () => {
        this.setState({
            showYoutubePopup: !this.state.showYoutubePopup
        })
    }

    showActionSheetUploadVideo = () => {
        let _SELF = this;
        _SELF.chooseVideo();
        return;
        // console.log('Helper._isIOS() :', Helper._isIOS());
        if(Helper._isIOS()){ 
            // popup message from bottom with ios native component
            ActionSheetIOS.showActionSheetWithOptions({

                message: 'Please select your video type',
                options: BUTTONS_UPLOAD_VIDEO,
                cancelButtonIndex: CANCEL_INDEX_UPLOAD,
                // destructiveButtonIndex: UPLOAD_YOUTUBE,

            },
            (buttonIndex) => {

                console.log(buttonIndex);
                //   this.setState({ clicked: BUTTONS[buttonIndex] });

                // Upload Normal Video
                if(buttonIndex==0){
                    // _SELF.logOutNow()
                    _SELF.chooseVideo();
                }
                else if(buttonIndex==1){ // upload youtube link
                    _SELF.setState({
                        showYoutubePopup: true,
                        youtube_link: {
                            val: '',
                            isErrRequired: false,
                        },
                        caption: {
                            val: '',
                            isErrRequired: false,
                        },
                    })
                    // _SELF.youtubeVideo();
                }

            });
        }
        else{

            // for android ask with alert message with button

            // Works on both iOS and Android
            Alert.alert(
            'Please select your video type',
            '', 
            [
                // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Youtube URL', onPress: () =>  {
                    
                    _SELF.setState({
                        showYoutubePopup: true,
                        youtube_link: {
                            val: '',
                            isErrRequired: false,
                        },
                        caption: {
                            val: '',
                            isErrRequired: false,
                        },
                    })

                    // _SELF.youtubeVideo()
                } },
                {text: 'Video', onPress: () =>  _SELF.chooseVideo() },
                
            ],
            { cancelable: false }
            )
        }

    };


    _uploadVideo = (caption, youtubeId = null) => {
        let that = this;
        // let _videoUUID = uuid.v4();

        if(youtubeId){
            let _photoUUID = uuid.v4();
            
            let url = '/api/media/videos/'+ _photoUUID +'/youtube';
            data ={
                video_id: youtubeId,
                caption: caption
            }
            data = JSON.stringify(data);

            console.log('url: ', url, ' == data', data);

            this.setState({
                loadingSubmitLink: !this.state.loadingSubmitLink
            })

            postApi(url, data).then((response) => {
                console.log('success response: ', response);
    
                if(response.code != 200){
                    alert('Can not upload the video. Please try again.');
                    return;
                }
    
                that.afterSuccessMediaPost(response, _photoUUID);

                that.hideShowYoutubePopup();

                let arrVideo = _.cloneDeep(that.state.video);
        
                let _id =0;
                if(arrVideo.length > 0)
                    _id = arrVideo.length;

                let vdo_idx = arrVideo.length + this.state.already_upload;

                arrVideo.push({
                    'id': _id, 
                    'uuid': _photoUUID,
                    'caption': caption,
                    'fileName': '', 
                    'media_type': 'youtube',
                    'uri': response.result.thumbnail_url_link, 
                    'thumbnail_url_link': response.result.thumbnail_url_link, 
                    'paused': true
                });

                console.log('==== arrVideo :', arrVideo);

                that.setState({
                    video: arrVideo,
                    idx: vdo_idx,
                    loadingSubmitLink: !this.state.loadingSubmitLink
                }, function(){
                    console.log('==== this.state.video :', this.state.video);
                });

                

            });
        }
        else{

            let vdoIdx = that.state.video.length - 1;
            let _videoUUID = that.state.tmpUUID;
            let url = '/api/media/videos/'+ _videoUUID +'/save';
            
            let vdo = that.state.video;
            vdo[vdoIdx].caption = caption;
            that.setState({
                video: vdo,
                idx: vdo.length
            });
            
            let data = [];

            if(Platform.OS === 'ios'){
                data.push({
                    name: 'video' , 
                    filename: that.state.video[vdoIdx].fileName, 
                    data: RNFetchBlob.wrap((that.state.video[vdoIdx].uri).replace('file://', '')), 
                    type:'video',
                    is_hd: true,
                    caption: caption
                })

            }else{
                data.push({
                    name: 'video',
                    filename: _videoUUID,
                    data: RNFetchBlob.wrap(that.state.video[vdoIdx].uri),
                    type: 'video',
                    is_hd: true, 
                    caption: caption
                })
            }

            url +='?by_pass=1&caption=' +  encodeURI(caption);

            console.log('Video Upload Url: ', url);
            // console.log('fileName: ', that.state.video[vdoIdx].fileName);
            postMedia(url, data, function(progress){
                //console.log('Upload process: ', progress);
                var percentage = Math.ceil(progress * 100);
                that.setState({txtUploading: percentage})
            })
            .then((response) => {
                console.log('success response: ', response);

                that.afterSuccessMediaPost(response, _videoUUID);

            });
        }

    }

    afterSuccessMediaPost = (response, _videoUUID) => {
        that.setState({isUploading: false});
        
        if(response.code != 200){
            alert('Can not upload the video. Please try again.');

            let vdoIndx = that.state.video.length - 1;
            // console.log('remove item from list cus of length > 60', vdoIdx);
            let allvdo = that.state.video;
            allvdo.splice(vdoIndx, 1);
            that.setState({
                video: allvdo,
                idx: allvdo.length
            });
            return;
        }

        // Disabled Skip Button when one video is uploaded
        that.setState({disableSkip: true});

        _userInfo.profile.video_uploaded_count++;
        // console.log("Last User Info : ",_userInfo);

        // store video that already upload for delete
        that.setState((previousState) => {
            // console.log('previousState.messages : ',previousState.messages);
            previousState.videoFromApi.push(response.result);
            return {
                startUpload: false,
                videoFromApi: previousState.videoFromApi
            };
        });


        if(_userInfo.videos){
            _userInfo.videos.push(response.result);
        }
        else{
            _userInfo = _.extend({
                videos: [response.result]
            }, _userInfo);
        }

        let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_userInfo));

        // UserHelper.UserInfo = _result; // assign for tmp user obj for helper
        _userData.then(function(result){
            // console.log('complete save sign up process 3'); 
        });

        // set cover on first upload image 
        if(!that.state.isFirstVideo && that.state.video.length==1){ 
            // let _photoId =  response.result._id;
            that._setProfileVideoFeature(_videoUUID);
            that.setState({
                isFirstVideo: true
            })
        }
    }

    // get photo that user already upload
    _getVideo = () => {
        // GET /api/media?type=photo or /api/media?type=video or  /api/media
        let that = this;
        
        let API_URL = '/api/media?type=video';
        // console.log(API_URL);
        getApi(API_URL).then((_response) => {
            // console.log('User Video Already Uploaded : ', _response);
            if(_response.code == 200){
                let _allImg = _response.result;

                console.log('User Video Already Uploaded : ', _response);
                let _tmp = [];
                _.each(_allImg,function(v,k){

                    let _videoUrl = v.s3_url + v.formatted_sd_video_url;

                    _tmp.push({
                        ...v,
                        'id': k, 
                        'uuid': v.upload_session_key, 
                        'fileName': v.file_name, 
                        'uri': v.media_type == 'video' ? _videoUrl : v.thumbnail_url_link, 
                        'paused': true,
                        isLocal: false,
                        'uuid': v.upload_session_key,
                        'is_featured': v.is_featured,
                        'caption': v.caption,
                    });
                })

                console.log('tmp: ', _tmp);

                that.setState({
                    disableSkip: _allImg.length>0 ? true: false,
                    videoFromApi: _allImg,
                    video: _tmp,
                    idx: _tmp.length
                })


                
            }

        });
    }

    _removeVideo = (_media, _mediaIndex) => {

        if(this.state.isUploading){
            alert('Please wait till the video is uploaded')
            return;
        }

        let that = this;
        let _mediaInfo = this.state.videoFromApi[_mediaIndex] ? this.state.videoFromApi[_mediaIndex] : null;

        // console.log('_mediaInfo : ', _mediaInfo);
        // console.log('this.state.videoFromApi : ', this.state.videoFromApi);

        if(_mediaInfo && _mediaInfo._id){

            let API_URL = '/api/media/videos/'+ _mediaInfo._id;

            // console.log('this.state.videoFromApi : ', this.state.videoFromApi);
            // console.log('_mediaIndex : ', _mediaIndex, ' === ', '_mediaInfo :', _mediaInfo);

            // return;

            deleteApi(API_URL).then((_response) => {
                console.log('Delete video : ', _response);
                if(_response.code == 200){

                    var _videoFromApi = _.filter(_.cloneDeep(that.state.videoFromApi), function(v,k) {
                        return k != _mediaIndex;
                    });
                    var _videoTmp = _.filter(_.cloneDeep(that.state.video), function(v,k) {
                        return k != _mediaIndex;
                    });

                    // console.log('_videoFromApi :', _videoFromApi);
                    // console.log('_videoTmp :', _videoTmp);

                    that.setState({
                        videoFromApi: _videoFromApi,
                        video: _videoTmp,
                        idx: _videoTmp.length
                    })

                    setTimeout(function(){
                        if(that.state.video.length <=0){
                            that.setState({
                                disableSkip: false,
                                isFirstVideo: false,
                            });
                        }
                    }, 50);
                }
            });
        }
        else{
            alert('Can not delete this video. Please try again.');
        }
    }

    _mediaOption = (_media, _mediaIndex) => {
        let _SELF = this;


        if(Helper._isIOS()){
            // popup message from bottom with ios native component
            ActionSheetIOS.showActionSheetWithOptions({

                message: 'Are you sure you want to delete this video?',
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,

            },
            (buttonIndex) => {

                // console.log(buttonIndex);
                //   this.setState({ clicked: BUTTONS[buttonIndex] });
                if(buttonIndex==0){
                    _SELF._removeVideo(_media, _mediaIndex)
                }

            });
        }
        else{

            // for android ask with alert message with button

            // Works on both iOS and Android
            Alert.alert(
            'Are you sure you want to delete this video?',
            '', 
            [
                // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Delete', onPress: () =>  _SELF._removeVideo(_media, _mediaIndex) },
            ],
            { cancelable: false }
            )
        }
    }

	componentDidMount() {

        GoogleAnalyticsHelper._trackScreenView('Sign Up - Upload Video');                 

		let _SELF = this;
		// init send bird
		sb = new SendBird({ appId: SEND_BRID_APP_ID });

        // if user not yet completed register
        // get all video that user upload 
        if(UserHelper._getUserInfo()){

            this._getVideo();
        }

    }


    componentWillMount(){
        const _SELF = this;

        DeviceEventEmitter.addListener('uploadAfterTrim', (data) => {
            console.log('Start Upload Video: ', data);
            this.initStaticVideo(data);
        })

    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('uploadAfterTrim');
    }

    chkVideoAlreadyUpload = (_item) => {
        
        if(_item.media_type == 'youtube')
            return true;

        let _tmpData = _.cloneDeep(this.state.videoFromApi);
        let _videoData = null;

        _.each(_tmpData, function(v,k){
            if(v.upload_session_key == _item.uuid){
                _videoData = v;
            }
        })

        return _videoData ? true : false;
    }

    _playVideoPopup = (_item) => {

        console.log('_playVideoPopup : ',_item);
        // this.setState({
        //     paused : !this.state.paused,
        // })
        // console.log('video click :', _id, ' =', _isMuted);
        let _tmpData = _.cloneDeep(this.state.videoFromApi);
        let _videoData = {};
        _.each(_tmpData, function(v,k){
            if(v.upload_session_key == _item.uuid){
                if(v.is_processing){
                    v.local_url = _item.uri;
                    v.localVideoThum = _item.videoThum;                    
                }
                _videoData = v;
            }
        })

        console.log('_videoData : ', _videoData);
        const { navigate, goBack, state } = this.props.navigation;
        navigate('VideoScreen',{video_data: _videoData, fromVideoUpload: true}); 

    }

    _playVideo = (_item) => {
        console.log('video item ',_item);
        if(!_item.isLocal && (!_item.s3_url || !_item.formatted_video_thumbnail_url)){
            alert('Video is being processed on server side. Please wait.');
            return;
        }
        this._playVideoPopup(_item)

        // console.log('Play Video', _item);
        let _videos = _.cloneDeep(this.state.video);
        _.each(_videos,function(v,k){
            if(v.id == _item.id){
                v.paused = !v.paused;
            }
            else{
                v.paused = true;
            }
        })
        this.setState({
            video: _videos
        })

        // console.log(this.state.video);
    }

    render() {
        return (    
                <View style={[styles.container,styles.mainScreenBg, this.state.disableSkip && {paddingBottom: 80}]} onPress={() =>  dismissKeyboard()}>
                
                    <YoutubePopup {...this.state} self={this} popupAction = {this.hideShowYoutubePopup} navigation={this.props.navigation} submitLink={this.youtubeVideo}  />

                    <ScrollView style={[ styles.justFlexContainer ]}> 
                        <View style={[styles.mainPadding]}>

                            <View style={[ styles.marginBotXS ]}>
                                <Text style={[styles.blackText, styles.btFontSize]}>
                                    Showcase your talent videos
                                </Text>
                                <Text style={[styles.grayLessText, styles.marginTopXS]}>
                                    Videos should be 1 min or less.
                                </Text>
                                <Text style={[ styles.marginTopMD, {color: Colors.primaryColor, textAlign:'right'} ]}>
                                    {this.state.video.length || 0}/4 Videos
                                </Text>
                                {this.state.isUploading && 
                                    <Text style={[ styles.marginTopMD, {color: Colors.primaryColor} ]}>
                                        Uploading: {this.state.txtUploading} %
                                    </Text>
                                }
                            </View>

                            <View style={[styles.boxWrapContainer, styles.boxWrapContainerNoWrap, {paddingTop: 20}]}> 
                                {this.state.video.map((item, index) => {
                                    {/*console.log(item);*/}
                                    return (
                                        <View key={ index }>
                                            <View style={[ styles.justFlexContainer ]}>
                                                <TouchableOpacity
                                                    activeOpacity = {0.9} 
                                                    style={[styles.boxWrapItem, styles.boxWrapItemNoWrap, index != this.state.video.length-1  && styles.marginBotSM, this.checkActiveTag(item) && styles.boxWrapSelected]} 
                                                    onPress={ () => this.selectedTag(item) }>
                                                    
                                                    <View style={[ styles.justFlexContainer ]}>

                                                        {/* { (item.media_type == 'video' && !item.file_key) && <Video source={{uri: item.uri}}   // Can be a URL or a local file. */}
                                                        { false && <Video source={{uri: item.uri}}   // Can be a URL or a local file.
                                                        
                                                            ref={(ref) => {
                                                                this.player = ref
                                                            }}                                      // Store reference
                                                            rate={1.0}                              // 0 is paused, 1 is normal.
                                                            volume={1.0}                            // 0 is muted, 1 is normal.
                                                            muted={true}                           // Mutes the audio entirely.
                                                            paused={true}                          // Pauses playback entirely.
                                                            resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
                                                            repeat={true}                           // Repeat forever.
                                                            playInBackground={false}                // Audio continues to play when app entering background.
                                                            playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
                                                            ignoreSilentSwitch={"ignore"}           // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual.
                                                            progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
                                                            //onLoadStart={this.loadStart}            // Callback when video starts to load
                                                            onLoad={this.onLoad}               // Callback when video loads
                                                            //onProgress={this.setTime}               // Callback every ~250ms with currentTime
                                                            //onEnd={this.onEnd}                      // Callback when playback finishes
                                                            //onError={this.videoError}               // Callback when video cannot be loaded
                                                            //onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                                            //onTimedMetadata={this.onTimedMetadata}  // Callback when the stream receive some metadata
                                                            style={styles.backgroundVideo} /> }

                                                        { item.isLocal && <Image
                                                            style={[styles.myAvatar, styles.mybgcover]}
                                                            //defaultSource={ require('@assets/banner-default.jpg') }
                                                            //component={ImageProgress}
                                                            source={{ uri: item.videoThum }} 
                                                            //indicator={ProgressCircle} 

                                                        /> }


                                                        { !item.isLocal && <CustomCachedImage
                                                            style={[styles.myAvatar, styles.mybgcover]}
                                                            defaultSource={ require('@assets/banner-default.jpg') }
                                                            component={ImageProgress}
                                                            source={{ uri: item.media_type == 'video' ? Helper._getVideoCover(item) : item.thumbnail_url_link }} 
                                                            indicator={ProgressCircle} 
                                                            onError={(e) => {

                                                                {/* console.log('error image view post : ', e); */}

                                                                GoogleAnalyticsHelper._trackException('Video Cover -  Sign Up == '); 

                                                                const _thumn = item.media_type == 'video' ? Helper._getVideoCover(item) : item.thumbnail_url_link;

                                                                ImageCache.get().clear(_thumn).then(function(e){
                                                                    console.log('clear thum ', e)
                                                                    ImageCache.get().bust(_thumn, function(e){
                                                                        console.log('bust', e);
                                                                    });
                                                                });

                                                            }}
                                                        /> }

                                                        {this.checkActiveTag(item) && (
                                                        
                                                            <View style={[styles.absoluteBox,styles.boxFeatured]}> 
                                                                <View style={[styles.boxWrapStatusContainer,styles.mainHorizontalPaddingSM]}> 
                                                                    <Text style={[styles.boxWrapSelectStatus, styles.fontBold]}>
                                                                        Featured
                                                                    </Text>
                                                                </View>
                                                            </View> 

                                                        )}
                                                    </View>
                                                </TouchableOpacity> 
                                                
                                                { this.chkVideoAlreadyUpload(item) && <TouchableOpacity style={[ styles.iconPlayBottomRight ]} onPress={() => this._playVideo(item) }>
                                                    <Icon 
                                                        //name={ item.paused==true ? 'play-circle-filled' : 'pause-circle-filled' }
                                                        name={ 'play-circle-filled' }
                                                        style={[ {color: 'white', fontSize: 40}, styles.shadowBox ]} 
                                                    />
                                                </TouchableOpacity> }

                                                <TouchableOpacity 
                                                    activeOpacity={.8}
                                                    style={[ 
                                                        styles.iconPlayTopRight,
                                                        {
                                                            top: -10,
                                                            right: -10,
                                                            backgroundColor: Colors.primaryColorDark,
                                                            borderRadius: 15,
                                                            padding: 3, 
                                                        }
                                                    ]} onPress={() => this._mediaOption(item, index) }>
                                                    <Icon 
                                                        name={ 'close' }
                                                        style={[ {color: 'white', fontSize: 22, backgroundColor: 'transparent'}, styles.shadowBox ]} 
                                                    />
                                                </TouchableOpacity>
                                            </View>    

                                            <View style = {styles.videoTitle}>
                                                <Text style={[styles.flatInputBoxFont]}>{item.caption}</Text>
                                            </View>
                                        </View>
                                    )
                                })}

                                { this.state.video.length >= 4 ? null :
                                    <TouchableOpacity
                                        activeOpacity = {0.9}
                                        style={[styles.boxWrapItem, styles.boxWrapItemNoWrap, styles.flexCenter, this.state.video.length>=1 && styles.marginTopSM]} 
                                        onPress={this.showActionSheetUploadVideo}>

                                        <IconCustom
                                            name="plus-gray-icon"
                                            style={[ styles.iconPlus ]} 
                                        />
                                    </TouchableOpacity> 
                                }
                            </View>
                        </View>
                    </ScrollView>
                    
                    <View style={styles.absoluteBox}>
                        <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                            <TouchableOpacity activeOpacity = {0.8} style={[styles.flatButton,{marginTop: 0}]} onPress={() => this.getStarted() }>
                                {   
                                    !this.state.joining ? <Text style={[styles.flatBtnText, styles.btFontSize]}>Get Started</Text> : <ActivityIndicator color="white" animating={true} /> 
                                }
                            </TouchableOpacity>
                            {!this.state.disableSkip && 
                                <View style={[styles.centerEle, styles.marginTopSM]}>
                                    <TouchableOpacity onPress={ () => { this.getStarted() } }>
                                        <Text style={styles.darkGrayText}> Skip this step </Text>
                                    </TouchableOpacity>
                                </View>
                            }

                        </View>
                    </View>

                    {this._prompt()}

                </View>
        );
    }

}


var styles = StyleSheet.create({ ...FlatForm, ...Utilities, ...BoxWrap,
    container: {
        flex: 1,
        paddingBottom: 115
    },
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingBottom: 200,
        // flexWrap: 'wrap'
    },
    txtContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch'
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    videoTitle:{
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        marginTop: 5,
        marginBottom: 15,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 10,
    },
    mybgcover:{
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    myAvatar:{
        // width: Dimensions.get('window').width / 3 - 10 ,
        // height: Dimensions.get('window').width / 3 - 10,
        // resizeMode: 'contain',
    },
});

export default connect(mapStateToProps, AuthActions)(UploadVideo)
