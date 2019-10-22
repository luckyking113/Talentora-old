import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    AppState,
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    DeviceEventEmitter,
    Alert
} from 'react-native'

import Video from 'react-native-video';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';

import BoxWrap from '@styles/components/box-wrap.style';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'

import _ from 'lodash'
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

import { VideoPlayer, Trimmer, ProcessingManager } from 'react-native-video-processing';

const { width, height } = Dimensions.get('window')

function mapStateToProps(state) {
    return {
        // detail: state.detail
    }
}

class VideoTrimView extends React.Component {

    constructor(props){
        super(props)

        const { navigate, goBack, state } = this.props.navigation;

        this.videoOption = {
            currentTime: 0
        }

        this.state = {
            isTriming: false,
            showLoading: null,
            isPaused: false,
            isLoaded: false,
            mute: false,
            totalVideoDuration: 0,
            videoInfo: {},
            trimOption: {
                trimStart: 0,
                trimEnd: 0,
            },
            video : {
                data: state.params.video_data,
                currentTime: 0,
            }
        }

        this.getPreviewImageForSecond = this.getPreviewImageForSecond.bind(this);
        
        // navigate('VideoScreen',{video_data: _videoData}); 
        console.log('VideoScreen ', this.state);

    }

    static navigationOptions = ({ navigation }) => ({
        headerTitle: navigation.state.params.video_data.caption,  
        headerVisible: false,  
        // headerLeft: null,
    }); 

    getPreviewImageForSecond(second){

        try{
            const maximumSize = { width: 640, height: 1024 }; // default is { width: 1080, height: 1080 } iOS only
            let source = this._getVideoPathOrUrl(this.state.video.data);
            console.log('source : ', source);

            ProcessingManager.getPreviewForSecond(source, second, maximumSize, 'JPEG') // maximumSize is iOS only
            .then((prev) => {
                console.log('This is BASE64 of image', prev)
                let _videoData = _.cloneDeep(this.state.video);
                _videoData.data.videoThum = prev.uri;
                this.setState({
                    video: _videoData 
                }, function(){
                    console.log('this.state.video :',this.state.video);
                })
            })
            .catch((e) =>  console.warn(e));
        }catch(e){
            console.log('error preview image : ', e);
        }

    }

    trimVideo() {

        if(this.isTriming)
            return;

        let options = {};

        this.setState({
            isTriming: true
        })

        if(Helper._isAndroid()){
            options = {
                startTime: this.state.trimOption.trimStart,
                endTime: this.state.trimOption.trimEnd,
            }
        }
        else{
            options = {
                startTime: this.state.trimOption.trimStart,
                endTime: this.state.trimOption.trimEnd,
                quality: VideoPlayer.Constants.quality.QUALITY_1280x720, // iOS only
                saveToCameraRoll: false, // default is false // iOS only
                saveWithCurrentDate: false, // default is false // iOS only
            };
        }

        // this.videoPlayerRef.trim(options)
        //     .then((newSource) => console.log(newSource))
        //     .catch(console.warn);
        console.log('options : ', options);
        
        // return;

        if(this.state.totalVideoDuration.toFixed(0) > 60.0){
            Alert.alert('The video length must be 1 minute max!');
            this.setState({
                isTriming: false
            })
            return;
        }

        try{
            
            this.getPreviewImageForSecond(this.state.trimOption.trimStart);

        }catch(e){
            GoogleAnalyticsHelper._trackException('Get Preview Image Video Trim (Trim Start Second) == ' + JSON.stringify(e));
            try{

                this.getPreviewImageForSecond(0);

            }catch(_e){
                GoogleAnalyticsHelper._trackException('Get Preview Image Video Trim (0sec) == ' + JSON.stringify(_e));
            }
        }
        

        ProcessingManager.trim(this._getVideoPathOrUrl(this.state.video.data), options) // like VideoPlayer trim options
        .then((videoTrimUri) => {
            console.log('videoTrimUri: ', videoTrimUri);
            let _videoInfo = _.cloneDeep(this.state.video.data);
            _videoInfo.uri = videoTrimUri;
            console.log('_videoInfo: ', _videoInfo);
            
            DeviceEventEmitter.emit('uploadAfterTrim', _videoInfo);
            const { navigate, goBack, state } = this.props.navigation;
            goBack();

            // return;

            // ProcessingManager.getVideoInfo(videoTrimUri)
            // .then(({ duration, size }) => {
            //     console.log('Duration: ',duration, ' == Size: ', size)
            //     if(duration > 61.0){
            //         Alert.alert('The video length must be 1 minute max!');
            //         this.setState({
            //             isTriming: false
            //         })
            //     }
            //     else{
            //         // Alert.alert('Good video length!');
            //         // return;                    
            //         DeviceEventEmitter.emit('uploadAfterTrim', _videoInfo);
            //         const { navigate, goBack, state } = this.props.navigation;
            //         goBack();
            //     }
            // });

        }).catch(console.warn);


    }


