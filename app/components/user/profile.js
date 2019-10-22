import React, { Component } from 'react'
import { connect } from 'react-redux'
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
    Modal,
    Dimensions,
    InteractionManager,
    FlatList,
    ActivityIndicator,
    DeviceEventEmitter
} from 'react-native'

import { view_profile_category } from '@api/response'

import { getApi } from '@api/request';  

import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style'; 

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'


import TalentFeedItem from '@components/lists/feed/talent-feed-list'
import ProfileHeader from '@components/user/comp/profile-header'

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import _ from 'lodash'

import Tab from '@components/tabs/tab'
import SpamReport from '@components/other/spam-report';

function mapStateToProps(state) {
    // console.log('wow',state)
    return {
        user: state.user,
    }
}
const { width, height } = Dimensions.get('window')


let _SELF = null;


const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
};

const tmpData = [
                {
                    id: 1,
                    cover: 'http://top10for.com/wp-content/uploads/2014/02/Angelina-Jolie1.jpg?1c5b41',
                    profile_cover: 'https://randomuser.me/api/portraits/women/63.jpg',
                    media_type: 'video',
                    name: 'Vickie Burke',
                },
                {
                    id: 2,
                    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD5SFxZAbP-zBF5mHo17zj87CY7tHTSeTgZPhjeCIJf3ILlzdx',
                    profile_cover: 'https://randomuser.me/api/portraits/men/75.jpg',
                    media_type: 'image',
                    name: 'Dwayne Frazier',
                },
                {
                    id: 3,
                    cover: 'http://1.bp.blogspot.com/-STgrKmv9ZH4/TkACoHX3aaI/AAAAAAAACpA/7hFvMGvrsfs/s1600/top+hollywood+actress.jpg',
                    profile_cover: 'https://randomuser.me/api/portraits/women/18.jpg',
                    media_type: 'video',
                    name: 'Beth Burns',
                },
                {
                    id: 4,
                    cover: 'http://www.wonderslist.com/wp-content/uploads/2013/06/Star-Wars-The-Force-Awakens.jpg',
                    profile_cover: 'https://randomuser.me/api/portraits/women/33.jpg',
                    media_type: 'image',
                    name: 'Allison Robertson',
                },
]

const _cloneTmpData = _.cloneDeep(tmpData);

class Profile extends React.PureComponent {

    constructor(props){
        super(props);

        this.state={
            tmpVideoData: [],
            refreshing: false,
            selected: (new Map(): Map<string, boolean>),
            // data: tmpData,
            data: [],
            extraData: [{_id : 1}],
            type: [
                {
                    name: 'Singer',
                    value: 'singer',
                },{
                    name: 'Dancer',
                    value: 'cancer',
                },
            ],
            user_name: UserHelper._getUserFullName(),
            showModal: false,
            userId: this._chkGetOtherUser()?this._chkGetOtherUser().user._id:''
        }

        const { navigate, goBack, state } = this.props.navigation;
        console.log(' State : ', state.params);

        _SELF = this;
    }
    
    static navigationOptions = ({ navigation }) => ({
        // title: '', 
        // tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="profile-icon" badgeNumber={typeof navigation.state.params === 'undefined' ? 0 : navigation.state.params.badgeCount} />),        
        headerVisible: false, 
        headerTitle: navigation.state.params ? (navigation.state.params.user_info 
            ? Helper._getUserFullName(navigation.state.params.user_info.attributes) 
            : UserHelper._getUserFullName()) : UserHelper._getUserFullName(),
            headerRight: navigation.state.params ? (navigation.state.params.is_direct_chat ? (<ButtonRight
                icon= {"message-icon"}
                navigate={navigation.goBack}
            />):(<ButtonRight
                icon= {navigation.state.params ? (navigation.state.params.user_info ? "message-icon" : "settings-icon") : "settings-icon"}
                navigate={navigation.navigate}
                // to= {navigation.state.params ? (navigation.state.params.user_info ? "Chat" : "Setting") : "Setting"}
                to= {navigation.state.params ? (navigation.state.params.user_info ? "Message" : "Setting") : "Setting"}
                chat_info = {navigation.state.params ? (navigation.state.params.user_info ?
                    navigation.state.params.user_info : undefined) : undefined}
                navigation = {navigation}
            />)) : (<ButtonRight
                icon= {navigation.state.params ? (navigation.state.params.user_info ? "message-icon" : "settings-icon") : "settings-icon"}
                navigate={navigation.navigate}
                // to= {navigation.state.params ? (navigation.state.params.user_info ? "Chat" : "Setting") : "Setting"}
                to= {navigation.state.params ? (navigation.state.params.user_info ? "Message" : "Setting") : "Setting"}
                chat_info = {navigation.state.params ? (navigation.state.params.user_info ?
                    navigation.state.params.user_info : undefined) : undefined}
                navigation = {navigation}
            />),
            headerLeft: navigation.state.params ? (navigation.state.params.user_info ? (<ButtonBack
				// colBtn={ {color: Colors.primaryColDark }}
                isGoBack={ navigation }
                // btnLabel= "Back" 
            />): null) : null,
            headerRight1: (
                
                <View style={[styles.flexVerMenu, styles.flexCenter]}>

                    <TouchableOpacity onPress={() => _SELF.goToSetting()}>
                        <Text>Save</Text>
                    </TouchableOpacity>

                </View>
            ),
    }); 

