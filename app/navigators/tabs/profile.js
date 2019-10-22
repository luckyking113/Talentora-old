import {
    StackNavigator,
    NavigationActions
} from 'react-navigation';

import ProfileUser from '../../components/user/profile'
import Setting from '../../components/user/setting'
import TermOfUse from '../../components/user/term-of-use'
import PrivacyPolicy from '../../components/user/privacy-policy'
import HowToImprove from '../../components/user/how-to-improve'
import EditProfile from '../../components/user/edit-profile'
import Review from '../../components/user/review'

// import ProfileUser from '../../components/user/profile'
import { Colors } from '@themes/index';
import { headerStyle, titleStyle } from '../../styles/header.style'
import { transparentHeaderStyle, defaultHeaderStyle, defaultHeaderWithShadowStyle } from '@styles/components/transparentHeader.style';

const options = {
    headerMode: 'screen',
    initialRouteName: 'Profile',
    navigationOptions:{
        headerStyle: defaultHeaderWithShadowStyle,  
        headerTitleStyle: titleStyle,
        // headerTintColor: Colors.textColorDark,
    }
}


const profileStack = StackNavigator({

    Profile:   { screen: ProfileUser },
    Setting: { screen: Setting },
    TermOfUse:{screen: TermOfUse},
    PrivacyPolicy:{screen:PrivacyPolicy},
    HowToImprove:{screen:HowToImprove},
    EditProfile:{screen:EditProfile},
    Review:{screen:Review},

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

profileStack.router.getStateForAction = navigateOnce(profileStack.router.getStateForAction);

export default profileStack;