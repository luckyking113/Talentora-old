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
    ActivityIndicator,
    FlatList,
    Dimensions,
    DeviceEventEmitter
} from 'react-native'

import * as BadgeNotification from '@actions/notification'

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

import NotiRowItem from '@components/notification/comp/notification-row-item';

import { getApi } from '@api/request';

import Tab from '@components/tabs/tab'

import NormalListItemDataMockUpLoading from '@components/other/normal-list-item-data-mock-up-loading'  
const { width, height } = Dimensions.get('window')

const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: false,
};

function mapStateToProps(state) {
    // console.log('main state',state);
    return {
        notification: state.notification,
        // navigation: state.navigation,
        // nav: state.navigation
    }
}

class Notification extends Component {

    constructor(props){
        super(props)

        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});



        this.state = {
            isLoadMore: false,
            refreshing: false,
            isFirstLoad: false,
            limit: 10,
            page: 1,
            selected: (new Map(): Map<string, boolean>),
            data: [],
            extraData: [{_id : 1}],
            // applyList: []
        }

        // console.log('chunk: ', _.chunk(_test, 2));
        console.log('this.props : ',this.props);

    }


    static navigationOptions = ({ navigation }) => ({
            // title: '', 
            // headerVisible: true,
            headerTitle: 'Notifications',
            // tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="notification-icon" badgeNumber={typeof navigation.state.params === 'undefined' ? 0 : navigation.state.params.badgeCount} />)            
        });

    // Fetch detail items
    // Example only options defined
    componentWillMount() {
        DeviceEventEmitter.addListener('refreshNoti', (data) => {
            if(this.props.notification.noti>0)
                this._getNoti();
        });
    }
    componentWillUnmount() {
        DeviceEventEmitter.removeListener('refreshNoti');        
    }

    PostAJob = () => {
        const { navigate, goBack } = this.props.navigation;
        navigate('CreatePostJob');
    }

    goToJobDetail = (_jobId) => { 
        const { navigate, goBack } = this.props.navigation;
        navigate('ViewPostJob', {job: _jobId});
    }

    _onRowPress = (_row) => {
        this.triggerNotificationDetail(_row)
    }

    _getNoti = (_isLoadMore = false) =>{
        let _SELF = this;
        let _offset = (this.state.page - 1) * this.state.limit;
        let API_URL = '/api/notifications?scope=_created_by&offset='+_offset+'&limit='+this.state.limit;

        getApi(API_URL).then((_response) => {
            console.log('All Notification : ', _response);
            if(_response.code == 200){
                let _result = _response.result;
                // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

                _SELF.setState({

                    data: _isLoadMore ?[...this.state.data,..._result]  :_result,
                    page: _SELF.state.page + (!_.isEmpty(_result) ? 1 : 0),

                }, function(){

                })

            }

            setTimeout(function() {
                _SELF.setState({
                    refreshing: false,
                    isFirstLoad: true,
                    isLoadMore: false,
                    extraData: [{_id : _SELF.state.extraData[0]._id++}]
                }, function(){
                    // console.log('This state: ',this.state);
                })
            }, 500);

        });
    }

    componentDidMount(){
        GoogleAnalyticsHelper._trackScreenView('Notification'); 
        
        this._getNoti();  
    }

    _keyExtractor = (item, index) => index;

    _renderItem = ({item}) => {
        return ( 
            <NotiRowItem { ...item } rowPress={ this._onRowPress } />
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

    handleRefresh = () => {

        let that = this;
        this.setState({
            page: 1,
            refreshing: true,
        }, function(){

            // clear red dot when pull to refresh
            DeviceEventEmitter.emit('clearBadgeNumber', {
                tabType: 'Notification'
            }); 

            this._getNoti();
            
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

    triggerNotificationDetail = (item) => {    
        let REQ_API;
        switch (item.action){
            case 'apply-job':
                REQ_API = '/api/posts/' + item.reference_id;
                getApi(REQ_API).then((_response) => {
                    if(_response.code == 200){
                        const { navigate, goBack } = this.props.navigation;
                        navigate('ViewPostJob', {
                            job: _response.result,
                            not_editable: true,
                        });
                    }
                });
                break;
            case 'shortlist-job':
                REQ_API = '/api/jobs/' + item.reference_id;
                getApi(REQ_API).then((_response) => {
                    console.log('Job: ', _response);
                    if(_response.code == 200){
                        const { navigate, goBack } = this.props.navigation;
                        // view_only : status of job if it is cancel or closed. view_only allow to remove if applicable false.
                        // can_remove: status of user if user could apply or remove job.
                        navigate('JobDetail', { 
                            job: _response.result, 
                            // View only true mean can do nothing, false can apply / remove. 
                            view_only: _response.result.status == 'cancel' ? (_response.result.removable ? false : true) : false,
                            can_remove:_response.result.status == 'cancel' ? 
                                (_response.result.removable ? true : false) : (_response.result.applicable ? false : true)  
                        });
                    }
                });
                break;
            case 'cancel-job':
                REQ_API = '/api/jobs/' + item.reference_id;
                // console.log(REQ_API)
                getApi(REQ_API).then((_response) => {
                    console.log('Job: ', _response);
                    if(_response.code == 200){
                        const { navigate, goBack } = this.props.navigation;
                        navigate('JobDetail', { 
                            job: _response.result, 
                            // View only true mean can do nothing, false can apply / remove. 
                            view_only: _response.result.status == 'cancel' ? (_response.result.removable ? false : true) : false,
                            can_remove:_response.result.status == 'cancel' ? 
                                (_response.result.removable ? true : false) : (_response.result.applicable ? false : true)
                        });
                    }
                });
                break;
        }
    }

    render() {
        if(this.state.data.length<=0 && !this.state.isFirstLoad)
            return (
                <NormalListItemDataMockUpLoading />
            )
        else{
            // if(_.isEmpty(this.state.data))
            //     return (
                    
            //         <View style={[ styles.defaultContainer, styles.mainScreenBg ]}>

            //             <Text style={[styles.blackText, styles.btFontSize]}>
            //                 You don`t have any notifications yet.
            //             </Text>

            //         </View>
            //     );
            // else{
                return (

                    <View style={[ styles.justFlexContainer, styles.mainScreenBg]}>  
                    
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
                        { _.isEmpty(this.state.data) && 
                            <View style={[ styles.fullWidthHeightAbsolute, {backgroundColor: 'transparent', height: 25, marginTop: (height/2)-70} ]}>
                                <View style={[ styles.defaultContainer ]}>
                                    <Text style={[styles.blackText, styles.btFontSize, {alignSelf:'center'}]}>
                                        You don`t have any notifications yet.
                                    </Text>
                                </View> 
                            </View> 
                        
                        }
                    </View>

                );
            // }
        }
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,
    scrollSpinner: {
        marginVertical: 20,
    },
})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps, BadgeNotification)(Notification)