    goToSetting = () => {
        // console.log('goToSetting', this.props);
        const { navigate, goBack, state } = this.props.navigation;
        navigate('Setting'); 
    }

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
                // console.log('Cover Only: ',_cover);
                let userInfoWithPhoto = _.extend({
                    cover: _.head(_cover),
                    photos: _allImg,
                },_userObj)

                console.log('userInfoWithPhoto : ',userInfoWithPhoto);


                let _userData =  StorageData._saveUserData('TolenUserData',JSON.stringify(userInfoWithPhoto)); 
                UserHelper.UserInfo = userInfoWithPhoto; // assign for tmp user obj for helper
                // _userData.then(function(result){
                //     console.log('complete final save sign up'); 
                // });

                console.log('Photo & Cover: ', userInfoWithPhoto);
            }

        });
    }

    _getVideoList = (_isLoadMore = false, txtSearch='', isSearchLoading=false) => {
        // 
        let _SELF = this; 
        // let API_URL = '/api/contacts/search/people?limit=20&sort=-created_at?v2'; 
        // let API_URL = '/api/media/public?type=video&is_featured=true&limit=20&sort=-created_at'; 
        let API_URL = '/api/media?type=video'; 

        if(isSearchLoading){
            this.setState({ 
                isLoading: true,
                extraData: [{_id : this.state.extraData[0]._id++}] // change this value to re-render header or footer 
            })
            API_URL += '&search=' + txtSearch;
        }

        let _chkOtherUser = this._chkGetOtherUser();
        // console.log('_chkOtherUser : ', _chkOtherUser);
        if(_chkOtherUser){
            // in video obj user = user_id, in people obj user = profile obj(_id, attributes, ...),.. 
            API_URL = '/api/users/'+ (_chkOtherUser.user.hasOwnProperty('_id') ? _chkOtherUser.user._id : _chkOtherUser.user) + '/medias';    
        }

        // GET /api/media/public?type=video|photo 
        console.log(API_URL);
        getApi(API_URL).then((_response) => {
            console.log('User Profile Get Video : ', _response);
            if(_response.status == 'success'){

                // let _allAvailableJob = _response.result;

                // console.log('All Vailable Job : ', _allAvailableJob); 

                let _result = _response.result;

                // let _goodData = _.filter(_result,function(v,k){
                //     return v.attributes.kind && v.attributes.kind.value!='';
                // });

                let _goodData = [];
                _goodData = _result;

                // if view other user filter only video for good Data
                if(_chkOtherUser){

                    _goodData = _.filter(_result, function(v,k){
                        return v.media_type == 'video';
                    });

                    _photos = _.filter(_result, function(v,k){
                        return v.media_type == 'photo';
                    });

                    const { navigate, goBack, state, setParams } = this.props.navigation;
                    let _tmp = state.params.user_info;
                    _tmp = _.extend({
                        photos: _photos
                    },_tmp)
                    setParams({
                        user_info: _tmp,
                    })

                    // _SELF.setState({ 
                    //     extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
                        
                    // })
                    console.log('Photo Other Profile: ', _tmp);

                }

                _.each(_goodData, function(v,k){
                    v.paused = true;
                    v.muted = false;
                    v.loaded = false;
                    v.alreadyLoaded = false;
                })


                // for(i= 0; i<600; i++ ){
                //     var _tmp = _.cloneDeep(_result[0]);
                //     _tmp.user._id = _tmp.user._id + '-panhna-' + i;
                //     _goodData.push(_tmp);
                // }

                console.log('_isLoadMore', _isLoadMore);
                if(_isLoadMore){
                    _SELF.setState({
                        data: [..._SELF.state.data, ..._goodData],          
                    }, () => {

                    })
                }
                else{
                    _SELF.setState({
                        data: [],
                    }, () => {
                        _SELF.setState({
                            data: _goodData,
                            extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
                        })
                    })
                }
                // console.log('this ', _SELF.state);

            }
            // console.log('isSearchLoading', isSearchLoading);
            if(isSearchLoading){

                _SELF.setState({ 
                    isLoading: false,
                    extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
                    
                })

            }
            setTimeout(function() {

                _SELF.setState({
                    refreshing: false,
                })

            }, 500);
            // console.log('_SELF', _SELF.state);

            // _SELF.listRef.scrollToOffset({offset: 50})
            
        });
    }

    componentDidMount() {

        GoogleAnalyticsHelper._trackScreenView('Profile');                 

        let _SELF = this;
        // setTimeout(function(){
            // _SELF.props.navigation.setParams({ handleFunc1: this.goToSetting });
        // },5000)
        // this.props.navigation.setParams({ handleFunc: this.goToSetting });
        // console.log('this.props.navigation', this.props.navigation);


        // InteractionManager.runAfterInteractions(() => {
        // // ...long-running synchronous task...
        // console.log('Run InteractionManager');
        // });

        // console.log('User Info', UserHelper.UserInfo)
        
        // remove temp videos
        StorageData._removeStorage('TmpVideoData');


        // get first photo
        if(!UserHelper.UserInfo.cover){
            this._getAndUpdatePhoto();
        }

        // if(!this.props.navigation.state.params)
            this._getVideoList();
        // else


    }

    test = () => {
        this.props.navigation.setParams({ handleFunc: this.goToSetting });
    }

    // test flatlist
    _keyExtractor = (item, index) => item.id;

    _onPressItem = (id) => {
        // updater functions are preferred for transactional updates
        console.log('ID: ', id);
        // console.log('this.state: ', this.state);
        // this.setState((state) => {
        // // copy the map rather than modifying state.
        //     const selected = new Map(state.selected);
        //     console.log('selected :',selected.get(id));
        //     // selected.set(id, selected.get(id)); // toggle
        //     selected.set(id,'lool'); // toggle
        //     console.log('selected :',selected);
        //     return {selected};
        // },((state)  => {
        //     console.log('after setState: ', this.state);
        // }));
    };

    _togglePlayVideoPopup = (_id, _isMuted = false) => {
        // this.setState({
        //     paused : !this.state.paused,
        // })
        // console.log('video click :', _id, ' =', _isMuted);
        let _tmpData = _.cloneDeep(this.state.data);
        let _videoData = {};
        _.each(_tmpData, function(v,k){
            if(v._id == _id){

                const _localVideo = _SELF._chkTmpVideoData(v);
                console.log('_localVideo : ', _localVideo, ' === ', v);
                if(v.is_processing && _localVideo.length>0){
                    v.local_url = _.head(_localVideo).uri;
                    v.localVideoThum = _.head(_localVideo).videoThum;
                }
                _videoData = v;
            }
        })


        const { navigate, goBack, state } = this.props.navigation;
        navigate('VideoScreen',{video_data: _videoData}); 


    }

    _togglePlayVideo = (_id, _isMuted = false) => {

        this._togglePlayVideoPopup(_id, _isMuted);
        return;
        // this.setState({
        //     paused : !this.state.paused,
        // })
        // console.log('video click :', _id, ' =', _isMuted);
        let _tmpData = _.cloneDeep(this.state.data);
        _.each(_tmpData, function(v,k){
            if(v._id == _id){
                
                
                if(_isMuted){
                    v.muted = !v.muted;
                }
                else{
                    v.paused = !v.paused;
                }
                // console.log('V :', v);
            }
            else{
                v.paused = true;
            }

            if(!v.loaded){
                v.loaded = true;
            }

        })
        this.setState({
            data: _tmpData
        }, () => {

        });

    }

    _deleteVideo = (_postId) => {
        console.log('delete video', _postId)
    }

    _reportVideo = (_postId) => {
        console.log('report video', _postId)
    }


    _renderItem = ({item}) => {
        // if(item.media_type == 'video')
        return (
        <TalentFeedItem
            myVideo={true}
            id={ item._id }  
            userId={ item.user._id || item.user }  
            videoId={ item._id }   
            onPressItem={ this._onPressItem } 
            togglePlayVideo={ this._togglePlayVideo }
            selected={ !!this.state.selected.get(item._id) }
            title={ Helper._getUserFullName(item.user) } 
            cover={ Helper._getCover(item.user) }  
            caption = {item.caption || ''}
            media_type={ item.media_type } 
            createdAt={item._created_at} 
            videoUrl={ this._getVideoUri(item)}  
            //videoUrl={'http://profficialsite.origin.mediaservices.windows.net/5ab94439-5804-4810-b220-1606ddcb8184/tears_of_steel_1080p-m3u8-aapl.ism/manifest(format=m3u8-aapl)'} 
            //videoUrl={'http://stolaf-flash.streamguys.net/webcams/himom.stream/playlist.m3u8)'} 
            
            isLocalFile={this._chkTmpVideoData(item).length>0 ? true : false}

            paused={item.paused}   
            loaded={item.loaded} 
            alreadyLoaded={item.alreadyLoaded} 
            updateVideoStatus = {this._updateVideoStatus}
            videoThum={this._getVideoCover(item)}  
            muted={item.muted}   
            profile_cover={ Helper._getCover(item.user) } 
            profile_id={ item.user._id || item.user } 
            navigation={ this.props.navigation }
            paddFirstItem={ true }
            deleteVideo={this._deleteVideo}
            reportVideo={this._reportVideo} />
    )};

    _updateVideoStatus = (_id, isLoaded = false) => {
        // console.log('_updateVideoStatus : ', _id);
        
         let _tmpData = _.cloneDeep(this.state.data);
        _.each(_tmpData, function(v,k){
            if(v._id == _id){
                v.alreadyLoaded = true;
            }

        });
        // console.log('_tmpData : ',_tmpData);
        this.setState({
            data: _tmpData
        }, () => {

        });
    }

    // check if video processing but we have backup video in local
    _chkTmpVideoData = (item) => {
        // let _video = null;
        return _.filter(this.state.tmpVideoData,function(v,k){
            return v.uuid == item.upload_session_key;
        });

        // return !_.isEmpty(_video) ? true : false;
    }

    _getVideoUri = (item) => {
        const _chkTmpVideo = this._chkTmpVideoData(item);
        // console.log('Cover _chkTmpVideo', _chkTmpVideo);        
        if(_chkTmpVideo.length>0){
            return _.head(_chkTmpVideo).uri;
        }
        else{
            return !_.isEmpty(item.s3_url) ? item.s3_url + item.formatted_sd_video_url : item.video_id;
        }
    }

    _getVideoCover = (item) => {

        const _chkTmpVideo = this._chkTmpVideoData(item);
        // console.log('Cover _chkTmpVideo', _chkTmpVideo);
        if(_chkTmpVideo.length>0){
            return _.head(_chkTmpVideo).videoThum;
        }
        else{
            if(item.media_type == 'video')
                return item.s3_url + item.formatted_video_thumbnail_url.replace('{{FILE_KEY}}',item.file_key)
            else
                return item.thumbnail_url_link;
        }
    }

    _renderHeader = ({item}) => (
        // console.log('item : ', item)
        <ProfileHeader
            onPressItem = {this._onPressItem}
            canReview = {this.props.navigation.state?this.props.navigation.state.params.canReview:false}/>
    );

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
        <View
            style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderColor: "#CED0CE"
            }}
        >
            <ActivityIndicator animating size="small" />
        </View>
        );
    };

    handleRefresh = () => {
        // console.log('pull to refresh');
        this.setState({
            refreshing: true,
        }, function(){
            this._getVideoList();
        })
    }

    handleLoadMore = () => {
        return;
        let that = this;

        if(this.state.loading) return;

        this.setState({
            loading: true,
        },() => {  
            // data testing
            // for increase the list item by 1
            let _allData = _.cloneDeep(tmpData); // clone obj to use to prevent conflict id. coz flatlist work by id
            let _tmp = [];
            let _obj = _.head(_.shuffle(_allData));
            _obj.id = that.state.data.length+1;
            _tmp.push(_obj);

            // console.log('TMP : ',_obj);

            that.setState({
                data: [...that.state.data, ..._tmp]
            }, () => {
                setTimeout(function(){
                    that.setState({
                        loading: false,
                    })
                },500)
            })

            // console.log('after push',that.state.data);


        })

    }

    onViewableItemsChanged = (e) => {
        // console.log('onViewableItemsChanged :', e);
        return;
        let _tmpData = _.cloneDeep(this.state.data);

        _.each(e.viewableItems,function(v,k){
            if(v.isViewable && !v.item.loaded){
                _.each(_tmpData, function(v_sub,k_sub){
                    if(v_sub._id == v._id){
                        v_sub.loaded = true;
                    }
                })
            }
        })

        this.setState({
            data: _tmpData
        }, () => {

        });
    }
 
    _chkGetOtherUser = () => {
        const { navigate, goBack, state } = this.props.navigation;
        if(state.params){
            if(state.params.user_info)
                return  state.params.user_info;
            else
                return null;
        }
        else{
            return null;
        }
    }

    componentWillMount() {
        let _SELF = this;
        DeviceEventEmitter.addListener('updateProfileInfo', (e)=>{ 
            // console.log('event',e);
            _SELF.setState({ 
                extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
            }, function(){
                if(e.update_video){
                    _SELF._getVideoList();
                }
            })
            // console.log('This Navigation: ', this.props.navigation);
            // console.log('This _SELF Info: ', _SELF.props.user.profile.attributes);
            // console.log('User Helper', UserHelper.UserInfo.profile);
            // console.log('User Full Name: ', UserHelper._getUserFullName());

            // isEdit is just set to update navigation, it isn't used in any place.
            this.props.navigation.setParams({
                isEdit: true
            });
            // console.log('IS Edit: ', this.props.navigation.state.params);
        });

        DeviceEventEmitter.addListener('PausedAllVideosProfile', (data) => {
            // console.log('WOW Paused All Videos : ', data);

            let _tmpData = _.cloneDeep(_SELF.state.data);  

            _.each(_tmpData, function(v,k){
                v.paused = true;
            });
            // console.log('_tmpData : ',_tmpData);
            this.setState({
                data: _tmpData
            }, () => {

            });

        })

        DeviceEventEmitter.addListener('UpdateHeader', () => {   

            _SELF.setState({
                extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
            })

        });

        DeviceEventEmitter.addListener('SpamReport', () => {    
            _SELF.setState({
                showModal: true
            })
        });

        DeviceEventEmitter.addListener('UpdateTmpVideoData', (_data) => {    
            console.log('UpdateTmpVideoData :', _data);
            _SELF.setState({
                tmpVideoData: _data.tmpVideoData
            })
        });

    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('UpdateHeader');
        DeviceEventEmitter.removeListener('updateProfileInfo');
        DeviceEventEmitter.removeListener('PausedAllVideosProfile');
        DeviceEventEmitter.removeListener('SpamReport');
        DeviceEventEmitter.removeListener('UpdateTmpVideoData');
    }

    // end testing flatlist

    render() {
        return (
            <View>
                <FlatList
                    data={this.state.data}
                    keyExtractor={this._keyExtractor}
                    ListHeaderComponent={(): React$Element<*> => (
                        <ProfileHeader
                            userInfo={this._chkGetOtherUser() || (UserHelper.UserInfo ? UserHelper.UserInfo.profile : null)}
                            onPressItem={this._onPressItem}
                            navigation = {this.props.navigation}
                        />
                    )}
                    ListFooterComponent={this.renderFooter}
                    renderItem={this._renderItem}
                    removeClippedSubviews={false}
                    viewabilityConfig={VIEWABILITY_CONFIG}

                    onViewableItemsChanged = {this.onViewableItemsChanged}

                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    onEndReachedThreshold={0.5}
                    onEndReached={this.handleLoadMore}
                />
                
                <SpamReport type = { 'user' }
                    reportId = { this.state.userId }
                    visible = { this.state.showModal }
                    setModalVisible = { () => { this.setState({showModal: false})} }/>

            </View>
        );
    }
    
}

var styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,
    topSection:{
        height:height-113,
        // flex: 1,
        justifyContent:'flex-end',
    },
    middleSection:{
        alignItems: 'stretch',
        height:300

    },
    bottomSection:{
        backgroundColor:'white',
        height:200
    },
    mywrapper:{
        flex:1,
    },
    mybgcover:{
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    mybgOverlay: {
        flex: 1,
        position: 'absolute',
        bottom:0,
        padding:20 ,
        width:width,
        zIndex: 2,
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
        backgroundColor: 'transparent'
    },
    favorite:{
        paddingTop:20,
        flexDirection:'row'
    },
    favoriteNumber:{
        color:'white',
        fontWeight:'bold',
        fontSize:18,
        marginRight:120
    },
    favoriteText:{
        color:'white'
    },
    btnMessage:{
        backgroundColor:Colors.buttonColor,
        paddingVertical:10,
        marginTop:5,
        borderRadius:5,
        paddingLeft:30,
        paddingRight:30,
        borderColor:Colors.buttonColor,
        marginRight:30,
    },
    btnMessageText:{
        color:'white',
        fontSize:20,
        fontWeight:'300'
    },
    btnEditProfile:{
        backgroundColor:'white',
        paddingVertical:10,
        marginTop:5,
        borderRadius:5,
        paddingHorizontal:30
    },
    imgContainer:{
        flex: 1,
        opacity:0.5
    },  
    alignSpaceBetween:{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});
export default connect(mapStateToProps)(Profile)