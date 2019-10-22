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

import * as BadgeNotification from '@actions/notification'

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


import PeopleItem from '@components/discovery/comp/people-list'  
import ProfileHeader from '@components/user/comp/profile-header'

import { transparentHeaderStyle, defaultHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';


import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import _ from 'lodash'

import { getApi } from '@api/request';

import SearchBox from '@components/ui/search'

import JobDataMockUpLoading from '@components/other/job-data-mock-up-loading'  
import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";

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
  waitForInteraction: true,
};


class People extends React.PureComponent {

    

    constructor(props){
        super(props);
        
        this.state={
            mockUpLoading: false,
            isFirstLoad: false,
            filterData: null,
            offset: 0,
            page: 1,
            limit: 10,
            searchText: '',
            loading: false,
            refreshing: false,
            extraData: [{_id : 1}],
            selected: (new Map(): Map<string, boolean>),
            data: [],
            options: {
                total: 0
            }
        }

        _SELF = this;
    }
    
    
    static navigationOptions = ({ navigation }) => ({
        // title: '', 
        headerVisible: false, 
        headerTitle: 'Discovery',
        headerLeft: (<ButtonLeft
            icon="person-add"
            navigate={navigation.navigate}
            to=""
        />),
        headerStyle: defaultHeaderStyle,
    }); 

    goToDetail = (item) => {
        console.log('goToSetting: ', item);

        GoogleAnalyticsHelper._trackEvent('View Profile', 'Discover - People', {user_id: item.userId, user_name: Helper._getUserFullName(item.attributes) });                                                 

        const { navigate, goBack, state } = this.props.navigation;
        navigate('Profile' , {'user_info': item, 'canReview':true}); 
    }

    // dispatching an action based on state change
    componentWillUpdate(nextProps, nextState) {
        // console.log(nextProps, nextState);
        if (nextState.open == true && this.state.open == false) {
            
        }
    }

    componentWillMount(){
        const { navigate, goBack, state, setParams } = this.props.navigation;
        
        DeviceEventEmitter.addListener('FilterPeople', (data) => {
            // _SELF.jobFilter(data);
            console.log('Filter People Emitted')            
            _SELF.setState({
                filterData: data.dataFilter,
                mockUpLoading: true,
                page: 1,
            }, function(){
                _SELF._getPeopleList();
                console.log('state.params : ',state.params)
            })
        })
        
        DeviceEventEmitter.addListener('Refresh_Discovery_People', (data) => {
            // _SELF.jobFilter(data);
            if(this.props.notification.discover>0)
                _SELF._getPeopleList();
        })

    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('Refresh_Discovery_People');
        DeviceEventEmitter.removeListener('FilterPeople');
    }

    componentDidMount() {

        // console.log('ImageCache', ImageCache.get());
        // ImageCache.get().clear();

        let _SELF = this;
        this._getPeopleList();



    }

