import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image, 
    StatusBar,
    ListView,
    Alert,
    ActivityIndicator,
    RefreshControl,
    DeviceEventEmitter,
    Modal,
    TextInput
} from 'react-native'

import { NavigationActions } from 'react-navigation';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';

import { Colors } from '@themes/index';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import BoxWrap from '@styles/components/box-wrap.style';
import BoxAvatarCover from '@styles/components/box-avatar-cover.style';

import JobApplyRow from '@components/lists/job/job-apply-row';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'
// import * as DetailActions from '@actions/detail'
import { getApi, postApi, putApi } from '@api/request';

import { transparentHeaderStyle, defaultHeaderStyle } from '@styles/components/transparentHeader.style';

import _ from 'lodash'

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

import MessageDataMockUpLoading from '@components/other/message-data-mock-up-loading'  
import RecommendDataMockUpLoading from '@components/other/recommend-data-mock-up-loading'  

const dismissKeyboard = require('dismissKeyboard');

function mapStateToProps(state) {
    return {
        // detail: state.detail
    }
}

class ViewJobList extends Component { 

    constructor(props){
        super(props);
        //your codes ....

        const { navigate, goBack, state } = this.props.navigation;
        // console.log('The item: ', state.params.job);
        // ._id, .reference_detail[0].thumbnail_url_link, sub_reference_detail.criteria .'gender , max_age,
        // min_age , type[] , title, description, status, 

        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        let _jobInfo = state.params.job;

        // console.log('Job Object: ', _jobInfo);

        _jobInfo = _.extend({
            cover: _.head(_jobInfo.reference_detail)
        },_jobInfo);

        this.state = {
            isFirstLoad: false,
            // cover: _.head(state.params.job.reference_detail),
            refreshing: false,
            jobInfo: _jobInfo,
            recommendTalent: [],
            allRecommendTalent:[],
            appliedDataSource: ds.cloneWithRows([]),
            appliedData: [],
            isUpdatingState: false,
            default_cover: require('@assets/job-banner.jpg'),
            options: {
                    isLoadingTail: false,
                    isShowReviewApp : false,
                    applicationCount : 0,
                    dataSource: ds.cloneWithRows([])
            },
            description:{
                val:''
            },
            modalVisible:false,
            positiveVisible:false,
            neutralVisible:false,
            negativeVisible:false,
            // disabledCover: false,
        }
        // console.log('this state :', this.props.navigation);
    }

    static navigationOptions = ({ navigation }) => ({
        // title: '', 
        // headerVisible: true,
        headerTitle: navigation.state.params.job.sub_reference_detail.title,
        headerLeft: (<ButtonBack
            // colBtn={ {color: Colors.primaryColDark }}
            isGoBack={ navigation }
            // btnLabel= "Back" 
        />),
        headerStyle: transparentHeaderStyle,  
        //headerRight: navigation.state.params.not_editable ? '' : (
        headerRight: navigation.state.params.job.status != 'published' ? '' : (    
            <View style={[styles.flexVerMenu, styles.flexCenter]}>

                <ButtonRight
                    //icon="add"
                    style={{marginRight: 10}}   
                    navigate={navigation.navigate}
                    nav={navigation}
                    to="CreatePostJob"
                    btnLabel= "Edit"
                />

                {/*<ButtonRight
                    icon="menu"
                    navigate={navigation.navigate}
                    to="Settings"
                />*/}

            </View>
        ),
    });

    // get recommended tablent if no talent apply yet
    _getRecommendedTalen = () => {
        // console.log('This is data: ', state.params.job);
        const { navigate, goBack, state } = this.props.navigation;

        // get job to reconfirm if there isn't any applied applicants
        REQ_API = '/api/posts/' + state.params.job._id;
        getApi(REQ_API).then((_response) => {
            if(_response.code == 200){
                // console.log('response: ', _response);
                let _jobInfo = _response.result;
                _jobInfo = _.extend({
                    cover: _.head(_jobInfo.reference_detail)
                },_jobInfo);

                this.setState({
                    jobInfo: _jobInfo

                }, function(){
                    if(this.state.jobInfo.sub_reference_detail.job_applied_count > 0){
                        this.getAppliedApplicants();
                    }else{
                        this.getRecommendCandidates();
                    }
                    DeviceEventEmitter.emit('reloadJobList');
                })
            }
        });
    }

