import React, { Component } from 'react'
import { connect } from 'react-redux'
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
    RefreshControl,
    DeviceEventEmitter,
    FlatList,
    ActivityIndicator
} from 'react-native'


import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';

import BoxWrap from '@styles/components/box-wrap.style';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'
import * as DetailActions from '@actions/detail'

import _ from 'lodash'
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { getApi, postApi } from '@api/request';
// import {notification_data} from '@api/response';
import JobRowItem from '@components/job/comp/job-item';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

import JobDataMockUpLoading from '@components/other/job-data-mock-up-loading'  

function mapStateToProps(state) {
    // console.log('state xxx : ',state);
    return {
        // detail: state.detail
        // navigation: state.navigation,
    }
}
let that;
let _SELF = null;

const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: false,
};

class PostJobList extends Component {

    constructor(props){
        super(props)

        that = this;
        this.state = { 
            isFirstLoad: false,
            refreshing: false,
            allJobList : [],
            selected: (new Map(): Map<string, boolean>),
            data: [],
            extraData: [{_id : 1}],
        };

        // console.log('First Job this state :', this.props.navigation);
    }

    static navigationOptions = ({ navigation }) => {
        _SELF = navigation;
        console.log('_SELF NAV: ',_SELF);
        return ({
            // title: '', 
            // headerVisible: true,
            headerTitle: 'Posted Jobs',
            headerLeft: (<ButtonLeft
                icon="person-add"
                navigate={navigation.navigate}  
                to=""
            />),
            headerRight: (
                <View style={[styles.flexVerMenu, styles.flexCenter]}>
                    <ButtonRight
                        icon="add"
                        style={{marginRight: 10}}   
                        navigate={navigation.navigate}
                        to="CreatePostJob"
                    />
                </View>
            ),
    })};

    componentWillMount() {
        let that = this;
        DeviceEventEmitter.addListener('reloadJobList', (data) => {
            that._getAllPostedJob();
        })
    }

    // Fetch detail items
    // Example only options defined
    componentWillUnmount() {
        DeviceEventEmitter.removeListener('reloadJobList');
    }

    _getAllPostedJob = (_reload = false) => {
        let _SELF = this;
        let API_URL = '/api/posts/jobs?sort=-created_at';
        getApi(API_URL, this).then((response) => {
            // console.log('Response Object Posted Job: ', response);
            if(response.status == "success"){
                let result = response.result;

                if(_reload && result.length>0){
                    if(result[0].reference_detail)
                        result[0].reference_detail = null; 
                    else{
                        let _latestObj = result[0];
                        _latestObj = _.extend({
                            reference_detail: null,
                        }, _latestObj);
                        result[0] = _latestObj;
                    }
                    // console.log('result : ',result);
                }

                // filter cancel job
                result = _.filter(result,function(v,k){
                    return v.sub_reference_detail.status == 'open';
                })
                console.log('result : ', result);
                this.setState({
                    // allJobList : result,
                    data : result,
                    extraData: [{_id : _SELF.state.extraData[0]._id++}],                    
                    // defaultCover: 'http://static.metacritic.com/images/products/movies/6/77471222784c9946afc3c57c642024a3.jpg',
                    defaultCover : require('@assets/job-banner.jpg')
                });
                // console.log('The state: ', this.state);
                // console.log('', this.state.allJobList[0].reference_detail[0].s3_url);
                // console.log('', this.state.allJobList[0].reference_detail[0].thumbnail_url_link);
                // console.log('', this.state.allJobList[0].sub_reference_detail.job_applied_count);

                // if(notification_data.length > 0){
                //     let API_GET_JOB = '/api/posts/' + notification_data[0].data.id;
                //     // console.log(API_URL);
                //     getApi(API_GET_JOB).then((_response) => {
                //         // console.log('GET JOB BY ID : ', _response);
                //         if(_response.code == 200){
                //             notification_data.splice(0,1);
                //             const { navigate, goBack } = this.props.navigation;
                //             // navigate('ViewPostJob', {job: _job_info});
                //             navigate('ViewPostJob', {job: _response.result});
                //         }
                //     });
                // }
            }

            _SELF.setState({
                refreshing: false
            },function(){
                setTimeout(function() {
                    _SELF.setState({
                        isFirstLoad: true
                    })
                }, 1000);
            })

        });
    }

