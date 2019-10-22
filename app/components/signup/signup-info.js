// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, TextInput, Keyboard, TouchableOpacity, Alert, StatusBar, TouchableWithoutFeedback, ActivityIndicator, ScrollView, 
PixelRatio } from 'react-native';

import ButtonBack from '@components/header/button-back'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import Utilities from '@styles/extends/ultilities.style';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import CountryPicker, {getAllCountries} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info';

import ALL_COUNTRIES from '@store/data/cca2';


import { postApi } from '@api/request';

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import _ from 'lodash'


const dismissKeyboard = require('dismissKeyboard');
var func = require('@helper/validate');
function mapStateToProps(state) {
    // console.log('wow',state)
    return {
        user: state.user,
        user_info: [],
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class SignUpInfo extends Component{

    constructor(props){
        
        super(props);
        let userLocaleCountryCode = DeviceInfo.getDeviceCountry();
        const userCountryData = getAllCountries();
        let callingCode = null;
        let name = null;
        let cca2 = userLocaleCountryCode;
        if (!cca2 || !name || !userCountryData) {
            // cca2 = 'US';
            // name = 'United States';
            // callingCode = '1';
        } else {
            callingCode = userCountryData.callingCode;
        }
        this.state = {
            joining: false,
            cca2,
            name,
            callingCode,
            country: {
                val: '',
                langCode: '',
                callingCode: '',
                isErrRequired: false
            },
            email: {
                val: '',
                isErrRequired: false
            },
            password: {
                val: '', 
                isErrRequired: false
            },
            phone: {
                val: '',
                isErrRequired: false
            },
            errMessage : null,
            isActionButton: true,
        };
        console.log(this.props);

        const { navigate, goBack, state } = this.props.navigation;
        // console.log('User Info : ',state.params);

        // console.log(UserHelper);

        // StorageData._saveUserData('test_data', 'panhna seng updated');

        // UserHelper.token = 'panhna seng';

        // console.log(UserHelper._getToken());

        // StorageData._removeStorage('SignUpProcess'); 

    }


    // verfity which route user has to continue to complete their fill info
    _verifyRouteToGo = (_userInfo) => {

        const { navigate, goBack, state } = this.props.navigation;
        
        if(_userInfo.activeUserRoles.length<=0){
            // user need to fill Talent Category (employer or user)
            navigate('WhoAreYou');
        }
        else{
            const userRole = UserHelper._getFirstRole();
            if(_userInfo.profile.attributes){
                
                if(_.isEmpty(_userInfo.profile.attributes.kind)){
                    // user need to fill Talent Type (director, dancer, host ...)

                    if(userRole.role.name == 'user')
                        navigate('TalentCategory');
                    else
                        navigate('TalentSeekerCategory');

                    // return true;
                }
                else if(_.isEmpty(_userInfo.profile.attributes.date_of_birth)){
                    navigate('TalentWelcome',{sign_up_info: _userInfo});
                    // return false;
                }
                else{
                    // attri data if user has been input some data of attri
                    const _attrData = _userInfo.profile.attributes;
                    if(userRole.role.name == 'user'){

                        // if user has been input at lease 1 field for Detail 
                        if(!_.isEmpty(_attrData.ethnicity.value) || !_.isEmpty(_attrData.language.value) || !_.isEmpty(_attrData.height.value) ||
                        !_.isEmpty(_attrData.weight.value) || !_.isEmpty(_attrData.hair_color.value) || !_.isEmpty(_attrData.eye_color.value)){
                            navigate('UploadPhoto',{sign_up_info: _userInfo});
                        }
                        else{
                            navigate('TalentDetail',{sign_up_info: _userInfo});
                        }

                    }
                    else{
                        navigate('UploadPhoto',{sign_up_info: _userInfo}); 
                    }
                }
            }
            else{
                // user need to fill Talent Type (director, dancer, host ...)
                if(userRole.role.name == 'user')
                    navigate('TalentCategory',{sign_up_info: _userInfo});
                else
                    navigate('TalentSeekerCategory',{sign_up_info: _userInfo});
            }
        }
    }

    componentDidMount(){

        GoogleAnalyticsHelper._trackScreenView('Sign Up');         
        

        console.log('Test: ',this.props);
        // this.props.authenticate();
        return;
        
        /*
            let that = this;
            
            // load sign up process (if user sign up success on first step & they missed next 'internet problem or ...') 
            // we will continue to force them to fill more info
            let _userData =  StorageData._loadInitialState('SignUpProcess'); 
            _userData.then(function(result){   

                // console.log(result);
                if(result!=null){
                    let _userInfo = JSON.parse(result);
                    UserHelper.UserInfo = _userInfo;
                    console.log('user helper userObj : ',UserHelper.UserInfo);

                    that._verifyRouteToGo(_userInfo);            
        
                    // const { navigate, goBack, state } = that.props.navigation;
                    // if(_userInfo.activeUserRoles.length<=0){
                    //     navigate('WhoAreYou');
                    //     // console.log('not yet has role'); 
                    // } 
                    // else if(_userInfo.activeUserRoles.length>0 && _userInfo.profile.gender == ''){
                    //     const userRole = UserHelper._getFirstRole();
                    //     if(userRole.role.name == 'user')
                    //         navigate('TalentCategory');
                    //     else
                    //         navigate('TalentSeekerCategory');
                        
                    // }

                }

            });
            
            // console.log(that.props);
            // setTimeout(function(){
                // this.props.authenticate();
            // },2000)

        */

    } 

    static navigationOptions = ({ navigation }) => ({
            // title: '', 
            headerVisible: true,
            headerLeft: (<ButtonBack
                    isGoBack={ navigation }
                    btnLabel= "Welcome" 
                />),
        });

    // continue button
    joinUsNow() {
        // func('variable that is in the function global');
        console.log('after calling');
        // this.phoneResult=func(this.state.phone,'phone');

        if(!this.state.joining){

            if(func(this.state.country,'country')){
                    this.setState({
                    country: {
                        isErrRequired:true
                    }
                })
            }
            if(func(this.state.email,'email')){
                    this.setState({
                    email: {
                        isErrRequired:true,
                        val: this.state.email.val
                    }
                })
            }
            if(func(this.state.password,'password')){
                this.setState({
                    password:{
                        isErrRequired:true
                    }
                })
            }
            if(func(this.state.phone,'phone')){
                this.setState({
                    phone: {
                        isErrRequired:true
                    }
                })
            }

            let that = this;
            setTimeout(function(){

                if(!that.state.country.isErrRequired && !that.state.email.isErrRequired && !that.state.password.isErrRequired && !that.state.phone.isErrRequired ){
                    console.log('sign up press');
                    // Alert.alert('login now');
                    // dismissKeyboard();

                    const { navigate, goBack, setParams, state } = that.props.navigation;
                    let signUpInfo = {
                        country: that.state.country.val,
                        lang_code: that.state.country.langCode,
                        phone_num_code: that.state.country.callingCode,
                        phone_number: that.state.phone.val,
                        email: that.state.email.val.trim(),
                        password: that.state.password.val,
                    };

                    // console.log('This is sing up info: ', signUpInfo);
                    // console.log('This is code: ', that.state.country.callingCode);
                    // return;
                    
                    that.setState({
                        joining: true,
                        errMessage : null
                    });

                    // setTimeout(function(){
                    //     that.setState({
                    //         joining: false
                    //     });
                    //     navigate('WhoAreYou',{ sign_up_info: signUpInfo});
                    // },1000)

                    // **** pls dont fucking delete my beauty code. !! get out of my code ****

                    let API_URL = '/api/users/register';
                    // console.log('signUpInfo CCCwekt4tl3434 3gert  :', signUpInfo);
                    postApi(API_URL,
                        JSON.stringify({
                            "email": signUpInfo.email,
                            "password" : signUpInfo.password,
                            "confirm_password": signUpInfo.password, 
                            // "date_of_birth": '',
                            // "first_name": '',
                            // "last_name": '',
                            // "gender": '',
                            "phone": signUpInfo.phone_number, 
                            "country_code": signUpInfo.phone_num_code,
                            "country": signUpInfo.country,
                            is_register_completed : false,
                        })
                    ).then((response) => {
                        console.log('Response Object: ', response);
                        if(response.status=="success"){
                            // console.log('Response Object: ', response);
                            // that._saveUserData(response);

                            let _result = response.result;

                            // let _userData =  StorageData._loadInitialState('SignUpProcess'); 
                            let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_result)); 
                            UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                            _userData.then(function(result){
                                console.log('complete save sign up process 1');
                                // navigate('WhoAreYou',{ sign_up_info: signUpInfo});
                                // navigate('WhoAreYou',{ sign_up_info: _result});
                                that.replaceScreen(_result)
                            });
                        }
                        else{
                            // let _state = this.state;
                            // _state.errMessage = response.result; 
                            that.setState({
                                errMessage : response.result
                            });

                            console.log('last state : ', that.state);
                        }

                        that.setState({
                            joining: false
                        });
                    })

                }
                
            }, 50);

        }

    }

    // check for render text color for value of country (error, placehoder and have value)
    checkColorCountryInput = () => {
        // console.log(this.state.country);
        if(this.state.country.val == '')
            return '#B9B9B9';
        else if(this.state.country.isErrRequired){
            return 'red';
        }
        else{
            return 'black';
        }
    }
   
    focusNextField = (nextField) => {
        this.refs[nextField].focus();
    };

    replaceScreen = (signUpInfo) => {
        // const { locations, position } = this.props.navigation.state.params;
        // console.log('Replace the screen');
        this.props.navigation.dispatch({
            key: 'WhoAreYou',
            type: 'ReplaceCurrentScreen',
            routeName: 'WhoAreYou',
            params: {sign_up_info: signUpInfo}
        });
    };

    // start keyboard handle
    componentWillMount () {
        // console.log(Keyboard);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove()
        this.keyboardDidHideListener.remove()
    }

    keyboardDidShow (e) {
        // let newSize = Dimensions.get('window').height - e.endCoordinates.height
        if(Helper._isAndroid()){
            this.setState({
                isActionButton: false,
            })
        }
        // console.log('keyboard show');

    }
    
    keyboardDidHide (e) {
        // console.log('keyboard hide');
        if(Helper._isAndroid()){
            this.setState({
            isActionButton: true,
            })
        }
    }  
    //   end keyboard handle

    onChanged(text){
         let reSing=/^[0-9]{0,8}$/;
         let re=/^[0-9]{0,20}$/;
        //  console.log("validate phone ",reSing.test(text));
        // console.log("country display",this.state.country.val);
         if(this.state.country.val == "Singapore"){
             if(reSing.test(text)){
                this.setState({phone:{
                    val:text   
                }})
             }
         }
         else{
             if(re.test(text)){
                  this.setState({phone:{
                    val:text   
                }})
             }
         }
    }
    
    render() {
        const { navigate, goBack, state } = this.props.navigation;
        
        return (
            <View style={[ styles.viewContainerOfScrollView ]}>    

                <ScrollView contentContainerStyle={[ styles.defaultScrollContainer ]}>
                    <TouchableWithoutFeedback onPress={() =>  {dismissKeyboard()}}>

                        <View style={[styles.container,styles.mainScreenBg]}>

                            <View style={[styles.mainPadding]}>

                                {/*<TextInput 
                                    placeholder="Country *"
                                    placeholderTextColor="#B9B9B9"
                                    returnKeyType="next"
                                    keyboardType="email-address"
                                    autoCorrect={false}
                                    onSubmitEditing={() => this.passwordInput.focus()}
                                    style={styles.flatInputBox}
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom
                                />*/}
                                <CountryPicker
                                    countryList={ALL_COUNTRIES}
                                    closeable = {true}
                                    filterable = {true}
                                    onChange={(value)=> {
                                         this.setState({
                                            phone: {
                                                val: ''
                                            }
                                        });
                                        {/*this.setState({cca2: value.cca2, name: value.name, callingCode: value.callingCode});*/}
                                        this.setState({
                                            country: {
                                                val: value.name,
                                                langCode: value.cca2,
                                                callingCode: value.callingCode,
                                                isErrRequired: false
                                            }
                                        });
                                        // console.log('onChange', value);
                                    }}
                                    cca2={this.state.cca2}
                                    translation='eng' >

                                    <View style = {styles.countryPicker} >     
                                        <Text style={[styles.inputValueFontSize, {color:  this.checkColorCountryInput() } ]}> { this.state.country.val || 'Country' } </Text>
                                    </View>
                                </CountryPicker>
                                
                                <View style = {styles.phoneContainer}>
                                    <View style = {styles.callingCodeContainer}>
                                        <Text style = {styles.callingCode}> + {this.state.country.callingCode}</Text>
                                    </View>
                                    <TextInput 
                                        onChangeText={(text)=> this.onChanged(text)}
                                        value={this.state.phone.val}
                                        placeholder="Phone number *"
                                        placeholderTextColor={ this.state.phone.isErrRequired ? 'red' :"#B9B9B9"}
                                        returnKeyType="next"
                                        style={[styles.phoneNumber,styles.inputValueFontSize]}
                                        onFocus = { ()=> this.keyboardDidShow(null) }
                                        onSubmitEditing={()=> this.focusNextField('3') }
                                        underlineColorAndroid = 'transparent'
                                        textAlignVertical = 'bottom'
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                

                                <TextInput 
                                    ref= "3"
                                    onChangeText={(txtEmail) => this.setState({email:{
                                        val:txtEmail   
                                    }})}
                                    value={this.state.email.val}
                                    placeholder="Email *"
                                    onFocus = { ()=> this.keyboardDidShow(null) }
                                    placeholderTextColor={ this.state.email.isErrRequired ? 'red' :"#B9B9B9"}
                                    returnKeyType="next"
                                    style={[styles.flatInputBox, styles.marginTopBig, styles.inputValueFontSize,{color : this.state.email.isErrRequired ? 'red' : '#4a4a4a'}]}
                                    onSubmitEditing={()=> this.focusNextField('4') }
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom'
                                    keyboardType="email-address" 
                                    autoCapitalize = "none"
                                    autoCorrect = {false}
                                />

                                <TextInput 
                                    ref= "4"
                                    onChangeText={(txtPassword) => this.setState({password:{
                                        val:txtPassword   
                                    }})}
                                    value={this.state.password.val}                    
                                    placeholder="Password *"
                                    placeholderTextColor={ this.state.password.isErrRequired ? 'red' :"#B9B9B9"}
                                    returnKeyType="done"
                                    secureTextEntry
                                    style={[styles.flatInputBox,styles.inputValueFontSize]}
                                    onFocus = { ()=> this.keyboardDidShow(null) }
                                    onSubmitEditing={()=>this.joinUsNow()}
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom'
                                    autoCapitalize = "none"
                                    autoCorrect = {false}
                                />

                                {
                                    this.state.errMessage && (
                                        <View>
                                            <Text style={[ {color: 'red', textAlign: 'center'}, styles.marginTopSM ]}>{this.state.errMessage}</Text>
                                            <TouchableOpacity style={[ ]} onPress={() => goBack() }>
                                                {/*<Text style={[ {color: Colors.primaryColDark, textAlign: 'center'}, styles.marginTopSM ]}> Back To Log In </Text>*/}
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                            </View>

                        </View>

                    </TouchableWithoutFeedback>
                </ScrollView>

                { this.state.isActionButton  && 
                    <View style={styles.absoluteBox}>
                        <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                            <TouchableOpacity style={[styles.flatButton,]} onPress={() => this.joinUsNow() }>
                                {   
                                    !this.state.joining ? <Text style={[styles.btn, styles.btFontSize]}>Join</Text> : <ActivityIndicator color="white" animating={true} /> 
                                }
                            </TouchableOpacity>

                            <View style={[styles.centerEle, styles.marginTopSM]}>
                                <Text style={styles.grayLessText}>By signing up, you agree to our</Text>
                                <View style={{flexDirection:'row'}}>
                                    <TouchableOpacity onPress={ () => { navigate('TermOfUse') } }>
                                        <Text style={[styles.darkGrayText, styles.fontBold]}>Terms of Service</Text>
                                    </TouchableOpacity>
                                    <Text> & </Text>
                                    <TouchableOpacity onPress={ () => { navigate('PrivacyPolicy') } }>
                                        <Text style={[styles.darkGrayText, styles.fontBold]}>Privacy Policy.</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    </View>
                }

            </View>
        );
    }
}

/*<Text style={styles.instructions}>
    press on the flag
</Text>

{
    this.state &&
    <Text style={styles.data}>
        {JSON.stringify(this.state, null, 2)}
    </Text>
}*/


var styles = StyleSheet.create({ ...FlatForm, ...Utilities,
    container: {
        flex: 1,
        paddingTop: 50,
        // padding: 20
    },

    countryPicker:{
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        marginBottom: 10,
        // color: Colors.textColor,
        // paddingHorizontal: 12,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        // flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 8,
    },

    phoneContainer:{
        flexDirection: 'row',
        // backgroundColor: 'red',
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        marginBottom: 10,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        justifyContent:'center',
        alignItems: 'stretch',
    },

    callingCodeContainer:{
        backgroundColor: Colors.componentDarkBackgroundColor,
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1, 
        borderColor: Colors.componentBackgroundColor,
    
    },

    callingCode:{
        flex: 0,
        fontSize: 16,
        textAlign: 'left',
        paddingLeft: 7,
        paddingRight: 12, 
        minWidth: 50,
        // textAlign: 'center',
    },

    phoneNumber:{
        flex: 2, 
        marginBottom: 0,
        paddingLeft: 10
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


    // For Country Picker
    // welcome: {
    //     fontSize: 20,
    //     textAlign: 'center',
    //     margin: 10,
    // },
    // instructions: {
    //     fontSize: 12,
    //     textAlign: 'center',
    //     color: '#888',
    //     marginBottom: 5,
    // },
    // data: {
    //     padding: 15,
    //     marginTop: 10,
    //     backgroundColor: '#ddd',
    //     borderColor: '#888',
    //     borderWidth: 1 / PixelRatio.get(),
    //     color: '#777'
    // }

});

export default connect(mapStateToProps, AuthActions)(SignUpInfo)
