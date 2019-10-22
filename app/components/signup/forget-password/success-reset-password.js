// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { NavigationActions } from 'react-navigation';

import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback , Alert, StatusBar, ActivityIndicator } from 'react-native';

import { user_type } from '@api/response'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import Utilities from '@styles/extends/ultilities.style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BoxWrap from '@styles/components/box-wrap.style';

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import _ from 'lodash'

import { postApi } from '@api/request';
import { UserHelper, StorageData, GoogleAnalyticsHelper } from '@helper/helper';


const dismissKeyboard = require('dismissKeyboard');

function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class SuccessResetPassword extends Component{

    constructor(props){
        super(props);
        //your codes ....

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            user_type_select: '',  
            joining: false
        }

    }

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: false,
        headerLeft: null
    });

    continue() {

        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;
        // dispatch(NavigationActions.back({key: state.params.first_key}));
        // navigate('SuccessResetPassword',{email: 'panhaseng12@gmail.com'});
        const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'RootScreen'}], key: null })
        dispatch(resetAction);
    }

    componentDidMount() {
        
         GoogleAnalyticsHelper._trackScreenView('Success Reset Password');                 

    }
 
    render() {
        
        return (    

            <View style={[styles.container,styles.mainScreenBg, styles.paddingTopNav]}>
                {/*<StatusBar barStyle="light-content" />*/}
                
                <View style={[styles.mainPadding]}>

                    <Text style={[styles.blackText, styles.btFontSize]}>
                        SUCCESSFULLY
                    </Text>

                    {/*<Text style={[styles.grayLessText, styles.marginTopXS]}>
                        You may only select one. This can be easily changed later in your account settings.
                    </Text>*/}
                    <Text style={[styles.grayLessText, styles.marginTopXS]}>
                        Your password has been reset successfully. You can try to login again. 
                    </Text>

                    <View style={[styles.tagContainer,styles.marginTopLG]}> 



                    </View>

                </View>
                
                <View style={styles.absoluteBox}>
                    <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                        <TouchableOpacity style={[styles.flatButton]} onPress={() => this.continue() }>
                                {   
                                    !this.state.joining ? <Text style={[styles.btn, styles.btFontSize]}>Back To Login</Text> : <ActivityIndicator color="white" animating={true} /> 
                                }
                        </TouchableOpacity>

                    </View>
                </View>

            </View>
        );
    }
}


var styles = StyleSheet.create({ ...FlatForm, ...Utilities, ...TagsSelect, ...BoxWrap,
    container: {
        flex: 1,
        // padding: 20
    },

    btn: {
        textAlign: 'center',
        color: "white",
        fontWeight: "700",
    },

    help: {
        justifyContent:'center',
        flexDirection: 'row',
        marginTop: 10,
    },

    forget:{
        color: Colors.textColorDark,  
    },

    gethelp:{
        fontWeight: 'bold',
        color: Colors.textColorDark,
    },


    icon:{
        fontSize: 25,
        fontWeight: 'bold',
        color: Colors.textColorDark,
    },

    fbContainer:{
        // flex: 1,
        justifyContent:'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 10,
    },

    fbLogin:{
        fontWeight: 'bold',
        color: Colors.textColor,
        marginLeft: 10,
    },

    txtContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch'
    },

});

export default connect(mapStateToProps, AuthActions)(SuccessResetPassword)
