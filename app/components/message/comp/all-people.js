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
    DeviceEventEmitter,
    ActionSheetIOS
} from 'react-native'

import { view_profile_category } from '@api/response'


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


import PeopleItem from '@components/message/comp/people-item-with-skill'  
// import PeopleItem from '@components/discovery/comp/people-list'  
import ProfileHeader from '@components/user/comp/profile-header'

import { transparentHeaderStyle, defaultHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';


import { ChatHelper, UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import _ from 'lodash'

import { postApi, getApi } from '@api/request';

import SearchBox from '@components/ui/search'

// import JobDataMockUpLoading from '@components/other/job-data-mock-up-loading'  
import NormalListItemDataMockUpLoading from '@components/other/normal-list-item-data-mock-up-loading'  

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";

import IconMeterial from 'react-native-vector-icons/MaterialIcons';

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

var BUTTONS = [
    'Send Now',
    'Cancel',
  ];

var DESTRUCTIVE_INDEX = 0;
var CANCEL_INDEX = 1;

let sb = null;

class AllPeople extends React.PureComponent {

    

    constructor(props){
        super(props);
        
        this.state={
            isSending: false,
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
        const { navigate, goBack, state } = this.props.navigation;
        
        console.log('Nav State: ', state);

    }
    
    
    static navigationOptions = ({ navigation }) => ({
        // title: '', 
    }); 

    goToDetail = (item) => {
        console.log('goToSetting: ', item);

        GoogleAnalyticsHelper._trackEvent('View Profile', 'Job - Share - To - People', {user_id: item.userId, user_name: Helper._getUserFullName(item.attributes) });                                                 

        const { navigate, goBack, state } = this.props.navigation;
        navigate('Profile' , {'user_info': item, 'canReview':true}); 
    }

    selectedPeople = (itemSelected) => {
        let _stateData = _.cloneDeep(this.state.data);
        console.log('itemSelected: ', itemSelected);
        // return;
        _.each(_stateData,function(v,k){
            if(itemSelected.user._id == v.user._id){
                v.selected = !v.selected;
            }
        });

        this.setState({
            data: _stateData,
        }, function(){
            console.log('State after update : ',this.state);
        });
    }

    _sendJobInChat = (itemSelected) => {
        
        let _itemSelected = _.filter(this.state.data, function(v,k){
            return v.selected;
        })

        console.log('_itemSelected: ', _itemSelected);

        // return;

        const _SELF = this;
        const { navigate, goBack, state } = this.props.navigation;

        if(_itemSelected.length>0){

            this.setState({
                isSending: true
            })

            let _data = {
                job: state.params.shareJobInfo
            }
            let customType = 'send-job';

            _.each(_itemSelected, function(v_user_selected,k){


                ChatHelper._createChannel(sb, {id: v_user_selected.user._id}, null, function(_channel){
                    
                    console.log('send job in chat channel : ', _channel)
                    // _SELF.getChannelInfo(_channel.url);
        
                    // return;
        
                    console.log('data: ', _data);
                    // return;
        
                    _channel.sendUserMessage('', JSON.stringify(_data), customType, function (message, error) {
                        if (error) {
                            console.log(error);
                            return;
                        }
        
                        const _message = {
                        
                            message: state.params.shareJobInfo.title,
                            messageType: 'send-job',
                            chat_id: v_user_selected._id,
                            channelUrl: _channel.url,
                    
                        };
        
                        console.log('Message Obj Notify : ', _message);
        
                        // get meta data for detech both user online + stay on chat room or not
                        // if online + stay on chat room both user no need to send notification. coz user already  saw the message
                        _channel.getMetaData(['chat_members'], function(response, error){
                            if (error) {
                                console.log(error);
                                return;
                            }
        
                            let _metaData = response;
                            if(_metaData.chat_members){
                                let _objMembers = JSON.parse(_metaData.chat_members);
                                let _chkEnablePush = false;
        
                                _.each(_objMembers, function(v,k){
                                    if(!v.isOnScreen)
                                        _chkEnablePush = true;
                                })
                                // console.log('_check Online: ', _chkEnablePush);
                                if(_chkEnablePush)
                                    _SELF._notifyToUser(_message); // send notification to user			
                            }
                            else{
                                _SELF._notifyToUser(_message); // send notification to user
                            }


                            if(k == _itemSelected.length-1){
                                _SELF.setState({
                                    isSending: false
                                })
                                goBack();
                            }
                            

                        });
        
        
                    });
        
                })


            })
        }


    }


	// this function not 
	// coz every message will add to notification item list (notification tab)
	_notifyToUser = (_messsage) => {
		// console.log('_notifyToUser :', _messsage);
		// return;
		const { navigate, goBack, state } = this.props.navigation;
		let _data = {
			text: _messsage.message, 
			action: _messsage.messageType  == 'file' ? 'send-photo' : 'send-text', //'send-text' or 'send-photo',
			user: _messsage.chat_id,
			name: UserHelper.UserInfo.profile.attributes.first_name.value + ' ' + UserHelper.UserInfo.profile.attributes.last_name.value, 
			channel_url: _messsage.channelUrl, 
			chat_id: UserHelper.UserInfo._id
		}
		console.log('_data: ', _data);
		// return;
		let API_URL = '/api/notifications/customs';
		postApi(API_URL,
			JSON.stringify(_data)
		).then((response) => {

			console.log('Response Save Job: ', response);

			if(response.code== 200){
				console.log('Message Notification Send.');
			}
			else{
				console.log('Message Notification Send Error');
			}

		});
	}

    sendJobNow = () => {
        let _SELF = this;
        // console.log('Helper._isIOS() :', Helper._isIOS());
        if(Helper._isIOS()){
            // popup message from bottom with ios native component
            ActionSheetIOS.showActionSheetWithOptions({

                message: 'You want to send now?',
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,

            },
            (buttonIndex) => {

                // console.log(buttonIndex);
                //   this.setState({ clicked: BUTTONS[buttonIndex] });
                if(buttonIndex==0){
                    _SELF._sendJobInChat()
                }

            });
        }
        else{

            // for android ask with alert message with button

            // Works on both iOS and Android
            Alert.alert(
            'You want to send now?',
            '', 
            [
                // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Send Now', onPress: () =>  _SELF._sendJobInChat() },
            ],
            { cancelable: false }
            )
        }
    }

    componentWillMount(){
        const { navigate, goBack, state, setParams } = this.props.navigation;
        
        // DeviceEventEmitter.addListener('FilterPeople', (data) => {
        //     // _SELF.jobFilter(data);
        //     console.log('Filter People Emitted')            
        //     _SELF.setState({
        //         filterData: data.dataFilter,
        //         mockUpLoading: true,
        //         page: 1,
        //     }, function(){
        //         _SELF._getPeopleList();
        //         console.log('state.params : ',state.params)
        //     })
        // })

    }

    componentWillUnmount(){
        // DeviceEventEmitter.removeListener('FilterPeople');
    }

    componentDidMount() {

        // console.log('ImageCache', ImageCache.get());
        // ImageCache.get().clear();

        let _SELF = this;
        this._getPeopleList();

        ChatHelper._sendBirdLogin(function(_sb){
            
            if(!_sb){
                console.log('cannot login to send bird')
                return;
            }

            console.log('_sb : ', _sb);

            sb = _sb;

        })


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

                // _goodData = _.chunk(_result, 2);
                _goodData = _result;

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
            onPressItem={this.selectedPeople}
            selected={!!this.state.selected.get(item.id)}
            userInfo = {item}
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

    if (!this.state.loading) return (<View style={[ {height: 40} ]} />);

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

    // end testing flatlist
    render() {

        if( ((!this.state.data || this.state.data.length<=0) && !this.state.isFirstLoad) || this.state.mockUpLoading)
            return (
                <View style={[ {flex: 1, paddingTop: 0} ]}>
                    <NormalListItemDataMockUpLoading />
                </View>
            )
        else{

            if(_.isEmpty(this.state.data) && !this.state.loading)
                return(
                    <View  style={[ styles.justFlexContainer, {paddingTop: 0} ]}>
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
                    <View style={[ styles.justFlexContainer, styles.mainScreenBg, {paddingTop: 0}]}>  

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

                        { <TouchableOpacity onPress={() => this.sendJobNow()} activeOpacity={.9} style={[ styles.btnSendJobToFriend, styles.shadowBox ]}>
                            {!this.state.isSending && <IconMeterial style={[ { color: 'white', fontSize: 22 } ]} name={'send'} />}
                            {this.state.isSending && <ActivityIndicator color="white" animating={true} />}
                        </TouchableOpacity> }

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
    btnSendJobToFriend: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        height: 50,
        width: 50,
        backgroundColor: Colors.primaryColor,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },

});

export default connect(mapStateToProps)(AllPeople)