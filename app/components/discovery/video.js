import React, { Component } from 'react'
import { connect } from 'react-redux'
// import * as DetailActions from '@actions/detail'
import * as BadgeNotification from '@actions/notification'

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
    InteractionManager,
    FlatList,
    ActivityIndicator,
    DeviceEventEmitter
} from 'react-native'

import { view_profile_category } from '@api/response' 

import Video from 'react-native-video';


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

import uuid from 'react-native-uuid';

import TalentFeedItem from '@components/lists/feed/talent-feed-list'
import ProfileHeader from '@components/user/comp/profile-header'

import { UserHelper, StorageData, Helper, ChatHelper, GoogleAnalyticsHelper } from '@helper/helper';
import _ from 'lodash'

import { getApi, postApi } from '@api/request';

import SearchBox from '@components/ui/search'

import VideoDataMockUpLoading from '@components/other/video-data-mock-up-loading'  
import SpamReport from '@components/other/spam-report';


function mapStateToProps(state) {
    // console.log('main state',state);
    return {
        notification: state.notification,
        user: state.user,
    }
}

const { width, height } = Dimensions.get('window')


let _SELF = null;


const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: false,
};

class Videos extends React.PureComponent {

    constructor(props){
        super(props);

        this.state={
            // allowViewVideo: true,
            isFirstLoad: false,
            filterData: null,
            offset: 0,
            page: 1,
            limit: 4,
            searchText: '',
            isLoading: false,
            refreshing: false,
            selected: (new Map(): Map<string, boolean>),
            data: [],
            extraData: [{_id : 1}],
            options: {
                total: 0
            },
            modalVisible: false,
            reportVideoId: '',
        }

        _SELF = this;

    }
    
    static navigationOptions = ({ navigation }) => ({
        headerTitle: 'Discovery',
        headerLeft: (<ButtonLeft
            icon="person-add"
            navigate={navigation.navigate}
            to="ChatModal"
        />),
    }); 

    goToSetting = () => {
        // console.log('goToSetting', this.props);
        const { navigate, goBack, state } = this.props.navigation;
        navigate('Setting'); 
    }

    _openMessage = (userObj, userProfile) => {
        // console.log('Talent Feed List : ', this.props);
        
        // let userObj = {
        //     id : this.props.userId,
        //     cover : this.props.cover, 
        //     full_name : this.props.title, 
        // }
        let _SELF = this;

        const { navigate, goBack, state } = _SELF.props.navigation;

        GoogleAnalyticsHelper._trackEvent('Chat', 'Chat Button Click From Discover - Video', {
            user_id: userObj.id,
            full_name: userObj.full_name
        });     

        let _paramObj = {
            message_data: {
                name: userObj.full_name,
                // channelUrl: _channel.url,
                chat_id: userObj.id,
            },
            direct_chat: true,
            user_info: userProfile,
            userObj: userObj,
        };
        navigate('Message',_paramObj); 
    }

    componentDidMount() {
        let _SELF = this;

        this._getVideoList();

    }

