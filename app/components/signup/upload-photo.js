// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Image, ScrollView, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, ActionSheetIOS, ActivityIndicator, Dimensions, FlatList } from 'react-native';

import ButtonBack from '@components/header/button-back'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';
// import ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import { postMedia, putApi, postApi, getApi, deleteApi } from '@api/request';

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';
import ImagePickerCrop from 'react-native-image-crop-picker';

import PhotoBoxItem from '@components/user/comp/photo-box-item';

let options = {
    title: 'Select Image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};


const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: false,
  };

var BUTTONS = [
  'Delete',
  'Cancel',
];
var DESTRUCTIVE_INDEX = 0;
var CANCEL_INDEX = 1;

const pic = [
    // {
    //     id: 1,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p200x200/13690662_777391902401412_7742506644238257845_n.jpg?oh=0a5c9f2ec8ab04ffa1533f67b65ca26a&oe=59977320',
    // },
    // {
    //     id: 2,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p160x160/17799245_820895741395836_893744169114306193_n.jpg?oh=9f5dbd67b6df76217571ec7b8804e6f1&oe=59993FD3',
    // },
    // {
    //     id: 3,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p200x200/16508988_1075299335933144_3547182206399928845_n.jpg?oh=c1e90ca0968e7175be239e9131799261&oe=594CE7FD',
    // },
    // {
    //     id: 4,
    //     uri: 'https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p160x160/14670629_106377253167543_2254683061619192365_n.jpg?oh=aa154b6e14368353322494cb048cc7f3&oe=597E1B1C',
    // },
];


import _ from 'lodash'


const {width, height} = Dimensions.get('window');


