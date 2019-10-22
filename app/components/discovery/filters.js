import React, { Component} from 'react'
import { connect } from 'react-redux'

// import {
//     addNavigationHelpers
// } from 'react-navigation';

import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, AsyncStorage, Alert, TouchableOpacity,ScrollView, TextInput, Modal,Picker, DeviceEventEmitter } from 'react-native';
import { transparentHeaderStyle, defaultHeaderStyle } from '@styles/components/transparentHeader.style';

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import _ from 'lodash'
import { Colors } from '@themes/index';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import BoxStyles from '@styles/components/box-wrap.style';
import BoxWrap from '@styles/components/box-wrap.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';


import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import ModalCustomHeader from '@components/header/modal-custom-header';
import { talent_seeker_category, talent_category, filterData} from '@api/response';
import { ethnicities, hair_colors, eye_colors, languages, ages,heights,weights,gendersFilter } from '@api/response'

import CountryPicker, {getAllCountries} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info';
import MinMaxPicker from '@components/ui/minMaxPicker';
import ALL_COUNTRIES from '@store/data/cca2'; 

// import AvailableJob from '@components/job/talent/available-job'
// import AppliedJob from '@components/job/talent/applied-job'

// var ScrollableTabView = require('react-native-scrollable-tab-view'); 

// import ScrollableTabView, {DefaultTabBar } from 'react-native-scrollable-tab-view';

let _SELF = null;
let originalLanguage = _.cloneDeep(languages);
let originalGender=_.cloneDeep(gendersFilter);
const Item = Picker.Item;
let _initState;

class filters extends Component {

    constructor(props){
        super(props);
        //your codes ....
     
        let userLocaleCountryCode = DeviceInfo.getDeviceCountry();
        const userCountryData = getAllCountries();
        let callingCode = null;
        let name = null;
        let cca2 = userLocaleCountryCode;
        const { navigate, state, goBack } = this.props.navigation;
        let talentcate=_.cloneDeep(talent_category);
        let talentseekercate=_.cloneDeep(talent_seeker_category);
        let allTalentCate=[];
        let tmptalent=[];
        if(state.params.filterType == 'job'){
            console.log('Emit FilterJob');
            _.forEach(talentcate,function(v,k){
                tmptalent.push(v);
            });
            allTalentCate=tmptalent;
        }
        else if(state.params.filterType == 'discover'){
            console.log('Emit FilterPeople');            
            _.forEach(talentcate,function(v,k){
                tmptalent.push(v);
            });
            allTalentCate=tmptalent;
            _.forEach(talentseekercate,function(v,k){
                allTalentCate.push(v);
            });
        }

        // allTalentCate.push(tmptalent);
        
        if (!cca2 || !name || !userCountryData) {
            // cca2 = 'US';
            // name = 'United States';
            // callingCode = '1';
        } else {
            callingCode = userCountryData.callingCode;
        }
        _initState = null;
        _initState = {
            selectedTab: 0,
            talent_cate : allTalentCate,
            age:{
                val:''
            },
            gender:{
                val:''
            },
            myheight:{
                val:''
            },
            myweight:{
                val:''
            },
            hair_color: '',
            myhaircolor:{
                val: ''
            },
            eye_color: '',
            myeyecolor:{
                val: ''
            },
            cca2,
            name,
            callingCode, 
            country: {
                val: '',
                langCode: '',
                callingCode: '',
                isErrRequired: false
            },
            languages: originalLanguage,       
            selectedLanguages: '',
            displayLanguages: '',
            selectedLanguagesCount: 0,
            ethnicityModalVisible: false,
            languageModalVisible: false,
            ageModalVisible:false,
            hairModalVisible: false,
            eyeModalVisible: false,
            genderModalVisible: false, 
            selectedGender: 'B'||'',
            mode: Picker.MODE_DIALOG,  
            prevoius_gender:'', 
            selectedEthnicity  : '', 
            Genders:originalGender,
            displayGendersAndroid:'',
            genderAndroidVisible:false
        }
        if(state.params.filterType == 'job'){
            // console.log('Filter Data: ', filterData.job);
            this.state = filterData.job ? _.cloneDeep(filterData.job.data) : _.cloneDeep(_initState);

        }else if(state.params.filterType == 'discover'){
            // console.log('Filter Data: ', filterData, ', ' , state.params.tabType);
            if(state.params.tabType == 'Videos'){
                this.state = filterData.video ? _.cloneDeep(filterData.video.data) : _.cloneDeep(_initState);
            }else{
                this.state = filterData.people ? _.cloneDeep(filterData.people.data) : _.cloneDeep(_initState);
            }
        }
        // this.state = _.cloneDeep(_initState);
        // console.log(_.cloneDeep(_initState));
        // console.log('Filter Navigation: ', this.props.navigation);
    }

