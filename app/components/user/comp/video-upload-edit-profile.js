import React, {Component} from 'react'
import {connect} from 'react-redux'
import * as DetailActions from '@actions/detail'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StatusBar,
    Alert,
    Picker,
    Platform,
    Dimensions,
    ActionSheetIOS,
    DeviceEventEmitter
} from 'react-native'

import {view_profile_category} from '@api/response'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';

import Styles from '@styles/card.style'
import {Colors} from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style';

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';
import ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { postMedia, postApi, putApi, getApi, deleteApi } from '@api/request';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';

import YoutubePopup from '@components/user/comp/youtube-link-popup';

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper} from '@helper/helper';

import _ from 'lodash'

import moment from 'moment'
import Prompt from 'react-native-prompt';


import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

import ImagePickerCrop from 'react-native-image-crop-picker';

const {width, height} = Dimensions.get('window')


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
//   var UPLOAD_YOUTUBE = 0;
//   var UPLOAD_VDIEO = 1;
  var CANCEL_INDEX_UPLOAD = 2;

export default class VideoUploadEditProfile extends Component {

    constructor(props) {
        super(props);

        
        this.state = {
            startUpload: false,
            tmpUUID: '',
            video:[],
            videoFromApi: [], // store video from api for delete
            idx: 0,
            isFirstVideo: false,
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

        that = this;

        // console.log('Video Props : ',this.props);

        // console.log('get all cache image :', ImageCache.get());

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


        const { navigate, goBack, state } = this.props.navigation;
        navigate('VideoScreen',{video_data: _videoData, fromVideoUpload: true}); 

    }
    
    _playVideo = (_item) => {

        // if(_item.file_key){
            this._playVideoPopup(_item)
            return;
        // }

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

    chooseVideo () {
        let that = this;
        
        // this.props.updateSpinerLoading();
        console.log('finished update spinder loading');
        // return;

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                that.props.updateSpinerLoading();
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                that.props.updateSpinerLoading();
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                console.log('Response: ', response);
                // return;
                // that.props.updateSpinerLoading();
                let _videoUri = Helper._isAndroid() ? response.path : response.uri
                // 
                if(!Helper._chkVideoExtension(_videoUri)){
                    if(Helper._isAndroid()){
                        Alert.alert('Android only support mp4 extension');
                        GoogleAnalyticsHelper._trackException('Android only support mp4 extension == ' + _videoUri); 
                    }
                    else{
                        Alert.alert('IOS only support mp4 or mov extension');
                        GoogleAnalyticsHelper._trackException('IOS only support mp4 or mov extension == ' + _videoUri);                         
                    }
                }
                else{
                    // this.props.updateSpinerLoading();
                    const { navigate, goBack, state } = this.props.navigation;
                    navigate('VideoTrimScreen',{video_data: response}); 
                }
                // return;

            }
        });


        // ImagePickerCrop.openPicker({
        //     mediaType: 'video',
        //     // includeBase64: true,
        //     compressVideoPreset: false,
        // }).then(response => {
        //     console.log('response :', response);
        //     // return;
        //     // const { navigate, goBack, state } = this.props.navigation;
        //     // navigate('VideoTrimScreen',{video_data: response}); 