    componentDidMount(){

        GoogleAnalyticsHelper._trackScreenView('Post Job List - Talent Seeker');         

        // console.log('ImageCache', ImageCache.get());
        // ImageCache.get().clear();
        this._getAllPostedJob();
    }

    PostAJob = () => {
        // console.log('Navigation ddd: ', this.props);
        const { navigate, goBack } = this.props.navigation;
        navigate('CreatePostJob');
    }

    goToJobDetail = (_job_info) => {  
        // console.log('_SELF : ', _SELF); 
        // console.log('_SELF', this.props.navigation);
        const { navigate, goBack } = this.props.navigation;
        navigate('ViewPostJob', {job: _job_info});
    }

    // ==========

    _keyExtractor = (item, index) => index;
    
    _renderItem = ({item}) => {
        return ( 
            <JobRowItem { ...item } goToJobDetail={ this.goToJobDetail } />
    )};

    renderFooter = () => {
        if (!this.state.isLoadMore) 
            return (
                <View style={[ {height: 10} ]} />
            );

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

        let that = this;
        this.setState({
            page: 1,
            refreshing: true,
        }, function(){

            // clear red dot when pull to refresh
            // DeviceEventEmitter.emit('clearBadgeNumber', {
            //     tabType: 'Notification'
            // }); 

            // this._getNoti();
            this._getAllPostedJob();
            
        });

    }

    handleLoadMore = () => {
        // console.log('isLoadMore: ', this.state.isLoadMore);
        // We're already fetching
        if (this.state.isLoadMore) {
            return;
        }

        this.setState({
            isLoadMore: true,
        }, function(){
            // console.log('go get noti');
            this._getNoti(true);
        });


    }

    // ==========


