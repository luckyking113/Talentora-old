// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'
import { NavigationActions } from 'react-navigation';

import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback , Alert, StatusBar, ActivityIndicator, Keyboard } from 'react-native';

import { user_type } from '@api/response';

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import Utilities from '@styles/extends/ultilities.style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BoxWrap from '@styles/components/box-wrap.style';

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import _ from 'lodash'

import { postApi } from '@api/request';
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';


const dismissKeyboard = require('dismissKeyboard');

function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class VerifyCode extends Component{

    constructor(props){
        super(props);
        //your codes ....

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            isSendAgain: false,
            showCompletedSendAgain: false,
            code: {
                isErrRequired: false,
                val: ''
            },
            user_type_select: '',  
            isLoading: false,
            isActionButton:true,
        }

    }

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: false,
        headerLeft: null
    });


    sendVerifyCodeToEmailAgain = (user_recovery_token) => {

        let _SELF = this;

        // {"user_recovery_token": "YmE5OGMwNWRiZTkwNDhhODljMWIyZmZmMzY4ZTJkODI=", "recovery_mode": "sms"}
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;

        if(_.isEmpty(user_recovery_token)){

            console.log('empty resetPasswordData');
            return;
            
        }


        this.setState({
            isSendAgain: true,
            showCompletedSendAgain: false
        })

        let API_URL = '/api/recoveries/resend-code';

        postApi(API_URL,
            JSON.stringify({
                recovery_token: user_recovery_token,
            })
        ).then((response) => {

            console.log('Response Object: ', response);

            this.setState({
                isSendAgain: false
            })

            if(response.status=="success"){

                let _result = response.result;

                this.setState({
                    showCompletedSendAgain: true
                }, function(){
                    setTimeout(function() {
                        _SELF.setState({
                            showCompletedSendAgain: false
                        })
                    }, 5000);
                })

                // // user_recovery_token
                // console.log('search account: ', _result);
                setParams({ resetPasswordData: _result } );
            }

        })

    }

    continue() {

        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;
        dismissKeyboard()

        let _data = state.params.resetPasswordData;

        let API_URL = '/api/recoveries/verify';

        this.setState({
           isLoading: true 
        })
        let _postData = {
            recovery_token: _data.token,   
            code: this.state.code.val
        }
        console.log('My Data: ', _postData);

        postApi(API_URL,
            JSON.stringify(_postData)
        ).then((response) => {

            this.setState({
                isLoading: false 
            })
            
            console.log('Response Object: ', response);
            if(response.status=="success"){

                let _result = response.result;

                navigate('CreateNewPassword',{ 
                    resetPasswordData: _.extend({ verify_code: this.state.code.val},_data) 
                });
            }
            else{
                alert('Verification code invalid or expired.');
            }

        })
    }

    sendCodeAgain = () => {
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;

        GoogleAnalyticsHelper._trackEvent('Verify Code', 'Send Verify Code Again');         
        

        let _data = state.params.resetPasswordData;
        this.sendVerifyCodeToEmailAgain(_data.token);
    }

    backToSignIn = () => {
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;

        const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'RootScreen'}], key: null })
        dispatch(resetAction);
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove()
        this.keyboardDidHideListener.remove()
    }

    keyboardDidShow (e) {
        if(Helper._isAndroid()){
            this.setState({
                isActionButton: false,
            })
        }
    }
    
    keyboardDidHide (e) {
        if(Helper._isAndroid()){
            this.setState({
            isActionButton: true,
            })
        }
    }

    componentDidMount() {
       
        GoogleAnalyticsHelper._trackScreenView('Verify Code');                 
        
        // this.sendVerifyCodeToEmail();
    }
 
    render() {
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;
        return (    
            <TouchableWithoutFeedback style={[styles.container]} onPress={() =>  dismissKeyboard()}>
                <View style={[styles.container,styles.mainScreenBg, styles.paddingTopNav]}>
                    {/*<StatusBar barStyle="light-content" />*/}
                    
                    <View style={[styles.mainPadding, {marginTop:this.state.isActionButton?0:-30}]}>

                        <Text style={[styles.blackText, styles.btFontSize]}>
                            Verify Code
                        </Text>

                        {/*<Text style={[styles.grayLessText, styles.marginTopXS]}>
                            You may only select one. This can be easily changed later in your account settings.
                        </Text>*/}
                        <Text style={[styles.grayLessText, styles.marginTopXS]}>
                            Please check your email (<Text style={[ {color: 'black'} ]}>{ state.params.resetPasswordData.username }</Text>) and input the confirmation code below.
                        </Text>

                        <View style={[styles.container,styles.marginTopLG]}> 

                            <TextInput 
                                onChangeText={(txtCode) => this.setState({code:{

                                    val: txtCode 

                                }})}
                                value={this.state.code.val}                        
                                placeholder="- - - - - -"
                                placeholderTextColor={ this.state.code.isErrRequired ? 'red' :"#B9B9B9"}
                                returnKeyType="next"
                                keyboardType="phone-pad"
                                autoCorrect={false}
                                //onFocus = { ()=> this.keyboardDidShow(null) }
                                onSubmitEditing={() => this.continue()}
                                style={[styles.flatInputBox, styles.input, {textAlign: 'center'}]}
                                underlineColorAndroid = 'transparent'
                                textAlignVertical = 'bottom'
                            />

                            <View style={styles.help}>
                                <Text style={styles.forget}>Didn't see the verification code?</Text>
                                <TouchableOpacity activeOpacity={.8} onPress={() => this.sendCodeAgain()}>
                                    <Text style={styles.gethelp}> Send Again.</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.help, {marginTop: 20}]}>
                                { this.state.isSendAgain && <ActivityIndicator color="gray" animating={true} /> }
                                { this.state.showCompletedSendAgain && <Text style={[ {color: Colors.secondaryCol} ]}>Verification Code Sended.</Text> }
                            </View>

                        </View>

                    </View>
                    
                    <View style={styles.absoluteBox}>
                        <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                            <TouchableOpacity activeOpacity={.8} style={[styles.flatButton]} onPress={() => this.continue() }>
                                    {   
                                        !this.state.isLoading ? <Text style={[styles.btn, styles.btFontSize]}>Next</Text> : <ActivityIndicator color="white" animating={true} /> 
                                    }
                            </TouchableOpacity>
                            <View style={[styles.centerEle, styles.marginTopSM]}>
                                <TouchableOpacity activeOpacity={.8} onPress={ () => { this.backToSignIn() } }>
                                    <Text style={styles.darkGrayText}> Back to login </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
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
        height: 20
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

export default connect(mapStateToProps, AuthActions)(VerifyCode)
