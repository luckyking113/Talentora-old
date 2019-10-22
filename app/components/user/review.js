import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as AuthActions from '@actions/authentication'

const FBSDK = require('react-native-fbsdk');
const { LoginButton, AccessToken, LoginManager } = FBSDK;

// import * as DetailActions from '@actions/detail'
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
    Switch,
    ActionSheetIOS,
    Linking,
    FlatList,
    ActivityIndicator,
    DeviceEventEmitter
} from 'react-native'

import { view_profile_category } from '@api/response'


import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Styles from '@styles/card.style'
import { Colors } from '@themes/index';
import Utilities from '@styles/extends/ultilities.style'; 
import ListItem from '@styles/components/list-item.style'; 
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'
import ReviewRow from '@components/user/review-row'
import _ from 'lodash'
import { getApi } from '@api/request'

import { UserHelper, StorageData, Helper } from '@helper/helper';

import NormalListItemDataMockUpLoading from '@components/other/normal-list-item-data-mock-up-loading'  


function mapStateToProps(state) {
    // console.log('wow',state)
    return {
        user: state.user,
        user_info: [],
        // navigation: state.navigation
    }
}
const { width, height } = Dimensions.get('window') 

var BUTTONS = [
  'Sign Out',
  'Cancel',
];
var DESTRUCTIVE_INDEX = 0;
var CANCEL_INDEX = 1;
let pre;

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
};

class Review extends Component {
    constructor(props){
        super(props);
        pre = 0;
        this.state={
            tmp:[],
            header:[],
            allIcon:[],
            data:[],
            page:1,
            refreshing: false,
            loading:false,
            dataOption: {},
            isFirstLoad: false,
        }
        console.log('UserHelper._getKind: ',UserHelper._getKind('dancer,actor'));
    }
    
    static navigationOptions = ({ navigation }) => ({ 
        // title: '', 
        headerVisible: false,
        headerTitle: 'Review',
        headerLeft: (<ButtonBack
            isGoBack={ navigation }
            btnLabel= ""
        />),
        headerRight: (
                navigation.state.params.user.user._id?<View style={[styles.flexVerMenu, styles.flexCenter]}>
                    <ButtonRight
                        icon="plus-gray-icon"
                        isReview = { true }
                        user = { navigation.state.params.user }
                        style={{marginRight: 10}}   
                        navigate={navigation.navigate}
                        to="LeaveReview"
                    />
                </View>:null
            )
    });

    componentWillMount(){
        let _SELF = this;        
        DeviceEventEmitter.addListener('reloadReview', (_data) => {
            console.log('_data :', _data)
            _SELF.getRecommendCount();
            _SELF.getReviewList(false, _data.isReload);
        });
    }

    componentDidMount(){
        this.getRecommendCount();
        this.getReviewList(false);
    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('reloadReview');
    }

    inviteFriend = () => {
        const { navigate, goBack, state } = this.props.navigation;
        navigate('InviteFriend');
    }

    handleScroll=(event) => {
        let contentOffset = event.nativeEvent.contentOffset;
        let viewSize = event.nativeEvent.layoutMeasurement;

        // Divide the horizontal offset by the width of the view to see which page is visible
        let pageNum = Math.floor(contentOffset.x / viewSize.width);
        // return pageNum;
        console.log('scrolled to page ', pageNum);
        if(pageNum < 0)
            return;
        let that = this;
        let tmpSelect = _.cloneDeep(this.state.allIcon);
        if(pageNum <= 5){
            tmpSelect[pre].isSelected = false;
            tmpSelect[pageNum].isSelected = true;
            pre = pageNum;
        }
        this.setState({
            allIcon:tmpSelect,
        },function(){
            console.log("All Icon after set selected field",this.state.allIcon);
        })
    }

    getRecommendCount = () => {
        let url = '/api/contacts/' + this.props.navigation.state.params.user._id;
        getApi(url).then((response) => {
            console.log(response);
            let tmpIcon = [];
            for(let i = 0; i < response.result.recommended_stats.length; i++){
                tmpIcon.push({
                    isSelected:false,
                    attribute_value:response.result.recommended_stats[i].attribute_value
                });
            }
            if(tmpIcon.length > 0)
                tmpIcon[0].isSelected = true;
            this.setState({
                header:response.result.recommended_stats,
                allIcon:tmpIcon
            })
        });
    };

