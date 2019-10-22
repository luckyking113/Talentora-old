import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, TouchableOpacity, ActivityIndicator,
    TouchableWithoutFeedback, Image, StatusBar, Alert, Picker, Platform, Modal, ActionSheetIOS, DeviceEventEmitter } from 'react-native';

import { talent_category } from '@api/response';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';

import { Colors } from '@themes/index';
import Styles from '@styles/card.style'
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style'; 

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

import ImagePickerCrop from 'react-native-image-crop-picker';

// import ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { postApi, postMedia, putApi, deleteApi } from '@api/request';
import * as DetailActions from '@actions/detail'
import CountryPicker, {getAllCountries} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info';
import ALL_COUNTRIES from '@store/data/cca2';
import _ from 'lodash';
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import { transparentHeaderStyle, defaultHeaderStyle, defaultHeaderWithShadowStyle } from '@styles/components/transparentHeader.style';
import { gendersFilter } from '@api/response'
import MultiSlider from '@ptomasroos/react-native-multi-slider';

let func = require('@helper/validate');

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
var CANCEL_INDEX = 2;

var BUTTON_WARNING = [
    'Upload Cover',    
    'Skip',
    'Cancel',
];
var SKIP_INDEX = 0;


let that;

const Item = Picker.Item;

function mapStateToProps(state) {
    return {
        // detail: state.detail
        user: state.user,
    }
}

let _SELF = null;
const ICON_SIZE_ANDROID = 24;
const JOB_INFO = null;
const IMAGE_REF = null;
let originalGender=_.cloneDeep(gendersFilter);


class CreatePostJob extends Component {

    constructor(props){
        super(props);

        JOB_INFO = null;
        IMAGE_REF = null;

        console.log('this.props.navigation: ', this.props.navigation);  
        // console.log('This is props: ', this.props);
        if(this.props.navigation.state.params && this.props.navigation.state.params.Job_Info){
            JOB_INFO = this.props.navigation.state.params.Job_Info.sub_reference_detail;
            if(this.props.navigation.state.params.Job_Info.reference_detail.length > 0)
                IMAGE_REF = this.props.navigation.state.params.Job_Info.reference_detail[0];
        }
        let job_info = {
            'title': JOB_INFO?JOB_INFO.title:'',
            'country': JOB_INFO?JOB_INFO.criteria.country:'',
            'gender': JOB_INFO?JOB_INFO.criteria.gender:'',
            'fromAge': JOB_INFO?JOB_INFO.criteria.min_age:'',
            'toAge': JOB_INFO?JOB_INFO.criteria.max_age:'',
            'description': JOB_INFO?JOB_INFO.description:'',
            'talent_cate': _.cloneDeep(talent_category),
            'img': IMAGE_REF ? [{ id:IMAGE_REF._id, uri:IMAGE_REF.preview_url_link }] : []
        }

        console.log('Image: ', job_info.img);

        if(JOB_INFO){
            for(let i = 0; i < job_info.talent_cate.length; i++){
                for(let j = 0; j < JOB_INFO.criteria.type.length; j++){
                    if(job_info.talent_cate[i].category === JOB_INFO.criteria.type[j]){
                        job_info.talent_cate[i].selected = true;
                        break;
                    }
                }
            }
        }

        that = this;
        this.state = {

            photoNeedToRemove: null,
            contentScroll: true,
            isLoading: false,
            isEditing: false,

            talent_cate : job_info.talent_cate,
            cca2: '',
            country: {
                val: job_info.country,
                isErrRequired: false
            },
            img: job_info.img,
            idx: IMAGE_REF?1:0, 
            age:{
                val: job_info.fromAge,
                isErrRequired:false
            },
            toAge: job_info.toAge,
            title:{
                val: job_info.title, 
                isErrRequired:false
            },
            gender: {
                val: job_info.gender,
                isErrRequired: false
            }, 
            description: job_info.description,
            selectedGender: JOB_INFO?JOB_INFO.criteria.gender:'',
            mode: Picker.MODE_DIALOG,
            modalVisible: false,
            prevoius_gender:'' ,
            is_api_requesting: false,
            isImageChange: false,      
            Genders:originalGender,
            multiSliderValue: [job_info.fromAge * 1 || 18, job_info.toAge * 1 || 60],
        }

        this.chooseImage = this.chooseImage.bind(this);

        console.log('THIS State: ', this.state);
    }

    multiSliderValuesChange = (values) => {
        this.setState({
            multiSliderValue: values,
        });
        console.log(values);
    }
    
