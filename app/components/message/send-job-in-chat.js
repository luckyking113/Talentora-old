import React, { Component} from 'react'
import { connect } from 'react-redux'

// import {
//     addNavigationHelpers
// } from 'react-navigation';

import * as AuthActions from '@actions/authentication'

import AllJobPosted from '@components/job/talent-seeker/post-job-list' // for talent seeker (employer)
import AvailableJobApplied from '@navigators/tabs/job-tabs' // for talent (user)

import { StyleSheet, Text, View, AsyncStorage, Alert, TouchableOpacity, Modal ,TouchableWithoutFeedback, DeviceEventEmitter } from 'react-native';

import Authenticate from '@components/authentication/authenticate';
import LoadingScreen from '@components/other/loading-screen'; 
import OneSignal from 'react-native-onesignal'; 

import { UserHelper, StorageData, GoogleAnalyticsHelper } from '@helper/helper';

import _ from 'lodash'
import { Colors } from '@themes/index';

import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';

import BoxWrap from '@styles/components/box-wrap.style';
import Tabs from '@styles/tab.style';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'

// import AvailableJob from '@components/job/talent/available-job'
// import AppliedJob from '@components/job/talent/applied-job'
// import Videos from '@components/discovery/video'
// import People from '@components/discovery/people'

import AllPeople from '@components/message/comp/all-people'

// var ScrollableTabView = require('react-native-scrollable-tab-view'); 

import ScrollableTabView from 'react-native-scrollable-tab-view';
import CustomizeTabBar from '@components/ui/scroll-tab-view-custom-tab/customize-tab-item';
import { transparentHeaderStyle, defaultHeaderStyle, defaultHeaderWithShadowStyle } from '@styles/components/transparentHeader.style';

import Tab from '@components/tabs/tab'
import ModalCustomHeader from '@components/header/modal-custom-header';

const dismissKeyboard = require('dismissKeyboard');

let _SELF = null;

class SendJobInChat extends Component {

    constructor(props){
        super(props);
        //your codes ....
        this.state = {  
            selectedTab: 0,
            modalVisible:false,
            tabSelected: '',
        }
    }

    static navigationOptions = ({ navigation }) => {
        // console.log('navigation : ', navigation);
        // _SELF = navigation;
        // console.log('_SELF NAV: ',_SELF);
        return ({
            headerTitle: 'Send job to other people',
            headerStyle: defaultHeaderWithShadowStyle,  
            header: () =>  <ModalCustomHeader {...navigation} self={_SELF} title={'Share job with other peoples'} noLeftBtn={true} />,
            headerTitleStyle: titleStyle,
            // tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="discover-icon" badgeNumber={typeof navigation.state.params === 'undefined' ? 0 : navigation.state.params.badgeCount} />),
            headerLeft: (<ButtonLeft
                icon="invite-icon"
                navigate={navigation.navigate}
                to="InviteFriend"
                //babo={console.log('navigation', navigation.state.hasOwnProperty('params') ? (navigation.state.params.hasOwnProperty('hideFilter') ? 'man has': 'ot man te' ): "false")}
            />),
        })};

    componentWillMount(){

    }
    
    componentWillUnmount(){
        
    }

    componentDidMount() {

        GoogleAnalyticsHelper._trackScreenView('Share job with other peoples'); 

        _SELF = this;
    }

    onTabPress = (_tabIndex) => {
        this.setState({
            selectedTab: _tabIndex,
        })
    }


    onChangeTab = (e) => { 
        // console.log('Change Tab: ', e.ref.props.tabLabel);
        dismissKeyboard();

    }

    render() {
        // console.log(this.props.user, this.state.userData);

            return (
                <View style={[ styles.justFlexContainer, styles.mainScreenBg ]}>
                    <AllPeople  tabLabel='All People' navigation={this.props.navigation} discoverState={this.state}/>
                </View>
            )


            return (
                <View style={[ styles.justFlexContainer, styles.mainScreenBg ]}>
                    <ScrollableTabView
                        style={[{marginTop: 0}]}
                        //renderTabBar={() => <ScrollableTabBar tabsContainerStyle={[ styles.tabItem, {padding: 0}, styles.tabsContainer ]} tabStyle={[styles.scrollableTabBar]} style={[{ borderColor: Colors.lineColor } ]} />}
                        //tabBarUnderlineStyle={[{ backgroundColor: Colors.primaryColor,height:2 }, styles.tabBarUnderline]}                    
                        renderTabBar={() => <CustomizeTabBar style={[{ borderColor: Colors.componentBackgroundColor } ]} />} 
                        tabBarUnderlineStyle={[{ backgroundColor: Colors.primaryColor,height:2 }]}
                        tabBarBackgroundColor='white'
                        tabBarPosition='overlayTop'
                        tabBarActiveTextColor={ Colors.primaryColor }
                        tabBarInactiveTextColor={ Colors.textBlack }
                        scrollWithoutAnimation={false}
                        tabBarTextStyle={{fontSize: 16}}
                        onChangeTab={ this.onChangeTab }
                        prerenderingSiblingsNumber={1} // load content in all tav
                        ref={'scrollableTabView'}
                    >
                        <People  tabLabel='All People' navigation={this.props.navigation} discoverState={this.state}/>
                        <People  tabLabel='My Favorite' navigation={this.props.navigation} discoverState={this.state}/>
                    </ScrollableTabView>
                </View>
            
            );

        
    }
}

function mapStateToProps(state) {
    // console.log('main state',state);
    return {
        // user: state.user,
        // navigation: state.navigation,
        // nav: state.navigation
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...Tabs,
    tabItem: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    tabsContainer:{
        justifyContent: 'center'
    },
    scrollableTabBar: {
        width: 120,
        height: 64,
        marginLeft: 20,
        marginRight: 20,
        paddingBottom: 10 
        // paddingTop: 20
    },
    tabBarUnderline: {
        //  height: 4,
        //  bottom: 5,
        //  borderRadius: 5,
         marginLeft: 50,
         width: 60,
        //  backgroundColor: '#57a8f5'
    },
})

export default connect(mapStateToProps, AuthActions)(SendJobInChat)
