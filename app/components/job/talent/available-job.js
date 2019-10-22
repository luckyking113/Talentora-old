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
    RefreshControl,
    TextInput,
    FlatList,
    ActivityIndicator,
    DeviceEventEmitter
} from 'react-native'

import { NavigationActions } from 'react-navigation'

import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';

import BoxWrap from '@styles/components/box-wrap.style';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'
import SearchBox from '@components/ui/search'

import _ from 'lodash'
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import ViewPostJob from '@components/job/talent-seeker/view-post-job'     

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";

import { getApi } from '@api/request';

import MatchJobRow from '@components/job/comp/match-job-list'  

import JobDataMockUpLoading from '@components/other/job-data-mock-up-loading'  


function mapStateToProps(state) {
    return {
        // detail: state.detail
    }
}

const _talentType = [{
                        id: '1',
                        category: 'actor',
                        display_name: 'Actor'
                    },
                    {
                        id: '3',
                        category: 'musician',
                        display_name: 'Musician'
                    },
                    {
                        id: '2',
                        category: 'singer',
                        display_name: 'Singer'
                    },
                    {
                        id: '4',
                        category: 'dancer',
                        display_name: 'Dancer'
                    },
                    {
                        id: '5',
                        category: 'model',
                        display_name: 'Model'
                    },
                    {
                        id: '6',
                        category: 'host',
                        display_name: 'Host'
                    }];

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
};


class AvailableJob extends Component {

    constructor(props){
        super(props)

        this.state = {
            options:{
                total: 0
            },
            filterData: null,
            offset: 0,
            page: 1,
            limit: 10,
            searchText: '',
            loading: false,
            isFirstLoad: false,
            refreshing: false,
            extraData: [{_id : 1}],
            selected: (new Map(): Map<string, boolean>),
            isLoading: false,
            isPullRefresh: false,
            allJobList: [],
            allJobListOrigin: [],
        }

        // console.log('chunk: ', _.chunk(_test, 2));

        // console.log('Check User: ',UserHelper._isUser()); 
        // console.log('Check Employer: ',UserHelper._isEmployer());

    }

    static navigationOptions = ({ navigation }) => ({
            // title: '', 
            // headerVisible: true,
            headerTitle: 'Posted Jobs',
            headerLeft: (<ButtonLeft
                icon="person-add"
                navigate={navigation.navigate}
                to=""
            />),
            headerStyle: defaultHeaderStyle,
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
    });

    componentWillMount(){
        let _SELF = this;
        DeviceEventEmitter.addListener('refreshJopListList', (data) => {
            _SELF._getVailableJob('', true);
        });

        DeviceEventEmitter.addListener('FilterJob', (data) => {
            // _SELF.jobFilter(data);
            this.setState({
                filterData: data.dataFilter,
            }, function(){
                _SELF._getVailableJob('', true);
            })
        })

    }

    // Fetch detail items
    // Example only options defined
    componentDidMount() {
        this._getVailableJob();

        // ImageCache.get().clear();
        
        // show filter
        // this.props.navigation.setParams({})
    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('refreshJopListList');
        DeviceEventEmitter.removeListener('FilterJob');
    }

    PostAJob = () => {
        const { navigate, goBack } = this.props.navigation;
        navigate('CreatePostJob');
    }

    goToJobDetail = (_jobId) => { 
        // console.log(_jobId, '==', this.props.navigation);
        const { navigate, goBack } = this.props.navigation;
        navigate('JobDetail', {job: _jobId});

    }

    // get vailable job (all match job)
    _getVailableJob = (_search = '', isLoading, isRefreshing=false) => {
        // return;
        // /api/users/me/jobs
        let _SELF = this;
        let _offset;
        // console.log('Paging : ', this.state.page);
        if(this.state.refreshing || isLoading){
            _offset = 0;
            this.setState({ 
                page: 1,
            })
        }
        else
            _offset = (this.state.page - 1) * this.state.limit;

        // let API_URL = '/api/users/me/jobs?offset='+ _offset +'&limit='+this.state.limit+'&sort=-created_at';
        let API_URL = this._getURLJob(_offset);

        if(isLoading || this.state.searchText != ''){
            this.setState({ 
                isLoading: true,
            })
            API_URL += '&search=' + encodeURI(this.state.searchText || _search);
        }
        
        // console.log('API_URL : ',API_URL);


        getApi(API_URL, this).then((_response) => {
            console.log('All Available Job : ', _response);

            if(_response.code == 401)
                return;

            if(_response.code == 200){
                let _allAvailableJob = _response.result;

                if(_allAvailableJob.length>0){
                    console.log('have data');
                    
                    // console.log('All Vailable Job : ', _SELF); 
                    // console.log('refreshing :',_SELF.state.refreshing);
                    // let _offset = (this.state.page - 1) * this.state.limit
                    if(isRefreshing || isLoading || _SELF.state.allJobList.length == 0){
                        _SELF.setState({
                            // allJobList: 
                            // allJobList: _.chunk(_allAvailableJob, 2)
                            allJobList: _allAvailableJob,
                            options: _response.options,
                            page: _SELF.state.page+1,
                            extraData: [{_id : _SELF.state.extraData++}], 
                        })
                    }
                    // else if(this.options && this.options.total>10){
                    else{
                        _SELF.setState({
                            allJobList: [..._SELF.state.allJobList, ..._allAvailableJob],
                            page: _SELF.state.page+1
                        })
                    }

                }
                else{
                    console.log('empty data');
                    if((this.state.filterData || this.state.searchText) && !this.state.loading ){
                        console.log('set to zero data');
                        _SELF.setState({
                            allJobList: [],
                            page: 1 
                        })
                    }
                }

                // ($scope.cur_page - 1) * $scope.num_per_page

                // console.log('this ', _.chunk(this.state.allJobList, 2));

            }


            if(isLoading || this.state.searchText != ''){
                _SELF.setState({
                    isLoading: false,
                })
            }

            _SELF.setState({
                isFirstLoad: true,
                isPullRefresh: false,
                refreshing: false,
            })

            setTimeout(function(){
                _SELF.setState({
                    loading: false
                })
            },1000)

        });


        // clear red dot when pull to refresh
        if(isRefreshing){
            DeviceEventEmitter.emit('clearBadgeNumber', {
                tabType: 'JobList'
            }); 
        }

    }