    getRecommendCandidates = () => {
        let API_URL = '';
        const { navigate, goBack, state } = this.props.navigation;

        // console.log('The job id: ', this.props.navigation.state.params);
        API_URL = '/api/jobs/' + this.props.navigation.state.params.job._id + '/candidate';
        getApi(API_URL).then((response) => {
            console.log('Job Candidates (Recommend Applicants): ', response);
            let _allRecommendTalent = response.result;
            // console.log("all recommendtalent",_allRecommendTalent);
            let mainTmp = _.chunk(_.cloneDeep(_allRecommendTalent), 3);
            // console.log("mainTmp after chunk",mainTmp);

            if(response.code == 401)
                return;

            if(response.code == 200){
                _SELF.setState({
                    recommendTalent: mainTmp,
                    allRecommendTalent: _allRecommendTalent
                }, function(){
                    setTimeout(function() {
                        _SELF.setState({
                            isFirstLoad: true,
                        })
                    }, 100);
                })
            }
            _SELF.setState({
                refreshing: false
            })
        });
    }

    getAppliedApplicants = () => {
        // return;
        let API_URL = '';
        const { navigate, goBack, state } = this.props.navigation;
            
        // console.log('Job ID: ', this.props.navigation.state.params.job._id);
        API_URL = '/api/jobs/' + this.props.navigation.state.params.job._id + '/apply?v1';
        // return; 
        getApi(API_URL).then((response) => {
            console.log('Job Applied: ', response);

            if(response.code == 401)
                return;

            let _jobInfo = _SELF.state.jobInfo;
            if(response.code == 200){
                const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
                _jobInfo.sub_reference_detail.job_applied_count = response.result.length;
                
                _SELF.setState({
                    appliedData: response.result,
                    appliedDataSource: ds.cloneWithRows(response.result),
                    jobInfo: _jobInfo

                }, function(){
                    setTimeout(function() {
                        _SELF.setState({
                            isFirstLoad: true,
                        })
                    }, 100);
                })
            }
            _SELF.setState({
                refreshing: false
            })
        });
    }

    // Fetch detail items
    // Example only options defined
    componentWillMount() {
        console.log('Image Cache: ', ImageCache.get());
        // ImageCache.get().clear();

        _SELF = this;
        DeviceEventEmitter.addListener('UpdateAfterEdit', (data) => {
            const { navigate, goBack, setParams, state } = _SELF.props.navigation;
            // console.log('This is my navigation vol vol: ', this.props.navigation);
            // navigate('ViewPostJob', {job: job_info, backToJobList1: true});
            // navigate('JobList');

            // console.log('UpdateAfterEdit: ', data);

            DeviceEventEmitter.emit('reloadJobList');
            
            setParams({
                job : data
            })

            // const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'ViewPostJob', params: {job: data} }], key: state.key })
            // console.log('resetAction : ',resetAction);
            // _SELF.props.navigation.dispatch(resetAction);

            // return;

            if(!_.isEqual(data.sub_reference_detail.criteria, _SELF.state.jobInfo.sub_reference_detail.criteria) ){
                _SELF._getRecommendedTalen();
            }
            let _imgData = _.cloneDeep(data);

            _imgData = _.extend({
                cover: _.head(_imgData.reference_detail)
            },_imgData);

            // data.cover = null;
            _SELF.setState({
                jobInfo:_imgData
            }, function(){
                // console.log('before: ',data);
                // setTimeout(function(){
                //     // _imgData.cover = null;
                //     _SELF.setState({
                //         jobInfo: _imgData
                //     }) 
                //     console.log('after: ', _imgData);
                // },3000)
            })
            // console.log('data....', data)
        })
    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('UpdateAfterEdit');
    }

    openReviewApp = () => {
        var _options = _.extend({}, this.state.options);
        _options.isShowReviewApp = true;
        _options.applicationCount = 6;
        this.setState({options: _options});
    }

