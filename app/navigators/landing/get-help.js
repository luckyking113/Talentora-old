import React from 'react'

import {
    StackNavigator,
} from 'react-navigation';


import ForgetPassword from '@components/signup/forget-password'
import VerifyCode from '@components/signup/forget-password/verify-code'
import CreateNewPassword from '@components/signup/forget-password/create-new-pass'
import SuccessResetPassword from '@components/signup/forget-password/success-reset-password'

import { Colors } from '@themes/index';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';

const options = {
    headerMode: 'screen',  
    initialRouteName: 'ForgetPassword',   
    // lazyLoad: true,
}

const navOptions =  ({ navigation }) => ({
    tabBarVisible: false,
    headerVisible: false, 
    headerStyle: transparentHeaderStyle,  
    headerTintColor: Colors.textColorDark, 
});

export default StackNavigator({

    ForgetPassword: { screen: ForgetPassword, navigationOptions: navOptions },
    VerifyCode: { screen: VerifyCode, navigationOptions: navOptions },
    CreateNewPassword: { screen: CreateNewPassword, navigationOptions: navOptions },
    SuccessResetPassword: { screen: SuccessResetPassword, navigationOptions: navOptions },

}, options);