    _getURLJob = (_offset) =>{
        if(this.state.filterData){
            console.log('Data: ', this.state.filterData);
            let _SELF = this;
            let _dataFilter = this.state.filterData;

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

            console.log('Age: ',_age, 'talenCate: ', talentCateStringArray);

            return  '/api/jobs/filter?offset='+ _offset +'&limit='+ this.state.limit + '&type='+ talentCateStringArray +'&min_age='+ ageMinMax.min_age +'&max_age='+ ageMinMax.max_age +'&country='+ _country +'&gender='+_gender;
        }
        else{
            return '/api/users/me/jobs?offset='+ _offset +'&limit='+this.state.limit+'&sort=-created_at';
        }
    }

    searchNow = (txtSearch, isEmpty=false) => {
        // console.log('Search Text: ', txtSearch);
        if(!isEmpty){
            this.setState({
                searchText: txtSearch
            }, function(){

                GoogleAnalyticsHelper._trackEvent('Search', 'Job', {text_search: txtSearch});                         

                this._getVailableJob(txtSearch, true);
                if(txtSearch == ''){
                    this.setState({
                        page: 1
                    })
                }
                
            })
        }
    }

    // test flatlist

    _keyExtractor = (item, index) => index;

    _renderItem = ({item}) => (
        <MatchJobRow
            onPressItem={this.goToDetail}
            selected={!!this.state.selected.get(item.id)}
            allJobList = {item}
            navigation = {this.props.navigation}
        />
    );

    renderHeader = () => {
        return (
            <View style={[ styles.marginBotSM ]}>
                <SearchBox placeholder={'Search'} onSubmit={this.searchNow} isLoading={this.state.isLoading} />
            </View>
        )
    }

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
        <View
            style={{
                paddingVertical: 20,
                /*borderTopWidth: 1,*/
                borderColor: "#CED0CE"
            }}
        >
            <ActivityIndicator animating size="small" />
        </View>
        );
    };

    testRefresh = () => {
        console.log('testRefresh');
    }

    handleRefresh = () => { 
        // return;
        let that = this;
        console.log('handleRefresh');
        
        this.setState({
            refreshing: true,
            isPullRefresh: true,
        }, function(){

            // setTimeout(function() {
            that._getVailableJob('',false,true);
            // }, 250);
        
        })
        
    }

    handleLoadMore = () => {

        if(this.state.options.total <= this.state.limit)
            return;

        // console.log('handleLoadMore', this.state.loading);

        let that = this;

        if(!this.state.loading){

            this.setState({
                loading: true,
            },() => {  
                that._getVailableJob();
            })

        }

    }

    emptyComponent = () => {
        return (
            <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>

                <Text style={[styles.blackText, styles.btFontSize]}>
                    No job has been found. 
                </Text>

            </View>
        )
    }

    render() {
        if( !this.state.isFirstLoad && this.state.allJobList.length<=0)
            return (
                <View style={[ {flex: 1, paddingTop: 55} ]}>
                    <JobDataMockUpLoading />
                </View>
            )
        else{
            if(_.isEmpty(this.state.allJobList) && this.state.page == 1)
                return (
                    <View  style={[ styles.justFlexContainer, {paddingTop: 50} ]}>
                        <View style={[ styles.marginBotSM, {height: 50} ]}>
                            <SearchBox placeholder={'Search'} prevText={this.state.searchText} onSubmit={this.searchNow} isLoading={this.state.isLoading} />
                        </View>
                        <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>

                            <Text style={[styles.blackText, styles.btFontSize]}>
                                No job has been found. 
                            </Text>

                        </View>
                    </View>
                )
            else
                return (
                    <View style={[ styles.justFlexContainer, styles.mainScreenBg, {paddingTop: 50}]}>  

                        <FlatList
                            
                            data={_.chunk(this.state.allJobList, 2)}
                            extraData={this.state.extraData}
                            keyExtractor={this._keyExtractor}
                            ListHeaderComponent={this.renderHeader}
                            ListFooterComponent={this.renderFooter}
                            ListEmptyComponent={this.emptyComponent}
                            renderItem={this._renderItem}
                            removeClippedSubviews={false}
                            viewabilityConfig={VIEWABILITY_CONFIG}
                            onEndReachedThreshold={5}
                            onEndReached={this.handleLoadMore}

                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                        />

                    </View>
                );
        }
    }

}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,

})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps, AuthActions)(AvailableJob)
