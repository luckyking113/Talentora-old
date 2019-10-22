import React from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, TouchableOpacity, Alert, StatusBar, AsyncStorage } from 'react-native';
import { Colors } from '../../themes/index';
import Icon from 'react-native-vector-icons/FontAwesome';
import { IconCustom } from '@components/ui/icon-custom';

const FBSDK = require('react-native-fbsdk');
const { LoginButton, AccessToken, LoginManager } = FBSDK;
import DeviceInfo from 'react-native-device-info';
import {postApi, loginFacebook} from '@api/request';

import _ from 'lodash'

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';


var func = require('@helper/validate');
let _deviceId;
let that;

export default class LogInForm extends React.Component {

    constructor(props){
        super(props);
        that = this;
        // this._successLogin = this._successLogin.bind(this);
        this.state = {
            email: {
                val: '',
                isErrRequired: false
            },
            password: {
                val: '',
                isErrRequired: false
            },
            fbLoading: false,
            emailLoginLoading: false,

        };

        // testing helper func
        // let _bd = Helper._getBirthDateByAge(24);  
        // let _gender = Helper._getGender('male');
        // console.log('_bd :', _bd, ', gender: ', _gender);
    }

    componentDidMount() {

        LoginManager.logOut();

        GoogleAnalyticsHelper._trackScreenView('Log In');         
        
        this.txtUsername.focus();
    }