        // }).catch(e => {
        //     console.log('error : ', e);
        // });

    }

    initStaticVideo = (response) => {
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
                'videoThum': response.videoThum,
                isLocal: true,                
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

    _uploadVideo(caption, youtubeId = null){

        // this.props.updateSpinerLoading();

        let vdoIdx = that.state.video.length - 1;
        let _videoUUID = that.state.tmpUUID;
        
        let url = '/api/media/videos/'+ _videoUUID +'/save';

        // console.log('VideoScreen ', state.params);

        let vdo = that.state.video;


        vdo[vdoIdx].caption = caption;
        that.setState({
            video: vdo,
            idx: vdo.length
        });

        const { navigate, goBack, state } = this.props.navigation;
        // navigate('VideoTrimScreen',{video_data: this.state.video[vdoIdx]}); 
        // return;

        let data = [];

        if(youtubeId){
            let _photoUUID = uuid.v4();
            
            url = '/api/media/videos/'+ _photoUUID +'/youtube';
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
                    that.props.updateSpinerLoading();
                    try{
                        GoogleAnalyticsHelper._trackException('Can not upload the youtube video. Please try again. == ' + JSON.stringify(response) );                                                                 
                    }catch(e){
                        GoogleAnalyticsHelper._trackException('Error send to google exception at upload youtube video');                                                                                         
                    }
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
                    that.props.updateSpinerLoading();
                    console.log('==== this.state.video :', this.state.video);
                });

                

            });
        }
        else{
            if(Platform.OS === 'ios'){
                data.push({
                    name: 'video' , 
                    filename: that.state.video[vdoIdx].fileName, 
                    data: RNFetchBlob.wrap((that.state.video[vdoIdx].uri).replace('file://', '')), 
                    type:'video',
                    is_hd: true
                })

            }else{
                data.push({
                    name: 'video',
                    filename: _videoUUID,
                    data: RNFetchBlob.wrap(that.state.video[vdoIdx].uri),
                    type: 'video',
                    is_hd: true
                })
            }
            url +='?by_pass=1&caption=' +  encodeURI(caption);

            // console.log('that.state.video[vdoIdx]', that.state.video[vdoIdx]);
            // return;

            postMedia(url, data).then((response) => {
                console.log('success response: ', response);
    
                if(response.code != 200){
                    // that.props.updateSpinerLoading();
                    try{
                        GoogleAnalyticsHelper._trackException('Can not upload the video. Please try again. == ' + JSON.stringify(response) );                                                                
                    }catch(e){
                        GoogleAnalyticsHelper._trackException('Error send to google exception at upload video');                                                                                         
                    }                                             
                    alert('Can not upload the video. Please try again.');
                    return;
                }

                that.afterSuccessMediaPost(response, _videoUUID, that.state.video[vdoIdx]);
                // that.props.updateSpinerLoading();
                
            });

        }



    }


    afterSuccessMediaPost = (response, _videoUUID, localVideo) => {

        // console.log("Last User Info : ",_userInfo);

        let _tmpVideoDataStorage =  StorageData._loadInitialState('TmpVideoData');        
        _tmpVideoDataStorage.then(function(result){ 

            let _tmpVideoData = [];

            if(result){
                _tmpVideoData = JSON.parse(result);
            }
            
            
            _tmpVideoData.push(localVideo)


            console.log('_tmpVideoData : ', _tmpVideoData)
            DeviceEventEmitter.emit('UpdateTmpVideoData',  {tmpVideoData: _tmpVideoData})
            let _tmpUpdateVideoDataStorage =  StorageData._saveUserData('TmpVideoData',JSON.stringify(_tmpVideoData));
            
            _tmpUpdateVideoDataStorage.then(function(result){
                console.log('TalenUserData', result); 
            });

        });

        // _userInfo = _.cloneDeep(UserHelper.UserInfo);

        // store video that already upload for delete
        that.setState((previousState) => {
            // console.log('previousState.messages : ',previousState.messages);
            previousState.videoFromApi.push(response.result);

            return {
                startUpload: false,
                videoFromApi: previousState.videoFromApi,
                // video: _tmpAllVideo,
                // idx: _tmpAllVideo.length
            };
        }, function(){
            console.log('Video State : ', this.state);
        });


        // if(_userInfo.videos){
        //     _userInfo.videos.push(response.result);
        // }
        // else{
        //     _userInfo = _.extend({
        //         videos: [response.result]
        //     }, _userInfo);
        // }

        // set cover on first upload image 
        if(!that.state.isFirstVideo && that.state.video.length==1){ 
            // let _photoId =  response.result._id;
            that._setProfileVideoFeature(_videoUUID);
            that.setState({
                isFirstVideo: true
            })
        }
        // this.state

        DeviceEventEmitter.emit('updateProfileInfo',  {update_video: true})

        return;
        setTimeout(function(){
            // trigger to force flatlist re-render
            // DeviceEventEmitter.emit('updateProfileInfo',  {update_video: true})
            const { navigate, goBack, state, setParams } = that.props.navigation;
            setParams({
                updateUserVideoList: true
            }); 
        },5000)
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

                    // ImageCache.get().bust(Helper._getVideoCover(v));
                    ImageCache.get().dispose(Helper._getVideoCover(v), {});

                    _tmp.push({
                        ...v,
                        'id': k, 
                        'uuid': v.upload_session_key, 
                        'fileName': v.file_name, 
                        'uri': _videoUrl, 
                        'paused': true,
                        isLocal: false,
                        'uuid': v.upload_session_key,
                        'is_featured': v.is_featured,
                    });
                })

                that.setState({
                    videoFromApi: _allImg,
                    video: _tmp,
                    idx: _tmp.length
                }, function(){
                    console.log('After Get Video: ', this.state);
                })

                console.log('get all cache image :', _.cloneDeep(ImageCache.get()));
                
                
            }

        });
    }

    _removeVideo = (_media, _mediaIndex) => {
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
                    }, function(){
                        // trigger to force flatlist re-render
                        DeviceEventEmitter.emit('updateProfileInfo',  {update_video: true})
                    })

                    
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
        // this.props.updateSpinerLoading();
        // if user not yet completed register
        // get all video that user upload 
        // if(UserHelper._getUserInfo()){

        //     this._getVideo();
        // }
    }

    _prompt = () =>{
        console.log("Prompt calling");
        return (
            <Prompt
                title=''
                placeholder="Title"
                //defaultValue="Hello"
                visible={this.state.promptVisible}
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

    componentWillMount(){

        if(UserHelper._getUserInfo()){
            this._getVideo();
        }

        const _SELF = this;
        DeviceEventEmitter.addListener('PausedAllVideosSetting', (data) => {
            // console.log('WOW Paused All Videos : ', data);
            console.log('_SELF.refs : ',_SELF.refs);

            let _tmpData = _.cloneDeep(_SELF.state.video);  

            _.each(_tmpData, function(v,k){
                v.paused = true;
            });

            // console.log('_tmpData : ',_tmpData);
            this.setState({
                video: _tmpData
            }, () => {

            });
        })

        DeviceEventEmitter.addListener('uploadAfterTrim', (data) => {
            console.log('Start Upload Video: ', data);
            this.initStaticVideo(data);
        })

    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('PausedAllVideosSetting');
        DeviceEventEmitter.removeListener('uploadAfterTrim');
    }

    render() {
        const { navigate, goBack, state } = this.props.navigation;

        // {console.log("This is the information of the user: ", this.props.userInfo)}
        return ( 
            <View style={[ styles.justFlexContainer ]}>

                <YoutubePopup {...this.state} self={this} popupAction = {this.hideShowYoutubePopup} navigation={this.props.navigation} submitLink={this.youtubeVideo}  />

                <View style={[styles.marginBotMD1]}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:0.7}}>
                            <Text style={{fontWeight:'bold'}}>
                                Videos
                            </Text>
                        </View>  
                        <View style={{flex:0.3}}>
                            <Text style={[ {color: Colors.primaryColor, textAlign:'right'} ]}>
                                {this.state.video.length || 0}/4 Videos
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={[styles.boxWrapContainer, styles.boxWrapContainerNoWrap,{flexDirection: 'row',justifyContent:'flex-start', paddingTop: 20}]}>

                        {this.state.video.map((item, index) => {
                            {/*console.log(item);*/}
                            return (
                                <View key={ index } style={[ styles.justFlexContainer ]}>

                                    <TouchableOpacity
                                        activeOpacity = {0.9} 
                                        style={[styles.boxWrapItem, styles.boxWrapItemNoWrap, this.checkActiveTag(item) && styles.boxWrapSelected, {width:300,marginRight:10}]} 
                                        onPress={ () => this.selectedTag(item) }>
                                        <View style={[ styles.justFlexContainer ]}>

                                            { false &&  <Video source={{uri: item.uri}}   // Can be a URL or a local file.
                                                ref={(ref) => {
                                                    this.player = ref
                                                }}                                      // Store reference
                                                rate={1.0}                              // 0 is paused, 1 is normal.
                                                volume={1.0}                            // 0 is muted, 1 is normal.
                                                muted={true}                           // Mutes the audio entirely.
                                                paused={true}                          // Pauses playback entirely.
                                                resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
                                                repeat={true}      // Repeat forever.
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

                                            {/* { item.file_key && <Image
                                                style={[styles.myAvatar, styles.mybgcover]}
                                                //defaultSource={ require('@assets/banner-default.jpg') }
                                                //component={ImageProgress}
                                                source={{ uri: item.media_type == 'video' ? Helper._getVideoCover(item) : item.thumbnail_url_link }} 
                                                //indicator={ProgressCircle} 
                                            /> } */}

                                            { item.isLocal && <Image
                                                style={[styles.myAvatar, styles.mybgcover]}
                                                source={{ uri: item.videoThum }} 
                                            /> }

                                            { !item.isLocal && <CustomCachedImage
                                                style={[styles.myAvatar, styles.mybgcover]}
                                                defaultSource={ require('@assets/banner-default.jpg') }
                                                component={ImageProgress}
                                                source={{ uri: item.media_type == 'video' ? Helper._getVideoCover(item) : item.thumbnail_url_link }} 
                                                indicator={ProgressCircle} 
                                                onError={(e) => {

                                                    {/* console.log('error image view post : ', e); */}

                                                    GoogleAnalyticsHelper._trackException('Video Cover - Edit Profile == '); 

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

                                    { this.chkVideoAlreadyUpload(item) && <TouchableOpacity style={[ styles.iconPlayBottomRight, {right: 25} ]} onPress={() => this._playVideo(item) }>
                                        <Icon 
                                            name={ item.paused==true ? 'play-circle-filled' : 'pause-circle-filled' }
                                            style={[ {color: 'white', fontSize: 40}, styles.shadowBox ]} 
                                        />
                                    </TouchableOpacity> }

                                    <TouchableOpacity 
                                    activeOpacity={.8}
                                    style={[ styles.iconPlayTopRight, {
                                            top: -10,
                                            right: 2,
                                            backgroundColor: Colors.primaryColorDark,
                                            borderRadius: 15,
                                            padding: 3,
                                        } ]} onPress={() => this._mediaOption(item, index) }>
                                        <Icon 
                                            name={ 'close' }
                                            style={[ {color: 'white', fontSize: 18, backgroundColor: 'transparent'}, styles.shadowBox ]} 
                                        />
                                    </TouchableOpacity>
                                </View>    
                            )
                        })}

                        { this.state.video.length >= 4 ? null : 
                            
                                <TouchableOpacity
                                    activeOpacity = {0.9}
                                    style={[styles.boxWrapItem, styles.boxWrapItemNoWrap, styles.flexCenter,{width:300,marginRight:20}]} 
                                    //onPress={this.chooseVideo.bind(this)}
                                    onPress={this.showActionSheetUploadVideo}
                                    >

                                    <IconCustom
                                        name="plus-gray-icon"
                                        style={[ styles.iconPlus ]} 
                                    />
                                </TouchableOpacity>
                                
                        
                        }

                    </View>
                </ScrollView>

                {this._prompt()}

            </View>
     
        );

    }

}
var styles = StyleSheet.create({ ...FlatForm, ...Utilities, ...BoxWrap,
    container: {
        flex: 1,
        paddingBottom: 120
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