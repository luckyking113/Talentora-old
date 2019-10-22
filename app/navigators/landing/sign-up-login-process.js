import React from 'react'

import {
    StackNavigator,
    NavigationActions
} from 'react-navigation';

import SignUp from '@components/signup/signup-info'

import ForgetPassword from '@components/signup/forget-password'
import VerifyCode from '@components/signup/forget-password/verify-code'
import CreateNewPassword from '@components/signup/forget-password/create-new-pass'
import SuccessResetPassword from '@components/signup/forget-password/success-reset-password'

import WhoAreYou from '@components/signup/who-are-you'
import TermOfUse from '../../components/user/term-of-use'
import PrivacyPolicy from '../../components/user/privacy-policy'

// Talent Seeker
import TalentSeekerCategory from '@components/signup/talent-seeker/talent-seeker-category' 
// import TalentSeekerWelcome from '@components/signup/talent-seeker/talent-seeker-welcome'
 
// Talent
import TalentCategory from '@components/signup/talent/talent-category' 
// import TalentWelcome from '@components/signup/talent/talent-welcome' 
import TalentDetail from '@components/signup/talent/talent-detail' 

import TalentWelcome from '@components/signup/welcome' 

import UploadPhoto from '@components/signup/upload-photo' 
import UploadVideo from '@components/signup/upload-video'

import Authenticate from '@components/authentication/authenticate'

import { Colors } from '@themes/index';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';

// const options = {
//     headerMode: 'screen',  
//     initialRouteName: 'LogIn',
//     // initialRouteName: 'SignUp',
//     // initialRouteName: 'TalentUploadVideo',
    
// }

const options = {
    headerMode: 'screen',  
    // initialRouteName: 'UploadPhoto', 
    // initialRouteName:'TalentSeekerWelcome',
    // initialRouteName: 'UploadVideo',
    initialRouteName: 'LogIn',  
    // initialRouteName: 'SignUp',   
    // initialRouteName: 'TalentWelcome',   
    // initialRouteName: 'TalentDetail',   
    lazyLoad: true,
}

const navOptions =  ({ navigation }) => ({
    tabBarVisible: false,
    headerVisible: false, 
    headerStyle: transparentHeaderStyle,  
    headerTintColor: Colors.textColorDark, 
});

const signInSignUp =  StackNavigator({

    // sign-up & sign-in main page
    LogIn:   { screen: Authenticate, navigationOptions: {navOptions}},   
    SignUp: { screen: SignUp, navigationOptions: navOptions },

    ForgetPassword: { screen: ForgetPassword, navigationOptions: navOptions },
    VerifyCode: { screen: VerifyCode, navigationOptions: navOptions },
    CreateNewPassword: { screen: CreateNewPassword, navigationOptions: navOptions },
    SuccessResetPassword: { screen: SuccessResetPassword, navigationOptions: navOptions },

    WhoAreYou: { screen: WhoAreYou , navigationOptions: navOptions},

    // talent seeker (who need actor ...)
    TalentSeekerCategory: { screen: TalentSeekerCategory, navigationOptions: navOptions },
    TalentSeekerWelcome: { screen: TalentWelcome, navigationOptions: navOptions },

    // talent (w ho need job)
    TalentCategory: { screen: TalentCategory, navigationOptions: navOptions },
    TalentWelcome: { screen: TalentWelcome, navigationOptions: navOptions },
    TalentDetail: { screen: TalentDetail, navigationOptions: navOptions },

    UploadPhoto: { screen: UploadPhoto, navigationOptions: navOptions },
    UploadVideo: { screen: UploadVideo, navigationOptions: navOptions },

    TermOfUse:{screen: TermOfUse, navigationOptions: navOptions},
    PrivacyPolicy:{screen:PrivacyPolicy, navigationOptions: navOptions},

}, options);

const prevGetStateForActionHomeStack = signInSignUp.router.getStateForAction;
signInSignUp.router = {
  ...signInSignUp.router,
  getStateForAction(action, state) {
    if (state && action.type === 'ReplaceCurrentScreen') {
      const routes = state.routes.slice(0, state.routes.length - 1);
      routes.push(action);
      return {
        ...state,
        routes,
        index: routes.length - 1,
      };
    }
    return prevGetStateForActionHomeStack(action, state);
  },
};

const navigateOnce = (getStateForAction) => (action, state) => {
  const {type, routeName} = action;
  return (
    state &&
    type === NavigationActions.NAVIGATE &&
    routeName === state.routes[state.routes.length - 1].routeName
  ) ? null : getStateForAction(action, state);
  // you might want to replace 'null' with 'state' if you're using redux (see comments below)
};

signInSignUp.router.getStateForAction = navigateOnce(signInSignUp.router.getStateForAction);

export default signInSignUp;