    compressVideo() {
        const options = {
            width: 720,
            height: 1280,
            bitrateMultiplier: 3, // iOS only
            saveToCameraRoll: true, // default is false, iOS only
            saveWithCurrentDate: true, // default is false, iOS only
            minimumBitrate: 300000, // iOS only
            removeAudio: true, // default is false
        };

        ProcessingManager.compress(this._getVideoPathOrUrl(this.state.video.data), {
            width: 720,
            height: 1280,
        }) // like VideoPlayer compress options
        .then((data) => console.log(data));

        // this.videoPlayerRef.compress(options)
        //     .then((newSource) => console.log(newSource))
        //     .catch(console.warn);
    }

    getVideoInfo(_videoUri=null) {
        // this.videoPlayerRef.getVideoInfo()
        // .then((info) => console.log(info))
        // .catch(console.warn);
        try{

            ProcessingManager.getVideoInfo(_videoUri || this._getVideoPathOrUrl(this.state.video.data))
            .then(({ duration, size }) => {

                this.setState({
                    totalVideoDuration: duration,
                    videoInfo : {
                        duration: duration,
                        size: size
                    },
                    trimOption: {
                        trimStart: 0,
                        trimEnd: duration,
                    }
                })
                console.log('Duration: ',duration, ' == Size: ', size)

            }).catch(err => console.error(err));

        }catch(e){
            console.log('video error: ', e)
        }

    }

    videoLoaded = (e) => {
        console.log('video loaded :', e);
        this.setState({
            isLoaded: true
        })
        // setTimeout(() => {
        //     this.player.seek(100)
        // }, 100);
    }

    _onErrorVideoLoaded = (err) => {
        console.log('Video Loaded Error: ', err);
    }

    setTime = (_progress) => {
        // console.log('onProgress: ', _progress);
    }

    onEnd = (err) => {
        console.log('onEnd: ', err);
    }

    onBuffer = (err) => {
        console.log('onBuffer: ', err);
    }
    
    onTimedMetadata = (err) => {
        console.log('onTimedMetadata: ', err);
    }

    toggleVideoPlay = () => {
        this.setState({
            isPaused: !this.state.isPaused
        })
    }

    _toggleMuted = () =>{
        this.setState({
            muted: !this.state.muted
        })
    }

    _getVideoPathOrUrl = (_videoData) => {
        // return 'file:///data/user/0/co.talentora.app/cache/627a750f-d4d0-40e2-8bb4-11790c4c6058-screenshot197067753.mp4';
        return Helper._isAndroid() ? 'file://'+_videoData.path : _videoData.uri;
        // return Helper._isAndroid() ? _videoData.path : _videoData.uri;
        // return Helper._isAndroid() ? _videoData.uri : _videoData.uri;
    }

    _getTotalVideoDuration = (_start, _end) => {

        _start = _start * (Helper._isAndroid() ? (1000) : 1);
        _end = _end * (Helper._isAndroid() ? (1000) : 1);

        let _tolalDuration = this.state.videoInfo.duration - (_start + (this.state.videoInfo.duration - _end));

        this.setState({
            totalVideoDuration: _tolalDuration
        })

        console.log('_getTotalVideoDuration : ', _tolalDuration);

    }

    componentDidMount(){
        // this.getVideoInfo();
    }

