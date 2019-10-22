import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as DetailActions from '@actions/detail'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Button, 
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StatusBar,
    Alert,
    Picker,
    Platform,
    Modal,
    Dimensions,
    InteractionManager,
    ActivityIndicator,
    ActionSheetIOS,
    DeviceEventEmitter
} from 'react-native'

import { talent_category } from '@api/response';
import { talent_seeker_category} from '@api/response';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style'; 

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';
// import ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { postMedia, putApi, postApi, getApi,deleteApi } from '@api/request';

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import { ethnicities, hair_colors, eye_colors, languages,genders } from '@api/response'

import VideoUploadEditProfile from '@components/user/comp/video-upload-edit-profile'
import ImageUploadEditProfile from '@components/user/comp/image-upload-edit-profile'

import CountryPicker, {getAllCountries} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info';

import ALL_COUNTRIES from '@store/data/cca2';

const Item = Picker.Item;
import _ from 'lodash'
import moment from 'moment'

const {width, height} = Dimensions.get('window')

let originalGender=_.cloneDeep(genders);
function mapStateToProps(state) {
    // console.log('wow',state)
    return {
        user: state.user,
    }
}

let options = {
    title: 'Select Image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

var BUTTONS = [
  'Delete',
  'Cancel',
];

var DESTRUCTIVE_INDEX = 0;
var CANCEL_INDEX = 1;

const videoOptions = {
    title: 'Video Picker',
    takePhotoButtonTitle: 'Take Video...',
    mediaType: 'video',
    videoQuality: 'high'
};

let originalLanguage = _.cloneDeep(languages);

const appearance = {
    id:1,
    detail:{
        first_name:'Jane',
        last_name:'Wodtake',
        age:'27',
        gender:'Female',
        country:'Singapore',
        ethnicity:'Caucasian',
        language:'English, Mandarin, Tamil',
        height:'183cm',
        weight:'64kg',
        hair_color:'Black',
        eyes_color:'Brown'
    }
    
};

class EditProfile extends Component {

    constructor(props){
        super(props);
        var a = moment([moment().year(), 0]);
        var b = moment([UserHelper.UserInfo.profile.attributes.date_of_birth.value, 0]);
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
        let job_info = {
            'title': '',
            'country': '',
            'gender': '',
            'fromAge': '',
            'toAge': '',
            'description': '',
            'talent_cate': talent_category,
            'img': []
        }
        let talentCate=[];
        if(UserHelper._isUser()){
            talentCate=_.cloneDeep(talent_category);
        }
        if(UserHelper._isEmployer()){
            talentCate=_.cloneDeep(talent_seeker_category);
        }

        // console.log('User Info: ', UserHelper.UserInfo.profile)
        this.state = {
            item_selected: '',
            isLoadingVideoProcess: false,
            featuredPhoto: {},
            talent_cate : talentCate,
            user_type_select: '',
            joining: false,
            isLoading: false,
            firstname: {
                val:UserHelper.UserInfo.profile.attributes.first_name.value,
            },
            lastname:{
                val:UserHelper.UserInfo.profile.attributes.last_name.value
            },
            age:{
                val:(a.diff(b, 'years')).toString()
            },
            gender: {  
                val: UserHelper.UserInfo.profile.attributes.gender.value || '',
                isErrRequired: false
            },
            selectedEthnicity  :  UserHelper.UserInfo.profile.attributes.ethnicity.value || '', 
            languages: originalLanguage,       
            selectedLanguages:UserHelper.UserInfo.profile.attributes.language.value,
            // displayLanguages: UserHelper.UserInfo.profile.attributes.language.value.replace(/,/g, ', '),
            displayLanguages: UserHelper.UserInfo.profile.attributes.language.value ? UserHelper.UserInfo.profile.attributes.language.value.replace(/,/g, ', ') : '',
            selectedLanguagesCount: 0,
            height:UserHelper.UserInfo.profile.attributes.height.value,
            weight:UserHelper.UserInfo.profile.attributes.weight.value,
            myheight:{
                val:UserHelper.UserInfo.profile.attributes.height.value || ''
            },
            myweight:{
                val:UserHelper.UserInfo.profile.attributes.weight.value || ''
            },
            hair_color:UserHelper.UserInfo.profile.attributes.hair_color.value,
            myhaircolor:{
                val:UserHelper.UserInfo.profile.attributes.hair_color.value || ''
            },
            eye_color:UserHelper.UserInfo.profile.attributes.eye_color.value,
            myeyecolor:{
                val:UserHelper.UserInfo.profile.attributes.eye_color.value || ''
            },
            ethnicityModalVisible: false,
            hairModalVisible: false,
            eyeModalVisible: false,
            languageModalVisible: false,
            genderModalVisible: false, 
            selectedGender: UserHelper.UserInfo.profile.attributes.gender.value,
            mode: Picker.MODE_DIALOG,  
            prevoius_gender:'', 
            cca2,
            name,
            callingCode,
            country: {
                val: UserHelper.UserInfo.profile.attributes.country.value,
                // langCode: UserHelper.UserInfo.profile.attributes.country_code.value,
                // val: UserHelper.UserInfo.profile.country,
                // langCode: UserHelper.UserInfo.profile.country_code,
                callingCode: '',
                isErrRequired: false
            },
            company:{
                val:UserHelper.UserInfo.profile.attributes.company.value
            },
            Genders:originalGender,
            displayGendersAndroid:UserHelper.UserInfo.profile.attributes.gender.value,
            genderAndroidVisible:false
        }
        
        const { navigate, goBack, state } = this.props.navigation;
        console.log('OOBBLDF', UserHelper.UserInfo);
        // console.log("all image",UserHelper.UserInfo.photos);
        console.log("FFFFFFF",this.state.displayLanguages);

    }

    static navigationOptions = ({ navigation }) => ({ 
        // title: '', 
        headerVisible: false,
        headerTitle: 'Edit Profile',
        headerLeft: (<ButtonBack
            isGoBack={ navigation }
            btnLabel= ""
        />),
    });

    componentDidMount(){

        GoogleAnalyticsHelper._trackScreenView('Edit Profile');                 
        
        let langTmp=UserHelper.UserInfo.profile.attributes.language.value;
        let langSplit=langTmp.split(",");
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
        // if user not yet completed register
        // get all photo that user upload 
        // if(UserHelper._getUserInfo()){
            // console.log('get photo');
            // this._getPhoto();
        // }

        let res=UserHelper.UserInfo.profile.attributes.kind.value;
        let talentType=res.split(",");
        let tmp = [];
        _.each(_.cloneDeep(this.state.talent_cate), function(v,k){
            // if(v.category == talentType)
            _.each(talentType, function(v_sub, k_sub){
                if(v.category == v_sub){
                    v.selected = true;
                }
            })
            tmp.push(v);
        })
        this.setState({
            talent_cate:tmp,
            languages:tmpp
        },function(){
            // console.log("ORIGIAL LANGUAGE",originalLanguage);
            // console.log("Language",this.state.languages)
        })

    }
    componentWillUnmount() {
        originalLanguage = _.cloneDeep(languages);
    }
    Update(){
        // var tttt=[];
        // for(var i=0;i<6;i++){
        //     if(this.state.talent_cate[i].hasOwnProperty('selected'))
        //         tttt.push(this.state.talent_cate[i]);
        //         // console.log("Has field selected",this.state.talent_cate[i]);
        //     else
        //        continue;
        // }

        // _.each(this.state.talent_cate)
        console.log("Age age age",this.state.age.val);
        let _allTalentCateSelected = this.getTalentSelected();

        if(_.isEmpty(_allTalentCateSelected)){
            Alert.alert("You must select at least one talent category");
            return;
        }
        let talentCateStringArray = _.map(_allTalentCateSelected, function(v, k) {
            return v.category;
        });
        // console.log("moment of year",moment("01/01/1992", "MM/DD/YYYY").month(0).from(moment().month(0),true));
        // let yearofbirth=moment([Helper._getBirthDateByAge(parseInt(this.state.age.val)),1]);
        // console.log("year of birth",yearofbirth);
        let allField={
                "first_name": {
                    "value": this.state.firstname.val,
                    "privacy_type": "only-me"
                },
                "last_name": {
                    "value": this.state.lastname.val,
                    "privacy_type": "only-me"
                },
                "date_of_birth": {
                    "value": Helper._getBirthDateFullByAge(this.state.age.val), 
                    "privacy_type": "only-me"
                },
                "gender": {
                    "value": this.state.selectedGender,
                    "privacy_type": "only-me"
                },
                "kind": {
                    "value": talentCateStringArray,
                    "type":"register-category",
                    "privacy_type": "only-me"
                },
                "country":{
                    "value":this.state.country.val,
                    "privacy_type": "only-me"
                },
                "country_code":{
                    "value": this.state.country.callingCode,
                    "privacy_type": "only-me"
                }
        }
        if(UserHelper._isEmployer()){
            allField=_.extend({
                "company": {
                    "value": this.state.company.val,
                    "privacy_type": "only-me"
                }
            },allField)
        }
        if(UserHelper._isUser()){
            allField=_.extend({
                "ethnicity": {
                    "value": this.state.selectedEthnicity,
                    "privacy_type": "only-me"
                },  
                "language": {
                    "value": this.state.selectedLanguages,
                    "privacy_type": "only-me"
                },
                "height": {
                    "value": this.state.myheight.val,
                    "privacy_type": "only-me"
                },
                "weight": {
                    "value": this.state.myweight.val,
                    "privacy_type": "only-me"
                },
                "hair_color": {
                    "value": this.state.myhaircolor.val === 'Please select hair color'?'':this.state.myhaircolor.val,
                    "privacy_type": "only-me"
                },
                "eye_color": {
                    "value": this.state.myeyecolor.val === 'Please select eye color'?'':this.state.myeyecolor.val,
                    "privacy_type": "only-me"
                },              
            },allField)
        }
        let that=this;
        that.setState({
            isLoading: true,
            gender:{
                val:that.state.selectedGender
            }
        },function(){
            console.log("MY GENDER CLICK",that.state.gender.val);
            console.log("Country Chossen",this.state.country);

            GoogleAnalyticsHelper._trackEvent('Edit Profile', 'Update User Information',{ user_id: UserHelper.UserInfo._id });                                         
            

            // console.log("talent cate string array",talentCateStringArray);
            // return;
            let API_URL = '/api/users/me/customs';
            putApi(API_URL,
                JSON.stringify(allField)
            ).then((response) => {
                console.log('Response Object: ', response);
                if(response.status=="success"){

                    // StorageData._removeStorage('TolenUserData');

                    UserHelper.UserInfo.profile.attributes = response.result.profile.attributes;
                    if(UserHelper.UserInfo.profile.country!=this.state.country.val){
                        UserHelper.UserInfo.profile.country=this.state.country.val;
                    }


                    // let _result=UserHelper.UserInfo.profile.attributes;
                    // console.log("Response Result",UserHelper.UserInfo.profile.attributes);
                    let _userData =  StorageData._saveUserData('TolenUserData',JSON.stringify(UserHelper.UserInfo)); 
                    // UserHelper.UserInfo.profile.attributes = _result; // assign for tmp user obj for helper
                    _userData.then(function(result){
                        // trigger to refresh flatlist to re-render
                        DeviceEventEmitter.emit('updateProfileInfo',  {})
                        
                        const { navigate, goBack, state } = that.props.navigation;
                        goBack();

                    });

                    // console.log('Response Object: ', response);
                    // if(that._checkTalentType('employer')){
                    //     navigate('UploadPhoto', { sign_up_info: _result});
                    // }
                    // else{
                    //     navigate('TalentDetail', { sign_up_info: _result});
                    // }
                }
                that.setState({
                    joining: false
                }, function(){

                });
            })

        });
    }

    checkTalentActiveTag = (item) => {
        return item.selected;
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
    genderSelect=(item,index,type)=>{
        console.log("my item in gender select",item);
        console.log("state Genders",this.state.Genders);
        console.log("my type",type);
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
        console.log("temp in genderselect",temp);
        let selectedvalue;
        _.map(temp,function(v,k){
            if(v.id==item.id){
                selectedvalue=v.display_name;
            }
        });
        (type=='genderAndroid'? this.setState({selectedGender:selectedvalue=='Male' ? 'M':'F',displayGendersAndroid:selectedvalue}):(type=='ethnicity' ? this.setState({selectedEthnicity:selectedvalue}):(type=='hair'? this.setState({myhaircolor:{val:selectedvalue}}):this.setState({myeyecolor:{val:selectedvalue}}))));
        (type=='genderAndroid' ? this.setModalVisible(false,'genderAndroid'):(type=='ethnicity' ? this.setModalVisible(false,'ethnicity'):(type=='hair'? this.setModalVisible(false,'hair'):this.setModalVisible(false,'eye'))));
        console.log("After Set State",this.state);
    }
    // update basic info
    generatePicker(itemObject, type){
        console.log("generate picker item object and type",itemObject,type);
        let _prepareRenderPicker = (type=='genderAndroid' ? this.state.Genders:(type=='ethnicity' ? ethnicities:(type=='hair'? hair_colors : eye_colors)));
        return(
            <View style={[styles.justFlexContainer]}>
                { Helper._isAndroid()  && 
                    <View>
                        <View style = {[ {flex: 1} ]}>
                            <Modal
                                transparent={true}
                                onRequestClose={() => {}}
                                visible = {type == 'genderAndroid' ? this.state.genderAndroidVisible:(type=='ethnicity' ? this.state.ethnicityModalVisible:(type=='hair'? this.state.hairModalVisible: this.state.eyeModalVisible))}>
                                <TouchableOpacity style={[ styles.justFlexContainer, styles.mainVerticalPadding, {flex:1,flexDirection:'column',paddingBottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.8)'}]} onPressOut={() => {this.setModalVisible(false,type)}}>
                                    <View  style={{width:300,height:type=='genderAndroid'? 160:(type=='ethnicity'? 300:(type=='hair'? 270:270)),backgroundColor:'white'}}>
                                        <View style={[styles.languageNav ]} >
                                            <Text style={[ styles.languageNavTitle,styles.inputLabelFontSize,{textAlign:'left'} ]} >Please select {type=='genderAndroid'?'gender':type}</Text>
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
                                                            <Text style={[ styles.itemText,styles.inputValueFontSize,{paddingTop: 7, paddingBottom:7, 
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
                                <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: type=="genderAndroid" ? (this.state.selectedGender? 'black':'#9B9B9B'):(type=="ethnicity"? (this.state.selectedEthnicity? 'black':'#9B9B9B'):(type=="hair"? (this.state.myhaircolor.val ? 'black':'#9B9B9B'):(this.state.myeyecolor.val? 'black':'#9B9B9B')))  ,textAlign:'right'}]}>{ type=='genderAndroid'? this.state.selectedGender=='F'? 'Female':'Male' || 'Please Select Gender' :(type=='ethnicity' ? this.state.selectedEthnicity || 'Please select ethnicity' :(type=='hair' ? this.state.myhaircolor.val || 'Please select hair color' :this.state.myeyecolor.val|| 'Please select eye color') ) }</Text>
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
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {textAlign:'right',color: this.state.selectedEthnicity ? 'black':'#9B9B9B'}]}>{ this.state.selectedEthnicity || 'Select ethnicity' }</Text>
                                }

                                {
                                    type == 'hair' && 
                                    <Text style={[ styles.flatInputBoxFont, styles.inputValueFontSize,{textAlign:'right',color: this.state.myhaircolor.val ? 'black':'#9B9B9B'}]}>{ this.state.myhaircolor.val || 'Select hair color' }</Text>
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

    onHeightChanged(text){
        let reSing=/^[0-9]{0,3}$/;
        if(reSing.test(text)){
            this.setState({ height:text })
        }
    }

    onWeightChanged(text){
        let reSing=/^[0-9]{0,3}$/;
        if(reSing.test(text)){
            this.setState({ myweight: {val:text} })
        }
    }

    onEthnicityChange(text){
        // console.log('Ethnicity: ', text);
        this.setState({selectedEthnicity: text})
    }     

    languageSelect = (item, index) => {
        console.log("LANGUAGE FIELD CONSOLE",this.state.languages);
        let temp = this.state.languages;
        temp[index].selected = !temp[index].selected;
        // console.log('This is data: ', this.state.languages);
        
        let selectedCount = [];
        _.map(originalLanguage, function(val){
            if(val.selected)
                selectedCount.push(val);
        });
        console.log("selected count",selectedCount);
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
            },function(){  
                console.log("state display languages",this.state.displayLanguages);
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

                    <View style={[styles.languageNav]} >
                        <TouchableOpacity style={[{ flex:1 }]} 
                        onPress = {() => {
                            this.setModalVisible(false, 'language')
                            this.setState({languages:originalLanguage});
                        }}>
                            <Icon name={"close"} style={[ styles.languageNavIcon ]} />
                        </TouchableOpacity>
                        
                        <Text style={[ styles.languageNavTitle,styles.inputLabelFontSize ]} >Language</Text>
                        <Text style={[ styles.languageNavStatus ,styles.inputLabelFontSize,]} >{this.state.selectedLanguagesCount} /3 selected</Text>
                    </View>

                    <View style={[styles.mainHorizontalPadding, {marginTop: 20}]}>
                        <TextInput
                            style={[styles.inputValueFontSize,{marginBottom:7, height: Helper._isAndroid()?40:30, borderColor:Colors.componentBackgroundColor, borderRadius:5,textAlign:'center', backgroundColor:Colors.componentBackgroundColor,borderWidth: 1}]}
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
                                        <Text style={[ styles.itemText,styles.inputLabelValueSize, {paddingTop: 7, paddingBottom:7, 
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

    _updateCover = () => {
        console.log('DeviceEventEmitter ',DeviceEventEmitter);
        DeviceEventEmitter.emit('uploadCover',  {})
    }

    updateSpinerLoading = () => {
        this.setState({
            isLoadingVideoProcess: !this.state.isLoadingVideoProcess  
        })
    }
    
    render() {        
         return (
            <View style={[styles.container,styles.mainScreenBg]} onPress={() =>  dismissKeyboard()}>
                {/*<TouchableOpacity onPress={() => this._updateCover() }><Text>Test Me !!</Text></TouchableOpacity>*/}

                <Modal
                    transparent={true}
                    onRequestClose={() => {}}
                    visible = {this.state.isLoadingVideoProcess}>

                    <View style={[ {position: 'absolute', top: 0, left: 0, zIndex: 9999, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,.7)', width: width, height: height} ]} >
                        <View style={[{top: 0}]}>
                            <ActivityIndicator color="white" size="large" animating={true} />
                        </View>
                    </View> 

                </Modal>

                <ScrollView>

                    <View style={[ {flex: 1, paddingHorizontal: 10, marginTop: 20} ]}>
                        <ImageUploadEditProfile />
                    </View>
                    <View style={[styles.mainPadding, {paddingTop: 0}]}>

                        
                        {/* video upload */}
                        <View style={[ styles.justFlexContainer ]}>
                            <View ref={'videoContainer'} style={[{marginVertical:20, marginTop: 0}]}>

                                <VideoUploadEditProfile navigation={this.props.navigation} updateSpinerLoading={this.updateSpinerLoading} />

                            </View>
                        </View>   


                        {/* border */}
                        <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                            
                        <View style={[{marginVertical:10}]}>
                            <Text style={[styles.inputLabelFontSize,{fontSize:15,fontWeight:'bold'}]}>Who are you?</Text>
                            <View style={[styles.tagContainerNormal, styles.marginTopSM]}> 
                                {this.state.talent_cate.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity = {0.9}
                                            key={ index } 
                                            style={[styles.tagsSelectNormal, this.checkTalentActiveTag(item) && styles.tagsSelected]} 
                                            onPress={ () => this.selectedTalentTag(item, index) }
                                        >
                                            <Text style={[styles.tagTitle, styles.btFontSize,,styles.inputValueFontSize, this.checkTalentActiveTag(item) && styles.tagTitleSelected]}>
                                                {item.display_name}

                                                {item.selected}
                                            </Text>
                                            
                                        </TouchableOpacity>     
                                    )
                                })}   
                            </View>                         
                        </View>
                        
                        {/* border */}
                        <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />

                        <View style={[{flex:1}]}>
                            <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.refs.FirstInput.focus();}}>
                                <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>First Name</Text>
                                <TextInput 
                                    ref='FirstInput' 
                                    onChangeText={(txtFirstname) => this.setState({firstname:{
                                        val:txtFirstname   
                                    }})}
                                    value={this.state.firstname.val}
                                    style={[styles.inputBox,styles.inputValueFontSize,{color:'black'}]} 
                                    underlineColorAndroid = 'transparent'>
                                </TextInput>
                            </TouchableOpacity>
                            <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                        </View>
                        <View style={[{flex:1}]}>
                            <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.refs.SecondInput.focus();}}>
                                <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Last Name</Text>
                                <TextInput 
                                    ref='SecondInput'
                                    onChangeText={(txtLastname) => this.setState({lastname:{
                                        val:txtLastname   
                                    }})}
                                    value={this.state.lastname.val}
                                    style={[styles.inputBox,styles.inputValueFontSize,{color:'black'}]} 
                                    underlineColorAndroid = 'transparent'>
                                </TextInput>
                            </TouchableOpacity>
                            <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                        </View>                         
                        {/*<View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />*/}
                        <View style={[{flex:1}]}>
                            <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.refs.ThirdInput.focus();}}>
                                <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Age</Text>
                                <TextInput 
                                    ref='ThirdInput' 
                                    onChangeText={(txtage) => this.setState({age:{
                                        val:txtage  
                                    }})}                                    
                                    style={[styles.inputBox,styles.inputValueFontSize,{color:'black'}]} 
                                    value={this.state.age.val}
                                    underlineColorAndroid = 'transparent'>
                                </TextInput>
                            </TouchableOpacity>
                            <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                        </View>

                        {/*{End GENDER}*/}

                        <View style={[{flex:1}]}>
                            <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Gender</Text>

                                { Helper._isAndroid()  && 
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                        {this.generatePicker(this.state.Genders, 'genderAndroid')}
                                    </TouchableOpacity>
                                } 

                                { Helper._isIOS()  && 
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
                                                <Text style={[styles.fontBold,styles.inputLabelFontSize, {textAlign: 'right', color: '#3b5998'} ]} >Done</Text>
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
                                            this.setModalVisible(true, 'gender')
                                        }}>
                                        <View style = {styles.genderPicker}>
                                            <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color: this.state.gender.isErrRequired ? 'red': '#B9B9B9'} , !_.isEmpty(this.state.selectedGender) && {color: Colors.textBlack}  ]}>{ Helper._getGenderLabel(this.state.selectedGender) || 'Please select gender *' }</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View> }

                            </TouchableOpacity>
                            <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                        </View> 
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
                                        <Text style={[styles.inputValueFontSize, { color:  this.checkColorCountryInput() } ]}> { this.state.country.val || 'Country' } </Text>
                                    </View>
                                </CountryPicker>
                            </TouchableOpacity>
                            <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                        </View>   
                        {UserHelper._isUser() &&
                            <View>
                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Ethnicity</Text>
                                        {this.generatePicker(ethnicities, 'ethnicity')}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>
                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={() => this.setModalVisible(true, 'language')}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Language</Text>
                                        <View style = {[styles.itemPicker,{flex:0.7}]}>
                                            <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {textAlign:'right',color: this.state.displayLanguages ? 'black':'#9B9B9B'}]}>{ this.state.displayLanguages || 'Select languages' }</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {this.generateLanguageList()}
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>    
                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.refs.NinethInput.focus();}}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Height</Text>
                                        <TextInput 
                                            ref='NinethInput'
                                            onChangeText={(txtheight) => this.setState({myheight:{
                                                val:txtheight  
                                            }})}    
                                            style={[styles.inputBox,styles.inputValueFontSize,{color:'black'}]} 
                                            value={this.state.myheight.val}
                                            underlineColorAndroid = 'transparent'>
                                        </TextInput>
                                        <Text style={{color:"black"}}> cm</Text>
                                    </TouchableOpacity>             
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>    
                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.refs.NinethInput.focus();}}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Weight</Text>
                                        <TextInput 
                                            ref='NinethInput'
                                            onChangeText={(txtweight) => this.setState({myweight:{
                                                val:txtweight  
                                            }})}    
                                            style={[styles.inputBox,styles.inputValueFontSize,{color:'black'}]} 
                                            value={this.state.myweight.val}
                                            underlineColorAndroid = 'transparent'>
                                        </TextInput>
                                        <Text style={{color:"black"}}> kg</Text>
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>       
                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Hair color</Text>
                                        {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:'Please select hair color'},...hair_colors]:hair_colors, 'hair')}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>    
                                <View style={[{flex:1}]}>
                                    <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9}>
                                        <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Eyes color</Text>
                                        {this.generatePicker(Helper._isAndroid()?[{id:'0',display_name:'Please select eye color'},...eye_colors]:eye_colors, 'eye')}
                                    </TouchableOpacity>
                                    <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                                </View>    
                            </View>
                        }       
                        {UserHelper._isEmployer() &&
                            <View style={[{flex:1}]}>
                                <TouchableOpacity style={[{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}]} activeOpacity = {0.9} onPress={(event) => { this.refs.NinethInput.focus();}}>
                                    <Text style={[styles.titleBold,styles.inputLabelFontSize,{flex:0.3}]}>Company</Text>
                                    <TextInput 
                                        ref='NinethInput'
                                        onChangeText={(txtcompany) => this.setState({company:{
                                            val:txtcompany  
                                        }})}    
                                        style={[styles.inputBox,styles.inputValueFontSize]} 
                                        value={this.state.company.val}
                                        underlineColorAndroid = 'transparent'>
                                    </TextInput>
                                </TouchableOpacity>
                                <View style={[{marginVertical:15,borderColor: Colors.componentBackgroundColor, borderWidth: 1}]} />
                            </View>     
                        }                                                                                                                                                                                                         
                    </View>  
                    <View style={[styles.absoluteBox,{marginBottom:20, position: 'relative', backgroundColor: 'transparent'}]}>
                        <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                        <TouchableOpacity style={styles.btnContainer} onPress={() => this.Update()}>
                            
                                {   
                                    !this.state.isLoading ? <Text style={styles.btn}>Update</Text> : <ActivityIndicator color="white" animating={true} /> 
                                }
                            
                        </TouchableOpacity>

                        </View>
                    </View>               
                </ScrollView>
            </View>  
         );
    }
}

var styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,  
    container: {
        flex: 1
    },
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingBottom: 200,
        // flexWrap: 'wrap'
    },
    txtContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch'
    },
    titleBold:{
        fontWeight:'bold'
    },
    inputBox:{
        flex:0.6,
        textAlign:'right',
        right:0,
        paddingVertical: 0
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
});

export default connect(mapStateToProps)(EditProfile)