    static navigationOptions = ({ navigation }) => {
        // console.log('my self: ', screenProps);
        // _SELF = this;
        return ({
        headerTitle: 'Job Posting',
        headerLeft: (<ButtonBack
                isGoBack={ navigation }
                btnLabel= ""
            />),
            /*headerRight: (<ButtonTextRight  
                    callBack={ navigation.state.params }
                    btnLabel= "Save"
                />),*/
        // });
        headerRight1: (<ButtonTextRight  
            callBack={ _SELF }
            btnLabel= "Save"
        />),

        headerStyle: defaultHeaderWithShadowStyle,   

        headerRight_org: (
            <View style={[styles.flexVerMenu, styles.flexCenter]}>
                {/*<Text style={[styles.txt]}>Save</Text>*/}
                 {/*{ console.log('_SELF dddd :', UserHelper.UserInfo) }*/}
                
                <TouchableOpacity 
                    style={[{ marginRight: 15 }]}
                    onPress={ () => {
                        // console.log('_SELF', navigation);
                        _SELF.saveJob();
                    }}
                >
                
                    { navigation.state.params && navigation.state.params.isLoadingOnHeader ?
                        <ActivityIndicator
                            animating={true}
                            style={[  ]}
                            size="small"
                            color="gray"
                        />
                        :
                        <Text style={[styles.txt]}>{ navigation.state.params && navigation.state.params.isEditing ? 'Edit' : 'Save' }</Text>
                    }
                </TouchableOpacity>
            </View>
        ),
    })};

  
    componentDidMount() {
        // this.showActionSheetWarningForCoverImage();
        if(JOB_INFO)
            GoogleAnalyticsHelper._trackScreenView('Update Job'); 
        else
            GoogleAnalyticsHelper._trackScreenView('Create Job'); 
        
        _SELF = this;
    }

    checkColorCountryInput = () => {
        // console.log("CheckColorCountryInput", this.state.country);
        // console.log(this.state.country.isErrRequired);
        this.mycolor='';
        if(this.state.country.val == '')
            this.mycolor='#B9B9B9';
        else if(this.state.country.isErrRequired){ 
            this.mycolor='red';
        } 
        else{
            this.mycolor= Colors.textBlack;    
        }
        return this.mycolor;
    }    

    savePostJob = (job_info) => {  
        // Alert.alert('wow !!! save it now');
        const { navigate, goBack, state } = this.props.navigation;
        // console.log('This is my navigation vol vol: ', this.props.navigation);
        // navigate('ViewPostJob', {job: job_info, backToJobList1: true});
        // navigate('JobList');
        DeviceEventEmitter.emit('reloadJobList');
        goBack();
    }

    updatedPostJob = (job_info) => {  
        const { navigate, goBack, state, setParams } = this.props.navigation;
        job_info = _.extend({
            cover: this.state.img.length>0 ? _.head(job_info.reference_detail) : null
        }, job_info);

        // Helper._bustImageCache(job_info.cover);

        DeviceEventEmitter.emit('UpdateAfterEdit', job_info)
        goBack();
    }

    checkActiveTag = (item) => {
        return item.selected;
    }

    selectedTag = (item, index) => {
        let _tmp = this.state.talent_cate;
        _tmp[index].selected = !_tmp[index].selected;
        this.setState({
            talent_cate: _tmp
        });
    }