    componentWillMount() {
        GoogleAnalyticsHelper._trackScreenView('Video Trim'); 
        // try{

        //     this.getPreviewImageForSecond(0.1);

        // }catch(e){
        //     GoogleAnalyticsHelper._trackException('Get Preview Image Video Trim (0.1sec) == ');
        //     try{

        //         this.getPreviewImageForSecond(0);

        //     }catch(_e){
        //         GoogleAnalyticsHelper._trackException('Get Preview Image Video Trim (0sec) == ');
        //     }
        // }
    }

    render() {
        const { navigate, goBack, state } = this.props.navigation;
        
        try{

            return (

                <View style={[ styles.justFlexContainer, { backgroundColor: 'black', paddingTop: 30 } ]}>
                    
                        
                    <View style={[ {height: 60} ]}>

                        <Trimmer
                            source={ this._getVideoPathOrUrl(this.state.video.data) }
                            height={30}
                            width={width}
                            onTrackerMove={(e) => {
                                {/* console.log('e.currentTime: ', e.currentTime); */}
                                {/* this.player.seek(e.currentTime); */}
                            }} // iOS only
                            currentTime={this.videoOption.currentTime} // use this prop to set tracker position iOS only
                            themeColor={'white'} // iOS only 
                            thumbWidth={20} // iOS only
                            trackerColor={'green'} // iOS only
                            onChange={(e) => {

                                console.log('Start :', e.startTime* (Helper._isAndroid() ? (1000) : 1), ' == ', 'End: ', e.endTime * (Helper._isAndroid() ? (1000) : 1), 'Player: ');
                                this.player.seek(e.startTime * (Helper._isAndroid() ? (1000) : 1));
                                    
                                this._getTotalVideoDuration(e.startTime, e.endTime);

                                this.setState({
                                    trimOption: {
                                        trimStart: e.startTime * (Helper._isAndroid() ? (1000) : 1),
                                        trimEnd: e.endTime * (Helper._isAndroid() ? (1000) : 1),
                                    }
                                })
                                {/* this.player.seek(e.startTime) */}
                            }}
                        />

                    </View>
                        
                    <View style={[styles.justFlexContainer, styles.middleSection]}>
                        <TouchableOpacity activeOpacity={.9} onPress={() => this.toggleVideoPlay()} style={[styles.justFlexContainer, styles.imgContainer]}> 

                            {/* { !Helper._isAndroid() &&  */}
                            <Video source={{ uri: this._getVideoPathOrUrl(this.state.video.data) }}   // Can be a URL or a local file.                             // Store reference
                                ref={(ref) => {
                                    this.player = ref
                                }}  
                                rate={1.0}                              // 0 is paused, 1 is normal.
                                volume={1.0}                            // 0 is muted, 1 is normal.
                                muted={this.state.muted}                            // Mutes the audio entirely.
                                paused={this.state.isPaused}                          // Pauses playback entirely.
                                resizeMode="contain"                      // Fill the whole screen at aspect ratio.*
                                controls={false}
                                repeat={true}                           // Repeat forever.
                                //autoplay={false}                           // Repeat forever.
                                playInBackground={false}                // Audio continues to play when app entering background.
                                playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
                                ignoreSilentSwitch={"ignore"}           // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual.
                                progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
                                style={[styles.backgroundVideo, { backgroundColor: 'black', opacity: 0}, this.state.isLoaded && {opacity: 1}, styles.justFlexContainer]}
                                onLoad={this.videoLoaded}               // Callback when video loads

                                onProgress={this.setTime}               // Callback every ~250ms with currentTime
                                onEnd={this.onEnd}                      // Callback when playback finishes
                                onError={this._onErrorVideoLoaded}               // Callback when video cannot be loaded
                                onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                onTimedMetadata={this.onTimedMetadata}  // Callback when the stream receive some metadata
                            />
                            {/* } */}

                            { this.state.showLoading && <View style={[ styles.iconContainer, {backgroundColor:'rgba(0, 0, 0, 0.2)'} ]}>
                                <ActivityIndicator animating color="white" size="small" />
                            </View> }
                            
                        </TouchableOpacity>

                        { (this.state.isPaused && !this.state.showLoading) && <TouchableOpacity onPress={ () => this.toggleVideoPlay()} activeOpacity={.8} style={[styles.iconContainer,{backgroundColor:'rgba(0, 0, 0, 0.2)'}  ]}>
                            
                                <Icon
                                    tintColor={"#fff"}
                                    name={'play-circle-filled'}  
                                    style={[ styles.myiconUploadAvatar ]} 
                                />
                        
                        </TouchableOpacity> }



                        {/* <TouchableOpacity onPress={ () => this._toggleMuted()} style={[ styles.mutedButton, {padding: 10, right: 0}, this.props.paused && {opacity: 0} ]} activeOpacity={.8}>
                            <Icon 
                                tintColor={"#fff"}
                                name={ !this.state.muted ? 'volume-up' : 'volume-mute'}  
                                style={[ styles.volumnIcon, {fontSize: 20, color: 'white', backgroundColor: 'transparent'} ]}
                            />
                        </TouchableOpacity> */}


                        <View style={[ styles.trimInfo ]}>
                            <View style={[ styles.trimInfoContainer ]}>
                                {/* {console.log('This is video length: ', this.state.totalVideoDuration)} */}
                                {}
                                <Text style={[ styles.durationLabel ]}>Duration { Helper.formatVideoDuration( this.state.totalVideoDuration) } seconds</Text>
                                <Text style={[ styles.maxDurationLabel ]}>Max Duration 60 seconds</Text>
                            </View>
                        </View>                    


                    </View>

                                
                    <View style={[ styles.trimAction ]}>

                        <TouchableOpacity onPress={ () => goBack()} style={[ {padding: 10} ]} activeOpacity={.8}>
                            <Text style={[ {color: 'white'} ]}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={ () => this.trimVideo()} style={[ styles.btnTrim ]} activeOpacity={.8}>
                            { !this.state.isTriming && <Text style={[ styles.btnText ]}>Trim</Text> }
                            { this.state.isTriming && <ActivityIndicator color="black" animating={true} /> }
                        </TouchableOpacity>

                    </View>

                    {/* <TouchableOpacity activeOpacity={.9} onPress={() => goBack() } style={[styles.btnClose]}> 
                        <Icon name={'close'} style={{ fontSize:24, color: 'white', backgroundColor: 'transparent' }} />
                    </TouchableOpacity> */}

                </View>
                
            );

        }catch(e){
            console.log('errr : ', e)
        }

    }

}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,
    middleSection:{
        alignItems: 'stretch',
        // height:300
    },
    btnClose: {
        position: 'absolute',
        top:0,
        right: 0,
        padding: 15,
        zIndex: 999,
    },
    backgroundVideo: {
        position: 'absolute',
        bottom:0,
        right: 0,
        left: 0,
        top: 0,
        // height: 500,
    },
    mybgcover:{
        flex: 1,
        width: null,
        height: null,
        // resizeMode: 'cover'
    },
    myAvatar:{
        // width: Dimensions.get('window').width / 3 - 10 ,
        // height: Dimensions.get('window').width / 3 - 10,
        resizeMode: 'contain',
    },
    iconContainer:{
        position:'absolute',
        top:0,
        bottom:0,
        left:0,
        right:0,
        alignItems:'center',
        justifyContent:'center'
    },
    myiconUploadAvatar:{
        fontSize: 70,
        color: "rgba(255,255,255,0.6)",
        // color: "rgba(0,0,0,0.8)",
        backgroundColor: 'transparent'
    },
    mutedButton:{
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        bottom: 8,
        padding: 0,
        right: 0,
    },
    trimAction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },

    btnTrim: {
        backgroundColor: 'white', 
        padding: 10,
        width: 150,
        borderRadius: 75,   
    },

    btnText: {
        color: 'black',
        textAlign: 'center',
    },

    trimInfo: {
        position: 'absolute',
        top: 10,
        flex: 1,
        // backgroundColor: 'red',
        width: width,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },

    trimInfoContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)', 
        padding: 5,
        width: 160,
        borderRadius: 75,   
    },

    durationLabel: {
        color: 'white',
        textAlign: 'center',
        fontSize: 13,
    },

    maxDurationLabel: {
        color: 'yellow',
        textAlign: 'center',
        fontSize: 10,
    }

})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps)(VideoTrimView)
