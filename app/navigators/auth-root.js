// import React, { Component} from 'react'
// import { connect } from 'react-redux'

// import {
//     StackNavigator, DrawerNavigator
// } from 'react-navigation';

// // import TabNavigator from '@navigators/tabs'
// import Authenticate from '@components/authentication/authenticate'
// import * as AuthActions from '@actions/authentication'

// // import Authenticate from '../components/authentication/authenticate'
// // import Settings from '@components/card/settings'
// import Record from '../components/media/media-record'

// class RootLogin extends React.Component {

//   static navigationOptions = {
//     title: 'Login',
//   }

//   render() {
//     return (
//       <Authenticate authenticate={this.props.authenticate} />
//     );
//   }

// }

// function mapStateToProps(state) {
//     return {
//         user: state.user,
//         navigation: state.navigation
//     }
// }

// const RootAutoNav = StackNavigator({
//     Login: { screen: RootLogin, navigationOptions: { header: { visible: false }}},
//     Login1: { screen: RootLogin, navigationOptions: { header: { visible: false }}},
// }, {
//     headerMode: 'screen',
//     nitialRouteName: 'Login',
// });

// // export default StackNavigator({
// //     Login:       { screen: RootLogin, navigationOptions: { header: { visible: false }}},
// // }, {
// //     headerMode: 'screen',
// // });

// // export default connect(mapStateToProps, AuthActions)(RootLogin)


// export default RootAutoNav;

import {
    StackNavigator, DrawerNavigator, NavigationActions
} from 'react-navigation';
// import React, { Component } from 'react'
import VideoScreen from '@components/discovery/video-view';
import VideoTrimScreen from '@components/user/comp/video-trim-view';

// import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback , Alert, StatusBar, ActivityIndicator } from 'react-native';

import TabNavigator from '@navigators/landing'
// import GET_HELP from '@navigators/landing/get-help'
// export default TabNavigator;

const options = {
    initialRouteName: 'RootScreen',
    lazyLoad: true,
    navigationOptions: {
        headerVisible: false,
        header: null,
    },
    mode: 'modal'
}

// export default StackNavigator({
const authRootStack = StackNavigator({
        
    RootScreen:   { screen: TabNavigator, navigationOptions: { } },
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
}, options);

const navigateOnce = (getStateForAction) => (action, state) => {
    const {type, routeName} = action;
    // console.log('action: ', action, ' === ', 'state: ', state);
    return (
      state &&
      type === NavigationActions.NAVIGATE &&
      routeName === state.routes[state.routes.length - 1].routeName
    ) ? null : getStateForAction(action, state);
    // you might want to replace 'null' with 'state' if you're using redux (see comments below)
  };
  
  
  authRootStack.router.getStateForAction = navigateOnce(authRootStack.router.getStateForAction);
  
  export default authRootStack;