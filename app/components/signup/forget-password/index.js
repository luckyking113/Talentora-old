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
import ButtonBack from '@components/header/button-back'

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import _ from 'lodash'

import { postApi } from '@api/request';
import { UserHelper, Helper, StorageData, GoogleAnalyticsHelper } from '@helper/helper';


const dismissKeyboard = require('dismissKeyboard');

var func = require('@helper/validate');


function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class ForgetPassword extends Component{

    constructor(props){
        super(props);
        //your codes ....

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            email: {
                isErrRequired: false,
                val: ''
            },
            user_type_select: '',  
            isLoading: false,
            isActionButton:true,
        }

    }

    static navigationOptions = ({ navigation }) => ({
            headerVisible: false,
            headerLeft: (<ButtonBack
                isGoBack= { navigation }
                dispatchBack={true}
                btnLabel= { 'Welcome' }
            />),
        });


    sendVerifyCodeToEmail = (user_recovery_token) => {

        // {"user_recovery_token": "YmE5OGMwNWRiZTkwNDhhODljMWIyZmZmMzY4ZTJkODI=", "recovery_mode": "sms"}
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;

        if(_.isEmpty(user_recovery_token)){
            console.log('empty resetPasswordData');
            return;
        }

        let API_URL = '/api/recoveries/request';

        postApi(API_URL,
            JSON.stringify({
                user_recovery_token: user_recovery_token,
                recovery_mode: "sms"
            })
        ).then((response) => {

            console.log('Response Object1: ', response);
            if(response.status=="success"){

                let _result = response.result;

                // // user_recovery_token
                // console.log('search account: ', _result);

                // setParams({ resetPasswordData: _result } );
                navigate('VerifyCode',{ resetPasswordData: _result } );
            }
            else{
                alert('Your verify code request reach limit. Please try again in 1 hour')
            }

        })

    }

    continue() {
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;
        // navigate('VerifyCode',{ resetPasswordData: {username: 'panhna@gmail.com'} } );
        // return;
        // console.log('chk email: ', Helper._chkEmail(this.state.email.val));
        dismissKeyboard()
        if(!Helper._chkEmail(this.state.email.val)){
            this.setState({
                email: {
                    isErrRequired: true,
                    val: this.state.email.val
                }
            }, function(){
                console.log('this state', this.state)
            })
        }

        // return;
        let that = this;
        setTimeout(function(){

            if(that.state.email.isErrRequired)
                return;

            let API_URL = '/api/recoveries/search';

            that.setState({
                isLoading: true 
            })
            
            postApi(API_URL,
                JSON.stringify({
                    email: that.state.email.val
                })
            ).then((response) => {
                that.setState({
                    isLoading: false 
                })  
                console.log('Response Object2: ', response);
                if(response.status=="success"){
                    let _result = response.result;
                    that.sendVerifyCodeToEmail(_result.user_recovery_token);
                    // navigate('VerifyCode',{ resetPasswordData: _result } );
                }
                else{
                    alert('Your email is invalid.')
                }

            })

        },50);

        
    }


    backToSignIn = () => {
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;

        const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'RootScreen'}], key: null })
        dispatch(resetAction);
    }

    componentDidMount() {
        GoogleAnalyticsHelper._trackScreenView('Forget Password');                 
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
 
    render() {
        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;

        return (    

            <TouchableWithoutFeedback style={[styles.container]} onPress={() =>  dismissKeyboard()}>
                <View style={[styles.container,styles.mainScreenBg, styles.paddingTopNav]}>
                    
                    <View style={[styles.mainPadding, {marginTop:this.state.isActionButton?0:-30}]}>

                        <Text style={[styles.blackText, styles.btFontSize]}>
                            Forget Password?
                        </Text>

                        <Text style={[styles.grayLessText, styles.marginTopXS]}>
                            We will send confirmation code to your email account. 
                        </Text>

                        <View style={[styles.container,styles.marginTopLG]}> 

                            <TextInput 
                                onChangeText={(txtEmail) => this.setState({email:{

                                    val: txtEmail

                                }})}
                                value={this.state.email.val}                        
                                placeholder="Email *"
                                placeholderTextColor={ this.state.email.isErrRequired ? 'red' :"#B9B9B9"}
                                returnKeyType="next"
                                keyboardType="email-address"
                                autoCorrect={false}
                                autoCapitalize = "none"
                                //onFocus = { ()=> this.keyboardDidShow(null) }
                                onSubmitEditing={() => this.continue()}
                                style={[styles.flatInputBox, styles.input, this.state.email.isErrRequired && {color:'red'}]}
                                underlineColorAndroid = 'transparent'
                                textAlignVertical = 'bottom'
                            />

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

export default connect(mapStateToProps, AuthActions)(ForgetPassword)