    _getPeopleList = (isLoadMore = false, txtSearch='', isSearchLoading=false) => {
         
        let _SELF = this; 
        let _offset= (this.state.page - 1) * this.state.limit;
        // console.log('Offset: ', _offset, ' === Page: ', this.state.page, ' === limite: ', this.state.limit);
        if(isSearchLoading || (!isLoadMore && !isSearchLoading))
            _offset = 0;

        // let API_URL = '/api/contacts/search/people?limit=10&sort=-created_at'; 
        // let API_URL = this._getPeopleJobURL(_offset); 
        // let API_URL = '/api/users/filter?offset='+ _offset +'&limit='+ this.state.limit; 
        // api/users/filter?type=singer,actor&min_weight=50&max_weight=60&gender=M,F&search=sreng gueckly
        // console.log(API_URL);
        let _searchUrl = '';
        if((isSearchLoading || this.state.searchText != '') && !isLoadMore){
            this.setState({ 
                isLoading: true,
                page: 1,
                extraData: [{_id : this.state.extraData[0]._id++}] // change this value to re-render header or footer 
            })
            _searchUrl += '&search=' + encodeURI(this.state.searchText || txtSearch);
        }
        else{
            _searchUrl += '&search=' + encodeURI(this.state.searchText || txtSearch);            
        }

        let API_URL = this._getPeopleJobURL(_offset) + _searchUrl;

        console.log('API_URL _getPeopleList : ',API_URL);

        getApi(API_URL).then((_response) => {
            console.log('All People : ', _response);
            if(_response.status == 'success'){

                // let _allAvailableJob = _response.result;

                // console.log('All Vailable Job : ', _allAvailableJob); 

                let _result = _response.result;

                if((isSearchLoading || this.state.searchText != '') && !isLoadMore){
                    if(!_.isEmpty(_result)){
                        _SELF.setState({
                            data: [],
                            isFirstLoad: false
                        })
                    }
                } 

                let _goodData = _.filter(_result,function(v,k){
                    return v.attributes.kind && v.attributes.kind.value!='';
                });

                _goodData = _.chunk(_result, 2);

                // console.log('_goodData',_goodData, ' isLoadMore :', isLoadMore);

                if(isLoadMore){
                    // console.log('Load More', _SELF.state.data);
                    if(!_.isEmpty(_goodData)){
                        _SELF.setState({
                            data: [..._SELF.state.data, ..._goodData],
                            page: _SELF.state.page+1,
                            options: _response.options                            
                        }, () => {

                        })
                    }
                }
                else{
                    // console.log('No Load More');
                    _SELF.setState({
                        data: [],
                    }, function(){
                        _SELF.setState({
                            data: _goodData,
                            page: _SELF.state.page+1,
                            options: _response.options
                        }, () => {

                        })
                    })
                }
                
                // console.log('After All People : ', _SELF.state);

            }
            
            // console.log('after success');
            
            if(isSearchLoading || this.state.searchText != ''){

                _SELF.setState({  
                    isLoading: false,
                }, function(){
                    // setTimeout(function() {
                        _SELF.setState({
                            loading: false,
                        })
                    // }, 1000);
                })

            }

            _SELF.setState({
                loading: false,                
                isLoading: false,
                mockUpLoading: false,
                refreshing: false,
                isFirstLoad: true,                
                extraData: [{_id : _SELF.state.extraData[0]._id++}] // change this value to re-render header or footer 
            })

        });
    }