    getReviewList = (loadMore = false, isReload = false) => {
        console.log('loadMore :', loadMore);
        if(this.state.loading){
            return;
        }
        if(!loadMore){
            this.setState({
                refreshing: isReload ? false : true,
                page:1
            })
        }else{
            
            if(this.state.dataOption.total<=10)
                return;

            this.setState({
                loading:true
            })

        }
        let _SELF = this;
        let _offset= (this.state.page - 1) * 10;
        if(!loadMore){
            _offset = 0;
        }
        let url = '/api/ratings/profiles/?limit=10' + '&offset=' + _offset + '&target_user=';
        if(this.props.navigation.state.params.user.user._id){
            url = url + this.props.navigation.state.params.user.user._id;
        }else{
            url = url + this.props.navigation.state.params.user.user;
        }
        getApi(url).then((response) => {
            console.log('reponse: ', response);
            let tmp = this.state.data;
            if(loadMore){
                console.log('LOAD MORE...')
                tmp = [...tmp, ...response.result];
            }else{
                console.log('LOAD NEW...')                
                tmp = response.result;
            }
            _SELF.setState({
                data:tmp,
                page:_SELF.state.page+1,
                refreshing:false,
                loading:false,
                dataOption: response.options
            }, function(){
                setTimeout(function() {
                    _SELF.setState({
                        isFirstLoad: true
                    })
                }, 1000);
            });
        });
    };

    _keyExtractor = (item, index) => index;

    _renderItem = ({item, index}) => ( 
        <ReviewRow item ={item} index={index}/>
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

    render() {

        if(!this.state.isFirstLoad){
            return(
                <NormalListItemDataMockUpLoading />
            )
        }
        else{
            if(_.isEmpty(this.state.data))
                return (
                    <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>
                        <Text style={[styles.blackText, styles.btFontSize]}>
                            You don`t have any reviews yet.
                        </Text>
                    </View>
                );
            else{
                return (
                    <View style={[styles.viewContainerOfScrollView, styles.mainScreenBg, {justifyContent: 'flex-start'}]}> 
                        {this.state.header.length > 0 && <View style={[{backgroundColor:Colors.componentBackgroundColor,minHeight:75}]}>
                            <ScrollView pagingEnabled={true} horizontal={true} showsHorizontalScrollIndicator={false} onScroll={this.handleScroll}>
                                {this.state.header.map((item, index) => {
                                    if(!item.attribute_value) return null;                                                                
                                    return (
                                    <View key={index} style={[styles.boxWrapContainer, styles.boxWrapContainerNoWrap,{width:width,flexDirection:'row',justifyContent:'center',alignItems:'center'}]}>
                                        <Text><Text style={[{fontWeight:'bold',fontSize:12}]}>Recommended <Text style={[{color:'red'}]}> {item.count} times </Text> as</Text></Text>
                                        <View style={[{marginLeft:5}]}>
                                            <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    style={[styles.tagsSelectNormal, styles.withBgGray, styles.tagsSelectAutoWidth, styles.noMargin,{backgroundColor:'#e4e4e4'}]}>
                                                    <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM]}>
                                                        {item.attribute_value}
                                                    </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    )
                                })}
                            </ScrollView>
                            <View style={[{flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:10}]}>
                                {this.state.allIcon.map((item, index) => {
                                    if(!item.attribute_value) return null;                                
                                    return(
                                        <Icon key={index} name={"fiber-manual-record"} style={[{fontSize:10, color:item.isSelected ? '#4a4747':'#e4e4e4'}]} />
                                    )
                                })}
                            </View>
                        </View>}
                        <FlatList
                            data={this.state.data}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                            removeClippedSubviews={false}    
                            viewabilityConfig={VIEWABILITY_CONFIG}
                            onEndReachedThreshold={0.5}
                            onEndReached={() => this.getReviewList(true)}
                            onRefresh={() => this.getReviewList(false)}
                            refreshing={this.state.refreshing}
                            ListFooterComponent={this.renderFooter} />
                                    
                    </View>
                );
            }
        }
    }
}


var styles = StyleSheet.create({
    ...Styles,
    ...Utilities,
    ...ListItem,
    ...TagsSelect,
    ...BoxWrap,
    mytagcontainernormal:{
        flexDirection: 'row',
        // justifyContent: 'space-around',
        alignItems: 'center', 
    },
    mytagsSelectNormal: {  
        // minWidth: 75,
        // minHeight: 180,
        overflow: 'hidden',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.componentBackgroundColor,
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

});

export default connect(mapStateToProps, AuthActions)(Review)