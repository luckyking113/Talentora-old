// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'
import { NavigationActions } from 'react-navigation';

import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback , Alert, StatusBar, ActivityIndicator, Keyboard } from 'react-native';

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
class CreateNewPass extends Component{

    constructor(props){
        super(props);
        //your codes ....

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            password: {
                isErrRequired: false,
                val: ''
            },
            con_password: {
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

    continue() {
        // const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;
        // console.log('last key: ', state.params.first_key);
        // state.params.first_key.navigation.dispatch(NavigationActions.back());
        // state.params.first_key.navigation.goBack();

        // navigate('SuccessResetPassword',{email: 'panhaseng12@gmail.com'});

        const { navigate, goBack, setParams, state, dispatch } = this.props.navigation;
        dismissKeyboard();

        if(_.isEmpty(this.state.password.val)){
            this.setState({
                password: {
                    isErrRequired: true,
                    val: this.state.password.val
                }
            })
        }

        if(_.isEmpty(this.state.con_password.val)){
            this.setState({
                con_password: {
                    isErrRequired: true,
                    val: this.state.con_password.val
                }
            })
        }

        if(this.state.password.val != this.state.con_password.val){
            this.setState({
                con_password: {
                    isErrRequired: true,
                    val: this.state.con_password.val
                }
            })
            alert('Confirm password is not matching with password.');
            return;
        }


        let API_URL = '/api/recoveries/reset-password';

        this.setState({
           isLoading: true 
        })
        
        postApi(API_URL,
            JSON.stringify({
                recovery_token: state.params.resetPasswordData.token,
                code: state.params.resetPasswordData.verify_code,
                password: this.state.password.val
            })
        ).then((response) => {

            this.setState({
                isLoading: false 
            })

            console.log('Response Object: ', response);
            if(response.status=="success"){

                let _result = response.result;
                navigate('SuccessResetPassword',{ resetPasswordData: _result } );
            }
            else{
                this.setState({
                    password: {
                        isErrRequired: true,
                        val: this.state.password.val
                    },
                    con_password: {
                        isErrRequired: true,
                        val: this.state.con_password.val
                    }
                })
                alert(response.result);
            }

        })

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

    componentDidMount() {
        
         GoogleAnalyticsHelper._trackScreenView('Create New Password');                 

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
        
        return (    

            <TouchableWithoutFeedback style={[styles.container]} onPress={() =>  dismissKeyboard()}>

                <View style={[styles.container,styles.mainScreenBg, styles.paddingTopNav, {marginTop:this.state.isActionButton?0:-120}]}>
                    {/*<StatusBar barStyle="light-content" />*/}
                    
                    <View style={[styles.mainPadding]}>

                        <Text style={[styles.blackText, styles.btFontSize]}>
                            Set New Password
                        </Text>

                        {/*<Text style={[styles.grayLessText, styles.marginTopXS]}>
                            You may only select one. This can be easily changed later in your account settings.
                        </Text>*/}
                        <Text style={[styles.grayLessText, styles.marginTopXS]}>
                            Please input your new password. 
                        </Text>

                        <View style={[styles.container,styles.marginTopLG]}> 

                        <TextInput 
                                onChangeText={(txtPassword) => this.setState({password:{

                                    val: txtPassword 

                                }})}
                                value={this.state.password.val}                        
                                placeholder="Password *"
                                placeholderTextColor={ this.state.password.isErrRequired ? 'red' :"#B9B9B9"}
                                returnKeyType="next"
                                autoCorrect={false}
                                secureTextEntry
                                //onFocus = { ()=> this.keyboardDidShow(null) }
                                onSubmitEditing={() => this.conPasswordInput.focus()}
                                style={[styles.flatInputBox, styles.input, this.state.password.isErrRequired && {color:'red'}]}
                                underlineColorAndroid = 'transparent'
                                textAlignVertical = 'bottom'
                            />

                        <TextInput 
                                onChangeText={(txtConPassword) => this.setState({con_password:{

                                    val: txtConPassword 

                                }})}
                                value={this.state.con_password.val}                        
                                placeholder="Confirm Password *"
                                placeholderTextColor={ this.state.con_password.isErrRequired ? 'red' :"#B9B9B9"}
                                returnKeyType="next"
                                autoCorrect={false}
                                secureTextEntry
                                //onFocus = { ()=> this.keyboardDidShow(null) }
                                ref={(input) => this.conPasswordInput =  input}
                                onSubmitEditing={() => this.continue()}
                                style={[styles.flatInputBox, styles.input, this.state.con_password.isErrRequired && {color:'red'}]}
                                underlineColorAndroid = 'transparent'
                                textAlignVertical = 'bottom'
                            />

                        </View>

                    </View>
                    
                    <View style={styles.absoluteBox}>
                        <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                            <TouchableOpacity style={[styles.flatButton]} onPress={() => this.continue() }>
                                    {   
                                        !this.state.isLoading ? <Text style={[styles.btn, styles.btFontSize]}>Continue</Text> : <ActivityIndicator color="white" animating={true} /> 
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

export default connect(mapStateToProps, AuthActions)(CreateNewPass)