    _getPeopleJobURL = (_offset) =>{
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

            if(_dataFilter.selectedLanguages)
                _query += '&language=' + encodeURI(_dataFilter.selectedLanguages.toLowerCase());
            
            _query += '&eye_color=' + encodeURI(_dataFilter.myeyecolor.val.toLowerCase());

            _query += '&hair_color=' + encodeURI(_dataFilter.myhaircolor.val.toLowerCase());

            let _weight = _dataFilter.myweight.val ? _dataFilter.myweight.val.split(' to ') : [];
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
            

            let _height = _dataFilter.myheight.val ? _dataFilter.myheight.val.split(' to ') : [];
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
    
            return  '/api/contacts/search/people?offset='+ _offset +'&limit='+ this.state.limit +'&min_age='+ ageMinMax.min_age +'&max_age='+ ageMinMax.max_age +'&country='+ _country +'&gender='+_gender + _query + '&sort=-created_at';
            
        }
        else{

            return '/api/contacts/search/people?offset='+ _offset +'&limit='+ this.state.limit +'&sort=-created_at';

        }
    }

    test = () => {
        this.props.navigation.setParams({ handleFunc: this.goToSetting });
    }

    // test flatlist
    _keyExtractor = (item, index) => index;

    _onPressItem = (id) => {
        // updater functions are preferred for transactional updates
        console.log('THIS IS MY ID WHEN PRESS ITEM: ', id);
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

    _renderItem = ({item}) => (
        <PeopleItem
            onPressItem={this.goToDetail}
            selected={!!this.state.selected.get(item.id)}
            allData = {item}
        />
    );

    renderHeader = () => {
        return (
            <View style={[ styles.justFlexContainer, styles.marginBotSM ]}>   
                <SearchBox placeholder={'Search'} prevText={this.state.searchText} onSubmit={this.searchNow} isLoading={this.state.isLoading} /> 
            </View>
        )
    }

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
        this.setState({
            refreshing: true,
            page: 1,
        }, function(){
            console.log('pull to refresh');

            // clear red dot when pull to refresh
            DeviceEventEmitter.emit('clearBadgeNumber', {
                tabType: 'Discovery'
            });

            this._getPeopleList();
        });
    }

    handleLoadMore = () => {

        console.log(this.state.options.total,' == ',this.state.limit ,' this.state.loading', this.state.loading);

        let that = this;

        if(this.state.options.total <= this.state.limit || this.state.loading){ 
            return;
        }

        this.setState({
            loading: true,
        },() => {  
            // data testing
            // for increase the list item by 1
            // let _allData = _.cloneDeep(tmpData); // clone obj to use to prevent conflict id. coz flatlist work by id
            // let _tmp = [];
            // let _obj = _.head(_.shuffle(_allData));
            // _obj.id = that.state.data.length+1;
            // _tmp.push(_obj);

            // console.log('TMP : ',_obj);

            // that.setState({
            //     data: [...that.state.data, ..._tmp]
            // }, () => {
            //     setTimeout(function(){
            //         that.setState({
            //             loading: false,
            //         })
            //     },0)
            // })

            console.log('call people list');

            this._getPeopleList(true, '', false);
            

        })

    }

    searchNow = (txtSearch, isEmpty=false) => {
        console.log('Search Text: ', txtSearch);
        if(!isEmpty){
            
            this.setState({
                searchText: txtSearch
            }, function(){

                GoogleAnalyticsHelper._trackEvent('Search', 'People', {text_search: txtSearch});                         
                
                this._getPeopleList(false, txtSearch, true);
                if(txtSearch == ''){
                    this.setState({
                        page: 1
                    })
                }
                
            })
        }
    }


    onViewableItemsChanged = (e) => {
        // console.log('onViewableItemsChanged :', e);


        // clearTimeout();

        // setTimeout(() => {
        //     let _tmpData = _.cloneDeep(this.state.data);

        //     _.each(e.viewableItems,function(v,k){
        //         if(v.isViewable && !v.item.loaded){
        //             _.each(_tmpData, function(v_sub,k_sub){
        //                 if(v_sub._id == v._id){
        //                     v_sub.loaded = true;
        //                 }
        //             })
        //         }
        //     })

        //     _.each(e.changed,function(v,k){
        //         if(!v.isViewable && v.item.loaded){
        //             _.each(_tmpData, function(v_sub,k_sub){
        //                 if(v_sub._id == v._id){
        //                     v_sub.loaded = false;
        //                 }
        //             })
        //         }
        //     })

        //     this.setState({
        //         data: _tmpData
        //     }, () => {

        //     });
        // },2000);
    }

    // end testing flatlist
    render() {

        if( ((!this.state.data || this.state.data.length<=0) && !this.state.isFirstLoad) || this.state.mockUpLoading)
            return (
                <View style={[ {flex: 1, paddingTop: 50} ]}>
                    <JobDataMockUpLoading />
                </View>
            )
        else{

            if(_.isEmpty(this.state.data) && !this.state.loading)
                return(
                    <View  style={[ styles.justFlexContainer, {paddingTop: 50} ]}>
                        <View style={[ styles.marginBotSM, {height: 50} ]}>
                            <SearchBox placeholder={'Search'} prevText={this.state.searchText} onSubmit={this.searchNow} isLoading={this.state.isLoading} />
                        </View>
                        <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>

                            <Text style={[styles.blackText, styles.btFontSize]}>
                                No people has been found. 
                            </Text>

                        </View>
                    </View>
                )
            else
                return (
                    <View style={[ styles.justFlexContainer, styles.mainScreenBg, {paddingTop: 50}]}>  

                        <FlatList

                            data={this.state.data}
                            extraData={this.state.extraData}
                            keyExtractor={this._keyExtractor}

                            ListHeaderComponent={this.renderHeader}
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
    }
});

export default connect(mapStateToProps, BadgeNotification)(People)