import React from 'react'
import {
    TabNavigator,
    StackNavigator
} from 'react-navigation';

import { Colors } from '@themes/index';

import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'

// tabel (user)
import AvailableJob from '@components/job/talent/available-job'
import AppliedJob from '@components/job/talent/applied-job'

// Tabs
import Tab from '@components/tabs/tab'
import TabItem from '@components/tabs/tab-item'

import ViewPostJob from '@components/job/talent-seeker/view-post-job'     


// TabNavigator options
const options = {
    initialRouteName: 'Available',
    lazyLoad: true,
    tabBarPosition: 'top',
    // indicatorStyle: {
    //     backgroundColor: 'red',
    // },
    tabBarOptions: {
        // inactiveTintColor: '#aaa',
        inactiveTintColor: Colors.tabBarInactiveTintColor,
        activeTintColor: Colors.primaryColor,
        showIcon: false,
        showLabel: true,
        // indicatorStyle: {
        //     backgroundColor: 'red',
        // },
        style: {
            height: 45,
            paddingHorizontal: 15,
            backgroundColor: Colors.tabBarBg, 
            // backgroundColor: 'gray', 
            // borderBottomWidth: 1, 
            // borderBottomColor: Colors.lineColor,  
        }
    },
    animationEnabled: false,
    swipeEnabled: false,
    // tabBarComponent: TabBarComponent
}


const TabBarComponent = (props) => {
    console.log('TabBarComponent Props: ', Object.keys(props));
}

const optionsStack = {
    initialRouteName: 'AvailableJob',
    lazyLoad: true,
}

const StackRoute = StackNavigator({

    AvailableJob:   { screen: AvailableJob },
    ViewPostJob:   { screen: ViewPostJob },

}, optionsStack);

export default TabNavigator({

    Available:       { 
                    screen: AvailableJob,  
                    navigationOptions: ({ navigation }) => ({ 
                        headerVisible: false,  
                        tabBarLabel: (props) => (<TabItem {...props} label="Available" iconType="M" icon="card-travel" />),
                        // tabBarIcon: (props) => (<Tab {...props} iconType="M" icon="card-travel" />)
                    })
                },

    Applied:     { 
                    screen: AppliedJob, 
                    navigationOptions: { 
                        tabBarLabel: (props) => (<TabItem {...props} label="Applied" iconType="M" icon="card-travel" />),
                        // tabBarIcon: (props) => (<Tab {...props} iconType="M" icon="public" />)
                    }
                },

}, options);