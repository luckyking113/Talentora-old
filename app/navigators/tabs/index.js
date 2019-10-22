import React from 'react'
import {
    TabNavigator,
    TabBarBottom,
    NavigationActions
} from 'react-navigation';

import {
    DeviceEventEmitter
} from 'react-native'

import { Colors } from '@themes/index';

import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'

// Screens
// Only one for now, add more as required
import Job from './job'
import Discovery from './discovery'
import Search from './search'
// import Record from './media'  
import Message from './message'  
import _Notification from './notification'  
import User from './profile'  

// Tabs
import Tab from '@components/tabs/tab'

import { transparentHeaderStyle, defaultHeaderStyle } from '@styles/components/transparentHeader.style';


// TabNavigator options
const options = {
    initialRouteName: 'Job',
    lazy: true, // lazy = true it mean not load the component util user click on tab icon to shw it
    tabBarPosition: 'bottom',
    tabBarOptions: {
        inactiveTintColor: Colors.tabBarInactiveTintColor,
        activeTintColor: Colors.primaryColor,
        showIcon: true,
        showLabel: false,
        style: {
            backgroundColor: Colors.tabBarBg,
            borderTopColor: Colors.lineColor,

        }
    },

    animationEnabled: false,
    swipeEnabled: false,
    // tabBarComponent: TabBarComponent

    // customize event on click tab index and did other thing
    tabBarComponent: ({jumpToIndex, ...props, navigation}) => (
        <TabBarBottom
            {...props}
            jumpToIndex={index => {
                {/* console.log('props: ', props); */}

                // call to paused all video playing
                  
                 {/* DeviceEventEmitter.emit('PausedAllVideos', {});  */}
                {/* DeviceEventEmitter.emit('PausedAllVideosProfile', {}); */}

                const lastPosition = props.navigationState.index
                const tab = props.navigationState.routes[index]
                const tabRoute = tab.routeName;
                const firstTab = tab.routes[0].routeName;
                {/* console.log(tab.routes[0].params);
                const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: firstTab}], key: firstTab })
                navigation.dispatch(resetAction, {badgeCount : 0}); */}
                {/* navigation.setParams({badgeCount: 0}); */}

                const _emitEvent = 'clearBadgeNumber_' + firstTab;
                {/* console.log('_emitEvent: ', _emitEvent); */}

                // remove dot all except chat
                // coz chat remove dot if user has read all unread message first
                if (index != 2) {
                    setTimeout(function() {

                        DeviceEventEmitter.emit('clearBadgeNumber', {
                            tabType: firstTab
                        }); 


                        // refresh data when user click on tab that still have red dot
                        if(firstTab == 'Discovery'){
                            DeviceEventEmitter.emit('Refresh_Discovery_People'); 
                            DeviceEventEmitter.emit('Refresh_Discovery_Video');                             
                        }
                        else if(firstTab == 'JobList'){
                            DeviceEventEmitter.emit('refreshJopListList');                             
                        }
                        else if(firstTab == 'Notification'){
                            DeviceEventEmitter.emit('refreshNoti'); 
                        }

                        {/* console.log('after delay') */}
                    }, 500);
                }
                		                
                if (index === 2) {
                    {/*navigation.navigate('ChatModal', {isReload: true})*/}
                    
                    {/* const lastPosition = props.navigationState.index
                    const tab = props.navigationState.routes[index]
                    const tabRoute = tab.routeName
                    const firstTab = tab.routes[0].routeName */}

                    {/*console.log('tabRoute: ', tabRoute);
                    console.log('firstTab: ', firstTab);*/}
                    
                    {/* navigation.setParams({badgeCount: 0}); */}
                    {/*navigation.navigate('Chat', {isReload: true})*/}
                    
                    {/*lastPosition !== index && navigation.dispatch(pushNavigation(tabRoute))
                    lastPosition === index && navigation.dispatch(resetNavigation(firstTab))*/}
                    DeviceEventEmitter.emit('reloadMesssageList', {});		
                    DeviceEventEmitter.emit('UpdateUserEnterExitChatRoom', {status: true});
                    jumpToIndex(index)

                    {/*const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'Chat'}], key: 'Chat' })
                    navigation.dispatch(resetAction);

                    navigation.dispatch(NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: tabRoute })],
                    }))*/}

                }
                else {
                    DeviceEventEmitter.emit('UpdateUserEnterExitChatRoom', {});
                    jumpToIndex(index)
                }
            }}
        />

    )
}

/*const navOptions =  ({ navigation }) =>  ({
    headerRight: (<ButtonRight
        icon="add"
        navigate={navigation.navigate}
        to="Settings"
    />),
});*/


const navOptions =  {   
    headerStyle: defaultHeaderStyle,  
    headerTitleStyle :{textAlign: 'center',alignSelf:'center'}, 
    // headerTintColor: Colors.textColorDark, 
}

const TabBarComponent = (props) => {
    console.log('TabBarComponent Props: ', Object.keys(props));
}

export default TabNavigator({

    Job:       { 
                    screen: Job,  
                    navigationOptions: ({ navigation }) => ({ 
                        ...navOptions,
                        headerVisible: false,  
                        tabBarLabel: '',
                        tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="job-icon" notiType="job" />)
                    })
                },

    Discovery:     { 
                    screen: Discovery, 
                    navigationOptions: ({ navigation }) => ({ 
                        headerVisible: false,  
                        tabBarLabel: '',
                        tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="discover-icon" notiType="discover"/>)
                    })
                },

    Chat:     { 
                    screen: Message, 
                    navigationOptions: ({ navigation }) => ({  
                        headerVisible: false,  
                        tabBarLabel: '',
                        tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="message-icon" notiType="chat"/>),
                    })
                },

    Notification:    { 
                    screen: _Notification, 
                    navigationOptions: ({ navigation }) => ({  
                        headerVisible: false,  
                        tabBarLabel: '',
                        tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="notification-icon" notiType="noti" badgeNumber={typeof navigation.state.params === 'undefined' ? 0 : navigation.state.params.badgeCount} />)
                    })
                },

    User:       { 
                    screen: User, 
                    navigationOptions: ({ navigation }) => ({  
                        headerVisible: false,  
                        tabBarLabel: '',
                        //tabBarIcon: (props) => (<Tab {...props} iconType="M" icon="person" />)
                        tabBarIcon: (props) => (<Tab {...props} navigation={navigation} iconType="C" icon="profile-icon" notiType="user" />)
                    })
                },

}, options);
