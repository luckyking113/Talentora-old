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
    DeviceEventEmitter
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

// import YouTube from 'react-native-youtube'
// import { YouTubeStandaloneAndroid } from 'react-native-youtube';
import YouTube, { YouTubeStandaloneIOS, YouTubeStandaloneAndroid } from 'react-native-youtube';
const { width, height } = Dimensions.get('window')

function mapStateToProps(state) {
    return {
        // detail: state.detail
    }
}

class VideoView extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            showLoading: null,
            isPaused: false,
            isLoaded: false,
            mute: false,
        }

        const { navigate, goBack, state } = this.props.navigation;
        // navigate('VideoScreen',{video_data: _videoData}); 

        console.log('VideoScreen ', state.params);

        // if(state.params.fromVideoUpload){
        //     console.log('remove cache image')
        //     ImageCache.get().bust(Helper._getVideoCover(state.params.video_data));
        // }

    }

    static navigationOptions = ({ navigation }) => ({
        headerTitle: navigation.state.params.video_data.caption,  
        headerVisible: false,  
        // headerLeft: null,
    }); 

    videoLoaded = (e) => {
        console.log('video loaded :', e);
        this.setState({
            isLoaded: true
        })
    }

    _onErrorVideoLoaded = (err) => {
        console.log('Video Loaded Error: ', err);
    }

    setTime = (_progress) => {
        console.log('onProgress: ', _progress);
        if(_progress.currentTime>0){
            if(this.state.showLoading){
                this.setState({
                    showLoading: false
                })
            }
        }
    }

    onEnd = (err) => {
        // console.log('onEnd: ', err);
    }

    onBuffer = (err) => {
        console.log('onBuffer: ', err);

        if(!this.state.showLoading && !this.state.isPaused){
            this.setState({
                showLoading: true
            })
        }

    }
    
    onTimedMetadata = (err) => {
        // console.log('onTimedMetadata: ', err);
    }

    toggleVideoPlay = () => {
        this.setState({
            isPaused: !this.state.isPaused
        })
    }

    componentDidMount() {

        GoogleAnalyticsHelper._trackScreenView('Play Video Popup');                 

        // console.log('YouTube :', YouTube);

        this.setState({
            showLoading: true
        })
    }

    // listen app close or active to paused or play video
    appStateChange = (currentAppState) => {
        if (currentAppState === 'active') {
            this.setState({
                isPaused: false
            })
        } else if (currentAppState === 'background') {
            this.setState({
                isPaused: true
            })
        }
    }

    componentWillMount() {
        AppState.addEventListener('change', this.appStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.appStateChange);
        DeviceEventEmitter.emit('AllowViewVideo');        
    }

    _toggleMuted = () =>{
        this.setState({
            muted: !this.state.muted
        })
    }

    render() {
        const { navigate, goBack, state } = this.props.navigation;

        /*if(_.isEmpty(this.state.allJobList))
            return (
                
                <View style={[ styles.defaultContainer ]}>

                    <Text style={[styles.blackText, styles.btFontSize]}>
                        You’ve not post any jobs yet.
                    </Text>

                    <Text style={[styles.grayLessText, styles.marginTopXS]}>
                        Post a job in less than 30 seconds.
                    </Text>

                </View>
            );
        else{*/
            return (

                <View style={[ styles.justFlexContainer, { backgroundColor: 'black' } ]}>
                    
                        
                        
                    <View style={[styles.justFlexContainer, styles.middleSection, {overflow: 'hidden'}]}>
                        <TouchableOpacity activeOpacity={.9} onPress={() => this.toggleVideoPlay()} style={[styles.justFlexContainer, styles.imgContainer]}> 

                            { (!this.state.isLoaded && !state.params.fromVideoUpload && !state.params.video_data.isLocal) && <CustomCachedImage
                                style={[styles.myAvatar, styles.mybgcover]}
                                defaultSource={ require('@assets/banner-default.jpg') }
                                component={ImageProgress}
                                source={{ uri: Helper._getVideoCover(state.params.video_data) }} 
                                indicator={ProgressCircle}
                                onError={(e) => {

                                    {/* console.log('error image view post : ', e); */}

                                    GoogleAnalyticsHelper._trackException('View Video Cover == '); 

                                    const _thumn = Helper._getVideoCover(state.params.video_data);

                                    ImageCache.get().clear(_thumn).then(function(e){
                                        console.log('clear thum ', e)
                                        ImageCache.get().bust(_thumn, function(e){
                                            console.log('bust', e);
                                        });
                                    });

                                }} 
                            /> } 

                            {/* {console.log('This is video: ', this.state.isLoaded, state.params.fromVideoUpload, state.params.video_data, state.params.video_data.isLocal )}

                            { (!this.state.isLoaded && state.params.fromVideoUpload && !state.params.video_data.isLocal) && <Image
                                style={[styles.myAvatar, styles.mybgcover]}
                                source={{ uri: Helper._getVideoCover(state.params.video_data) }} 
                            /> }  */}


                            {state.params.video_data.media_type == 'youtube' && <YouTube
                                apiKey="AIzaSyCkiy4xwm28s264LLK7khKDjIQ6tlRlLrA"
                                videoId={state.params.video_data.video_id}   // The YouTube video ID
                                play={true}             // control playback of video with true/false
                                fullscreen={true}       // control whether the video should play in fullscreen or inline
                                loop={true}             // control whether the video should loop when ended

                                onReady={e => this.videoLoaded()}
                                onChangeState={e => this.setState({ status: e.state })}
                                onChangeQuality={e => this.setState({ quality: e.quality })}
                                onError={e => console.log('error load youtube video: ', e)}

                                style={[styles.backgroundVideo, { backgroundColor: 'black', opacity: 1}, this.state.isLoaded && {opacity: 1}, styles.justFlexContainer]}
                            /> }

                            {state.params.video_data.media_type == 'video' && <Video source={{ uri: Helper._getFullVideoURL(state.params.video_data) }}   // Can be a URL or a local file.                             // Store reference
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
                                //progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
                                style={[styles.backgroundVideo, { backgroundColor: 'black', opacity: 0}, this.state.isLoaded && {opacity: 1}, styles.justFlexContainer]}
                                onLoad={this.videoLoaded}               // Callback when video loads

                                onProgress={this.setTime}               // Callback every ~250ms with currentTime
                                onEnd={this.onEnd}                      // Callback when playback finishes
                                onError={this._onErrorVideoLoaded}               // Callback when video cannot be loaded
                                onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                onTimedMetadata={this.onTimedMetadata}  // Callback when the stream receive some metadata
                            />}

                            { ( this.state.showLoading) && <View style={[ styles.iconContainer, {backgroundColor:'rgba(0, 0, 0, 0.2)'} ]}>
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



                        <TouchableOpacity onPress={ () => this._toggleMuted()} style={[ styles.mutedButton, {padding: 10, right: 0}, this.props.paused && {opacity: 0} ]} activeOpacity={.8}>
                            <Icon 
                                tintColor={"#fff"}
                                name={ !this.state.muted ? 'volume-up' : 'volume-mute'}  
                                style={[ styles.volumnIcon, {fontSize: 20, color: 'white', backgroundColor: 'transparent'} ]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={.9} onPress={() => goBack() } style={[styles.btnClose, true && {top: 30}]}> 
                            <Icon name={'close'} style={{ fontSize:24, color: 'white', backgroundColor: 'transparent' }} />
                        </TouchableOpacity>

                    </View>

                </View>

            );
        }
    // }
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
    }
})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps)(VideoView)