function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class UploadPhoto extends Component{

    constructor(props){
        super(props);
        //your codes ....

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            item_selected: '',
            // img: [{'id': 0, 'uri': 'https://talentora-rn.s3.amazonaws.com/resources/clouds/5906addab81611399dadd78b/photos/original/c4e57210-3177-11e7-b8f9-270be727ae37.JPG'}],
            img:[],
            // videoFromApi: [], // store video from api for delete
            photoUploaded: [],
            idx: 0,
            isFirstPhoto: false,
            featuredPhoto: {},
            uploading: false,
            selected: (new Map(): Map<string, boolean>),
            data: [],
            extraData: [{_id : 1}],
        }

        // const { navigate, goBack, state } = this.props.navigation;
        // console.log('User Info : ',state.params);
    }

    _generateBox = (_boxs) => {

        _boxs = _.filter(_boxs,function(v,k){
            return v.boxType == 'photo';
        })

        let _missingBox = 5 - _boxs.length

        // if(_boxs.length>=3)

        if(_missingBox>=0){
            _boxs.push({
                boxType: 'add_more',
                created_date: new Date('01/01/1970').getTime()
            })
        }

        for(let _i =0; _i<=_missingBox; _i++){
            _boxs.push({
                boxType: null,
                created_date: new Date('01/01/1969').getTime()
            })
        }

        // _boxs = _.sortBy(_boxs, [function(v,k) {

        //      return -v.created_date; 

        // }]);

        return _boxs;

    }

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: true,
        headerLeft: navigation.state.params.noBackButton ? null : (<ButtonBack
            isGoBack={ navigation }
            btnLabel= { UserHelper._getFirstRole().role.name == 'employer' ? 'Welcome to Talentora': 'To the details' }
        />),
    });

    joinUsNow() {
        const { navigate, goBack, state } = this.props.navigation;
        console.log('state.params.sign_up_info', state.params.sign_up_info);
        // merge info 
        var signUpInfo = _.extend({
            // talent_category: this.getTalentSelected(),
            featuredPhoto: this.state.featuredPhoto
        }, state.params ? state.params.sign_up_info : {});

        if(this.state.img.length > 0){
            let _chkImgFeatured = _.filter(_.cloneDeep(this.state.img), function(v,k){
                return v.is_featured;
            })
            if(_chkImgFeatured.length<=0){
                alert('Please set your photo cover')
            }
            else{
                const { navigate, goBack, state } = this.props.navigation;
                navigate('UploadVideo', { sign_up_info: signUpInfo });
            }
        
        }else{
            Alert.alert('Upload at least 1 image to continue.');
        }
    }

    checkActiveTag = (item) => {
        // console.log(checkActiveTag, item);
        // return item.is_featured || this.state.item_selected == item._id;
        return item.is_featured || false;
    }

    selectedTag = (item) => {
        // console.log(item);

        console.log('item selected : ', item)
        if(this.state.item_selected != item._id){
            if(this.state.img.length>=1){
                this._setPhotoFeature(item.uuid);
            }
        }

        this.setState({
            item_selected: item._id
        })

    }

    _updateCoverPhotoProfile = (_allImg) => {
        let that = this;

        const { navigate, goBack, state, setParams } = that.props.navigation;

        let _userInfo = state.params.sign_up_info;
        
        const _cover = _.filter(_allImg, function(v,k){
            return v.is_featured;
        });
        console.log('Cover Only: ',_cover);

        if(!_userInfo.cover && !_userInfo.photos){

            _userInfo  = _.extend({
                cover: _.head(_cover),
                photos: _allImg,
            },_userInfo);

        }
        else{
            _userInfo.cover = _.head(_cover);
            _userInfo.photos = _allImg;
        }

        that.props.navigation.setParams({ sign_up_info : _userInfo });

        console.log('_userInfo : ', _userInfo);

        let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_userInfo)); 
        // UserHelper.UserInfo = _result; // assign for tmp user obj for helper
        _userData.then(function(result){
            console.log('complete save sign up process 3'); 
        });
    }

    // get photo that user already upload
    _getPhoto = () => {
        // GET /api/media?type=photo or /api/media?type=video or  /api/media
        let that = this;
        const { navigate, goBack, state, setParams } = that.props.navigation;
        
        let API_URL = '/api/media?type=photo';
        getApi(API_URL).then((_response) => {

            if(_response.code == 200){
                let _allImg = _response.result;

                console.log('User Photo Already Uploaded : ', _allImg);
                let _tmp = [];
                _.each(_.cloneDeep(_allImg),function(v,k){
                    _tmp.push({
                        'id': k, 
                        'type':'image',                         
                        'uri':v.thumbnail_url_link, 
                        'uuid': v.upload_session_key, 
                        'boxType': 'photo',   
                        created_date: new Date().getTime(),                    
                        _id: v._id, is_featured: 
                        v.is_featured});
                })

                that._updateCoverPhotoProfile(_allImg);

                that.setState({ 
                    img: _tmp,
                    idx: _tmp.length,
                    data: this._generateBox(_tmp),
                    extraData: [{_id : this.state.extraData[0]._id++}]                    
                })
            }

        });
    }

    _removePhoto = (_media, _mediaIndex) => {
        let that = this;
        let _mediaInfo = null;
        // _mediaInfo = this.state.img[_mediaIndex] ? this.state.img[_mediaIndex] : null;
        _mediaInfo = _.filter(this.state.img,function(v,k){
            
            if(v.uuid)
                return v.uuid == _media.uuid;
            else
                return v.upload_session_key == _media.uuid

        });

        if(_mediaInfo.length>0){
            _mediaInfo = _.head(_mediaInfo);
        }

        console.log('_mediaInfo : ', _mediaInfo, ' == ', _mediaIndex);
        console.log('this.state.photoFromApi : ', this.state.img);
        // return;
        if(_mediaInfo && _mediaInfo._id){

            let API_URL = '/api/media/photos/'+ _mediaInfo._id;

            // console.log('this.state.videoFromApi : ', this.state.videoFromApi);
            // console.log('_mediaIndex : ', _mediaIndex, ' === ', '_mediaInfo :', _mediaInfo);

            // return;

            deleteApi(API_URL).then((_response) => {
                console.log('Delete photos : ', _response);
                if(_response.code == 200){

                    var _ImageTmp = _.filter(_.cloneDeep(that.state.img), function(v,k) {
                        if(v.uuid)
                            return v.uuid != _media.uuid;
                        else
                            return v.upload_session_key != _media.uuid
                    });

                    // console.log('_videoFromApi :', _videoFromApi);
                    // console.log('_ImageTmp :', _ImageTmp);

                    that._updateCoverPhotoProfile(_ImageTmp);

                    if(_ImageTmp.length <= 0){
                        that.setState({
                            isFirstPhoto: false
                        }) 
                    }

                    that.setState({
                        img: _ImageTmp,
                        idx: _ImageTmp.length,
                        data: [],
                        extraData: [{_id : this.state.extraData[0]._id++}]
                    }, function(){

                        that.setState({
                            data: that._generateBox(_ImageTmp),                    
                            extraData: [{_id : that.state.extraData[0]._id++}]  
                        }, function(){
                            if(_mediaInfo.is_featured){
                                if(that.state.img.length>0){
    
                                    that._setPhotoFeature(that.state.img[0].uuid);
    
                                }
                            }
                        });
                        
                    })
                    
                }

            });
        }
        else{
            alert('Can not delete this photo. Please try again.');
        }
    }

    _mediaOption = (_media, _mediaIndex) => {
        let _SELF = this;
        _mediaIndex = _media.id;
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

    // set feature photo
    _setPhotoFeature = (_id) => {
        let that = this;
        // let API_URL = '/api/users/me/picture';
        let API_URL = '/api/users/me/feature/photo';
        postApi(API_URL,JSON.stringify({
            feature : _id
        })).then((_response) => {
            console.log('success set photo cover response: ', _response);

            let _tmp = _.cloneDeep(that.state.img);
            _.each(_tmp, function(v,k){
                console.log(v.upload_session_key,' == ', _id)
                if(v.uuid == _id){
                    v.is_featured = true;
                }
                else{
                    v.is_featured = false;
                }
            })
            console.log('_tmp : ', _tmp);
            this.setState({
                img: _tmp,
                data: [],
                extraData: [{_id : this.state.extraData[0]._id++}]
            }, function(){
                
                that.setState({
                    data: that._generateBox(_tmp),                    
                    extraData: [{_id : that.state.extraData[0]._id++}]  
                });

            })  


        });
    }

    chooseImage = () => {
        let that = this;
        console.log('this.state : ', this.state);
        if(this.state.uploading)
            return;

        ImagePickerCrop.openPicker({
            mediaType: 'photo',
            // cropping: true,
            includeBase64: true,
          }).then(image => {
            // console.log(image);
            const _sizeCrop = Helper._getSizeCrop(image);
            // console.log('_sizeCrop: ', _sizeCrop);
            ImagePickerCrop.openCropper({
                ..._sizeCrop,
                path: image.path,
                includeBase64: true,
            }).then(imageAfterScrop => {

                let _imageData = imageAfterScrop;
                let defUUID = uuid.v4();
                _imageData.filename = image.filename || defUUID;
                // console.log(_imageData);

                // this.imageCropUpload(_imageData);
                this.imageCropUpload(_imageData, defUUID);
                
            }).catch(e => {
                // alert(e);
                console.log('error : ', e);
            });

            
        }).catch(e => {
            // alert(e);
            console.log('error : ', e);
        });

        return;

        console.log('check is first photo : ', that.state.isFirstPhoto);
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {

                this.setState({
                    uploading: true
                })
                let _prevImgObj = _.cloneDeep(this.state);

                let _tmpSource = response.uri;

                let source = { uri: response.uri };
                // console.log('The state: ', this.state);
                let arrImg = this.state.img.slice();
                let _id =0;
                if(arrImg.length > 0)
                    _id = arrImg.length;

                let _photoUUID = uuid.v4();

                
                // this.setState({
                //     img: arrImg,
                //     idx: arrImg.length
                // })
                
                let data = response.data;
                
                let url = '/api/media/photos/'+ _photoUUID +'/save';

                // console.log('Response: ', response);
                postMedia(url, [
                    // {name: response.fileName , filename: response.fileName, data: data, type: 'image/jpg'},
                    {name: 'image' , filename: response.fileName, data: data, type:'image/jpg'}
                ]).then((response) => {
                    this.setState({
                        uploading: false
                    }) 
                    console.log('success response: ', response);  

                    let objPhoto = response.result;

                    if(response.code != 200){
                        console.log('Error');
                        alert('Can not upload this image !! please try again');
                        this.setState({
                            img: _prevImgObj.img,
                            idx: _prevImgObj.idx
                        })
                        return;
                    }

                    // let _tmpPhotoUpload = this.state.photoUploaded;
                    // _tmpPhotoUpload.push(response.result); 

                    arrImg.push({'id': _id, tmpSource: _tmpSource, 'uri':objPhoto.thumbnail_url_link, 'uuid': objPhoto.upload_session_key, _id: objPhoto._id, is_featured: objPhoto.is_featured});

                    // store photo uploaded
                    that.setState({
                        img: arrImg,
                        idx: arrImg.length,
                        // photoUploaded: _tmpPhotoUpload
                    });

                    console.log('photo uploaded: ', this.state);


                    // Save photo number.
                    const { navigate, goBack, state } = that.props.navigation;
                    let _userInfo = state.params.sign_up_info;
                    _userInfo.profile.photo_uploaded_count++;

                    if(_userInfo.photos){
                        _userInfo.photos.push(response.result);
                    }
                    else{
                        _userInfo = _.extend({

                            photos: [response.result]

                        }, _userInfo);
                    }

                    let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_userInfo)); 
                    // UserHelper.UserInfo = _result; // assign for tmp user obj for helper

                    console.log('UserHelper.UserInfo', UserHelper.UserInfo);

                    _userData.then(function(result){
                        console.log('complete save sign up process 3'); 
                    });

                    // set cover on first upload image 
                    if(!that.state.isFirstPhoto && that.state.img.length==1){
                        console.log('set feature on first time');
                        // let _photoId =  response.result._id;
                        that._setPhotoFeature(_photoUUID);
                        that.setState({
                            isFirstPhoto: true
                        })
                    }
                });
            }
        });

    }

    imageCropUpload = (imgData = null, _UUID = '') => {
        let that = this;
        if(imgData){
            this.setState({
                uploading: true
            })
            let _prevImgObj = _.cloneDeep(this.state);


            let tmpSource =  ( Helper._isIOS() ? 'file://' : '' ) + imgData.path;
            let source = { uri: tmpSource };

            // console.log('The state: ', this.state);
            let arrImg = this.state.img.slice();
            let _id =0;
            if(arrImg.length > 0)
                _id = arrImg.length;

            let _photoUUID = _UUID;

            
            // this.setState({
            //     img: arrImg,
            //     idx: arrImg.length
            // })
            
            let data = imgData.data;
            
            let url = '/api/media/photos/'+ _photoUUID +'/save';

            // console.log('Response: ', response);
            postMedia(url, [
                // {name: response.fileName , filename: response.fileName, data: data, type: 'image/jpg'},
                {name: 'image' , filename: imgData.filename, data: data, type:'image/jpg'}
            ]).then((response) => {
                this.setState({
                    uploading: false
                }) 
                console.log('success response: ', response);  

                let objPhoto = response.result;

                if(response.code != 200){
                    console.log('Error');
                    alert('Can not upload this image !! please try again');
                    this.setState({
                        img: _prevImgObj.img,
                        idx: _prevImgObj.idx
                    })
                    return;
                }

                // let _tmpPhotoUpload = this.state.photoUploaded;
                // _tmpPhotoUpload.push(response.result); 

                arrImg.push({
                    'id': _id, 
                    'type':'image',                     
                    tmpSource: tmpSource, 
                    'uri':objPhoto.thumbnail_url_link, 
                    'uuid': objPhoto.upload_session_key, 
                    _id: objPhoto._id, 
                    'boxType': 'photo',
                    created_date: new Date().getTime(),
                    is_featured: objPhoto.is_featured
                });

                arrImg = _.filter(arrImg, function(v,k){
                    return v.boxType == 'photo';
                })

                // store photo uploaded
                this.setState({
                    img: arrImg,
                    idx: arrImg.length,
                    data: [],
                    extraData: [{_id : this.state.extraData[0]._id++}]
                    // photoUploaded: _tmpPhotoUpload
                }, function(){
                    
                    that.setState({
                        data: that._generateBox(arrImg),                    
                        extraData: [{_id : that.state.extraData[0]._id++}]  
                    });
    
                })  

                console.log('photo uploaded: ', this.state);

                // Save photo number.
                const { navigate, goBack, state } = this.props.navigation;
                let _userInfo = state.params.sign_up_info;
                _userInfo.profile.photo_uploaded_count++;

                if(_userInfo.photos){
                    _userInfo.photos.push(response.result);
                }
                else{
                    _userInfo = _.extend({

                        photos: [response.result]

                    }, _userInfo);
                }

                let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_userInfo)); 
                // UserHelper.UserInfo = _result; // assign for tmp user obj for helper

                console.log('UserHelper.UserInfo', UserHelper.UserInfo);

                _userData.then(function(result){
                    console.log('complete save sign up process 3'); 
                });

                // set cover on first upload image 
                if(!this.state.isFirstPhoto && this.state.img.length==1){
                    console.log('set feature on first time');
                    // let _photoId =  response.result._id;
                    this._setPhotoFeature(_photoUUID);
                    this.setState({
                        isFirstPhoto: true
                    })
                }
            });
        }
    }

    componentDidMount(){

        GoogleAnalyticsHelper._trackScreenView('Sign Up - Upload Photo');         
        

        // if user not yet completed register
        // get all photo that user upload 
        if(UserHelper._getUserInfo()){
            console.log('get photo');
            this._getPhoto();
        }
    }

    _keyExtractor = (item, index) => index;
    
    _renderItem = ({item}) => {
        return (  
            <PhotoBoxItem { ...item } uploading={this.state.uploading} isBigSize={true} chooseImage={ this.chooseImage } rowPress={ this._onRowPress } checkActiveTag={this.checkActiveTag} selectedTag={this.selectedTag} _mediaOption={this._mediaOption} />
    )};


    render() {
        return (    
            <View style={[styles.container,styles.mainScreenBg]} onPress={() =>  dismissKeyboard()}>
                <ScrollView>
                    <View style={[styles.mainPadding]}>

                        <View style={[styles.marginBotMD]}>
                            <Text style={[styles.blackText, styles.btFontSize]}>
                                Upload your photos
                            </Text>

                            <Text style={[styles.grayLessText, styles.marginTopXS]}>
                                Feature your most flattering photo.
                            </Text>

                            <Text style={[ styles.marginTopMD, {color: Colors.primaryColor, textAlign:'right'} ]}>
                                {this.state.img.length || 0}/6 Photos
                            </Text>
                        </View>
                        
                        { false && <View style={[styles.boxWrapContainer,styles.marginTopMD1]}> 

                            {this.state.img.map((item, index) => {
                                {/*console.log(item);*/}
                                return (
                                    <View key={ index } style={[styles.boxWrapItem, styles.boxWrapItemSizeMD, this.checkActiveTag(item) && styles.boxWrapSelected, styles.marginBotSM, {overflow: 'visible'}]}>
                                        <TouchableOpacity
                                            activeOpacity = {0.9}
                                            style={[ styles.justFlexContainer ]} 
                                            onPress={ () => this.selectedTag(item) }
                                        >

                                            <Image
                                                key={ index }
                                                style={styles.userAvatarFull}
                                                source={{ uri: item.tmpSource || item.uri }}
                                            />

                                            {this.checkActiveTag(item) && 
                                            
                                                <View style={[styles.absoluteBox,styles.boxFeatured]}> 
                                                    <View style={[styles.boxWrapStatusContainer,styles.mainHorizontalPaddingSM]}> 
                                                        <Text style={[styles.boxWrapSelectStatus, styles.fontBold]}>
                                                            Featured
                                                        </Text>
                                                    </View>
                                                </View> 
                                                
                                            }
                                    
                                        </TouchableOpacity> 


                                        <TouchableOpacity 
                                        activeOpacity={.8}
                                        style={[ 
                                            styles.iconPlayTopRightSM,
                                            {
                                                right: -14, 
                                                top: -15, 
                                                backgroundColor: Colors.primaryColorDark,
                                                borderRadius: 12,
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

                            {this.state.idx > 5 ? null : 
                                <TouchableOpacity 
                                    activeOpacity = {0.9}
                                    style={[ styles.boxWrapItem, styles.boxWrapItemSizeMD, styles.flexCenter, styles.marginBotSM ]} 
                                    onPress={this.chooseImage.bind(this)} >

                                    { this.state.uploading ? 
                                        <ActivityIndicator color="gray" animating={true} /> 
                                        : 
                                        <IconCustom
                                            name="plus-gray-icon"
                                            style={[ styles.iconPlus ]} 
                                        /> 
                                    }
                                </TouchableOpacity>
                            } 

                        </View> }

                        <FlatList
                            style={{flex: 1}}
                            extraData={this.state.extraData}
                            data={this.state.data}
                            keyExtractor={this._keyExtractor}
                            ref={ref => this.listRef = ref}
                            //ListHeaderComponent={this.renderHeader}
                            horizontal={false}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={{ margin: 5 }}
                            //ListFooterComponent={this.renderFooter}
                            renderItem={this._renderItem}
                            removeClippedSubviews={false}
                            viewabilityConfig={VIEWABILITY_CONFIG}

                            //onViewableItemsChanged = {this.onViewableItemsChanged}

                            //refreshing={this.state.refreshing}
                            //onRefresh={this.handleRefresh}
                            //onEndReachedThreshold={0.5}
                            //onEndReached={this.handleLoadMore}
                        />

                    </View>
                </ScrollView>
                
                <View style={styles.absoluteBox}>
                    <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                        <TouchableOpacity activeOpacity = {0.8} style={[styles.flatButton,]} onPress={() => this.joinUsNow() }>
                            <Text style={[styles.flatBtnText, styles.btFontSize]}>Continue</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </View>
        );
    }
}


var styles = StyleSheet.create({ ...FlatForm, ...Utilities, ...BoxWrap,
    container: {
        flex: 1,
        paddingBottom: 80
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

});

export default connect(mapStateToProps, AuthActions)(UploadPhoto)