    // check it user complete fill info
    _verifyFullFillInfo = (_userInfo) => {
        if(_userInfo.activeUserRoles){
            if(_userInfo.profile.attributes){
                if(!_.isEmpty(_userInfo.profile.attributes.kind) && !_.isEmpty(_userInfo.profile.attributes.date_of_birth))
                    return true;
                else
                    return false;
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }
    }

    // verfity which route user has to continue to complete their fill info
    _verifyRouteToGo = (_userInfo) => {
        const { navigate, goBack, state } = this.props.loginFrm.props.navigation;
        
        if(_userInfo.activeUserRoles.length<=0){
            // user need to fill Talent Category (employer or user)
            navigate('WhoAreYou', { noBackButton : true  });
        }
        else{
            console.log(_userInfo);
            const userRole = UserHelper._getFirstRole();
            if(_userInfo.profile.attributes){
                
                if(_.isEmpty(_userInfo.profile.attributes.kind)){
                    // user need to fill Talent Type (director, dancer, host ...)

                    if(userRole.role.name == 'user')
                        navigate('TalentCategory' , { noBackButton : true  });
                    else
                        navigate('TalentSeekerCategory', { noBackButton : true } );

                    // return true;
                }
                else if(_.isEmpty(_userInfo.profile.attributes.date_of_birth)){
                    navigate('TalentWelcome',{ sign_up_info: _userInfo, noBackButton : true  });
                    // return false;
                }
                else{
                    // attri data if user has been input some data of attri
                    const _attrData = _userInfo.profile.attributes;
                    if(userRole.role.name == 'user'){

                        // if user has been input at lease 1 field for Detail 
                        if(!_.isEmpty(_attrData.ethnicity.value) || !_.isEmpty(_attrData.language.value) || !_.isEmpty(_attrData.height.value) ||
                        !_.isEmpty(_attrData.weight.value) || !_.isEmpty(_attrData.hair_color.value) || !_.isEmpty(_attrData.eye_color.value)){
                            
                            // console.log('WOWO User info: ', _userInfo.profile);
                            if(!_userInfo.photos || _userInfo.photos.length<=0)
                                navigate('UploadPhoto',{ sign_up_info: _userInfo, noBackButton : true  });
                            else
                                navigate('UploadVideo',{ sign_up_info: _userInfo, noBackButton : true  });
                        }
                        else{
                            if(_userInfo.photos && _userInfo.photos.length > 0)
                                navigate('UploadVideo',{ sign_up_info: _userInfo, noBackButton : true  });
                            else
                                navigate('TalentDetail',{ sign_up_info: _userInfo, noBackButton : true });
                        }
                    }
                    else{
                        // console.log('WOWO DOwn User info: ', _userInfo.profile);
                        if(!_userInfo.photos || _userInfo.photos.length<=0)
                            navigate('UploadPhoto',{ sign_up_info: _userInfo, noBackButton : true }); 
                        else
                            navigate('UploadVideo',{ sign_up_info: _userInfo, noBackButton : true  });
                    }
                }
            }
            else{
                // user need to fill Talent Type (director, dancer, host ...)
                if(userRole.role.name == 'user')
                    navigate('TalentCategory',{ sign_up_info: _userInfo, noBackButton : true });
                else
                    navigate('TalentSeekerCategory',{ sign_up_info: _userInfo, noBackButton : true });
            }
        }
    }


    // save user data for email login
    _saveUserData = (response) => {

        let that = this;
        const { navigate, goBack, state } = this.props.loginFrm.props.navigation;

        let _userInfo = response.result;

        UserHelper.UserInfo = _userInfo;

        console.log('_saveUserData : ', UserHelper.UserInfo);

        if(_userInfo.is_register_completed && this._verifyFullFillInfo(_userInfo)){

            let _userData =  StorageData._saveUserData('TolenUserData',JSON.stringify(_userInfo)); 
            // assign for tmp user obj for helper
            UserHelper.UserInfo = _userInfo;

            _userData.then(function(result){

                console.log('complete login : ', UserHelper.UserInfo);

                StorageData._removeStorage('SignUpProcess');
                
                that.setState({
                    fbLoading : false,
                }) 
                
                that.props.loginFrm.authenticate();

            });
        }
        else{
            
            that.setState({
                fbLoading : false,
            }) 
            
            this._verifyRouteToGo(_userInfo);

            // if(_userInfo.activeUserRoles.length<=0){
            //     navigate('WhoAreYou');
            //     // console.log('not yet has role'); 
            // } 
            // else if(_userInfo.activeUserRoles.length>0 && _.isEmpty(_userInfo.profile.attributes.gender)){ 
            //     const userRole = UserHelper._getFirstRole();
            //     if(userRole.role.name == 'user')
            //         navigate('TalentCategory');
            //     else
            //         navigate('TalentSeekerCategory');
                
            // }
        }

    }

    _logInBtn = () => {
        if(func(this.state.email,'email')){

			this.setState((previousState) => {
				return {
                    email:{
                        val: previousState.email.val,
                        isErrRequired:true
                    }
				};
			});

        }
        if(func(this.state.password,'password')){

            this.setState({
                password:{
                    isErrRequired:true
                }
            })

        }
        // this.checkRequire(this.state.email,'username');
        // this.checkRequire(this.state.password,'password');

        // user_name: michelbay@ex.com
        // password: a1234567


        GoogleAnalyticsHelper._trackEvent('Log In', 'With Email'); 
        

        let that = this;
        setTimeout(function(){

            if(!that.state.email.isErrRequired && !that.state.password.isErrRequired ){

                that.setState({
                    emailLoginLoading: true
                });

                postApi('/api/users/authenticate',
                    JSON.stringify({
                        'email': that.state.email.val,
                        'password': that.state.password.val,
                    })
                ).then((response) => {
                    console.log('response: ', response);
                    if(response.status=="success"){
                        console.log('Response Object: ', response);
                        that._saveUserData(response);
                    }
                    else{
                        that.setState({
                            emailLoginLoading: false
                        });
                        if(response.result){
                            // Alert.alert(response.result);
                            Alert.alert('Invalid Email or Password' );
                        }
                        
                    }
                })
            }
	    }, 50);
    }

    addText = function() {
        Alert.alert('Get Help');
        console.log('Hello Pressed');   
        // console.log('This is device id: ', DeviceInfo.getUniqueID());
    }

    // facebook login or signup
    _goSignUp = (response) => {

        // console.log(this.props.loginFrm.props);

        const { navigate, goBack, setParams, state } = this.props.loginFrm.props.navigation;

        let _userInfo = response.result;

        UserHelper.UserInfo = _userInfo;
        // if user complete signup process show login them
        if(_userInfo.is_register_completed && this._verifyFullFillInfo(_userInfo)){

            let that = this;
            let _userData =  StorageData._saveUserData('TolenUserData',JSON.stringify(_userInfo)); 
            // assign for tmp user obj for helper
            
            _userData.then(function(result){
                // console.log('complete save sign up process 3'); 
                that.props.loginFrm.authenticate();

            });
        }
        else{
            // user not complete signup process
            // continue with next step
            if(_userInfo.activeUserRoles.length<=0){
                navigate('WhoAreYou', { sign_up_info: {fb_data: _userInfo}});
                // console.log('not yet has role'); 
            } 
            else if(_userInfo.activeUserRoles.length>0 ){

                const userRole = UserHelper._getFirstRole();

                if(userRole.role.name == 'user')
                    navigate('TalentCategory',{ sign_up_info: {fb_data: _userInfo}});
                else
                    navigate('TalentSeekerCategory',{ sign_up_info: {fb_data: _userInfo}});
                
            }
        }
    }

    facebookLogin = () =>{
        // LoginManager.logOut();
        // Attempt a login using the Facebook login dialog asking for default permissions.
        let _SELF = this;
        let _userData =  StorageData._loadInitialState('SignUpProcess');
        
        GoogleAnalyticsHelper._trackEvent('Log In - Sign Up', 'Facebook'); 

        _userData.then(function(result){ 

            // console.log('result', JSON.parse(result));

            // if user already login one or first login with facebook
            if(!result || _.isEmpty(result) || !result.socialAccounts){

                _SELF.setState({
                    fbLoading : true,
                })  
                loginFacebook().then((response) => {
                    // console.log('reponse: ', response);
                    if(response){
                        // this._goSignUp(response);

                        // console.log('_result :', response.result);
                        // return;

                        if(response.code == 200){
                            let _result = response.result;
                            // if user try to first signup with fb
                            // we need to save signup process to prevent next time they try to login facebook again
                            // and confirm login dialog not work sometime
                            if(!response.result.is_register_completed){
                                
                                let _userDataSignUp =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_result)); 
                                UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                                _userDataSignUp.then(function(result){
                                    // console.log('complete save sign up process 2'); 
                                });
                            }

                            _SELF._saveUserData(response);
                            // console.log('Response Object FB Login: ', response);
                        }
                        else{
                            _SELF.setState({
                                fbLoading : false,
                            })
                            alert('Can not login with facebook. Please try again.')
                        }
                    }
                    else{
                        _SELF.setState({
                            fbLoading : false,
                        })
                    }
                });

            }
            else{
                UserHelper.UserInfo = JSON.parse(result);
                _SELF._verifyRouteToGo(JSON.parse(result));
            }

        });

