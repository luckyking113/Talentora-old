// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, TextInput, Keyboard, Platform, TouchableOpacity, ScrollView, 
    Alert, StatusBar, KeyboardAvoidingView, TouchableWithoutFeedback, 
    ActivityIndicator, Modal, Picker } from 'react-native';

import ButtonBack from '@components/header/button-back'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import Utilities from '@styles/extends/ultilities.style';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import _ from 'lodash'

import { postApi, putApi } from '@api/request';
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
const Item = Picker.Item;
import { ethnicities, hair_colors, eye_colors, languages } from '@api/response'
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

var func = require('@helper/validate');

const dismissKeyboard = require('dismissKeyboard');

function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

let originalLanguage = null;

// export default class SignUpInfo extends React.Component {
class TalentDetail extends Component{

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: true,
        headerLeft: navigation.state.params.noBackButton ? null : (<ButtonBack
            isGoBack={ navigation }
            btnLabel= "Welcome to Talentora"
        />),
    });

    constructor(props){
        super(props);

        // console.log('This is original language: ', originalLanguage);
        originalLanguage = _.cloneDeep(languages);

        this.state = {
            selectedEthnicity: '',   
            languages: originalLanguage,
            selectedLanguages: '',
            displayLanguages: '',
            selectedLanguagesCount: 0,   

            height: '',   
            weight: '',   

            hair_color: '',   
            eye_color: '',  
            joining: false, 
            isActionButton: true,

            ethnicityModalVisible: false,
            hairModalVisible: false,
            eyeModalVisible: false,
            languageModalVisible: false,
        };

        const { navigate, goBack, state } = this.props.navigation;
        // console.log('User Info : ', this.state);
        // console.log('This is original language: ', originalLanguage);
    }

    continue(isSkip = false) {
        // Alert.alert('login now');
        let that=this;
        const { navigate, goBack, state } = that.props.navigation;

        if(!this.state.joining && !isSkip){

            setTimeout(function(){

                    var signUpInfo = _.extend({

                        ethnicity: that.state.selectedEthnicity,   
                        languages: that.state.selectedLanguages,   

                        height: that.state.height,   
                        weight: that.state.weight,   

                        hair_color: that.state.hair_color === 'Please select hair color'?'':that.state.hair_color,   
                        eye_color: that.state.eye_color === 'Please select eye color'?'':that.state.eye_color,   

                    }, state.params.sign_up_info);

                    // var signUpInfo = _.extend({

                    //     ethnicity: that.state.selectedEthnicity,   
                    //     languages: that.state.selectedLanguages,   

                    //     height: that.state.height,   
                    //     weight: that.state.weight,   

                    //     hair_color: that.state.hair_color,   
                    //     eye_color: that.state.eye_color,   

                    // }, 50);

                    // console.log('This is data: ', signUpInfo); return;


                    that.setState({
                        joining: true
                    });

                    let API_URL = '/api/users/me/customs';

                    let talentCateStringArray = _.map(signUpInfo.talent_category, function(v, k) {
                        return v.category;
                    });

                    // console.log('talentCateStringArray : ',talentCateStringArray);

                    let _dataPost = {
                            "ethnicity": {
                                "value": signUpInfo.ethnicity,
                                "privacy_type": "only-me"
                            },
                            "language": {
                                "value": signUpInfo.languages,
                                "privacy_type": "only-me"
                            },
                            "height": {
                                "value": signUpInfo.height,
                                "privacy_type": "only-me"
                            },
                            "weight": {
                                "value": signUpInfo.weight,
                                "privacy_type": "only-me"
                            },
                            "hair_color": {
                                "value": signUpInfo.hair_color,
                                "privacy_type": "only-me"
                            },
                            "eye_color": {
                                "value": signUpInfo.eye_color,
                                "privacy_type": "only-me"
                            }
                        }
                    console.log('Data Post : ',JSON.stringify(_dataPost));
                    putApi(API_URL,
                        JSON.stringify(_dataPost)
                    ).then((response) => {

                        console.log('Response Object: ', response);
                        if(response.status=="success"){

                            let _result = response.result;

                            let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_result)); 
                            UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                            _userData.then(function(result){
                                console.log('complete save sign up process 3'); 
                            });

                            navigate('UploadPhoto', { sign_up_info: _result , from_route_name: 'To the details'});
                        }
                        that.setState({
                            joining: false
                        });
                    })
            }, 50);  
        }             
        else{
            navigate('UploadPhoto', { sign_up_info: state.params.sign_up_info , from_route_name: 'To the details'});
        }
    }

    focusNextField = (nextField) => {
        this.refs[nextField].focus();
    };

    componentDidMount(){
        GoogleAnalyticsHelper._trackScreenView('Sign Up - Information Detail - Talent');   
    }

    // start keyboard handle
    componentWillMount () {
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

    onHeightChanged(text){
        let reSing=/^[0-9]{0,3}$/;
        if(reSing.test(text)){
            this.setState({ height: text })
        }
    }

    onWeightChanged(text){
        let reSing=/^[0-9]{0,3}$/;
        if(reSing.test(text)){
            this.setState({ weight: text })
        }
    }

    onEthnicityChange(text){
        // console.log('Ethnicity: ', text);
        this.setState({selectedEthnicity: text})
    }

    onPickerChange(text, type){
        if(type == 'ethnicity'){
            this.setState({selectedEthnicity: text})
        }else if(type == 'hair'){
            this.setState({hair_color: text})
        }else if(type == 'eye'){
            this.setState({eye_color: text})
        }
    }

    setModalVisible(visible, type) {
        if(type == 'ethnicity'){
            this.setState({ethnicityModalVisible: visible})
        }else if(type == 'hair'){
            this.setState({hairModalVisible: visible})
        }else if(type == 'eye'){
            this.setState({eyeModalVisible: visible})
        }else if(type == 'language'){
            this.setState({languageModalVisible: visible})
        }
    }
    genderSelect=(item,index,type)=>{
        // let temp=this.state.Genders;
        // let selectedCount=[];
        // _.map(temp,function(v,k){
        //    if(v.id==item.id){
        //        v.selected=true;
        //        console.log("condition v select is true");
        //    }
        //    else{
        //        v.selected=false;
        //    }
        //    selectedCount.push(v);
        // });
        //     console.log("temp in genderselect",selectedCount);
        // let displayGendersAndroid;
        // _.map(selectedCount,function(val,key){
        //     if(val.selected){
        //         displayGendersAndroid=val.display_name;
        //     }
        // })
        // console.log("display gender android",displayGendersAndroid);
        // this.setState({
        //     Genders:selectedCount,
        //     selectedGender:displayGendersAndroid=='Both(Male & Female)' ? 'B':(displayGendersAndroid=='Male' ? 'M':'F'),
        //     displayGendersAndroid:displayGendersAndroid
        // })
        // this.setModalVisible(false,"genderAndroid");
        let temp=(type=='ethnicity' ? ethnicities: (type=='hair'? hair_colors:eye_colors));
        console.log("temp in genderselect",temp);
        let selectedvalue;
        _.map(temp,function(v,k){
            if(v.id==item.id){
                selectedvalue=v.display_name;
            }
        });
        (type=='ethnicity' ? this.setState({selectedEthnicity:selectedvalue}):(type=='hair'? this.setState({hair_color:selectedvalue}):this.setState({eye_color:selectedvalue})));
        (type=='ethnicity' ? this.setModalVisible(false,'ethnicity'):(type=='hair'? this.setModalVisible(false,'hair'):this.setModalVisible(false,'eye')));
        
    }
    generatePicker(itemObject, type){
        let _prepareRenderPicker = (type=='ethnicity' ? ethnicities:(type=='hair' ? hair_colors: eye_colors));
        return(
            <View style={[styles.justFlexContainer]}> 
                { Helper._isAndroid()  && 
                    <View>
                        <View style = {[ {flex: 1} ]}>
                            <Modal
                                transparent={true}
                                onRequestClose={() => {}}
                                visible = {type == 'ethnicity' ? this.state.ethnicityModalVisible:(type=='hair' ? this.state.hairModalVisible:this.state.eyeModalVisible)}>
                                <TouchableOpacity style={[ styles.justFlexContainer, styles.mainVerticalPadding, {flex:1,flexDirection:'column',paddingBottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.8)'}]}  onPressOut={() => {this.setModalVisible(false,type)}}>
                                    <View style={{width:300,height:type=='genderAndroid'? 200:(type=='ethnicity'? 300:(type=='hair'? 270:270)),backgroundColor:'white'}}>
                                        <View style={[styles.languageNav ]} >                                            
                                            <Text style={[ styles.languageNavTitle,styles.inputLabelFontSize,{textAlign:'left'} ]} >Please select {type=='genderAndroid'?'gender':type}</Text>
                                            {/*<Text style={[ styles.languageNavStatus ]} >{this.state.selectedLanguagesCount} /3 selected</Text>*/}
                                        </View>
                                        {/*Language Search*/}
                                        {/*<View style={[styles.mainHorizontalPadding, {marginTop: 20}]}>
                                            <TextInput
                                                style={{marginBottom:7, height: Helper._isAndroid()?40:30, borderColor:Colors.componentBackgroundColor, borderRadius:5,textAlign:'center', backgroundColor:Colors.componentBackgroundColor,borderWidth: 1}}
                                                onChangeText={(text) => this.onLanguageSearch(text)}
                                                value={this.state.text}
                                                placeholder="Search"
                                            />
                                        </View>*/}
                                        <ScrollView contentContainerStyle={[styles.mainVerticalPadding, styles.mainHorizontalPadding ]}>
                                            {_prepareRenderPicker.map((item, idx) => {
                                                return (
                                                    <View key={idx} >
                                                        {/*{console.log('Item ZIN: ', lang, idx)}*/}
                                                        {/* {when search first time click on the row is not work cus not yet lost focus from text input */}
                                                        <TouchableOpacity onPress={() => this.genderSelect(item, idx,type) } activeOpacity={.8}
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
                        <TouchableOpacity onPress={() => this.setModalVisible(true, type)}>
                            <View style = {[styles.itemPicker,{flex:0.7}]}>
                                <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color:type=="ethnicity"? (this.state.selectedEthnicity? 'black':'#9B9B9B'):(type=="hair" ? (this.state.hair_color? 'black':'#9B9B9B'):(this.state.eye_color? 'black':'#9B9B9B')),textAlign:'left'}]}>{type=='ethnicity' ? this.state.selectedEthnicity || 'Select Ethnicity' :(type=='hair' ? this.state.hair_color || 'Select Hair Color' :this.state.eye_color|| 'Select Eye Color') }</Text>
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
                            visible={ type == 'ethnicity' ? this.state.ethnicityModalVisible : 
                            (type == 'hair' ? this.state.hairModalVisible : this.state.eyeModalVisible)}
                            >

                            <View onPress = {()=>{ }} style={{flex: 1, justifyContent: 'flex-end',marginTop: 22}}>
                                <View style = {styles.pickerTitleContainer}>
                                    <Text style={[styles.fontBold, styles.inputLabelFontSize,{textAlign: 'left', color: '#4a4a4a', padding:10, left: 10} ]}>Select {type == 'ethnicity' ? type : type + ' color'} </Text>
                                <TouchableOpacity activeOpacity = {0.8}
                                    style={[ {backgroundColor: Colors.componentDarkBackgroundColor, position:'absolute', padding:10, right:10} ]}
                                    onPress={() => {
                                        this.setModalVisible(false, type)
                                    }}>
                                    <Text style={[styles.fontBold,styles.inputLabelFontSize, {textAlign: 'right', color: '#3b5998'} ]}>Done</Text>
                                </TouchableOpacity>
                                </View>
                                <View style={[ {backgroundColor: 'white'} ]}>
                                    <Picker
                                        selectedValue={ type == 'ethnicity' ? this.state.selectedEthnicity :
                                            (type == 'hair' ? this.state.hair_color : this.state.eye_color)}
                                        onValueChange={(item) => this.onPickerChange(item, type)}>
                                        {
                                            itemObject.map((item, index) => {
                                                return(
                                                    <Item key={index} label={item.display_name} value={item.display_name} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>
                            </View>
                        </Modal>

                        <TouchableOpacity
                            onPress={() => {
                                this.setModalVisible(true, type)
                                let val = type == 'ethnicity' ? this.state.selectedEthnicity : 
                                (type == 'hair' ? this.state.hair_color : this.state.eye_color);
                                if(val == '')
                                    this.onPickerChange(itemObject[0].display_name, type);
                            }}>
                            <View style = {styles.itemPicker}>
                                {
                                    type == 'ethnicity' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: this.state.selectedEthnicity ? 'black':'#9B9B9B'}]}>{ this.state.selectedEthnicity || 'Select ethnicity' }</Text>
                                }

                                {
                                    type == 'hair' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: this.state.hair_color ? 'black':'#9B9B9B'}]}>{ this.state.hair_color || 'Select hair color' }</Text>
                                }

                                {
                                    type == 'eye' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: this.state.eye_color ? 'black':'#9B9B9B'}]}>{ this.state.eye_color || 'Select eye color' }</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }

    languageSelect = (item, index) => {
        console.log('This is selected language: ', item, index);
        let temp = this.state.languages;
        temp[index].selected = !temp[index].selected;
        // console.log('This is data: ', this.state.languages);
        
        let selectedCount = [];
        _.map(originalLanguage, function(val){
            if(val.selected)
                selectedCount.push(val);
        });

        if(selectedCount.length <= 3){
            // console.log('Filter for true object: ', selectedCount.length);
            let displayLanguages;
            _.map(selectedCount, function(val, key){
                displayLanguages = key == 0 ? val.display_name : displayLanguages + ',' + val.display_name;
            });
            this.setState({
                languages : temp,
                selectedLanguagesCount : selectedCount.length,
                selectedLanguages: displayLanguages,
                displayLanguages: displayLanguages ? displayLanguages.replace(/,/g, ', ') : ''
            });
            
        }else{
            temp[index].selected = !temp[index].selected;
            this.setState({languages : temp});
            Alert.alert('You can select three languages only')
        }
    }

    onLanguageSearch(text){
        let _dataFilter = _.filter(originalLanguage, function(v,k){
            return _.includes(v.display_name.toLowerCase(), text.toLowerCase());
        })
        this.setState({languages:_dataFilter})

        // console.log('Languages: ', languages)
        // console.log('Original Lang: ', originalLanguage);
        // console.log('Filter Lang: ', _dataFilter);
    }

    generateLanguageList(){
        return(
            <Modal
                onRequestClose={() => {}}
                visible = {this.state.languageModalVisible}>
                <View style={[ styles.justFlexContainer, styles.mainVerticalPadding, {paddingBottom:0}]}>

                    <View style={[styles.languageNav ]} >
                        <TouchableOpacity style={[{ flex:1 }]} 
                        onPress = {() => {
                            this.setModalVisible(false, 'language')
                            this.setState({languages:originalLanguage});
                        }}>
                            <Icon name={"close"} style={[ styles.languageNavIcon ]} />
                        </TouchableOpacity>
                        
                        <Text style={[ styles.languageNavTitle ,styles.inputLabelFontSize]} >Language</Text>
                        <Text style={[ styles.languageNavStatus ,styles.inputLabelFontSize]} >{this.state.selectedLanguagesCount} /3 selected</Text>
                    </View>

                    <View style={[styles.mainHorizontalPadding, {marginTop: 20}]}>
                        <TextInput
                            style={[styles.inputValueFontSize,{ height: Helper._isAndroid() ? 40:30  ,marginBottom:7 , borderColor:Colors.componentBackgroundColor, borderRadius:5,textAlign:'center', backgroundColor:Colors.componentBackgroundColor,borderWidth: 1}]}
                            onChangeText={(text) => this.onLanguageSearch(text)}
                            value={this.state.text}
                            placeholder="Search"
                        />
                    </View>
                    <ScrollView contentContainerStyle={[styles.mainVerticalPadding, styles.mainHorizontalPadding ]}>
                        {this.state.languages.map((lang, idx) => {
                            return (
                                <View key={idx} >
                                    {/*{console.log('Item ZIN: ', lang, idx)}*/}
                                    {/* {when search first time click on the row is not work cus not yet lost focus from text input */}
                                    <TouchableOpacity onPress={() => this.languageSelect(lang, idx) } activeOpacity={.8}
                                        style={[ styles.flexVer, styles.rowNormal, {justifyContent:'space-between'}]}>
                                        <Text style={[ styles.itemText,styles.inputValueFontSize, {paddingTop: 7, paddingBottom:7, 
                                            color: lang.selected ? 'red' : 'black'} ]}>   
                                            { lang.display_name }
                                        </Text>
                                        {lang.selected && <Icon name={"done"} style={[ styles.itemIcon, 3, {color:'red' }]} /> }
                                    </TouchableOpacity>
                                    <View style={[{borderWidth:1,borderColor:Colors.componentBackgroundColor}]}></View>
                                </View>
                            )
                        })}
                    </ScrollView>
                </View>
            </Modal>  
        )
    }

    render() {
        return (    
            <View style={[ styles.viewContainerOfScrollView, this.state.isActionButton && {paddingBottom: 110}]} >

                {/* form */}  
                <ScrollView contentContainerStyle={[styles.mainScreenBg, {justifyContent: 'flex-start'}]}>
            
                    <KeyboardAvoidingView 
                        keyboardVerticalOffset={ 
                            Platform.select({
                                ios: () => 50,
                                android: () => 5
                            })()
                        }
                        behavior="position" style={[ {flex: 1 } ]}>
                                
                        <TouchableWithoutFeedback onPress={() =>  {dismissKeyboard()}} style={[styles.container]}>
            
                            <View style={[styles.container,styles.mainScreenBg]} >

                                <View style={[styles.mainPadding ]}>

                                    <View style={[styles.marginBotMD]}>
                                        <Text style={[styles.blackText, styles.btFontSize]}>
                                            To the details
                                        </Text>

                                        <Text style={[styles.grayLessText, styles.marginTopXS]}>
                                            These information will help you become more effective on our platform.
                                        </Text>
                                    </View>

                                    {this.generatePicker(ethnicities, 'ethnicity')}

                                    <TouchableOpacity
                                        onPress={() => this.setModalVisible(true, 'language')}>
                                        <View style = {styles.itemPicker}>
                                                <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: this.state.displayLanguages ? 'black':'#9B9B9B'}]}>{ this.state.displayLanguages || 'Select languages' }</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {this.generateLanguageList()}

                                    <View style = {styles.heightContainer}>
                                        
                                        <TextInput 
                                            onChangeText={(txtHeight) => this.onHeightChanged(txtHeight)} 
                                            value={this.state.height}  
                                            placeholder="Height"
                                            placeholderTextColor="#B9B9B9"
                                            returnKeyType="next"
                                            //style={[styles.flatInputBox, styles.marginTopBig]}
                                            style={[styles.heightValue,styles.inputValueFontSize,{color:'black'}]}
                                            ref="3"
                                            onSubmitEditing={()=> this.focusNextField('4') }
                                            underlineColorAndroid = 'transparent'
                                            textAlignVertical = 'bottom' 
                                        />

                                        <View style = {styles.measurementContainer}>
                                            <Text style = {[styles.measurementValue,{color:'black'}]}>{'cm'}</Text>
                                        </View>
                                    </View>

                                    <View style = {styles.heightContainer}>
                                        
                                        <TextInput 
                                            onChangeText={(txtWeight) => this.onWeightChanged(txtWeight)}
                                            value={this.state.weight}  
                                            placeholder="Weight"
                                            placeholderTextColor="#B9B9B9"
                                            returnKeyType="next"
                                            style={[styles.heightValue,styles.inputValueFontSize,{color:'black'}]}
                                            ref="4"
                                            underlineColorAndroid = 'transparent'
                                            textAlignVertical = 'bottom'
                                        />

                                        <View style = {styles.measurementContainer}>
                                            <Text style = {[styles.measurementValue,{color:'black'}]}>{'kg'}</Text>
                                        </View>
                                    </View>

                                    {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:'Please select hair color'},...hair_colors]:hair_colors, 'hair')}
                                    {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:'Please select eye color'},...eye_colors]:eye_colors, 'eye')}

                                </View>
                                
                                
                            </View>
                                    
                        </TouchableWithoutFeedback>


                    </KeyboardAvoidingView>
                </ScrollView>

                {/* absolute button */}
                { this.state.isActionButton  && 
                        <View style={styles.absoluteBox}>
                            <View style={[styles.txtContainer,styles.mainHorizontalPadding]}> 

                                <TouchableOpacity style={[styles.flatButton,]} onPress={() => this.continue() }>
                                    {   
                                        !this.state.joining ? <Text style={[styles.flatBtnText, styles.btFontSize]}>Continue</Text> : <ActivityIndicator color="white" animating={true} /> 
                                    }
                                </TouchableOpacity>

                                <View style={[styles.centerEle, styles.marginTopSM]}>
                                    <TouchableOpacity onPress={ () => { this.continue(true) } }>
                                        <Text style={styles.darkGrayText}> Skip this step </Text>
                                    </TouchableOpacity>
                                </View>

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
        // justifyContent: 'center',
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
    
    heightContainer:{
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

    heightValue: {
        flex: 2, 
        marginBottom: 0,
        paddingLeft: 10
    },

    measurementContainer: {
        backgroundColor: Colors.componentDarkBackgroundColor,
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1, 
        borderColor: Colors.componentBackgroundColor,
    },

    measurementValue:{
        flex: 0,
        fontSize: 16,
        textAlign: 'center',
        minWidth: 50,
    },
    itemPicker:{
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
    pickerTitleContainer:{
        flexDirection: 'row',
        backgroundColor: Colors.componentDarkBackgroundColor,
        height: 35,
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

export default connect(mapStateToProps, AuthActions)(TalentDetail)