    // go to create new job
    PostAJob = () => {
        const { navigate, goBack } = this.props.navigation;
        navigate('CreatePostJob');
    }

    // view profile 
    viewProfile = (_item) => {
        // candidate
        // console.log('This is user info: ', _item); return;
        const { navigate, goBack } = this.props.navigation;
        navigate('Profile',{ user_info: _item });
    }

    // remove after click on unsuitable & start refresh application list
    _updateApplicationList = (_type,applicationId, updateStatus) => {
        let _tmpData = _.cloneDeep(this.state.appliedData);
        // let _tmpApp = [];

        let _tmpJobInfo = _.cloneDeep(this.state.jobInfo);

        if(_type == 'short_listed'){
            _.each(_tmpData,function(v,k){
                if(v._id == applicationId){
                    v.status = updateStatus;
                }
            })
        }
        else{
            // remove apply count
            _tmpJobInfo.sub_reference_detail.job_applied_count--;
            _tmpData = _.filter(_tmpData,function(v,k){
                return v._id != applicationId; 
            })
        }

        // console.log('_tmpData : ', _tmpData, _tmpJobInfo);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
            jobInfo: _tmpJobInfo,
            appliedData: _tmpData,
            appliedDataSource: ds.cloneWithRows(_tmpData),
        }, function(){
            // refresh job post list
            // console.log('Applied Data: ', this.state.appliedData);
            // console.log('Applied Data: ', this.state.appliedData.length);
            this._getRecommendedTalen();
            DeviceEventEmitter.emit('reloadJobList');
        })
    }

    // update status application when user click on short-list or unsuitable
    _updateStatusApplication = (_type, applicationItem) => {
        // console.log('Type: ', _type, ' -===- Application: ', applicationItem);
        if(_type && !this.isUpdatingState){
            this.setState({
                isUpdatingState: true
            })  
            let API_URL = '/api/jobs/' + this.props.navigation.state.params.job._id + '/status';
            putApi(API_URL,
                JSON.stringify({
                    "status": _type,
                    "application_id": applicationItem._id
                })
            ).then((response) => {
                console.log('_updateStatusApplication: ', response);
                if(response.code == 200){
                    _SELF._updateApplicationList(_type, applicationItem._id, response.result.status, );
                
                }else{
                    alert('The applicant is not available to shortlist or unsuitable.');
                }
                this.setState({
                    isUpdatingState: false
                })
            });
        }
    }

    // mark application as short list
    markAsShortList = (_item) => {

        _SELF._updateStatusApplication('short_listed', _item);

        // Alert.alert(
        //     'Are you sure you want to accept this application in short list?',
        //     '',
        //     [
        //         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        //         {text: 'OK', onPress: () => _SELF._updateStatusApplication('short_listed', _item) },
        //     ],
        // )
    }

    // mark application as unsuitable
    markAsUnsuitable = (_item) => {

        _SELF._updateStatusApplication('no_longer_consideration', _item);

        // Alert.alert(
        //     'Are you sure you want to remove this application?',
        //     '',
        //     [
        //         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        //         {text: 'OK', onPress: () => _SELF._updateStatusApplication('no_longer_consideration', _item) },
        //     ],
        // ) 
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

    componentDidMount(){

        GoogleAnalyticsHelper._trackScreenView('Job Detail - Talent Seeker');                 

        // console.log('ImageCache', ImageCache.get());
        const { navigate, goBack, state } = this.props.navigation;
        
        if(state.params.job.apply_count>0){
            this.openReviewApp();
        }

        this._getRecommendedTalen();

    }

    // close listing job api
    _closeJob = () => {
        let rate="";
        if(this.state.positiveVisible){
            rate="positive";
        }
        if(this.state.neutralVisible){
            rate="neutral";
        }
        if(this.state.negativeVisible){
            rate="negative";
        }
        // console.log("State after close job",this.state.description,rate);
        // return;
        let _SELF = this;
        // this.setState({modalVisible:true});
        // console.log('Close Job');
        // return;
        let API_URL = '/api/jobs/'+ this.state.jobInfo._id +'/cancel';

        let _data = JSON.stringify({
            "description": this.state.description.val,
            "rate": rate  
        });

        GoogleAnalyticsHelper._trackEvent('Job', 'User Want To Close', {
            job_id: this.state.jobInfo._id,
            desc: this.state.description.val
        });  

        // console.log('_Data : ', _data);
        postApi(API_URL,_data).then((response) => {
            // console.log('Cancel Job Post: ', response);
            if(response.code == 200){
                
                const { navigate, goBack, dispatch } = _SELF.props.navigation;
                
                Alert.alert(
                    'This job has been deleted.',
                    '',
                    [
                        {text: 'OK', onPress: () => {

                            // const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'JobList'}], key: 'JobList' })
                            // dispatch(resetAction);

                            GoogleAnalyticsHelper._trackEvent('Job', 'User Closed Job', {
                                job_id: _SELF.state.jobInfo._id,
                                desc: _SELF.state.description.val
                            });  

                            DeviceEventEmitter.emit('reloadJobList');
                            goBack();

                            // const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'JobList'}], key: 'JobList' })
                            // dispatch(resetAction);

                            this.setState({modalVisible:false});
                        }},
                    ],
                )

            }
            else{
                alert(response.result);
            }
        });
    }

    setModalVisible(visible){
        this.setState({modalVisible:visible});
    }
    // when user click on close listing job
    _onClosePress = () =>{
        this.setState({modalVisible:true});
        // this._closeJob();
        // Works on both iOS and Android
        // Alert.alert(
        //     'Are you sure you want to close this job?',
        //     '',
        //     [
        //         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        //         {text: 'OK', onPress: () => this._closeJob()},
        //     ],
        // )
    }

    renderFooter = () => {
        // if (!this.state.options.isLoadingTail) {
        //     return <View style={styles.scrollSpinner} />;
        // }
        if (this.state.options.isLoadingTail) {
            return <ActivityIndicator style={styles.scrollSpinner} />;
        }
    }

    _getCover = (item) => {
        let _cover = Helper._getCover(item) ?  {uri: Helper._getCover(item,'thumbnail_url_link')} : require('@assets/icon_profile.png');
        // console.log('_COVER:: ', _cover );
        return _cover;
    }

    _onPullRefresh = () => {
        this.setState({
            refreshing: true
        }, function(){
            this._getRecommendedTalen();
        })
    }
    
    onSelectRate=(type)=>{
        if(type=="positive"){
            this.setState({positiveVisible:true,neutralVisible:false,negativeVisible:false})
        }
        if(type=="neutral"){
            this.setState({positiveVisible:false,neutralVisible:true,negativeVisible:false})            
        }
        if(type=="negative"){
            this.setState({positiveVisible:false,neutralVisible:false,negativeVisible:true})
            
        }
        // Alert.alert('Clicking');
    }

    getEmptyBox = (mainBox) => {
        // console.log('mainBox.length: ', mainBox.length);
        if(mainBox.length == 1)
            return [{},{}];
        else if(mainBox.length == 2)
            return [{}];
        else
            return [];
    }

    render() {

        const { navigate, goBack, state } = this.props.navigation;

        // console.log(this.state);
        return (
                
            <View style={[ styles.justFlexContainer, styles.mainScreenBg ,  {paddingBottom: this.state.jobInfo.status == 'published' ? 50 : 0}]} onPress={() =>  dismissKeyboard()}>
                <ScrollView contentContainerStyle={[ styles.defaultContainer1, {paddingBottom: 20} ]}
                
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={ () => this._onPullRefresh() }
                        />
                    }>
                    {/* cover & avatar */}

                    <View style={[styles.boxAvatarCoverContainer, {maxHeight: 160}]}> 
                        {/*{console.log('This Job info: ', this.state.jobInfo)}*/}
                        {/*<Image style={[styles.boxCover, {width: null }]} source={this.state.jobInfo.cover ? { uri:  this.state.jobInfo.cover.thumbnail_url_link } : this.state.default_cover }/>*/}
                        
                        <CustomCachedImage
                            ref="main_cover"
                            style={[styles.boxCover, {width: null }]}  
                            defaultSource={ require('@assets/banner-default.jpg') }
                            component={ImageProgress}
                            source={ this.state.jobInfo.cover ? { uri:  this.state.jobInfo.cover.thumbnail_url_link } : this.state.default_cover }  
                            indicator={ProgressCircle} 
                            onError={(e) => {

                                console.log('error image view post : ', e); 
                                const _SELF = this;
                                
                                let _jobInfo = this.state.jobInfo;
                                const _thumn = _jobInfo.cover.thumbnail_url_link;

                                ImageCache.get().clear(_thumn).then(function(){

                                    ImageCache.get().bust(_thumn, function(){
                                        console.log('call back');
                                        _jobInfo.cover.thumbnail_url_link = '';

                                        if(_SELF.refs['main_cover']){

                                            _SELF.setState({
                                                jobInfo: _jobInfo
                                            }, function(){
                                                console.log('1-jobInfo', _jobInfo);
                                                _jobInfo.cover.thumbnail_url_link = _thumn;
                                                _SELF.setState({
                                                    jobInfo: _jobInfo,
                                                }, function(){
                                                    console.log('2-jobInfo', _jobInfo);
                                                    
                                                });

                                            });
                                            
                                        }

                                    });

                                });

                            }}
                        />
                        
                        <View style={[ styles.fullWidthHeightAbsolute ]}>

                            <CustomCachedImage
                                ref="sub_cover"                            
                                style={[ styles.boxAvatar, styles.whiteBorder ]}   
                                defaultSource={ require('@assets/job-banner.jpg') }
                                component={ImageProgress}
                                source={ this.state.jobInfo.cover ? { uri: this.state.jobInfo.cover.thumbnail_url_link } : this.state.default_cover } 
                                indicator={ProgressCircle}
                                onError={() => {
                                    {/* ImageCache.get().bust(this.state.jobInfo.cover ? this.state.jobInfo.cover.thumbnail_url_link  : this.state.default_cover) */}
                                }} 
                            />
                            <Text style={[ {color: 'white', marginTop: 8, fontSize: 16}, styles.fontBold ]}>{ this.state.jobInfo.sub_reference_detail.title }</Text>
                            <Text style={{color: 'white', marginTop: 2}}>{ this.state.jobInfo.sub_reference_detail.job_applied_count } Application</Text>

                        </View>
                    </View>

                    {/* recomment talent */}
                    {/*{console.log('The applied count: ', this.state.jobInfo.sub_reference_detail.job_applied_count)}*/}
                    { this.state.jobInfo.sub_reference_detail.job_applied_count <= 0 && (

                        this.state.jobInfo.status != 'published' ? 

                        <View>
                            <Text style={[ styles.blackText, styles.mainHorizontalPaddingXS, { alignSelf:'center', marginTop:100 } ]}>This Job is Closed</Text>
                        </View>

                        :

                        <View style={[ styles.marginTopMD, styles.mainHorizontalPaddingSM ]}>
                        
                            <Text style={[ styles.grayLessText, styles.mainHorizontalPaddingXS ]} onPress={ () => this.openReviewApp() }>Recommended talents</Text>

                            { !this.state.isFirstLoad && (

                                <RecommendDataMockUpLoading />

                            )}

                            <View style={[ {flex:1}, styles.marginTopSM ]}>
                                
                                {this.state.recommendTalent.map((itemMain, indexMain) => {
                                    {/*console.log('Item Main: ', itemMain)*/}
                                    return (
                                    <View key={indexMain} style={[styles.boxWrapContainer,styles.marginTopMD1]}>
                                    {/*console.log('This is recommended applicants[' + index +']: ', item);*/}
                                        {itemMain.map((item, index) => {
                                            {/*console.log("item in render",item);*/}
                                            return (
                                                <View  key={ index } style={[ styles.boxWrapItem, styles.myWrap, styles.marginBotXXS, styles.grayLessBg]}>
                                                    <TouchableOpacity
                                                        activeOpacity = {0.9} 
                                                        style={[{flex:1}]} 
                                                        onPress = {() => this.viewProfile(item)}
                                                    >
                                                        <CustomCachedImage
                                                            style={[styles.userAvatarFull, styles.bgCover]} 
                                                            defaultSource={ require('@assets/job-banner.jpg') }
                                                            component={ImageProgress}
                                                            source={ this._getCover(item) } 
                                                            indicator={ProgressCircle} 
                                                        />

                                                    </TouchableOpacity>
                                                </View>   
                                            )
                                        })}

                                        {this.getEmptyBox(itemMain).map((item, index) => {
                                            {/*console.log("item in render",item);*/}
                                            return (
                                                <View  key={ index } style={[ styles.boxWrapItem, styles.boxWrapItemSizeSM, styles.marginBotXXS, styles.grayLessBg, {opacity: 0}]}>
                                                    <TouchableOpacity
                                                        activeOpacity = {0.9} 
                                                        style={[{flex:1}]} 
                                                        onPress = {() => this.viewProfile(item)}
                                                    >
                                                        <CustomCachedImage
                                                            style={[styles.userAvatarFull, styles.bgCover]} 
                                                            defaultSource={ require('@assets/job-banner.jpg') }
                                                            source={ require('@assets/job-banner.jpg') }                                                             
                                                            component={ImageProgress}
                                                            indicator={ProgressCircle} 
                                                        />
                                                    </TouchableOpacity>
                                                </View>   
                                            )
                                        })}

                                    </View>
                                    )
                                })}

                            </View>

                        </View>

                    )}


                    {/*<Text>{this.state.jobInfo.sub_reference_detail.job_applied_count}</Text>*/}
                    {/* if have someone apply to this job  */}
                    { this.state.jobInfo.sub_reference_detail.job_applied_count>0 && ( 

                        <View style={[ styles.marginTopMD ]}>

                            <Text style={[ styles.grayLessText, styles.mainHorizontalPaddingMD, {marginLeft: 2} ]} onPress={ () => {} }>Review applicants ({ this.state.jobInfo.sub_reference_detail.job_applied_count })</Text>

                            <View style={[ styles.listContainer, styles.marginTopSM, {paddingHorizontal: 0} ]}>

                                { !this.state.isFirstLoad && (
                                    <View style={[ styles.paddingHorizontal ]}>
                                        <MessageDataMockUpLoading />
                                    </View>
                                )}

                                <ListView
                                    dataSource={this.state.appliedDataSource} 
                                    renderFooter={this.renderFooter}
                                    onEndReachedThreshold={10}
                                    onEndReached={() => { 
                                        {/*console.log("fired"); // keeps firing*/}
                                    }}
                                    renderRow={(rowData) => <JobApplyRow {...rowData} func_1={this.markAsShortList} func_2={this.markAsUnsuitable} viewProfileFunc={this.viewProfile} /> }
                                    
                                    automaticallyAdjustContentInsets={false} 
                                    keyboardDismissMode="on-drag"
                                    keyboardShouldPersistTaps="always"
                                    showsVerticalScrollIndicator={false}
                                    removeClippedSubviews={false}
                                    enableEmptySections={true}

                                />
                            </View>

                        </View>

                    )}

                </ScrollView>

                <View style={{flex:1}}>
                    <Modal 
                        visible={this.state.modalVisible}
                        animationType={"slide"}
                        onRequestClose={() => {}}
                        transparent={true}>
                        <TouchableWithoutFeedback onPressOut1={() => {this.setModalVisible(false)}}  onPress={() =>  {dismissKeyboard()}}>
                            <View style={ {flex: 1, backgroundColor:"rgba(0,0,0,0.8)"} }>
                                <View style={{ flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                                    
                                        <TouchableOpacity activeOpacity={1} style={[styles.modalProp]} onPress={() =>  {dismissKeyboard()}}>
                                            <View style={{flex: 1,padding:30,alignItems:'center'}}>
                                            
                                                <Text style={[{fontSize:16,fontWeight:'bold',color:Colors.textBlack}]}>How was your experience?</Text>
                                                <View style={[{flexDirection:'row',marginVertical:20}]}>
                                                    
                                                    <TouchableOpacity activeOpacity={0.5} onPress={() => this.onSelectRate("positive")} style={[styles.iconMargin]}>
                                                        <IconCustom name={"positive-icon"} style={[ styles.languageNavIcon ,styles.iconContainer,{color:this.state.positiveVisible ? Colors.primaryColor : Colors.textBlack}]} />
                                                        <Text style={{textAlign:'center',color:this.state.positiveVisible ? Colors.primaryColor : Colors.textBlack}}>Positive</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity activeOpacity={0.5} onPress={() => this.onSelectRate("neutral")} style={[styles.iconMargin]}>
                                                        <IconCustom name={"neutral-active-icon"} style={[ styles.languageNavIcon ,styles.iconContainer,{color:this.state.neutralVisible ? Colors.primaryColor : Colors.textBlack}]} />
                                                        <Text style={{textAlign:'center',color:this.state.neutralVisible ? Colors.primaryColor : Colors.textBlack}}>Neutral</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity activeOpacity={0.5} onPress={() => this.onSelectRate("negative")} style={[styles.iconMargin]}>
                                                        <IconCustom name={"negative-icon"} style={[ styles.languageNavIcon,styles.iconContainer,{color:this.state.negativeVisible ? Colors.primaryColor : Colors.textBlack}]} />
                                                        <Text style={{textAlign:'center',color:this.state.negativeVisible ? Colors.primaryColor : Colors.textBlack}}>Negative</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <TextInput 
                                                    onChangeText={(txtDescription) => this.setState({description:{
                                                        val:txtDescription   
                                                    }})}
                                                    //returnKeyType="done"
                                                    //onSubmitEditing={() => this._closeJob()}
                                                    placeholder={"Describe your experience or share an idea"}
                                                    editable = {true} 
                                                    numberOfLines = {4} 
                                                    style={[styles.inputBox,styles.textInputMultiLine]} 
                                                    underlineColorAndroid = 'transparent' 
                                                    value={this.state.description.val} 
                                                    multiline={true}
                                                    textAlignVertical={'top'}>
                                                </TextInput>
                                                <View style={[{flex:1,flexDirection:'row',marginVertical:20}]}>

                                                    <TouchableOpacity style={[styles.btnContainer,{marginRight:5}]} onPress={()=>this._closeJob()}>
                                                                <Text style={{color:'white'}}>Submit</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.btnContainer,{backgroundColor:'transparent'}]} onPress={()=>this.setModalVisible(!this.state.modalVisible)}>
                                                        <Text style={{color:Colors.buttonColor}}>Don't close listing</Text>
                                                    </TouchableOpacity>
                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </View>

                {   this.state.jobInfo.status == 'published' && 
                    <View style={styles.absoluteBoxBottom}>
                        <View style={[styles.txtContainer, {flex: 1}]}> 
    
                            <TouchableOpacity activeOpacity = {0.8} style={[styles.flatButton, styles.noRadius, styles.grayBg, styles.noBorder]} onPress={() => this._onClosePress() }>
                                <Text style={[styles.flatBtnText, styles.btFontSize]}>CLOSE LISTING</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                }
                
            </View>
        );
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxAvatarCover, ...BoxWrap,

    scrollSpinner: {
        marginVertical: 20,
    },
    btnContainer:{
        flex:1,
        backgroundColor:Colors.buttonColor,
        justifyContent:'center',
        alignItems: 'center',
        borderRadius:4,
        height:40
    },
    textInputMultiLine:{
        width: 240,
        height:100,
        borderRadius:4,
        backgroundColor:Colors.componentBackgroundColor,
        textAlign:'auto',
        padding:10,
        fontSize:15
    },
    modalProp:{
        width:300,
        height:350,
        backgroundColor:'white',
        borderRadius:8,
        overflow:'hidden'
    },
    iconContainer:{
        fontSize:60,
        color:Colors.textBlack
    },
    iconMargin:{
        marginRight:10
    }   
})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps, AuthActions)(ViewJobList)
