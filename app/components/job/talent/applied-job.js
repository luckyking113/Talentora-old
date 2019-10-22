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
    ListView,
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

import _ from 'lodash'
import { UserHelper, StorageData, Helper } from '@helper/helper';

import ApplyRowItem from '@components/job/comp/apply-row-item';

import { getApi } from '@api/request';

import NormalListItemDataMockUpLoading from '@components/other/normal-list-item-data-mock-up-loading'  

function mapStateToProps(state) {
    return {
        // detail: state.detail
    }
}

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: false,
};


class AppliedJob extends Component {

    constructor(props){
        super(props)

        // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            isFirstLoad: false,
            isPullRefresh: false,
            limit: 10,
            page: 1,
            // dataSource: ds.cloneWithRows([]),
            refreshing: false,
            isLoadMore: false,
            data: [],
            options: {
                total: 0,
            },
            extraData: [{_id : 1}],
        }


        // console.log('chunk: ', _.chunk(_test, 2));

        console.log('Applied Job Info : ',this.props);

    }


    startApplying = () => {
        // const { navigate, goBack } = this.props.navigation;
        // navigate('CreatePostJob');
        console.log('this.props: ', this.props);
        this.props.triggerTab(0);
    }

    // goToJobDetail = (_jobId) => { 
    //     console.log("This is job: ", _jobId); return;
    //     const { navigate, goBack } = this.props.navigation;
    //     navigate('ViewPostJob', {job: _jobId});
    // }

    _onRowPress = (_row) => {
        console.log('_onRowPress', _row);
    }

    goToJobDetail = (_job) => { 
        // console.log(_jobId, '==', this.props.navigation);
        const { navigate, goBack } = this.props.navigation;
        navigate('JobDetail', {job: _job, view_only: false, can_remove: true}); 
    }

    // get vailable job (all match job)
    _getAppliedJob = (_isLoadMore=false, isRefreshListAgain=false) => {
        // /api/users/me/jobs
        let _SELF = this;
        let _offset = (this.state.page - 1) * this.state.limit;
        let API_URL = '/api/users/me/jobs/apply?sort=-created_at&offset='+_offset+'&limit='+this.state.limit;
        // console.log(API_URL);
        getApi(API_URL).then((_response) => {
            // console.log('User Video Already Uploaded : ', _response);
            if(_response.code == 200){
                let _allAppliedJob = _response.result;

                console.log('All Applied Job : ', _response, ' refreshing :', _SELF.state.refreshing, ' isRefreshListAgain: ', isRefreshListAgain); 
                console.log('_isLoadMore: ', _isLoadMore);
                if((!_isLoadMore && !_.isEmpty(_allAppliedJob)) || _SELF.state.refreshing){
                    console.log('condition 1');
                    _SELF.setState({
                        data: _allAppliedJob,
                        options: _response.options,
                        page: _response.options.total <= 1 ? 1 : _SELF.state.page + 1,
                    })
                }
                else{
                    console.log('condition 2');
                    if(_isLoadMore){
                        _SELF.setState({
                            data: [..._SELF.state.data ,..._allAppliedJob ],
                            options: _response.options,                        
                            page: _SELF.state.page + (!_.isEmpty(_allAppliedJob) ? 1 : 0),
                        })
                    }
                }

                // console.log(' Applied Job: ', _SELF);

            }

            _SELF.setState({
                isFirstLoad: true,
                refreshing: false,
                isLoadMore: false,
                extraData: [{_id : _SELF.state.extraData[0]._id++}]
            }, function(){
                console.log('This is data lenght', this.state.data , this.state.page);
            })

        });
    }

    componentWillMount(){
        let _SELF = this;
        DeviceEventEmitter.addListener('refreshApplyList', (data) => {
            _SELF.handleRefresh(true);
        });
    }

    componentDidMount() {
        // console.log('hey xxxxxxxx');
        this._getAppliedJob();

        // hide filter
        // this.props.navigation.setParams({
        //     hideFilter: true
        // })
    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('refreshApplyList');
    }


    _keyExtractor = (item, index) => index;

    _renderItem = ({item}) => {
        return ( 
            <ApplyRowItem { ...item } rowPress={ this.goToJobDetail } />
    )};

    renderFooter = () => {
        if (!this.state.isLoadMore) return null;

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

    handleRefresh = (isRefreshListAgain=false) => {

        let that = this;
        this.setState({
            refreshing: true,
            page: 1,
        }, function(){
            this._getAppliedJob(false, isRefreshListAgain);
        })

    }

    handleLoadMore = () => {

        console.log('isLoadMore: ', this.state.options);
        // We're already fetching
        if (this.state.isLoadMore || this.state.options.total<=this.state.limit) {
            console.log('no need load');
            return;
        }
        console.log('still work')
        this.setState({
            isLoadMore: true,
        }, function(){
            // console.log('go get noti');
            this._getAppliedJob(true);
        });

    }


    render() {

        if(this.state.data.length<=0 && !this.state.isFirstLoad)
            return (
                <View style={[ styles.justFlexContainer, styles.mainScreenBg, {paddingTop: 50} ]}>
                    <NormalListItemDataMockUpLoading />
                </View>
            )
        else{
            if(this.state.data.length<=0 && this.state.page == 1)
                return (
                    
                    <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>

                        <Text style={[styles.blackText, styles.btFontSize]}>
                            You’ve not applied for any jobs yet.
                        </Text>

                        {/*<Text style={[styles.grayLessText, styles.marginTopXS]}>
                            Post a job in less than 30 seconds.
                        </Text>*/}

                        <TouchableOpacity style={[styles.flatButton, styles.flatButtonSizeSM, styles.marginTopMDD, styles.mainHorizontalPaddingSM]} onPress={() => this.startApplying() }>
                            <Text style={[styles.flatBtnText, styles.btFontSize]}>Start applying</Text>
                        </TouchableOpacity>

                    </View>
                );
            else{
                return (
                    <View style={[ styles.justFlexContainer, styles.mainScreenBg, {paddingTop: 50}]}>  
                        {/* <Text>{this.state.page}</Text> */}
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

                            //onViewableItemsChanged = {this.onViewableItemsChanged}

                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                            onEndReachedThreshold={0.5}
                            onEndReached={this.handleLoadMore}
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
export default connect(mapStateToProps)(AppliedJob)