    static navigationOptions = ({ navigation }) => {
        // console.log('navigation : ', navigation);
        return ({
            headerStyle: defaultHeaderStyle,  
            header: () => <ModalCustomHeader {...navigation} self={_SELF} title={'Filters'} />,
    })};

    componentDidMount() {        

        const { navigate, state, goBack } = this.props.navigation;
        _SELF = this;
        let langTmp="";
        console.log("objct filterdata",filterData);
        if(state.params.filterType == 'job'){

            GoogleAnalyticsHelper._trackScreenView('Job Filter'); 

            console.log("blah");
        }else if(state.params.filterType == 'discover'){

            //console.log('tabType: ', state.params.tabType);
            // console.log("discover tab true");
            if(state.params.tabType == 'Videos'){
                langTmp=filterData.video? filterData.video.data.displayLanguages: "";
                GoogleAnalyticsHelper._trackScreenView('Video Filter'); 
            
            }else{
               langTmp=filterData.people? filterData.people.data.displayLanguages: "";
               
            }
            
            // if(state.params.tabType == 'Videos'){
            //     console.log("langtmp in tab videos true",langTmp);
            // }else{
            //    console.log("langtmp in tab people true",langTmp);
            // }
        }
        // console.log("original filter selected languages value",filterData.people.data.displayLanguages);
        // let langTmp=UserHelper.UserInfo.profile.attributes.language.value;
        let langSplit=langTmp.split(", ");
      
        let tmpp = [];
        // console.log("OBJECT LANGUAGE",this.state.languages);
        _.each(_.cloneDeep(this.state.languages), function(v,k){
            // if(v.category == talentType)
            _.each(langSplit, function(v_sub, k_sub){
                if(v.display_name == v_sub){
                    v.selected = true;
                }
            })
            tmpp.push(v);
        })
        originalLanguage=tmpp;
        console.log("tcmpp",tmpp);
      
        this.setState({
            languages:tmpp
        },function(){
            console.log("object language after assign new value",this.state.languages);
        })
    }
    
    componentWillUnmount() {
        originalLanguage = _.cloneDeep(languages);
    }

    onTabPress = (_tabIndex) => {
        this.setState({
            selectedTab: _tabIndex,
        })
    }

    selectedTalentTag = (item, index) => {
        
        let _tmp = this.state.talent_cate;
        _tmp[index].selected=!_tmp[index].selected;
        this.setState({
            talent_cate: _tmp
        });

    } 

    getTalentSelected = () => {
        // let _talentCate = this.state.talent_cate
        return _.filter(this.state.talent_cate, function(_item) { return _item.selected; });
    }

    checkTalentActiveTag = (item) => {
        return item.selected;
    }

    checkColorCountryInput = () => {
        // console.log(this.state.country);
        if(this.state.country.val == '')
            return '#9B9B9B';
        else if(this.state.country.isErrRequired){
            return 'red';
        }
        else{
            return 'black';
        }
    }