        // _SELF.setState({
        //     fbLoading : true,
        // })
        // loginFacebook().then((response) => {

        //     _SELF.setState({
        //         fbLoading : false,
        //     })
        //     if(response){
        //         // this._goSignUp(response);
        //         if(response.code == 200){
        //             _SELF._saveUserData(response);
        //             console.log('Response Object FB Login: ', response);
        //         }
        //         else{
        //             alert('Can not login with facebook. Please try again.')
        //         }
        //     }
        // });
    }


    forgetPassword = () => {

        GoogleAnalyticsHelper._trackEvent('Log In', 'User Click On Forget Password');         

        const { navigate, goBack, setParams, state } = this.props.loginFrm.props.navigation;
        navigate('ForgetPassword',{});
    }
    
    
    render() {
        return (    

            <View style={styles.container} onPress={() =>  dismissKeyboard()}>

                <TextInput 
                    ref= {(el) => { this.txtUsername = el; }}
                    onChangeText={(txtUsername) => this.setState({email:{
                        val:txtUsername   
                    }})}
                    value={this.state.email.val}
                    placeholder="Email address *"
                    placeholderTextColor={ this.state.email.isErrRequired ? 'red' :"#B9B9B9"}
                    returnKeyType="next"
                    keyboardType="email-address"
                    autoCorrect={false}
                    autoCapitalize = "none"
                    onSubmitEditing={() => this.passwordInput.focus()}
                    style={[styles.input,this.state.email.isErrRequired && {color:'red'}]}
                    underlineColorAndroid = 'transparent'
                    textAlignVertical = 'bottom'
                />

                <TextInput 
                    ref= {(el) => { this.txtPassword = el; }}
                    onChangeText={(txtPassword) => this.setState({password:{
                        val:txtPassword
                    }})}
                    value={this.state.password.val}
                    placeholder="Password *"
                    placeholderTextColor={ this.state.password.isErrRequired ? 'red' :"#B9B9B9"}
                    returnKeyType="go"
                    secureTextEntry
                    style={styles.input}
                    ref={(input) => this.passwordInput =  input}
                    onSubmitEditing={()=>this._logInBtn()}
                    underlineColorAndroid = 'transparent'
                    textAlignVertical = 'bottom'
                />

                <TouchableOpacity activeOpacity={.8} style={styles.btnContainer} onPress={this._logInBtn}>
                    
                        {   
                            !this.state.emailLoginLoading ? <Text style={styles.btn}>{ this.props.loginFrm.state.btnLoginText }</Text> : <ActivityIndicator color="white" animating={true} /> 
                        }
                    
                </TouchableOpacity>

                <View style={styles.help}>
                    <Text style={styles.forget}>Forget your login details?</Text>
                    <TouchableOpacity activeOpacity={.8} onPress={() => this.forgetPassword()}>
                        <Text style={styles.gethelp}> Get help.</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.orBar}>
                    <View style={styles.line}></View>
                    <Text style={styles.txtOR}>OR</Text>
                    <View style={styles.line}></View>
                </View>

                <TouchableOpacity activeOpacity={.8} style={styles.fbContainer} onPress={() =>  this.facebookLogin()}>
                    {/*<Icon
                        name='facebook-square'
                        style={[ styles.icon, ]}
                    />*/}
                    <IconCustom 
                        name='facebook-gray-logo'
                        style={[ styles.icon, ]}
                    />
                    <Text style={styles.fbLogin}> Log in with Facebook</Text>
                </TouchableOpacity>
                <View>
                    <ActivityIndicator
                        animating={this.state.fbLoading}  
                        style={[styles.centering, {marginTop: 20, height: 0}]}
                        /*size="large"*/
                    />
                </View>
            </View>

        );
    }
    
}