    // show action sheet log out for IOS ONLY
    showActionSheetWarningForCoverImage = (isUpdate = false) => {
        let _SELF = this;
        // console.log('Helper._isIOS() :', Helper._isIOS());

        if(that.state.img.length <= 0){
                

            if(Helper._isIOS()){
                // popup message from bottom with ios native component
                ActionSheetIOS.showActionSheetWithOptions({

                    message: 'Putting a cover picture will enhance your post 🙂',
                    options: BUTTON_WARNING,
                    cancelButtonIndex: CANCEL_INDEX,
                    destructiveButtonIndex: SKIP_INDEX,

                },
                (buttonIndex) => {

                    // console.log(buttonIndex);
                    // return;
                    //   this.setState({ clicked: BUTTONS[buttonIndex] });
                    if(buttonIndex==0){ // upload cover
                        _SELF.chooseImage(function(){
                            if (isUpdate)
                                _SELF._updateJob();
                            else
                                _SELF._postJob();
                        }) 

                    }
                    else  if(buttonIndex == 1){ // skip
                        if (isUpdate)
                            _SELF._updateJob();
                        else
                            _SELF._postJob();
                    }

                });
            }
            else{

                // for android ask with alert message with button

                // Works on both iOS and Android
                Alert.alert(
                'Putting a cover picture will enhance your post',
                '', 
                [
                    // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                    {text: 'Upload Cover', onPress: () => {
                    
                        _SELF.chooseImage(function(){
                            if (isUpdate)
                                _SELF._updateJob();
                            else
                                _SELF._postJob();
                        }) 
                    
                    }},
                    {text: 'Skip', onPress: () =>  {
                            if (isUpdate)
                                _SELF._updateJob();
                            else
                                _SELF._postJob();
                        }
                    },
                    {text: 'Cancel', onPress: () =>  {
                        }, style: 'cancel'
                    },
                ],
                { cancelable: false }
                )
            }

        }
        else{
            if (isUpdate)
                this._updateJob();
            else
                this._postJob();
        }

    };

    _postJob = () => {
        console.log("state before post job",this.state);

        // that.savePostJob({'job':'job'});
        // return;

        if(that.state.is_api_requesting) return;

        let requiredField = false;
        // console.log('required Field: ', requiredField);
        
        // if(!func(this.state.title))
        //     requiredField = false;
        // else requiredField = true;
        // console.log('required Field: ', requiredField, this.state.title);

        if(func(this.state.title, 'title')){
            let _tmp = this.state.title;
            _tmp.isErrRequired = true;
            this.setState({
                title:_tmp
            })
            requiredField = true;
        }
        // console.log('required title: ', requiredField, this.state.title.val);

        if(func(this.state.country, 'country')){
            let _tmp = this.state.country;
            _tmp.isErrRequired= true;
            this.setState({
                country: _tmp
            });
            requiredField = true;
        }
        // console.log('required country: ', requiredField, this.state.country.val);

        if(this.state.selectedGender == 'Please select gender *' || 
            this.state.selectedGender == ''){ 
            this.setState({
                gender: {
                    val: "",
                    isErrRequired : true
                }    
            });
            requiredField = true;

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
        // console.log('required gender: ', requiredField, this.state.gender.val);

        // if(func(this.state.age, 'age')){
        //     let _tmp = this.state.age;
        //     _tmp.isErrRequired = true;
        //     this.setState({
        //         age:_tmp
        //     })
        //     requiredField = true;
        // }
        // console.log('required age: ', requiredField, this.state.age.val);
        // console.log('required Field: ', requiredField);



        // if(this.state.toAge == '')
        //     this.setState({ toAge: this.state.age.val });
        // else 
        // if(this.state.toAge != ''){
        //     if (this.state.toAge < this.state.age.val){
        //         Alert.alert('To age should be greater than from age!');
        //         requiredField = true;
        //     }
        // }
            
        // console.log('To age: ', this.state.toAge);
        // if(requiredField) return;

        if(requiredField){
            alert('Please input valid information.');
            return;
        }
        
        let selectedCategory = [];
        for(let i = 0; i < _.cloneDeep(talent_category).length; i++){
            if(this.state.talent_cate[i].selected == true){
               selectedCategory.push(this.state.talent_cate[i].category);
            }
        }
        if(_.isEmpty(selectedCategory)){
             Alert.alert('You must select at least a talent type');
             requiredField = true;
             return;
        }

        // if(that.state.img.length <= 0){
        //     alert('Test');
        // }


        // console.log('requiredField', requiredField);

        that.setState({
            is_api_requesting: true
        })

        // return;
        setTimeout(function(){
            console.log('Job info: ' , that.state);
            // console.log('selected type: ', selectedCategory);

            let req_object = {
                "owner_type": "person",
                "owner": UserHelper.UserInfo._id,
                "post_type": "job",
                "references": [],
                "content": that.state.title.val.trim(), 
                "description": that.state.description,
                "criteria":{
                    "type": selectedCategory,
                    "country":that.state.country.val,
                    "gender": that.state.gender.val,
                    "min_age": that.state.multiSliderValue[0],
                    "max_age": that.state.multiSliderValue[1]
                },
                "is_allow_forward": true,
                "privacy_type": "public",
                "status": "published",
                // "latitude": 14.28323,
                // "longitude": 104.29382
            }

            let post_job_url = '/api/posts';

            // console.log('Image : ', that.state.img);

            if(that.state.img.length > 0){
                let photo_url = '/api/media/jobs/'+ that.state.img[0].img_uuid +'/save';
                let photo_obj = {name: 'image' , filename: that.state.img[0].filename, data: that.state.img[0].data, type:'image/jpg'};
                // console.log('Photo Obj: ', that.state.img , 
                // "\n", "Filename: ", that.state.img[0].filename, 
                // "\n", "Data: ", that.state.img[0].data);

                postMedia(photo_url, [
                    photo_obj
                ]).then((response) => {
                    // console.log('Success upload image: ', response);
                    if(response.code == 200){

                        let imgReference = [];
                        imgReference.push(response.result._id);

                        req_object.references = imgReference;
                        
                        postApi(post_job_url,
                            JSON.stringify(req_object)
                        ).then((response) => {
                            console.log('Response Posted Job: ', response);
                            if(response.code == 200){
                                // that.state.is_api_requesting = false;
                                that.savePostJob(response.result);
                            }
                            that.setState({
                                is_api_requesting: false
                            });
                        });
                    }
                    // else{
                    //     that.setState({
                    //         is_api_requesting: false
                    //     })
                    // }
                });

            }else{
                console.log("Request Object",req_object);
                postApi(post_job_url,
                    JSON.stringify(req_object)
                ).then((response) => {
                    console.log('Response Save Job: ', response);
                    if(response.status=="success"){
                        that.setState({
                            is_api_requesting: false
                        });
                        that.savePostJob(response.result);
                    }
                    that.state.is_api_requesting = false;
                });
            }

        }, 50);
    }

    _updateJob = () => {
        if(that.state.is_api_requesting) return;
        let requiredField = false;
        if(func(this.state.title, 'title')){
            let _tmp = this.state.title;
            _tmp.isErrRequired = true;
            this.setState({
                title:_tmp
            })
            requiredField = true;
        }
        if(func(this.state.country, 'country')){
            let _tmp = this.state.country;
            _tmp.isErrRequired= true;
            this.setState({
                country: _tmp
            });
            requiredField = true;
        }
        if(this.state.selectedGender == 'Please select gender *' || 
            this.state.selectedGender == ''){ 
            this.setState({
                gender: {
                    val: "",
                    isErrRequired : true
                }    
            });
            requiredField = true;
        }else{
            let _tmp = this.state.gender;
            _tmp.val= this.state.selectedGender;
            _tmp.isErrRequired= false;
            this.setState({
                selectedGender: _tmp.val,
                gender: _tmp,
                prevoius_gender: _tmp.val  
            }); 
        }
        if(func(this.state.age, 'age')){
            let _tmp = this.state.age;
            _tmp.isErrRequired = true;
            this.setState({
                age:_tmp
            })
            requiredField = true;
        }

        if(requiredField){
            alert('Please input valid information.');
            return;
        }

        if(this.state.toAge != ''){
            if (this.state.toAge < this.state.age.val){
                Alert.alert('To age should be greater than from age!');
                requiredField = true;
                return;
            }
        }

        let selectedCategory = [];
        for(let i = 0; i < talent_category.length; i++){
            if(this.state.talent_cate[i].selected == true){
               selectedCategory.push(this.state.talent_cate[i].category);
            }
        }
        if(_.isEmpty(selectedCategory)){
             Alert.alert('You must select at least a talent type');
             requiredField = true;
             return;
        }


        that.setState({
            is_api_requesting: true
        },function(){
            // console.log('Job info: ' , that.state);
            let req_object = {
                "owner_type": "person",
                "owner": UserHelper.UserInfo._id,
                "post_type": "job",
                // "references": [],
                "content": that.state.title.val.trim(), 
                title: that.state.title.val,
                "description": that.state.description,
                "criteria":{
                    "type": selectedCategory,
                    "country": that.state.country.val,
                    "gender": that.state.gender.val,
                    "min_age": that.state.age.val,
                    "max_age": that.state.toAge
                },
                "is_allow_forward": true,
                "privacy_type": "public",
                "status": "published",
                // "latitude": 14.28323,
                // "longitude": 104.29382
            }
            let post_job_url = '/api/posts/' + _SELF.props.navigation.state.params.Job_Info._id; 
            // console.log('req_object: ', req_object);
            // console.log('API URL: ', post_job_url);
            if(!that.state.isImageChange && that.state.img.length > 0){
                let imgReference = [];
                    imgReference.push(IMAGE_REF._id);
                    req_object.references = imgReference;
            }
            if(that.state.img.length > 0 && that.state.isImageChange){
                let photo_url = '/api/media/jobs/'+ that.state.img[0].img_uuid +'/save';
                let photo_obj = {name: 'image' , filename: that.state.img[0].filename, data: that.state.img[0].data, type:'image/jpg'};
                postMedia(photo_url, [
                    photo_obj
                ]).then((response) => {
                    if(response.code == 200){
                        let imgReference = [];
                        imgReference.push(response.result._id);
                        req_object.references = imgReference;
                        putApi(post_job_url,
                            JSON.stringify(req_object)
                        ).then((response) => {
                            // console.log('Response Posted Job: ', response);
                            if(response.code == 200){
                                that.removePhotoOnUpdate(function(){
                                    that.updatedPostJob(response.result);
                                })
                            }
                            that.setState({
                                is_api_requesting: false
                            });
                        });
                    }
                });
            }else{
                that.removePhotoOnUpdate(function(){
                    putApi(post_job_url,
                        JSON.stringify(req_object)
                    ).then((response) => {
                        // console.log('Response Save Job: ', response);
                        if(response.status=="success"){
                            // that.removePhotoOnUpdate(function(){
                                that.updatedPostJob(response.result);
                            // })
                        }
                        that.setState({
                            is_api_requesting: false
                        });
                    });
                });
            }
        });
    }

    // when click button save on header
    saveJob = () => {
        // console.log('CLICK SAVE: ', this);
        // this._postJob();
        const { navigate, goBack, state, setParams } = this.props.navigation;
        setParams({ isLoadingOnHeader: true });
    }

    onPostCancel = () => {
        if(this.state.is_api_requesting)
            return;
        // Clear selected job types.
        _.each(this.state.talent_cate, function(v){
            // console.log('category: ', v);
            v.selected = false;
        })

        const { navigate, goBack, state, setParams } = this.props.navigation;
        // console.log('navigation component: ', this.props.navigation);
        goBack();
    }

    chooseImage1 = () => {
        // console.log("hello choose image");
        ImagePicker.launchImageLibrary(options, (response) => {
            // console.log("ImagePicker lanchImageLibrary");
            if (response.didCancel) {
                // console.log('User cancelled image picker');
            }
            else if (response.error) {
                // console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                // console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // console.log("Choose Image calling");
                let id = uuid.v4();
                let source = { uri: response.uri };
                // console.log('The state: ', this.state);
                let arrImg = this.state.img.slice();
                let _id = 0;
                if(arrImg.length > 0)
                    _id = arrImg.length;

                arrImg.push({
                    'id': _id, 
                    'uri':source.uri, 
                    'img_uuid': id, 
                    'data': response.data,
                    'filename': response.fileName ? response.fileName : id
                });
                this.setState({
                    img: arrImg,
                    idx: arrImg.length,
                    isImageChange: true
                })
                
                // let data = response.data;
                // let url = '/api/media/photos/'+ id +'/save';

                // // console.log('Response: ', response);
                // postMedia(url, [
                //     // {name: response.fileName , filename: response.fileName, data: data, type: 'image/jpg'},
                //     {name: 'image' , filename: response.fileName, data: data, type:'image/jpg'}
                // ]).then((response) => {
                //     console.log('success response: ', response);
                // });

                // let obj_photo = {name: 'image' , filename: response.fileName, data: response.data, type:'image/jpg'};
                // console.log("Pick obj_photo: ", obj_photo);
            }
        });

    }

    chooseImage (callback = null) {
        let that = this;
        // console.log('check is first photo : ', that.state.isFirstPhoto);

        ImagePickerCrop.openPicker({
            mediaType: 'photo',
            // cropping: true,
            includeBase64: true,
          }).then(image => {
            // console.log(image);
            const _sizeCrop = Helper._getSizeCrop(image, true);
            console.log('_sizeCrop: ', _sizeCrop);
            ImagePickerCrop.openCropper({
                ..._sizeCrop,
                path: image.path,
                includeBase64: true,
            }).then(imageAfterScrop => {

                let _imageData = imageAfterScrop;
                let defUUID = uuid.v4();
                _imageData.filename = image.filename || defUUID;
                console.log('imageAfterScrop : ',imageAfterScrop);

                // this.imageCropUpload(_imageData);
                this.imageCropUpload(_imageData, defUUID, callback);
                
            }).catch(e => {
                // alert(e);
                console.log('error : ', e);
            });

            
        }).catch(e => {
            // alert(e);
            console.log('error : ', e);
        });

    }

    imageCropUpload = (imgData = null, _UUID = '', callback=null) => {
        if(imgData){
            let id = _UUID;
            let source = { uri: 'file://' + imgData.path };
            // console.log('The state: ', this.state);
            let arrImg = this.state.img.slice();
            let _id = 0;
            if(arrImg.length > 0)
                _id = arrImg.length;

            arrImg.push({
                'id': _id, 
                'uri':source.uri, 
                'img_uuid': id, 
                'data': imgData.data,
                'filename': imgData.filename ? imgData.filename : id,
                'isLocal' : true,
            });
            this.setState({
                img: arrImg,
                idx: arrImg.length,
                isImageChange: true
            })

            // callback if user try to create job without cover
            // we show message for user again to pick cover or skip
            // if user pick a cover
            // so we will auto post or update job
            if(callback){
                callback();
            }
        }
    }

    removePhotoOnUpdate = (_callBack) => {
        if(this.state.photoNeedToRemove){
            let API_URL = '/api/media/photos/'+ this.state.photoNeedToRemove;

            deleteApi(API_URL).then((_response) => {
                // console.log('Delete photos : ', _response);
                if(_response.code == 200){

    
                }
                if(_callBack)
                    _callBack();
            });
        }
        else{
            if(_callBack)
                _callBack();
        }
    }

    _removePhoto = (_media, _mediaIndex) => {
        if(JOB_INFO){
            // console.log(IMAGE_REF._id ,' == ', _media.id)
            if(IMAGE_REF._id == _media.id){
                this.setState({
                    photoNeedToRemove: IMAGE_REF._id,
                    img: [],
                    idx: 0
                }) 
            }else if(_media.id == 0){
                this.setState({
                    img: [],
                    idx: 0
                })
            }
            else{
                alert('Can not delete this photo. Please try again.');
            }
        }
        else{
            this.setState({
                img: [],
                idx: 0
            })
        }
    }

    _mediaOption = (_media, _mediaIndex) => {
        let _SELF = this;


        if(Helper._isIOS()){
            // popup message from bottom with ios native component
            ActionSheetIOS.showActionSheetWithOptions({

                message: 'Are you sure you want to delete this photo?',
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,

            },
            (buttonIndex) => {

                // console.log(buttonIndex);
                //   this.setState({ clicked: BUTTONS[buttonIndex] });
                if(buttonIndex==0){
                    _SELF._removePhoto(_media, _mediaIndex)
                }

            });
        }
        else{

            // for android ask with alert message with button

            // Works on both iOS and Android
            Alert.alert(
            'Are you sure you want to delete this photo?',
            '', 
            [
                // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Delete', onPress: () =>  _SELF._removePhoto(_media, _mediaIndex) },
            ],
            { cancelable: false }
            )
        }
    }

    onValueChange = (key, value) => {
        // console.log(key, value);
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

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    onAgeChanged(text, type){
        let re=/^[0-9]{0,2}$/;

        if(re.test(text)){

            if(type === 'from'){
                this.setState({ 
                    age: {
                        val:text   
                    }
                })

            }else{
                this.setState({ toAge: text });
            }
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
        this.setState({selectedGender:selectedvalue=='Both(Male & Female)' ? 'B': (selectedvalue=='Male'? 'M':'F'),gender:_tmpStateObject},function(){
            console.log("after setstate",this.state.gender,this.state.selectedGender);
        });
        this.setModalVisible(false);
    }


    updateContentScroll = (_scrollStatus) => {
        this.setState({
            contentScroll: _scrollStatus
        })
    }

    render() {
        return (
            <View style={[styles.justFlexContainer,styles.mainScreenBg]} onPress={() =>  dismissKeyboard()}>
                <ScrollView contentContainerStyle={[styles.paddingTopNavMD]} scrollEnabled={this.state.contentScroll}>
                    <View style={[styles.mainHorizontalPadding]}>

                        <View>
                            <Text style={[styles.grayLessText, styles.marginBotXXS,styles.inputLabelFontSize]}>
                                Title of job
                            </Text>
                            <TextInput 
                                onChangeText={(txtTitle) => this.setState({title:{
                                    val:txtTitle   
                                }})}
                                value = { this.state.title.val }
                                placeholder="Wolverine, Ah Boys to Man *"
                                placeholderTextColor = { this.state.title.isErrRequired ? 'red':'#B9B9B9' }
                                returnKeyType="next"
                                autoCorrect = {false}
                                style={[styles.flatInputBox, styles.flatInputBoxSM,styles.inputValueFontSize]}
                                underlineColorAndroid = 'transparent'
                                textAlignVertical = 'bottom'
                            />
                        </View>

                        {/* country */}
                        <View style={[styles.marginTopXXS]}>
                            <Text style={[styles.grayLessText, styles.marginBotXXS,styles.inputLabelFontSize]}>
                                Country
                            </Text>
                            <CountryPicker
                                countryList={ALL_COUNTRIES} 
                                filterable = {true}
                                closeable = {true}
                                onChange={(value) => {
                                    {/*console.log('Value: ', value);*/}
                                    value.isErrRequired = false;

                                 this.props.navigation.setParams({payload:{country:value}}); 
                                    this.setState({ 
                                        country: {
                                            val: value.name,
                                            isErrRequired: false
                                        }
                                    });
                                }}
                                cca2={this.state.cca2}
                                translation='eng' >

                                <View style = {styles.countryPicker} > 
                                    <Text style={[styles.inputValueFontSize,styles.inputValueFontSize, {fontSize: 14, color:  this.checkColorCountryInput() },this.state.country.isErrRequired && {color: 'red'} ]}> { this.state.country.val || 'Country *' } </Text>
                                </View>
                             </CountryPicker>
                        </View>
 
                        {/* gender */}
                        <View style={styles.marginTopBig}>
                            <Text style={[styles.grayLessText, styles.marginBotXXS,styles.inputLabelFontSize]}>
                                Gender
                            </Text>
                            { Helper._isAndroid()  && 
                                <View>
                                    <View style = {[ {flex: 1} ]}>
                                        <Modal
                                            transparent={true}
                                            onRequestClose={() => {}}
                                            visible = {this.state.modalVisible}>
                                            <TouchableOpacity style={[ styles.justFlexContainer, styles.mainVerticalPadding, {flex:1,flexDirection:'column',paddingBottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.8)'}]} onPressOut={() => {this.setModalVisible(false)}}>
                                                <View style={{width:300,height:200,backgroundColor:'white'}}>
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
                                        visible={this.state.modalVisible}
                                        onRequestClose={() => {}}
                                        >

                                        <View onPress = {()=>{ }} style={{flex: 1, justifyContent: 'flex-end',marginTop: 22}}>
                                            <TouchableOpacity
                                                style={[ {backgroundColor: Colors.componentDarkBackgroundColor, padding: 15} ]}
                                                onPress={() => {
                                                    this.setModalVisible(!this.state.modalVisible)
                                                }}>
                                                <Text style={[styles.fontBold, {textAlign: 'right', color: '#3b5998'} ]} >Done</Text>
                                            </TouchableOpacity>
                                            <View style={[ {backgroundColor: 'white'} ]}>
                                                <Picker
                                                    selectedValue={this.state.selectedGender}
                                                    onValueChange={this.onValueChange.bind(this, 'selectedGender')}>
                                                    <Item label="Please select gender" value=""/>
                                                    <Item label="Male" value="M" /> 
                                                    <Item label="Female" value="F" />
                                                    <Item label="Both" value="B" />
                                                </Picker>
                                            </View>
                                        </View>
                                    </Modal>

                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setModalVisible(true)
                                        }}>
                                        <View style = {styles.genderPicker}>
                                            <Text style={[ styles.flatInputBoxFont, {fontSize: 14, color: this.state.gender.isErrRequired ? 'red': '#B9B9B9'} , !_.isEmpty(this.state.selectedGender) && {color: Colors.textBlack} ]}>{ Helper._getGenderLabel(this.state.selectedGender) || 'Please select gender *' }</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>

                        {/* age */}
                        <View style={[{flex: 1, alignItems: 'center'}, styles.marginTopXS]}>
                            <Text style={[styles.grayLessText, styles.marginBotXXS,styles.inputLabelFontSize, {alignSelf: 'flex-start'}]}>
                                Age
                            </Text>
                            <View style={[styles.tagContainerNormal, {paddingBottom: 20, marginTop: 10}]}>
                                <View style={[{flex:0.5}]}>
                                    <Text>
                                        From: {this.state.multiSliderValue[0]}
                                    </Text>
                                </View>
                                {/*<Text style={[styles.grayLessText, styles.marginBotXXS]}>
                                    From: 
                                </Text>*/}

                                {/*<Text style={[styles.grayLessText, styles.marginBotXXS]}>
                                    To: 
                                </Text>*/}
                                <View style={{flex:0.5}}>
                                    <Text style={{textAlign: 'right'}}>
                                        To: {this.state.multiSliderValue[1]}
                                    </Text>
                                </View>
                            </View>
                            <MultiSlider
                            
                                selectedStyle={{backgroundColor: Colors.primaryColorDark,}}
                                values={[this.state.multiSliderValue[0], this.state.multiSliderValue[1]]}
                                sliderLength={300}
                                onValuesChangeStart={() => this.updateContentScroll(false)}
                                onValuesChangeFinish={(value) => {
                                    
                                    this.updateContentScroll(true);
                                    this.multiSliderValuesChange(value);
                                
                                }}
                                touchDimensions={{ width: 80, height: 80 }}
                                min={1}
                                max={99}
                                step={1}
                                snapped
                                allowOverlap
                                />
                        </View>

                        {/* talent type */}
                        <View style={[styles.marginTopXXS]}>

                            <Text style={[styles.grayLessText, styles.marginBotXXS,styles.inputLabelFontSize]}>
                                Talent type *
                            </Text>
                            
                            <View style={[styles.tagContainerNormal, {marginTop: 10}]}> 

                                {this.state.talent_cate.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity = {0.9}
                                            key={ index } 
                                            style={[styles.tagsSelectNormal, this.checkActiveTag(item) && styles.tagsSelected]} 
                                            onPress={ () => this.selectedTag(item, index)} >
                                            <Text style={[styles.tagTitle, styles.btFontSize, this.checkActiveTag(item) && styles.tagTitleSelected,styles.inputValueFontSize]}>
                                                {item.display_name}
                                                {item.selected}
                                            </Text>
                                        </TouchableOpacity>     
                                    )
                                })}
                            </View>
                        </View>

                        {/* additional */}
                        <View style={[styles.marginTopMDD]}>
                            <TextInput 
                                onChangeText={(desc) => this.setState({description:desc})}
                                value = { this.state.description }
                                placeholder="Additional info (optional)"
                                placeholderTextColor={Colors.textBlack}
                                returnKeyType="next"
                                keyboardType="email-address"
                                autoCorrect={false}
                                /*onSubmitEditing={() => this.passwordInput.focus()}*/
                                style={[styles.inputBox,styles.textInputMultiLine,styles.inputValueFontSize]}
                                underlineColorAndroid = 'transparent'
                                textAlignVertical = 'bottom'
                                multiline={true}
                                numberOfLines = {4} 
                                textAlignVertical={'top'}
                            />
                        </View>


                        {/* upload images */}
                        <View style={[styles.marginTopXS]}> 
                            <Text style={[styles.grayLessText, styles.marginBotXXS,styles.inputLabelFontSize, {marginTop: 20}]}>
                                Cover image (optional)
                            </Text>

                            <View style={[styles.boxWrapContainer, styles.marginTopXS, {margin: 0, overflow: 'visible'}]}> 
                                {this.state.img.map((item, index) => {
                                    return (
                                        
                                        <View key={ index } style={[ styles.justFlexContainer ]}>
                                            <View style={[styles.boxWrapItem, styles.boxWrapItemSizeMD, {flex:1, width: null, overflow: 'visible', margin: 0}]}>

                                                <TouchableOpacity
                                                    activeOpacity = {0.9} 
                                                    key={ index } 
                                                    style={[styles.boxWrapItem, styles.boxWrapItemSizeMD, {flex:1, width: null, margin: 0}]}>
                                                    
                                                    { this.state.img[index].isLocal && <Image
                                                        style={styles.userAvatarFull}
                                                        source={{ uri:  this.state.img[index].uri }}
                                                    /> }

                                                    { !this.state.img[index].isLocal && <CustomCachedImage
                                                        style={[styles.userAvatarFull]}  
                                                        defaultSource={ require('@assets/banner-default.jpg') }
                                                        component={ImageProgress}
                                                        source={ { uri:  this.state.img[index].uri } } 
                                                        indicator={ProgressCircle} 
                                                        onError={() => {
                                                            ImageCache.get().bust(this.state.img[index].uri)
                                                        }}
                                                    /> }

                                                </TouchableOpacity>     
                                        
                                            </View>

                                            <TouchableOpacity 
                                                activeOpacity={.8}
                                                style={[ styles.iconPlayTopRightSM,
                                                    {
                                                        top: -10,
                                                        right: -10,
                                                        backgroundColor: Colors.primaryColorDark,
                                                        borderRadius: 15,
                                                        padding: 3,
                                                    }
                                                ]} onPress={() => this._mediaOption(item, index) }>
                                                    <Icon
                                                        name={ 'close' }
                                                        style={[ {color: 'white', fontSize: 20, backgroundColor: 'transparent'}, styles.shadowBox ]} 
                                                    />
                                                </TouchableOpacity>
                                        </View>
                                    )
                                })}



                                { this.state.idx == 1 ? null : 
                                    <TouchableOpacity
                                        activeOpacity = {0.9}
                                        style={[ styles.boxWrapItem, styles.boxWrapItemSizeMD, styles.flexCenter, {flex:1, width: null, margin: 0} ]} 
                                        onPress={() =>  this.chooseImage()} >

                                        <IconCustom
                                            name="plus-gray-icon"
                                            style={[ styles.iconPlus ]} 
                                        />
                                    </TouchableOpacity> 
                                }
                            </View>
                        </View>
                    </View>
                    
                    <View style={[styles.mainVerticalPaddingMD, styles.flexStretch, styles.mainHorizontalPadding, {flex: 1, flexDirection: 'row', justifyContent: 'space-between',}]}>

                        {!JOB_INFO?<TouchableOpacity style={[styles.flatButton, styles.flatButtonSizeSM, styles.grayBg, styles.noBorder, {width: 160,}]} onPress={() => this.showActionSheetWarningForCoverImage() }>
                            {/*<Text style={[styles.flatBtnText, styles.btFontSize]}>Close Listing</Text>*/}
                            { !this.state.is_api_requesting ? <Text style={[styles.flatBtnText, styles.btFontSize]}>Post</Text> : <ActivityIndicator color="white" animating={true} /> }
                                
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={[styles.flatButton, styles.flatButtonSizeSM, styles.grayBg, styles.noBorder, {width: 160,}]} onPress={() => this.showActionSheetWarningForCoverImage(true)}>
                            { !this.state.is_api_requesting ? <Text style={[styles.flatBtnText, styles.btFontSize]}>Update</Text> : <ActivityIndicator color="white" animating={true} /> }
                        </TouchableOpacity>
                        }

                        {/*<TouchableOpacity style={[styles.flatButton, styles.flatButtonSizeSM, styles.darkishRedBg,{width: 160}]} onPress={() => { this.setLoding() } }>
                            <Text style={[styles.flatBtnText, styles.btFontSize]}>Cancel</Text>
                        </TouchableOpacity>*/}

                        <TouchableOpacity style={[styles.flatButtonCancel, styles.flatButtonSizeSM]} onPress={() => { this.onPostCancel() } }>
                            <Text style={[styles.flatBtnText, styles.btFontSize, styles.txtCancel]}>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </View>
        );
    }

}


const styles = StyleSheet.create({ ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,
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
        paddingLeft:(Platform.OS === 'ios') ? 12: 3,
    },
    countryPicker:{
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 8,
    },


    icon: { 

        // width: 35,
        fontSize: ICON_SIZE_ANDROID,
        fontWeight: 'bold',
        color: Colors.tabBarActiveTintColor 
    },
 
    txt: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    txtCancel:{
        color: '#B9B9B9',
        fontSize: 14,
        textDecorationLine: 'underline'
    },

    flatButtonCancel: {
        paddingVertical: 15,
        marginTop: 5,
    },
    textInputMultiLine:{
        flex:1,
        height:100,
        borderRadius:4,
        backgroundColor:Colors.componentBackgroundColor,
        textAlign:'auto',
        padding:10,
        fontSize:15
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
})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps, DetailActions)(CreatePostJob)