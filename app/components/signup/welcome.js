 // import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, Picker, 
    Modal, ActivityIndicator, ScrollView, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Platform } from 'react-native';

import ButtonBack from '@components/header/button-back'

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import Utilities from '@styles/extends/ultilities.style';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';
import { genders } from '@api/response'
import _ from 'lodash'

import { postApi, putApi } from '@api/request';
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

var func = require('@helper/validate');
const Item = Picker.Item;

const dismissKeyboard = require('dismissKeyboard');
let originalGender=_.cloneDeep(genders);
function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class TalentSeekerWelcome extends Component{

    constructor(props){
    
        super(props);

        const { navigate, goBack, state } = this.props.navigation;
        // console.log('User Info : ',state.params);

        let _userInfo = UserHelper.UserInfo;
        console.log('_userInfo : ', _userInfo);
        let _tmpFbDat = {
            firstname : '',
            lastname : '',
            gender : '',
        }
        console.log('_userInfo.socialAccounts : ', _userInfo.socialAccounts)
        if(!_.isEmpty(_userInfo.socialAccounts)){
            _tmpFbDat = {
                firstname : _userInfo.profile.first_name,
                lastname : _userInfo.profile.last_name,
                gender : _userInfo.profile.gender,
            }
        }
        

        // console.log('FB DATA : ', _tmpFbDat);

        this.state = {
            joining: false,
            gendermale:{
                isErrRequired:false
            },
            genderfemale:{
                isErrRequired:false
            },
            firstname: {
                val: _tmpFbDat.firstname || '',
                isErrRequired: false
            },
            lastname: {
                val: _tmpFbDat.lastname || '', 
                isErrRequired: false
            },
            gender: {  
                val: _tmpFbDat.gender || '',
                isErrRequired: false
            },             
            age: {  
                val: '',
                isErrRequired: false
            },
            company:{
                val:'',
                isErrRequired:false
            },
            selectedGender: _tmpFbDat.gender,
            mode: Picker.MODE_DIALOG,
            modalVisible: false,    
            prevoius_gender:'',
            isActionButton: true,      
            Genders:originalGender

        };
        // console.log('Who Are You (DATA) : ', this.props.navigation);
    }

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: true,
        headerLeft: navigation.state.params.noBackButton ? null : (<ButtonBack
            isGoBack= { navigation }
            btnLabel= { UserHelper._getFirstRole().role.name == 'employer' ? 'Which talent seeker are you?': 'Which talent are you?' }
        />),
    });

    validateGender = (_val) => {
        // console.log(_val);
        let _tmp = '';
        if(_val != 'Male' && _val !='Female')
            _tmp = false
        else
            _tmp = true;
        // console.log('Tmp : ',_tmp);
        return _tmp;
    }

    getValueGender = (_val) => {
        // console.log(_val);

        if(_.isEmpty(_val))
            return 'Please select gender *';

        if(_val == 'M')
            return 'Male';
        else
            return 'Female';
    }

    checkRequiredField = () => {
        const { navigate, goBack, state } = this.props.navigation;        

        // return false;

        let _talentType = (state.params.sign_up_info.talent_type ? state.params.sign_up_info.talent_type.type : '') || (UserHelper.UserInfo ? UserHelper._getFirstRole().name : '');

        // console.log('Required field: ', _talentType , ", " , this.state.company.isErrRequired,' === ' ,UserHelper._isEmployer());
        // return;

        if(UserHelper._isEmployer(true)){ // true it mean register not yet successfully
            // console.log('He / She is employer'); return;
            return !this.state.firstname.isErrRequired && !this.state.lastname.isErrRequired && !this.state.age.isErrRequired && !this.state.gender.isErrRequired && !this.state.company.isErrRequired;
        }
        else{ 
            return !this.state.firstname.isErrRequired && !this.state.lastname.isErrRequired && !this.state.age.isErrRequired && !this.state.gender.isErrRequired;
        }
    }
 
    joinUsNow() {
        // Alert.alert('login now');
        // dismissKeyboard();  
        // console.log('JOIN us now is calling');

        if(!this.state.joining){

            if(this.state.selectedGender == ''){ 
                
                this.setState({
                    gender: {
                        val:"",
                        isErrRequired:true 
                    }    
                });               
            }else{

                let _tmp = this.state.gender;
            
                _tmp.val= this.state.selectedGender;
                _tmp.isErrRequired= false;

                this.setState({
                    selectedGender: _tmp.val,
                    gender: _tmp,
                    prevoius_gender: _tmp.val  
                }); 

                // console.log('Gender State : ',this.state);

            }

            if(func(this.state.firstname,'firstname')){
                this.setState({
                    firstname: {
                        isErrRequired:true
                    }
                })
            }
            if(func(this.state.lastname,'lastname')){
                this.setState({
                    lastname:{
                        isErrRequired:true
                    }
                })
            }
            if(func(this.state.age,'age')){
                this.setState({
                    age: {
                        isErrRequired:true
                    }
                })
            }
            if(func(this.state.company,'company')){
                this.setState({
                    company: {
                        isErrRequired:true
                    }
                })
            }        
            let that = this;
            setTimeout(function(){
                if(that.checkRequiredField()){

                    const { navigate, goBack, state } = that.props.navigation;

                    var signUpInfo = _.extend({

                        firstname: that.state.firstname.val,
                        lastname: that.state.lastname.val,
                        age: that.state.age.val,
                        gender: that.state.selectedGender,
                        company: that.state.company.val,

                    }, state.params.sign_up_info);

                    // console.log('User Info from beg: ' , state.params.sign_up_info);
                    let country = {
                        'country_name': '',
                        'country_code': '',
                    }
                    country.country_name = state.params.sign_up_info.profile ? 
                        (state.params.sign_up_info.profile.country ? state.params.sign_up_info.profile.country : '') : '';
                    
                    country.country_code = state.params.sign_up_info.profile ? 
                        (state.params.sign_up_info.profile.country_code ? state.params.sign_up_info.profile.country_code : '') : '';
                    
                    console.log('Country to save: ' , country);
                    console.log('Welcome Data To Save : ', signUpInfo);

                    // return;
                    that.setState({
                        joining: true
                    });
                     
                    // let talentCateStringArray = _.map(signUpInfo.talent_category, function(v, k) {
                    //     // console.log(v,k);
                    //     return v.category;
                    // });
                    // console.log('talentCateStringArray : ',talentCateStringArray);

                    // if(that._checkTalentType('employer')){
                    // **** pls dont fucking delete my beauty code. !! get out of my code ****

                        let API_URL = '/api/users/me/customs';

                        let talentCateStringArray = _.map(signUpInfo.talent_category, function(v, k) {
                            return v.category;
                        });

                        // console.log('talentCateStringArray : ',talentCateStringArray);

                        putApi(API_URL,
                            JSON.stringify({
                                "first_name": {
                                    "value": signUpInfo.firstname,
                                    "privacy_type": "only-me"
                                },
                                "last_name": {
                                    "value": signUpInfo.lastname,
                                    "privacy_type": "only-me"
                                },
                                "date_of_birth": {
                                    "value": Helper._getBirthDateFullByAge(signUpInfo.age),
                                    "privacy_type": "only-me",
                                    "constraint": 'YYYY'
                                },
                                "age": {
                                    "value": signUpInfo.age,
                                    "privacy_type": "only-me"
                                },
                                "gender": {
                                    "value": signUpInfo.gender,
                                    "privacy_type": "only-me"
                                },
                                "company": {
                                    "value": signUpInfo.company,
                                    "privacy_type": "only-me"
                                },
                                "ethnicity": {
                                    "value": "",
                                    "privacy_type": "only-me"
                                },
                                "language": {
                                    "value": "",
                                    "privacy_type": "only-me"
                                },
                                "height": {
                                    "value": "",
                                    "privacy_type": "only-me"
                                },
                                "weight": {
                                    "value": "",
                                    "privacy_type": "only-me"
                                },
                                "hair_color": {
                                    "value": "",
                                    "privacy_type": "only-me"
                                },
                                "eye_color": {
                                    "value": "",
                                    "privacy_type": "only-me"
                                },
                                "country": {
                                    "value": country.country_name,
                                    "privacy_type": "only-me"
                                },
                                "country_code": {
                                    "value": country.country_code,
                                    "privacy_type": "only-me"
                                }
                            })
                        ).then((response) => {
                            console.log('Response Object: ', response);
                            if(response.status=="success"){

                                let _result = response.result;

                                let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_result)); 
                                UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                                _userData.then(function(result){
                                    console.log('complete save sign up process 3'); 
                                });

                                // console.log('Response Object: ', response);
                                if(that._checkTalentType('employer')){
                                    navigate('UploadPhoto', { sign_up_info: _result});
                                }
                                else{
                                    navigate('TalentDetail', { sign_up_info: _result});
                                }
                            }
                            that.setState({
                                joining: false
                            });
                        })
                        
                    // }
                }
            }, 50);

        }

    }

    _checkTalentType = (_type) => {


        const { navigate, goBack, state } = this.props.navigation;

        if(state.params || !_.isEmpty(UserHelper.UserInfo)){
            // console.log(state.params, ' == ',UserHelper._getFirstRole());

            let _talentType = UserHelper._getFirstRole().role.name;
            // console.log('check employer : ',_talentType, _type);
            if(_talentType){
                return _talentType == _type;
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }

    }

    onValueChange = (key, value) => {
        console.log(key, value);
        const newState = {};
        newState[key] = value;
        if(key == 'selectedGender'){
            if(value != ''){
                this.setState(newState);
            }
        }else{
            this.setState(newState); 
        }
    };

    // state = {
    //     selectedGender: 'Gender *',
    //     mode: Picker.MODE_DIALOG,
    //     modalVisible: false,
    // };

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    componentDidMount() {
        GoogleAnalyticsHelper._trackScreenView('Sign Up - Welcome');                         
    }

    // start keyboard handle
    componentWillMount () {
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
    }

    componentWillUnmount () {
        // this.keyboardDidShowListener.remove()
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

    onAgeChanged(text){
        let re=/^[0-9]{0,2}$/;

        if(re.test(text)){
            this.setState({ 
                age: {
                    val:text   
                }
            })
        }
    }

    genderSelect=(item,index)=>{
        console.log("my item in gender select",item);
        console.log("state Genders",this.state.Genders);
        let temp=this.state.Genders;
        let selectedvalue;
        _.map(temp,function(v,k){
            if(v.id==item.id){
                selectedvalue=v.display_name;
            }
        });
        let _tmpStateObject=this.state.gender;
        _tmpStateObject.val=selectedvalue;
        _tmpStateObject.isErrRequired=false;
        this.setState({selectedGender:selectedvalue=='Male'? 'M':'F',gender:_tmpStateObject},function(){
            console.log("after setstate",this.state.gender,this.state.selectedGender);
        });
        this.setModalVisible(false);
    }

    render() {
        const { navigate, goBack, state } = this.props.navigation;
        return (    

            <View style={[styles.container,styles.mainScreenBg]}>
                {/*<StatusBar barStyle="light-content" />*/}

                <ScrollView contentContainerStyle={[ styles.defaultScrollContainer ]}>
                    <KeyboardAvoidingView 
                                keyboardVerticalOffset={ 
                                    Platform.select({
                                        ios: () => 50,
                                        android: () => 60
                                    })()
                                }
                                behavior="position" style={[ {flex: 1 } ]}>

                        <TouchableWithoutFeedback onPress={() =>  {dismissKeyboard()}} style={[styles.container]}>
                            <View style={[styles.mainPadding]}>

                                <View style={[styles.marginBotMD]}>
                                    <Text style={[styles.blackText, styles.btFontSize]}>
                                        Welcome to Talentora
                                    </Text>

                                    <Text style={[styles.grayLessText, styles.marginTopXS]}>
                                        Before we begin, tell us more about yourself.
                                    </Text>
                                </View>

                                <TextInput 
                                    onChangeText={(txtFirstname) => this.setState({firstname:{

                                        val:txtFirstname   
                                    }})}
                                    value={this.state.firstname.val}                        
                                    placeholder="First Name *"
                                    placeholderTextColor={ this.state.firstname.isErrRequired ? 'red' :"#B9B9B9"}
                                    returnKeyType="next"
                                    keyboardType="email-address"
                                    autoCorrect={false}
                                    onFocus = { ()=> this.keyboardDidShow(null) }
                                    onSubmitEditing={() => this.lastname.focus()}
                                    style={[styles.flatInputBox,styles.inputValueFontSize,{color:'black'}]}
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom'
                                />

                                <TextInput 
                                    onChangeText={(txtLastname) => this.setState({lastname:{ 

                                        val:txtLastname   

                                    }})}
                                    value={this.state.lastname.val} 
                                    placeholder="Last Name *"
                                    placeholderTextColor={ this.state.lastname.isErrRequired ? 'red' :"#B9B9B9"}
                                    returnKeyType="go"
                                    style={[styles.flatInputBox,styles.inputValueFontSize,{color:'black'}]}
                                    ref={(input) => this.lastname =  input}
                                    onFocus = {() => {
                                        this.keyboardDidShow(null)  
                                    }}
                                    onSubmitEditing={() => this.setState({
                                            modalVisible: true
                                        })}                                    
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom'
                                />

                                { Helper._isAndroid()  && 

                                    <View>
                                        <View style = {[ {flex: 1} ]}>
                                            <Modal
                                                transparent={true}
                                                onRequestClose={() => {}}
                                                visible = {this.state.modalVisible}>
                                                <TouchableOpacity style={[ styles.justFlexContainer, styles.mainVerticalPadding, {flex:1,flexDirection:'column',paddingBottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.8)'}]} onPressOut={() => {this.setModalVisible(false)}}>
                                                    <View style={{width:300,height:160,backgroundColor:'white'}}>
                                                        <View style={[styles.languageNav ]} >
                                                            <Text style={[ styles.languageNavTitle,styles.inputLabelFontSize,{textAlign:'left'} ]} >Please select gender</Text>
                                                        </View>
                                                        <ScrollView contentContainerStyle={[styles.mainVerticalPadding, styles.mainHorizontalPadding ]}>
                                                            {this.state.Genders.map((item, idx) => {
                                                                return (
                                                                    <View key={idx} >
                                                                        {/*{console.log('Item ZIN: ', lang, idx)}*/}
                                                                        {/* {when search first time click on the row is not work cus not yet lost focus from text input */}
                                                                        <TouchableOpacity onPress={() => this.genderSelect(item, idx) } activeOpacity={.8}
                                                                            style={[ styles.flexVer, styles.rowNormal, {justifyContent:'space-between'}]}>
                                                                            <Text style={[ styles.itemText,styles.inputValueFontSize, {paddingTop: 7, paddingBottom:7, 
                                                                                color: item.selected ? 'red' : 'black'} ]}>   
                                                                                { item.display_name }
                                                                            </Text>
                                                                            {item.selected && <Icon name={"done"} style={[ styles.itemIcon, 3, {color:'red' }]} /> }
                                                                        </TouchableOpacity>
                                                                        <View style={[{borderWidth:1,borderColor:Colors.componentBackgroundColor}]}></View>
                                                                    </View>
                                                                )
                                                            })}
                                                        </ScrollView>
                                                    </View>
                                                </TouchableOpacity>
                                            </Modal>
                                            {/*Old Picker*/}
                                            {/*<Picker
                                                ref = 'genderPicker'
                                                selectedValue={this.state.selectedGender}
                                                onValueChange={this.onValueChange.bind(this, 'selectedGender')}>
                                                <Item label="Please select gender" value=""/>  
                                                <Item label="Male" value="M" /> 
                                                <Item label="Female" value="F" />
                                            </Picker>*/}
                                        </View>
                                        <TouchableOpacity onPress={() => this.setModalVisible(true)} style={{backgroundColor: Colors.componentBackgroundColor, marginBottom: 10,borderRadius: 5}}>
                                            <View style = {[styles.itemPicker,{flex:0.7,paddingHorizontal:12}]}>
                                                <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {opacity:this.state.selectedGender? 1:(this.state.gender.isErrRequired? 1:0.8),color:this.state.selectedGender? 'black':(this.state.gender.isErrRequired? 'red':'#B9B9B9'),textAlign:'left',paddingVertical:12,backgroundColor: Colors.componentBackgroundColor}]}>{ Helper._getGenderLabel(this.state.selectedGender) || 'Please select gender *' }</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View> 
                                } 

                                { Helper._isIOS()  && 
                                    <View> 
                                        <Modal
                                            animationType={"slide"}
                                            transparent={true}
                                            onRequestClose={() => {}}
                                            visible={this.state.modalVisible}>

                                            <View onPress = {()=>{ }} style={{flex: 1, justifyContent: 'flex-end',marginTop: 22}}>
                                                <TouchableOpacity
                                                    style={[ {backgroundColor: Colors.componentDarkBackgroundColor, padding: 15} ]}
                                                    onPress={() => { 
                                                        this.setModalVisible(!this.state.modalVisible);
                                                        let _SELF = this;
                                                        setTimeout(function(){
                                                            _SELF.ageInput.focus();
                                                        },200)
                                                    }}>
                                                    <Text style={[styles.fontBold, styles.inputLabelFontSize,{textAlign: 'right', color: '#3b5998'} ]} >Done</Text>
                                                </TouchableOpacity>
                                                <View style={[ {backgroundColor: 'white'} ]}>
                                                    <Picker
                                                        selectedValue={this.state.selectedGender}
                                                        onValueChange={this.onValueChange.bind(this, 'selectedGender')}>
                                                        <Item label="Please select gender" value=""/>
                                                        <Item label="Male" value="M" /> 
                                                        <Item label="Female" value="F" />
                                                    </Picker>
                                                </View>
                                            </View>
                                        </Modal>

                                        <TouchableOpacity
                                            onPress={() => {
                                                this.setModalVisible(true)
                                            }}>
                                            <View style = {styles.genderPicker}>
                                                <Text style={[ styles.flatInputBoxFont, styles.inputValueFontSize,{color: this.state.gender.isErrRequired ? 'red': '#B9B9B9'} , !_.isEmpty(this.state.selectedGender) && {color: Colors.textBlack}  ]}>{ Helper._getGenderLabel(this.state.selectedGender) || 'Please select gender *' }</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }

                                <TextInput 
                                    onChangeText={(txtAge) => this.onAgeChanged(txtAge)}
                                    value={this.state.age.val}                     
                                    placeholder="Age *"
                                    placeholderTextColor={ this.state.age.isErrRequired ? 'red' :"#B9B9B9"}
                                    returnKeyType="go"
                                    style={[styles.flatInputBox,styles.inputValueFontSize,{color:'black'}]}
                                    ref={(input) => this.ageInput =  input}
                                    onFocus = { ()=> this.keyboardDidShow(null) }
                                    onSubmitEditing={()=>this.joinUsNow()}
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom'
                                    keyboardType="phone-pad" 
                                />

                                { this._checkTalentType('employer')  && 
                                <TextInput 
                                    onChangeText={(txtCompany) => this.setState({company:{
                                        val:txtCompany   
                                    }})}
                                    value={this.state.company.val}                     
                                    placeholder="Company *"
                                    placeholderTextColor={ this.state.company.isErrRequired ? 'red' :"#B9B9B9"}
                                    returnKeyType="go"
                                    style={[styles.flatInputBox, styles.marginTopBig,styles.inputValueFontSize,{color:'black'}]}
                                    ref={(input) => this.ageInput =  input}
                                    onFocus = { ()=> this.keyboardDidShow(null) }
                                    onSubmitEditing={()=>this.joinUsNow()}
                                    underlineColorAndroid = 'transparent'
                                    textAlignVertical = 'bottom'
                                />}

                            </View>
                        </TouchableWithoutFeedback>

                    </KeyboardAvoidingView>
                    
                </ScrollView>

                { this.state.isActionButton  && 
                <View style={styles.absoluteBox}>
                    <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                        <TouchableOpacity style={[styles.flatButton,]} onPress={() => this.joinUsNow() }>
                                {   
                                    !this.state.joining ? <Text style={[styles.btn, styles.btFontSize]}>Continue</Text> : <ActivityIndicator color="white" animating={true} /> 
                                }
                        </TouchableOpacity>

                    </View>
                </View>
                }

            </View>
        );
    }
}


var styles = StyleSheet.create({ ...FlatForm, ...Utilities,
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

    genderPicker:{
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        marginBottom: 10,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 10,
    },
    languageNav:{
        flexDirection : 'row', 
        height : 50, 
        paddingBottom: 15, 
        paddingTop: 15, 
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowRadius: 3,
        shadowOpacity: 0.2,
        paddingHorizontal:15
    },
    languageNavIcon:{
         color:'black',
         fontSize: 20,
         backgroundColor: 'transparent',
         left: 17
    },
    languageNavTitle:{
        flex: 1,
        // backgroundColor: 'yellow',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    languageNavStatus:{
        flex: 1,
        // backgroundColor: 'red',
        textAlign: 'right',
        right: 17,
        fontSize: 15,
        color: 'red'
    }
});

export default connect(mapStateToProps, AuthActions)(TalentSeekerWelcome) 
