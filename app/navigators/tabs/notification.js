import {
    StackNavigator,
    NavigationActions
} from 'react-navigation';

// talent seeker (employer)   
import _Notification from '@components/notification/notification'
import JobDetail from '@components/job/talent-seeker/job-detail'
import ViewPostJob from '@components/job/talent-seeker/view-post-job'  

// tabel (user)
// import AvailableAppliedJob from '@components/job/talent/available-applied-job'
import JobTab from '@navigators/tabs/job-tabs'; // talent (user) has tab on job page (available & applied)
import ProfileUser from '@components/user/profile'
import MessageDetail from '@components/message/message'
import CreatePostJob from '@components/job/talent-seeker/create-post-job'

import { Colors } from '@themes/index';
import { headerStyle, titleStyle } from '@styles/header.style'
import { transparentHeaderStyle, defaultHeaderStyle, defaultHeaderWithShadowStyle } from '@styles/components/transparentHeader.style';

import { UserHelper, StorageData, Helper } from '@helper/helper';

// console.log('sowowo : ', props);
const TabBarComponent = (props) => {
    console.log('TabBarComponent Props: ', props);
}
const options = {
    // initialRouteName: 'CreatePostJob',
    // initialRouteName: 'JobDetail',
    initialRouteName: 'Notification',
    navigationOptions:{
        headerStyle: defaultHeaderWithShadowStyle,  
        headerTitleStyle: titleStyle,
        // headerTintColor: Colors.textColorDark,
    }
}

const notificationStack = StackNavigator({

    Notification:   { screen: _Notification },
    JobDetail: { screen: JobDetail},
    ViewPostJob:   {  screen: ViewPostJob },
    Profile:   {  screen: ProfileUser },
    Message:   {  screen: MessageDetail },
    CreatePostJob:   {  screen: CreatePostJob },
    
}, options);


const navigateOnce = (getStateForAction) => (action, state) => {
  const {type, routeName} = action;
  return (
    state &&
    type === NavigationActions.NAVIGATE &&
    routeName === state.routes[state.routes.length - 1].routeName
  ) ? null : getStateForAction(action, state);
  // you might want to replace 'null' with 'state' if you're using redux (see comments below)
};

notificationStack.router.getStateForAction = navigateOnce(notificationStack.router.getStateForAction);

export default notificationStack;