    // genderSelect=(item,index)=>{
    //     let temp=this.state.Genders;
    //     // temp[index].selected=!temp[index].selected;
    //     // console.log("Temp in gendeselect", temp);
    //     // console.log("Item in genderselect",item);
    //     let selectedCount=[];
    //     _.map(temp,function(v,k){
    //        if(v.id==item.id){
    //            v.selected=true;
    //            console.log("condition v select is true");
    //        }
    //        else{
    //            v.selected=false;
    //        }
    //        selectedCount.push(v);
    //     });
    //         console.log("temp in genderselect",selectedCount);
    //     let displayGendersAndroid;
    //     _.map(selectedCount,function(val,key){
    //         if(val.selected){
    //             displayGendersAndroid=val.display_name;
    //         }
    //     })
    //     console.log("display gender android",displayGendersAndroid);
    //     this.setState({
    //         Genders:selectedCount,
    //         selectedGender:displayGendersAndroid=='Both(Male & Female)' ? 'B':(displayGendersAndroid=='Male' ? 'M':'F'),
    //         displayGendersAndroid:displayGendersAndroid
    //     })
    //     // let selectedCount=[];
    //     // _.map(temp,function(val){
    //     //     if(val.selected){
    //     //         selectedCount.push(val);
    //     //     }
    //     // });
    //     // if(selectedCount.length<=1){
    //     //     let displayGendersAndroid;
    //     //     _.map(selectedCount,function(val,key){
    //     //         displayGendersAndroid=key==0 ? val.display_name : displayGendersAndroid + ','+ val.display_name;
    //     //     });
    //     //     this.setState({
    //     //         Genders:temp,
    //     //         selectedGenderCount:selectedCount.length,
    //     //         selectedGenderAndroid:displayGendersAndroid,
    //     //         displayGendersAndroid:displayGendersAndroid?displayGendersAndroid.replace(/,/g, ', '):''
    //     //     })
    //     // }
    //     // else{
    //     //     temp[index].selected = !temp[index].selected;
    //     //     this.setState({Genders : temp});
    //     //     Alert.alert('You can select one type of gender only');
    //     // }
    //     this.setModalVisible(false,"genderAndroid");
    // }

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
        let temp=(type=='genderAndroid' ? this.state.Genders: (type=='ethnicity'? ethnicities:(type=='hair'? hair_colors:eye_colors)));
       
