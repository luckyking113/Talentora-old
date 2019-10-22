import {
    StackNavigator, DrawerNavigator
} from 'react-navigation';
import React from 'react'
import { StyleSheet, Text, View, AsyncStorage, Alert, TouchableOpacity,ScrollView } from 'react-native';
import TabNavigator from '@navigators/tabs'
// import Authenticate from '../components/authentication/authenticate'
import Settings from '@components/card/settings'
import InviteFriend from '@components/user/invite-friend';
import Message from './tabs/message'  
import Filters from '@components/discovery/filters'
import FeedBack from '@components/discovery/feed-back'
import VideoScreen from '@components/discovery/video-view';
import VideoTrimScreen from '@components/user/comp/video-trim-view';
import SendJobByChat from '@components/message/send-job-in-chat'

const options = {
    initialRouteName: 'RootScreen',
    lazyLoad: true,
    navigationOptions: {
        headerVisible: false,
        header: null,
    },
    mode: 'modal'
}

export default StackNavigator({

    RootScreen:   { 
        screen: TabNavigator,
        navigationOptions: {
            headerVisible: false,
        }
    },
    Settings:   { 
        screen: Settings,     
        navigationOptions: {
            headerVisible: false,
        }},
    InviteFriend:   { 
        screen: InviteFriend,     
        navigationOptions: {
            headerVisible: true,
        }},
    Filters:   { 
        screen: Filters,     
        navigationOptions: {
            headerVisible: true,
        }},
    FeedBack:   { 
        screen: FeedBack,     
        navigationOptions: {
            headerVisible: false,
            header: null,
        }},
    VideoScreen:   { 
        screen: VideoScreen,
        navigationOptions: {
            headerVisible: false,
            header: null,
        }},
    VideoTrimScreen:   { 
        screen: VideoTrimScreen,
        navigationOptions: {
            headerVisible: false,
            header: null,
        }},
    ChatModal:   { 
        screen: Message,     
        navigationOptions: {
            headerVisible: false,
            header: null,
        }},
    SendJobByChat:   { 
        screen: SendJobByChat,     
        navigationOptions: {
            headerVisible: false,
            // header: null,
        }},
},options);

// export default TabNavigator;