    componentWillMount(){

        // DeviceEventEmitter.addListener('AllowViewVideo', (data) => {
        //     _SELF.setState({
        //         allowViewVideo: !this.state.allowViewVideo
        //     });
        // })

        DeviceEventEmitter.addListener('FilterVideos', (data) => {
            // _SELF.jobFilter(data);
            console.log('Filter People Emitted')
            _SELF.setState({
                filterData: data.dataFilter,
                data: null,
            }, function(){
                _SELF._getVideoList(); 
            })
        })

        DeviceEventEmitter.addListener('PausedAllVideos', (data) => {
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

        DeviceEventEmitter.addListener('Refresh_Discovery_Video', (data) => {
            if(this.props.notification.discover>0)
                this._getVideoList(false, '', true);
        })

    }

    componentWillUnmount(){
        // DeviceEventEmitter.removeListener('AllowViewVideo');
        DeviceEventEmitter.removeListener('Refresh_Discovery_Video');
        DeviceEventEmitter.removeListener('FilterVideos');
        DeviceEventEmitter.removeListener('PausedAllVideos');
    }

    
    _getVideoList = (_isLoadMore = false, txtSearch='', isSearchLoading=false) => {
        // return;
        // 
        let _SELF = this; 

        let _offset= (this.state.page - 1) * this.state.limit;
        
        if(isSearchLoading){
            this.setState({ 
                page: 1,
            })
            _offset = 0;
        }


        // let API_URL = '/api/contacts/search/people?limit=20&sort=-created_at?v2'; 
        // let API_URL = '/api/media/public?type=video&is_featured=true&offset='+ _offset +'&limit='+ this.state.limit +'&sort=-created_at'; 
        let API_URL = this._getURLVideo(_offset); 


        if(isSearchLoading || this.state.searchText != ''){
            this.setState({ 
                isLoading: true,
                extraData: [{_id : this.state.extraData[0]._id++}] // change this value to re-render header or footer 
            }) 
            API_URL += '&search=' + encodeURI(this.state.searchText || txtSearch);
        }

        // GET /api/media/public?type=video|photo 
        console.log('Video Search : ',API_URL);
        getApi(API_URL).then((_response) => {

            console.log('All Video : ', _response);

            if(_response.status == 'success'){

                // let _allAvailableJob = _response.result;

                // console.log('All Vailable Job : ', _allAvailableJob); 

                let _result = _response.result; 

                // let _goodData = _.filter(_result,function(v,k){
                //     return v.attributes.kind && v.attributes.kind.value!='';
                // });

                if(_result.length>0){

                    let _goodData = [];
                    _goodData = _result;

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

                    console.log('_isLoadMore', _goodData);
                    if(_isLoadMore){
                        _SELF.setState({
                            data: [..._SELF.state.data, ..._goodData],
                            page: _SELF.state.page+1,
                        }, () => {

                        })
                    }
                    else{
                        _SELF.setState({
                            data: _goodData,
                            extraData: [{_id : this.state.extraData[0]._id++}],
                            page: _SELF.state.page+1,
                            options: _response.options
                        }, () => {

                        })
                    }

                }
                else{
                    
                    if((this.state.filterData || this.state.searchText) && !this.state.loading){
                        _SELF.setState({
                            data: [],
                            extraData: [{_id : this.state.extraData[0]._id++}],
                            page: 1,
                        }, () => {

                        })
                    }
                }
                // console.log('this ', _SELF.state);

            }

            // console.log('isSearchLoading', isSearchLoading);
            if(isSearchLoading || this.state.searchText != ''){

                _SELF.setState({ 
                    isLoading: false,
                    loading: false,
                    extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
                    
                })

            }

            _SELF.setState({
                refreshing: false,
                loading: false,
                extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
            }, function(){
                setTimeout(function() {
                    _SELF.setState({
                        isFirstLoad: true
                    })
                }, 1000);
            })

            // console.log('_SELF', _SELF.state);

            // _SELF.listRef.scrollToOffset({offset: 50})
            
        });
    }

    // http://localhost:3000/api/users/filter?type=singer,actor&min_weight=50&max_weight=60&gender=M,F&search=sreng gueckly&mode=video

    _getURLVideo = (_offset) =>{
        if(this.state.filterData){
            console.log('Data: ', this.state.filterData);
            let _SELF = this;
            let _dataFilter = this.state.filterData;

            let _query = '';

            let _age = _dataFilter.age.val ? _dataFilter.age.val.split(' to ') : [];
            let ageMinMax = {
                    min_age: '',
                    max_age: ''
            }
            if(_age.length == 2){
                ageMinMax = {
                    min_age: _age[0],
                    max_age: _age[1],
                }
            }

            let _country = _dataFilter.country.val.toLowerCase();
            let _gender = _dataFilter.selectedGender.toLowerCase();
            if(_gender == 'b')
                _gender = '';
            

            let _talentCateSelected = _.filter(_.cloneDeep(_dataFilter.talent_cate), function(v,k){
                return v.selected;
            })
            talentCateStringArray = _.map(_talentCateSelected, function(v, k) {
                return v.category;
            });
            if(talentCateStringArray){
                _query += '&type='+ encodeURI(talentCateStringArray);
            }

            _query += '&ethnicity=' + _dataFilter.selectedEthnicity.toLowerCase();

            _query += '&language=' + encodeURI(_dataFilter.selectedLanguages.toLowerCase());
            
            _query += '&eye_color=' + encodeURI(_dataFilter.myeyecolor.val.toLowerCase());

            _query += '&hair_color=' + encodeURI(_dataFilter.myhaircolor.val.toLowerCase());

            let _weight = _dataFilter.age.val ? _dataFilter.myweight.val.split(' to ') : [];
            let _weightMinMax = {
                    min_weight: '',
                    max_weight: ''
            }
            if(_weight.length == 2){
                _weightMinMax = {
                    min_weight: _weight[0],
                    max_weight: _weight[1],
                }
            }
            _query += '&min_weight='+ _weightMinMax.min_weight +'&max_weight='+ _weightMinMax.max_weight;
            

            let _height = _dataFilter.age.val ? _dataFilter.myweight.val.split(' to ') : [];
            let _heightMinMax = {
                    min_height: '',
                    max_height: ''
            }
            if(_height.length == 2){
                _heightMinMax = {
                    min_height: _height[0],
                    max_height: _height[1],
                }
            }
            _query += '&min_height='+ _heightMinMax.min_height +'&max_height='+ _heightMinMax.max_height;
            

            // console.log('Age: ',_age, 'talenCate: ', talentCateStringArray);
    
            return  '/api/users/filter?mode=video&offset='+ _offset +'&limit='+ this.state.limit +'&min_age='+ ageMinMax.min_age +'&max_age='+ ageMinMax.max_age +'&country='+ _country +'&gender='+_gender + _query + '&sort=-created_at';
            
        }
        else{

            return  '/api/users/filter?mode=video&is_feature=true&offset='+ _offset +'&limit='+ this.state.limit + '&sort=-created_at';
            // return '/api/media/public?type=video&is_featured=true&offset='+ _offset +'&limit='+ this.state.limit +'&sort=-created_at';

        }
    }


    test = () => {
        this.props.navigation.setParams({ handleFunc: this.goToSetting });
    }

    // test flatlist
    _keyExtractor = (item, index) => index;

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
        console.log('allowViewVideo :', this.state.allowViewVideo);

        // if(!this.state.allowViewVideo)
        //     return;

        let _tmpData = _.cloneDeep(this.state.data);
        let _videoData = {};
        _.each(_tmpData, function(v,k){
            if(v._id == _id){
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

    _getVideoCover = (item) => {

        if(item.media_type == 'youtube')
            return item.thumbnail_url_link;

        const _videoURL = item.s3_url + item.formatted_video_thumbnail_url.replace('{{FILE_KEY}}',item.file_key);
        // console.log('video cover: ', _videoURL);
        return _videoURL;
        
    }

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

    showReportVideoView = (videoId) => {
        this.setModalVisible(true);
        this.setState({
            reportVideoId: videoId
        });
    }

    setModalVisible = (visible) => {
        this.setState({
            modalVisible: visible,
        });
    }

    _renderItem = ({item}) => {
        return ( 
            <TalentFeedItem
                _openMessage={this._openMessage}
                id={ item._id }  
                userId={ item.user._id }  
                videoId={ item._id }   
                onPressItem={ this._onPressItem } 
                togglePlayVideo={ this._togglePlayVideo }
                selected={ !!this.state.selected.get(item._id) }
                title={ Helper._getUserFullName(item.user) } 
                caption={ item.caption || '' } 
                cover={ Helper._getCover(item.user) } 
                media_type={ 'video' } 
                createdAt={item._created_at} 
                videoUrl={ item.media_type == 'video' ? item.s3_url + item.formatted_sd_video_url : item.thumbnail_url_link } 
                paused={item.paused} 
                loaded={item.loaded} 
                alreadyLoaded={item.alreadyLoaded} 
                updateVideoStatus = {this._updateVideoStatus}
                videoThum={this._getVideoCover(item)}  
                userObj={item.user}   
                muted={item.muted}   
                profile_cover={ Helper._getCover(item.user, 'small_url_link') } 
                profile_id={ item.user._id } 
                navigation={ this.props.navigation }
                paddFirstItem={ true }
                reportVideo = { ()=> this.showReportVideoView(item._id) }
            />
        /* <Text>Check for android</Text> */
    )};

    _renderHeader = ({item}) => (
        // console.log('item : ', item)
        <ProfileHeader
        onPressItem={this._onPressItem}
        />
    );

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
        <View
            style={{
                paddingVertical: 20,
                borderColor: "#CED0CE"
            }}
        >
            <ActivityIndicator animating size="small" />
        </View>
        );
    };

    handleRefresh = () => {
        console.log('pull to refresh');
        this.setState({
            refreshing: true,
        })

        // clear red dot when pull to refresh
        DeviceEventEmitter.emit('clearBadgeNumber', {
            tabType: 'Discovery'
        });
        
        this._getVideoList(false, '', true);
    }

    handleLoadMore = () => {

        let that = this;

        if(this.state.options.total <= this.state.limit || this.state.loading) 
            return;

        this.setState({
            loading: true,
        },() => {  
            // data testing
            // for increase the list item by 1
            // let _allData = _.cloneDeep(this.state.data); // clone obj to use to prevent conflict id. coz flatlist work by id
            // let _tmp = [];
            // let _obj = _.head(_.shuffle(_allData));
            // _obj.user._id = that.state.data.length + 1;
            // _tmp.push(_obj);

            // // console.log('TMP : ',_obj);

            // that.setState({
            //     data: [...that.state.data, ..._tmp]
            // }, () => {
            //     setTimeout(function(){
            //         that.setState({
            //             loading: false,
            //         })
            //     },0)
            // })

            that._getVideoList(true, '', false);

            // console.log('after push',that.state.data);
        })

    }

    searchNow = (txtSearch, isEmpty=false) => {
        console.log('Search Text: ', txtSearch);
        
        if(!isEmpty){
            
            this.setState({
                searchText: txtSearch
            }, function(){

                GoogleAnalyticsHelper._trackEvent('Search', 'Video', {text_search: txtSearch});                         
                
                this._getVideoList(false, txtSearch, true);
                if(txtSearch == ''){
                    this.setState({
                        page: 1
                    })
                }
                
            })
        }
    }

    onViewableItemsChanged = (e) => {
        return;
        console.log('onViewableItemsChanged :', e);

        clearTimeout();

        setTimeout(() => {
            console.log('TIMEOUT : onViewableItemsChanged :', e);
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

            _.each(e.changed,function(v,k){
                if(!v.isViewable && v.item.loaded){
                    _.each(_tmpData, function(v_sub,k_sub){
                        if(v_sub._id == v._id){
                            v_sub.loaded = false;
                        }
                    })
                }
            })

            this.setState({
                data: _tmpData
            }, () => {

            });
            
        }, 2000);

    }

    renderHeader = () => {
        return (
            <View style={[ styles.justFlexContainer, styles.marginBotSM ]}>
                <SearchBox placeholder={'Search'} onSubmit={this.searchNow} isLoading={this.state.isLoading} />
            </View>
        )
    }

    // end testing flatlist

    render() {
        if(this.state.data && this.state.data.length<=0  && !this.state.isFirstLoad)
            return (
                <View style={[ {flex: 1, paddingTop: 50} ]}>
                    <VideoDataMockUpLoading />
                </View>
            )
        else{

            if(_.isEmpty(this.state.data))
                return(
                    <View  style={[ styles.justFlexContainer, {paddingTop: 50} ]}>
                        <View style={[ styles.marginBotSM, {height: 50} ]}>
                            <SearchBox placeholder={'Search'} prevText={this.state.searchText} onSubmit={this.searchNow} isLoading={this.state.isLoading} />
                        </View>
                        <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>

                            <Text style={[styles.blackText, styles.btFontSize]}>
                                No video has been found. 
                            </Text>

                        </View>
                    </View>
                )
            else
                return (
                    <View style={[ styles.justFlexContainer, styles.mainScreenBg, {paddingTop: 50}]}>  

                        <FlatList
                            extraData={this.state.extraData}
                            data={this.state.data}
                            keyExtractor={this._keyExtractor}
                            ref={ref => this.listRef = ref}
                            ListHeaderComponent={this.renderHeader}

                            ListFooterComponent={this.renderFooter}
                            renderItem={this._renderItem}
                            removeClippedSubviews={false}
                            viewabilityConfig={VIEWABILITY_CONFIG}

                            onViewableItemsChanged = {this.onViewableItemsChanged}

                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                            initialNumToRender={4}
                            maxToRenderPerBatch={4}
                            onEndReachedThreshold={2}
                            onEndReached={this.handleLoadMore}
                        />
                        
                        <SpamReport type = { 'video' }
                            reportId = { this.state.reportVideoId }
                            visible = { this.state.modalVisible }
                            setModalVisible = { () => this.setModalVisible(false) }/>
                        
                    </View>

                )
        }
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
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },modalProp:{
        width:300,
        height:350,
        backgroundColor:'white',
        borderRadius:8,
        overflow:'hidden'
    },btnContainer: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.buttonColor
    },textInputMultiLine:{
        width: 240,
        height:100,
        borderRadius:4,
        backgroundColor:Colors.componentBackgroundColor,
        textAlign:'auto',
        padding:10,
        fontSize:15,
        marginTop: 10
    }
});
export default connect(mapStateToProps, BadgeNotification)(Videos)