/* Default FB Login 

<View>
    <LoginButton
        publishPermissions={["publish_actions"]}
        onLoginFinished={
            (error, result) => {
                if (error) {
                    alert("login has error: " + result.error);
                } else if (result.isCancelled) {
                    alert("login is cancelled.");
                } else {
                        this._successLogin();
                    AccessToken.getCurrentAccessToken().then((data) => {
                        // alert(data.accessToken.toString())
                        console.log('this data ', data);

                    })
                }
                console.log('result', result);
            }
        }
    onLogoutFinished={() => alert("logout.")}/>
</View>

*/

var styles = StyleSheet.create({

    container: {
        // flex: 1, 
        padding: 20
    },

    input: {
        height: 45,
        // backgroundColor: "rgba(255,255,255,.2)",
        backgroundColor: Colors.componentBackgroundColor,
        marginBottom: 10,
        color: Colors.textBlack,
        paddingHorizontal: 12,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#fff',
    },

    btnContainer: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 15,
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.buttonColor
    },

    btn: {
        textAlign: 'center',
        color: "white",
        fontWeight: "700",
    },

    help: {
        justifyContent:'center',
        flexDirection: 'row',
        marginTop: 15,
    },

    forget:{
        color: Colors.textColorDark,  
    },

    gethelp:{
        fontWeight: 'bold',
        color: Colors.textColorDark,
    },

    orBar:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 60
    },

    line:{
        height: 1,
        width: 150,
        alignSelf:'center',
        backgroundColor: Colors.lineColor,
        marginLeft: 5,
        marginRight: 5
    },

    txtOR:{
        textAlign: 'center',
        textAlignVertical: 'top',
        fontWeight: 'bold',
        color:Colors.textColor,
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
});