    render() {
        if(this.state.data.length<=0 && !this.state.isFirstLoad)
            return (
                <View style={[ styles.justFlexContainer, styles.mainScreenBg]}>
                    <JobDataMockUpLoading />
                </View>
            )
        else{
            if(_.isEmpty(this.state.data))
                return (
                    <View style={[ styles.defaultContainer ]}>

                        <Text style={[styles.blackText, styles.btFontSize]}>
                            You’ve not post any jobs yet.
                        </Text>

                        <Text style={[styles.grayLessText, styles.marginTopXS]}>
                            Post a job in less than 30 seconds.
                        </Text>

                        <TouchableOpacity style={[styles.flatButton, styles.flatButtonSizeSM, styles.marginTopMDD]} onPress={() => this.PostAJob() }>
                            <Text style={[styles.flatBtnText, styles.btFontSize]}>Post a job</Text>
                        </TouchableOpacity>

                    </View>
                );
            else{
                return (
                    <View style={[ styles.justFlexContainer, styles.mainScreenBg]}>  

                        { false && <ScrollView contentContainerStyle={[ styles.defaultScrollContainer ]}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={ () => this.onRefresh() }
                                />
                            }>

                            <View style={[ styles.justFlexContainer, styles.marginTopSM]}>

                                {_.chunk(this.state.allJobList, 2).map((itemMain, indexmain) => {
                                    return(
                                        <View key={ indexmain }  style={[ styles.boxWrapContainerNew, styles.mainHorizontalPaddingMD ]}>
                                            
                                            {itemMain.map((item, index) => { 
                                                {/*console.log('item : ',item);*/}
                                                return (
                                                    <TouchableOpacity
                                                        activeOpacity = {0.9}  
                                                        key={ index }  
                                                        onPress={() => this.goToJobDetail(item)}
                                                        style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol, index==0 && {  marginRight: 10 }]}   
                                                    >

                                                        {/*<Image 
                                                            style={[styles.userAvatarFull, {height: 200, width: null }]} 
                                                            source={ item.reference_detail && item.reference_detail.length>0 ? { uri:item.reference_detail[0].thumbnail_url_link } : this.state.defaultCover}
                                                        />*/}

                                                        <CustomCachedImage
                                                            style={[styles.userAvatarFull, {height: 200, width: null }]}  
                                                            defaultSource={ require('@assets/job-banner.jpg') }
                                                            component={ImageProgress}
                                                            source={ item.reference_detail && item.reference_detail.length>0 ? { uri:item.reference_detail[0].thumbnail_url_link } : this.state.defaultCover } 
                                                            indicator={ProgressCircle} 
                                                            //onError={() => {
                                                              //  ImageCache.get().bust(item.reference_detail && item.reference_detail.length>0 ? item.reference_detail[0].thumbnail_url_link : this.state.defaultCover)
                                                            //}}
                                                            onError={(e) => {

                                                                {/* console.log('error image view post : ', e); */}

                                                                GoogleAnalyticsHelper._trackException('Job Listing - Talent Seeker == '); 

                                                                const _thumn = item.reference_detail[0].thumbnail_url_link;
                                                                
                                                                ImageCache.get().clear(_thumn).then(function(e){
                                                                    console.log('clear thum ', e)
                                                                    ImageCache.get().bust(_thumn, function(e){
                                                                        console.log('bust', e);
                                                                    });
                                                                });

                                                            }}
                                                        />


                                                        <View style={[ styles.fullWidthHeightAbsolute, styles.defaultContainer, styles.infoBottom, styles.mainVerticalPaddingSM, styles.mainHorizontalPaddingMD ]}>

                                                            <Text style={[ {color: 'white', textAlign: 'left'}, styles.fontBold, styles.marginBotXXS ]}>{ item.sub_reference_detail.title }</Text> 
                                                            {/* tag normal */}
                                                            <View style={[ styles.tagContainerNormal, styles.paddingBotNavXS]}>   

                                                                <View style={[ styles.tagsSelectNormal, styles.withBgGray, item.sub_reference_detail.job_applied_count>0 && styles.tagSelectedGreen, styles.tagsSelectAutoWidth, styles.noMargin, styles.marginTopXXS ]}>
                                                                    <Text style={[ styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, item.sub_reference_detail.job_applied_count>0 && styles.tagTitleSelectedGreen ]}>
                                                                        { item.sub_reference_detail.job_applied_count } applicants
                                                                    </Text>
                                                                    
                                                                </View>      

                                                            </View>
                                                        </View>

                                                    </TouchableOpacity>     
                                                )
                                            })}

                                            { itemMain.length==1 && <View style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol, {opacity:0} ]}></View> }

                                        </View>
                                    )
                                })}

                            </View>

                        </ScrollView> }

                        <FlatList
                            extraData={this.state.extraData}
                            data={this.state.data}
                            keyExtractor={this._keyExtractor}
                            ref={ref => this.listRef = ref}
                            //ListHeaderComponent={this.renderHeader}

                            ListFooterComponent={this.renderFooter}
                            renderItem={this._renderItem}
                            removeClippedSubviews={false}
                            viewabilityConfig={VIEWABILITY_CONFIG}

                            horizontal={false}
                            numColumns={2}
                            //scrollEnabled={false}
                            columnWrapperStyle={{ marginHorizontal: 8 }}

                            //onViewableItemsChanged = {this.onViewableItemsChanged}

                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                            style={[ {paddingBottom: 20} ]}
                            //onEndReachedThreshold={0.5}
                            //onEndReached={this.handleLoadMore}
                        />

                    </View>
                );
            }
        }
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,

})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps)(PostJobList)
