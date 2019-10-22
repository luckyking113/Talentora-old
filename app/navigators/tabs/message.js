import {
    StackNavigator,
    NavigationActions
} from 'react-navigation';

import MessageContainer from '@components/message/message-container';
import MessageList from '@components/message/message-list'
import Message from '@components/message/message'
import MessageProfileUser from '@components/user/profile'
import JobDetail from '@components/job/talent-seeker/job-detail'
// import Notification from '@components/messsage/notification/notification'
import { Colors } from '@themes/index';
import { headerStyle, titleStyle } from '../../styles/header.style'
import { transparentHeaderStyle, defaultHeaderStyle, defaultHeaderWithShadowStyle } from '@styles/components/transparentHeader.style';

const options = {
    headerMode: 'screen',
    // initialRouteName: 'Message',
    initialRouteName: 'MessageList',
    navigationOptions:{
        headerStyle: defaultHeaderWithShadowStyle,  
        headerTitleStyle: titleStyle,
        // headerTintColor: Colors.textColorDark,
    }
}


const messageStack = StackNavigator({
    MessageContainer: { screen: MessageContainer },
    MessageList:   { screen: MessageList },
    Message:   { screen: Message },
    Profile: { screen: MessageProfileUser },
    JobDetail: { screen: JobDetail},
    // Notification: { screen: Notification }

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

messageStack.router.getStateForAction = navigateOnce(messageStack.router.getStateForAction);

export default messageStack;