        let selectedvalue;
        _.map(temp,function(v,k){
            if(v.id==item.id){
                selectedvalue=v.display_name;
            }
        });
        (type=='genderAndroid'? this.setState({selectedGender:selectedvalue=='Both(Male & Female)' ? 'B':(selectedvalue=='Male' ? 'M':'F'),displayGendersAndroid:selectedvalue}):(type=='ethnicity' ? this.setState({selectedEthnicity:selectedvalue}):(type=='hair'? this.setState({myhaircolor:{val:selectedvalue}}):this.setState({myeyecolor:{val:selectedvalue}}))));
        (type=='genderAndroid' ? this.setModalVisible(false,'genderAndroid'):(type=='ethnicity' ? this.setModalVisible(false,'ethnicity'):(type=='hair'? this.setModalVisible(false,'hair'):this.setModalVisible(false,'eye'))));
       
    }

    languageSelect = (item, index) => { 
        let temp = this.state.languages;
        temp[index].selected = !temp[index].selected;
        let selectedCount = [];
        _.map(originalLanguage, function(val){
            if(val.selected)
                selectedCount.push(val);
        });
        if(selectedCount.length <= 3){
            let displayLanguages;
            _.map(selectedCount, function(val, key){
                displayLanguages = key == 0 ? val.display_name : displayLanguages + ',' + val.display_name;
            });
            
            this.setState({
                languages : temp,
                selectedLanguagesCount : selectedCount.length,
                selectedLanguages: displayLanguages,
                displayLanguages: displayLanguages?displayLanguages.replace(/,/g, ', '):''
            },function(){

            });
            
        }else{
            temp[index].selected = !temp[index].selected;
            this.setState({languages : temp});
            Alert.alert('You can select three languages only')
        }
    }

    onLanguageSearch(text){
        console.log("this is language from search box",text);
        let _dataFilter = _.filter(originalLanguage, function(v,k){
            return _.includes(v.display_name.toLowerCase(), text.toLowerCase());
        })
        this.setState({languages:_dataFilter},function(){
            console.log("Language state after search and choose",this.state.languages);
        })

    }  
    
    generateLanguageList(){
        console.log("this state language before language is generated",this.state.languages);
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
                            <Icon name={"close"} style={[ styles.languageNavIcon ,{textAlign:'left'}]} />
                        </TouchableOpacity>        
                        <Text style={[ styles.languageNavTitle, styles.inputLabelFontSize ]} >Language</Text>
                        <Text style={[ styles.languageNavStatus ,styles.inputLabelFontSize]} >{this.state.selectedLanguagesCount} /3 selected</Text>
                    </View>

                    <View style={[styles.mainHorizontalPadding, {marginTop: 20}]}>
                        <TextInput
                            style={[styles.inputLabelValueSize,{marginBottom:7, height: Helper._isAndroid()?40:30, borderColor:Colors.componentBackgroundColor, borderRadius:5,textAlign:'center', backgroundColor:Colors.componentBackgroundColor,borderWidth: 1}]}
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

    generatePicker(itemObject, type){

        let _prepareRenderPicker = (type=='genderAndroid' ? this.state.Genders:(type=='ethnicity' ? ethnicities:(type=='hair'? hair_colors : eye_colors)));
       
        return(
            <View style={[styles.justFlexContainer]}>
                { Helper._isAndroid()  && 
                    <View>
                        <View style = {[ {flex: 1} ]}>
                            <Modal
                                transparent={true}
                                presentationStyle={'pageSheet'}
                                onRequestClose={() => {}}
                                visible = {type == 'genderAndroid' ? this.state.genderAndroidVisible:(type=='ethnicity' ? this.state.ethnicityModalVisible:(type=='hair'? this.state.hairModalVisible: this.state.eyeModalVisible))}>
                                <TouchableOpacity style={[styles.mainVerticalPadding, {flex:1,flexDirection:'column',paddingBottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.8)'}]} onPressOut={() => {this.setModalVisible(false,type)}}>
                                    <View style={{width:300,height:type=='genderAndroid'? 200:(type=='ethnicity'? 300:(type=='hair'? 270:270)),backgroundColor:'white'}}>
                                        <View style={[styles.languageNav]} >
                                            <Text style={[ styles.languageNavTitle ,styles.inputLabelFontSize,{flex:2,textAlign:'left'}]} >Please select {type=='genderAndroid'?'gender':type}</Text>
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
                                <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: type=="genderAndroid" ? (this.state.selectedGender? 'black':'#9B9B9B'):(type=="ethnicity"? (this.state.selectedEthnicity? 'black':'#9B9B9B'):(type=="hair"? (this.state.myhaircolor.val ? 'black':'#9B9B9B'):(this.state.myeyecolor.val? 'black':'#9B9B9B'))),textAlign:'right'}]}>{ type=='genderAndroid'? this.state.displayGendersAndroid || 'Both(Male & Female)' :(type=='ethnicity' ? this.state.selectedEthnicity || 'Select ethnicity' :(type=='hair' ? this.state.myhaircolor.val || 'Select hair color' :this.state.myeyecolor.val|| 'Select eyes color') ) }</Text>
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
                                    <Text style={[styles.fontBold, styles.inputLabelFontSize,{textAlign: 'left', padding:10, left: 10} ]}>Select {type == 'ethnicity' ? type : type + ' color'} </Text>
                                <TouchableOpacity activeOpacity = {0.8}
                                    style={[ {backgroundColor: Colors.componentDarkBackgroundColor, position:'absolute', padding:10, right:10} ]}
                                    onPress={() => {
                                        this.setModalVisible(false, type)
                                    }}>
                                    <Text style={[styles.fontBold, styles.inputLabelFontSize,{textAlign: 'right', color: '#3b5998'} ]}>Done</Text>
                                </TouchableOpacity>
                                </View>
                                <View style={[ {backgroundColor: 'white'} ]}>
                                    <Picker
                                        selectedValue={ type == 'ethnicity' ? this.state.selectedEthnicity :
                                            (type == 'hair' ? this.state.myhaircolor.val : this.state.myeyecolor.val)}
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
                                (type == 'hair' ? this.state.myhaircolor.val : this.state.myeyecolor.val);
                                if(val == '')
                                    this.onPickerChange(itemObject[0].display_name, type);
                            }}>
                            <View style = {styles.itemPicker}>
                                {
                                    type == 'ethnicity' && 
                                    <Text style={[ styles.flatInputBoxFont, styles.inputValueFontSize, {textAlign:'right',color: this.state.selectedEthnicity ? 'black':'#9B9B9B'}]}>{ this.state.selectedEthnicity || 'Select ethnicity' }</Text>
                                }

                                {
                                    type == 'hair' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {textAlign:'right',color: this.state.myhaircolor.val ? 'black':'#9B9B9B'}]}>{ this.state.myhaircolor.val || 'Select hair color' }</Text>
                                }

                                {
                                    type == 'eye' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {textAlign:'right',color: this.state.myeyecolor.val ? 'black':'#9B9B9B'}]}>{ this.state.myeyecolor.val || 'Select eye color' }</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }    

    setModalVisible(visible, type) {
        if(type == 'ethnicity'){
            this.setState({ethnicityModalVisible: visible})
        }else if(type == 'hair'){
            this.setState({hairModalVisible: visible})
        }else if(type == 'eye'){
            this.setState({eyeModalVisible: visible})
        }else if(type == 'language'){
            let selectedCount = [];
            _.map(originalLanguage, function(val){
                if(val.selected)
                    selectedCount.push(val);
            });
            this.setState({languageModalVisible: visible,selectedLanguagesCount:selectedCount.length})
        }else if(type == 'gender'){
            this.setState({genderModalVisible: visible})
        }
        else if(type=='genderAndroid'){
            this.setState({genderAndroidVisible:visible})
        }
    }

    onValueChange = (key, value) => {
        const newState = {};
        newState[key] = value;
        this.setState(newState);
    };

    onPickerChange(text, type){
        if(type == 'ethnicity'){
            this.setState({selectedEthnicity: text})
        }else if(type == 'hair'){
            this.setState({myhaircolor:{
                val:text
            }})
        }else if(type == 'eye'){
            this.setState({myeyecolor:{
                val:text
            }})
        }
    }  

    onEthnicityChange(text){
        // console.log('Ethnicity: ', text);
        this.setState({selectedEthnicity: text})
    }  

    // onHeightChanged(text){
    //     let reSing=/^[0-9]{0,3}$/;
    //     if(reSing.test(text)){
    //         this.setState({ height:text })
    //     }
    // }

    // onWeightChanged(text){
    //     let reSing=/^[0-9]{0,3}$/;
    //     if(reSing.test(text)){
    //         this.setState({ myweight: {val:text} })
    //     }
    // }

    onPickerChangeValue =(value,type) =>{
        if(type=="age"){
            this.setState({
                age:{
                    val:value
                }
            },function(){
                console.log("Object AGE State",this.state.age);
            })
        }
        if(type=="height"){
            this.setState({
                myheight:{
                    val:value
                }
            },function(){
                console.log("Object HEIGHT State",this.state.myheight)
            })
        }
        if(type=="weight"){
            this.setState({
                myweight:{
                    val:value
                }
            },function(){
                console.log("Object WEIGHT State",this.state.myweight)
            })
        }
    }
    // onMyModalVisible=(value,type)=>{
    //     this.setModalVisible(true,"ethnicity");
    // }
    isNotJobFilter = () =>{
        const { navigate, state } = this.props.navigation
        return  state.params && state.params.filterType != 'job';
    }

    _clearFilters = () => {

        GoogleAnalyticsHelper._trackEvent('Filter', 'Clear');         

        originalLanguage = _.cloneDeep(languages);
        originalGender=_.cloneDeep(gendersFilter);
        const {state} = this.props.navigation;
        if(state.params.filterType == 'job'){
            filterData.job = null
        }else if(state.params.filterType == 'discover'){
            if(state.params.tabType == 'Videos'){
                filterData.video = null;
            }else{
                filterData.people = null;
            }
        }
        this.triggerEmitFunc(null);
        
        return;        

        console.log('Clear Filters', _initState);
        // this.state = _.cloneDeep(this._initState);
        this.setState({
            ..._.cloneDeep(_initState)
        },function(){
            console.log('After Clear: ', this.state);
            DeviceEventEmitter.emit('FilterJob', { dataFilter: null});
            _SELF.applyFilter();
        })
    }

    // func for check which screen need to trigger
    triggerEmitFunc = (filterData) => { // null : mean reset data
        const { navigate, state, goBack } = this.props.navigation;
        console.log('Filter State :', state.params);
        if(state.params.filterType == 'job'){

            console.log('Emit FilterJob');
            GoogleAnalyticsHelper._trackEvent('Job Filter', 'Apply', {custom_data: filterData});         
        
            DeviceEventEmitter.emit('FilterJob', { dataFilter: filterData});

        }
        else if(state.params.filterType == 'discover'){
            
            
            if(state.params.tabType == 'Videos'){

                console.log('Emit FilterVideo');
                GoogleAnalyticsHelper._trackEvent('Video Filter', 'Apply', {custom_data: filterData});         
            
                DeviceEventEmitter.emit('FilterVideos', { dataFilter: filterData});
                
            }
            else{
                // console.log('Emit FilterPeople', filterData);            
                DeviceEventEmitter.emit('FilterPeople', { dataFilter: filterData});        
            }

            // DeviceEventEmitter.emit('UpdateFilterIconDiscover', { dataFilter: filterData});

        }
        goBack();
    }

    applyFilter = () => {
        // console.log("Apply Filter selectedGender",this.state);
        const {state} = this.props.navigation;
        // console.log('This is type: ', state.params.filterType);

        let filterObj = {};
        filterObj.data = this.state;
        filterObj.type = state.params.filterType;

        if(filterObj.type == 'job'){
            filterData.job = filterObj;

        }else if(filterObj.type == 'discover'){
            //console.log('tabType: ', state.params.tabType);
            if(state.params.tabType == 'Videos'){
                filterData.video = filterObj;
            }else{
                filterData.people = filterObj;
            }
        }
        console.log('This is filter object: ', filterData);
        console.log("this is state object",this.state);
        this.triggerEmitFunc(this.state);
    }   

    focusOnMe = (e) => {

    }

    render() {
        // console.log(this.props.user, this.state.userData);
         const { navigate, goBack } = this.props.navigation;

            return (
                <View style={{flex:1, backgroundColor:'white'}}>

                    <ScrollView>
                        <View style={[styles.mainPadding,{marginVertical:10}]}>

                            {/* select talent category */}
                            <Text style={[styles.inputLabelFontSize,{fontWeight:'bold'}]}>Select talent types</Text>
                            <View style={[styles.tagContainerNormal, styles.marginTopSM]}> 
                                {this.state.talent_cate.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity = {0.9}
                                            key={ index } 
                                            style={[{backgroundColor:Colors.componentBackgroundColor},styles.tagsSelectNormal, this.checkTalentActiveTag(item) && styles.tagsSelected]} 
                                            onPress={ () => this.selectedTalentTag(item, index) }
                                        >
                                            <Text style={[styles.tagTitle, styles.btFontSize,styles.inputValueFontSize, this.checkTalentActiveTag(item) && styles.tagTitleSelected]}>
                                                {item.display_name}

                                                {item.selected}
                                            </Text>
                                            
                                        </TouchableOpacity>     
                                    )
                                })}   
                            </View>    

                            <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />

                            {/* age */}
                            <View style={[{flex:1}]}>
                                <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { }}>
                                    <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Age</Text>
                                    <MinMaxPicker onPickerChangeValue={this.onPickerChangeValue}  myData={ages} type="age" default={this.state.age.val}/>
                                </TouchableOpacity>
                                <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                            </View>

                            {/* gender */}
                            <View style={[{flex:1}]}>
                                { Helper._isAndroid()  && 
                                    <View style={[{flex:1}]}>
                                        <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                            <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Gender</Text>
                                            {this.generatePicker(this.state.Genders, 'genderAndroid')}
                                        </TouchableOpacity>
                                    </View> 
                                } 

                                { Helper._isIOS()  && 
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.focusOnMe(event) }}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Gender</Text>
                                        <View> 
                                            <Modal
                                                animationType={"slide"}
                                                transparent={true}
                                                visible={this.state.genderModalVisible}
                                                onRequestClose={() => {}}
                                                >

                                                <View onPress = {()=>{ }} style={{flex: 1, justifyContent: 'flex-end',marginTop: 22}}>
                                                    <TouchableOpacity
                                                        style={[ {backgroundColor: Colors.componentDarkBackgroundColor, padding: 15} ]}
                                                        onPress={() => {
                                                            this.setModalVisible(!this.state.genderModalVisible, 'gender')
                                                        }}>
                                                        <Text style={[styles.fontBold, {textAlign: 'right', color: '#3b5998'} ]} >Done</Text>
                                                    </TouchableOpacity>
                                                    <View style={[ {backgroundColor: 'white'} ]}>
                                                        <Picker
                                                            ref = 'genderPicker'
                                                            selectedValue={this.state.selectedGender}
                                                            onValueChange={this.onValueChange.bind(this, 'selectedGender')}>
                                                            <Item label="Both" value="B"/>
                                                            <Item label="Male" value="M" /> 
                                                            <Item label="Female" value="F" />
                                                        </Picker>
                                                    </View>
                                                </View>
                                            </Modal>

                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.setModalVisible(true, 'gender')
                                                }}>
                                                <View style = {styles.genderPicker}>
                                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: this.state.gender.isErrRequired ? 'red': '#B9B9B9'} , !_.isEmpty(this.state.selectedGender) && {color: 'black'}  ]}>{ Helper._getGenderLabel(this.state.selectedGender)}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity> 
                                }
                                <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                            </View>

                            {/*country*/}
                            <View style={[{flex:1}]}>
                                <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                    <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Country</Text>
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
                                            <Text style={[ styles.inputValueFontSize,{ color:  this.checkColorCountryInput() } ]}> { this.state.country.val || 'Country' } </Text>
                                        </View>
                                    </CountryPicker>
                                </TouchableOpacity>
                                <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                            </View> 

                            { this.isNotJobFilter() && <View style={[{flex:1}]}>

                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Ethnicity</Text>
                                        {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:''},...ethnicities]:ethnicities, 'ethnicity')}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View> 

                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={() => this.setModalVisible(true, 'language')}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Language</Text>
                                        <View style = {[styles.itemPicker,{flex:0.7}]}>
                                            <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color:this.state.displayLanguages? 'black':'#9B9B9B',textAlign:'right'}]}>{ this.state.displayLanguages || 'Select languages' }</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {this.generateLanguageList()}
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>  

                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { }}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Height cm</Text>
                                        <MinMaxPicker onPickerChangeValue={this.onPickerChangeValue} myData={heights} type="height" default={this.state.myheight.val}/>
                                        {/*<Text style={{fontSize:16}}> cm</Text>*/}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>

                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { }}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Weight kg</Text>
                                        <MinMaxPicker onPickerChangeValue={this.onPickerChangeValue} myData={weights} type="weight" default={this.state.myweight.val}/>
                                        {/*<Text style={{fontSize:16}}> kg</Text>*/}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>  

                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={() => this.setModalVisible(true, 'hair')}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Hair color</Text>
                                        {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:''},...hair_colors]:hair_colors, 'hair')}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>   

                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={() => this.setModalVisible(true, 'eye')}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Eyes color</Text>
                                        {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:''},...eye_colors]:eye_colors, 'eye')}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>   
                            </View> }

                        </View>
                        <View style={[styles.absoluteBox,{marginBottom:20, position: 'relative', backgroundColor: 'transparent',paddingVertical:0}]}>
                            <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                            <TouchableOpacity style={[styles.btnContainer]} onPress={() => this.applyFilter()}>
                                
                                    {   
                                        !this.state.isLoading ? <Text style={styles.btn}>Apply Filters</Text> : <ActivityIndicator color="white" animating={true} /> 
                                    }
                                
                            </TouchableOpacity>

                            </View>
                        </View> 
                    </ScrollView>
                    
                </View>
            
            );

        
    }
}

function mapStateToProps(state) {
    // console.log('main state',state);
    return {
        // user: state.user,
        // navigation: state.navigation,
        // nav: state.navigation
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,
    txtContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch'
    },
    btn: {
        textAlign: 'center',
        color: "white",
        fontWeight: "700",
    },
    btnContainer: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 15,
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.buttonColor
    },
    titleBold:{
        fontWeight:'bold'
    },
    inputBox:{
        flex:0.6,
        textAlign:'right',
        paddingVertical: 0
    },
    itemPicker:{
        backgroundColor: 'transparent',
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 10,
        minHeight:20
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
         textAlign:'left'
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
})

export default connect(mapStateToProps, AuthActions)(filters)
