import React, {Component} from 'react'
import {connect} from 'react-redux'
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
    Dimensions,
    InteractionManager,
    FlatList,
    Modal,
    ActivityIndicator
} from 'react-native'

import {view_profile_category} from '@api/response'
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAwesome from 'react-native-vector-icons/FontAwesome';
import Styles from '@styles/card.style'
import {Colors} from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style';

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import {UserHelper, StorageData, Helper, ChatHelper, GoogleAnalyticsHelper} from '@helper/helper';
import SendBird from 'sendbird';
import _ from 'lodash'

import Carousel from 'react-native-looped-carousel';

import moment from 'moment'
import { getApi, postApi } from '@api/request'

// import CacheableImage from 'react-native-cacheable-image';
import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

const {width, height} = Dimensions.get('window')

const sb = null;

export default class ProfileHeader extends Component {

    constructor(props) {
        super(props);

        // sb = SendBird.getInstance();
        var a = moment([moment().year(), 0]);
        var b = moment([UserHelper.UserInfo.profile.attributes.date_of_birth.value, 0]);
        // console.log('Years Old ',a.diff(b, 'years')); 
        // console.log(moment("01/01/1992", "MM/DD/YYYY").month(0).from(moment().month(0),true));

        let _profileAttr = UserHelper.UserInfo.profile;
        // console.log('testindsfkjsdlf : ',UserHelper.UserInfo.profile);
        let is_Employer = UserHelper._isEmployer();
        if(!UserHelper._isMe(this.props.userInfo.user)){
            _profileAttr = this.props.userInfo;
            b = moment([_profileAttr.attributes.date_of_birth.value, 0]);
            if(_profileAttr.user.activeUserRoles)
                is_Employer = _profileAttr.user.activeUserRoles[0].role.name === 'employer';
        }
        console.log("Check Empty Value",this._chkEmptyVal(_profileAttr.attributes.language.value));
        // console.log('Profile Attribute: ', _profileAttr);
        this.state = {
            modalPhotoGallery: false,
            moreInfo: [
                {
                    label: 'Country',
                    value: _profileAttr.attributes ? (_profileAttr.attributes.country ? (_profileAttr.attributes.country.value ? _profileAttr.attributes.country.value : 'N/A'): 'N/A'): 'N/A',
                    // value: _profileAttr.country || 'N/A',
                },
                {
                    label: 'Company',
                    value: _profileAttr.attributes.company ? this._chkEmptyVal(_profileAttr.attributes.company.value) : 'N/A',
                    isEmployer: !is_Employer,
                },
                {
                    label: 'Language',
                    value: _profileAttr.attributes.language ? this._chkEmptyVal(_profileAttr.attributes.language.value).replace(/,/g, ', ') : 'N/A',
                    isEmployer: is_Employer,
                },
                {
                    label: 'Gender',
                    value: _profileAttr.attributes.gender ? Helper._getGenderLabel(_profileAttr.attributes.gender.value) : 'N/A',
                },
                {
                    label: 'Age',
                    // value: moment("01/01/"+_profileAttr.attributes.date_of_birth.value, "MM/DD/YYYY").month(0).from(moment().month(0),true),
                    value: a.diff(b, 'years').toString(),
                },
                {
                    label: 'Ethnicity',
                    value: _profileAttr.attributes.ethnicity ? this._chkEmptyVal(_profileAttr.attributes.ethnicity.value) : 'N/A',
                    isEmployer: is_Employer,
                },
                {
                    label: 'Height',
                    value: _profileAttr.attributes.height ? this._chkEmptyVal(_profileAttr.attributes.height.value) : 'N/A',
                    isEmployer: is_Employer,
                },
                {
                    label: 'Weight',
                    value: _profileAttr.attributes.weight ? this._chkEmptyVal(_profileAttr.attributes.weight.value) : 'N/A',
                    isEmployer: is_Employer,
                },
                {
                    label: 'Hair color',
                    value: _profileAttr.attributes.hair_color ? this._chkEmptyVal(_profileAttr.attributes.hair_color.value) : 'N/A',
                    isEmployer: is_Employer,
                },
                {
                    label: 'Eye color',
                    value: _profileAttr.attributes.eye_color ? this._chkEmptyVal(_profileAttr.attributes.eye_color.value) : 'N/A',
                    isEmployer: is_Employer,
                },
            ],
            // isHasPhotos: (UserHelper._isMe(this.props.userInfo.user) ? UserHelper.UserInfo.photos>0 : this.props.userInfo.photos),
            isHasPhotos: true,
            reviewCount: 0,
            showFavIcon: !UserHelper._isMe(this.props.userInfo.user),
            isFavorite: false,
            isRequestingFavorite: false
        }

        // console.log('Sort by featured photo : ',_.sortBy(this.props.userInfo.photos, function(v){ return !v.is_featured; }));

        // console.log('Profile Header : ', this.props);

    }

    _chkEmptyVal = (_val) => {
        return !_.isEmpty(_val) ? _val : 'N/A';
    }

    // _createChannel(_item) {

    //     const {navigate, goBack, state} = this.props.navigation;

    //     let name = '';
    //     let _channelURL = '';
    //     let userIds = [this.props.id];
    //     let coverFile = this.props.cover;
    //     let data = '{}';
    //     let customType = '';

    //     sb
    //         .GroupChannel
    //         .createChannelWithUserIds(userIds, true, name, coverFile, data, customType, function (createdChannel, error) {

    //             console.log('Create Channed 1-to-1 : ', channel);

    //             if (error) {
    //                 console.error(error);
    //                 return;
    //             }
    //         });
    // }

    directToMessage = () => {
        // Alert.alert('Bring me to message page'); console.log('Talent Feed List : ',
        // this.props);

        GoogleAnalyticsHelper._trackEvent('Chat', 'Chat Button Click From Profile', {
            user_id: this.props.userInfo.user._id,
            full_name: Helper._getUserFullName(this.props.userInfo.attributes)
        });                                                 

        let userObj = {
            id: this.props.userInfo.user._id,
            cover: Helper._getCover(this.props.userInfo),
            full_name: Helper._getUserFullName(this.props.userInfo.attributes)
        }
        let _SELF = this;

        const {navigate, goBack, state} = _SELF.props.navigation;
        console.log('This is state: ', state);

        if(state.params.is_direct_chat){
            goBack();
            
        }else{


            const { navigate, goBack, state } = _SELF.props.navigation;
            let _paramObj = {
                message_data: {
                    name: userObj.full_name,
                    // channelUrl: _channel.url,
                    chat_id: userObj.id,
                },
                // direct_chat: true,
                // user_info: userProfile,
                userObj: userObj,
            };
            navigate('Message',_paramObj); 
            
        }
    }

    directToEdit = () => {
        const { navigate, goBack, state } = this.props.navigation;
        navigate('EditProfile');
    }

    directToReview = () => {
        const { navigate, goBack, state } = this.props.navigation;
        navigate('Review',{'user':this.props.userInfo});
    }

    requestFavorite = () => {
        let _SELF = this;        
        if(this.state.isRequestingFavorite) return;
        this.setState({
            isFavorite: !this.state.isFavorite,
            isRequestingFavorite: true
        }, () => {
            let url = '/api/favorites/' + this.props.userInfo.user._id;
            postApi(url).then((response) => {
                console.log('request', url, response);
                _SELF.setState({
                    isRequestingFavorite: false
                });            
            });
        });
    }

    // filter for carousel to show featured photo first
    getPhotosSortByFeature = () => {

        let _photos = UserHelper._isMe(this.props.userInfo.user) ? UserHelper.UserInfo.photos : this.props.userInfo.photos
        // console.log('getPhotosSortByFeature', _photos)
        let _tmp = _.sortBy(_photos, function(v){ return !v.is_featured; });
        // console.log('getPhotosSortByFeature : ',_tmp);
        return _tmp;
    }

    componentWillMount(){
        // https://github.com/wcandillon/react-native-img-cache
        // Remove cache entries and all physical files.
        // ImageCache.get().clear();
    }

    componentDidMount(){
        this.getReviewCount();
    }

    getReviewCount = () => {
        let _SELF = this;
        let url = '/api/ratings/profiles/?limit=1&target_user=';
        if(this.props.userInfo.user._id){
            url = url + this.props.userInfo.user._id;
        }else{
            url = url + this.props.userInfo.user;
        }
        getApi(url).then((response) => {
            if(response.options.total && this.refs.review_button)
                _SELF.setState({
                    reviewCount:response.options.total
                });
        });
    };

    render() {

        // {console.log("This is the information of the user: ", this.props.userInfo)}

        let _cover = '';

        // if me get my cover 
        if(UserHelper._isMe(this.props.userInfo.user)){
            _cover = UserHelper._getCover('preview_url_link') ? { uri: UserHelper._getCover('preview_url_link') } : require('@assets/img-default.jpg');
            // _cover = require('@assets/img-default.jpg');
            // console.log(' Cover 1', UserHelper._getCover('preview_url_link'));
        }
        else{
            // view other profile user
            _cover = { uri : this.props.userInfo.photo.preview_url_link };
            // console.log(' Cover 2', _cover);
        }

        // console.log(' Cover ', _cover);

        return (

                <View style={[styles.topSection]}>
                    
                    <Modal
                    animationType={"fade"}
                    //animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalPhotoGallery}
                    onRequestClose={() => {}}
                    >

                        <TouchableOpacity   
                            style={[ {zIndex: 99,position: 'absolute', top: 0, right:0, backgroundColor: 'transparent'} ]}
                            onPress={()=> { 
                                
                                GoogleAnalyticsHelper._trackEvent('Profile', 'View Gallery Image');                                         

                                if(this.getPhotosSortByFeature().length > 0){
                                    this.setState({
                                        modalPhotoGallery: false 
                                    });
                                }
                                 
                            }}
                            activeOpacity={.8} >
                            <Icon name={'close'} style={styles.closeButton} />
                        </TouchableOpacity>

                        <Carousel
                            autoplay={false}
                            bullets={this.state.isHasPhotos && this.getPhotosSortByFeature().length > 1 && true}
                            style={{
                            width: width,
                            height: height,
                            flex: 1,
                            backgroundColor: 'black'
                        }}>
                            {this.state.isHasPhotos ? this.getPhotosSortByFeature()
                                .map((item, index) => {
                                    return (

                                        <CustomCachedImage
                                        key={index}
                                        style={{
                                            flex: 1,
                                            height: height,
                                            width: width,
                                            resizeMode: 'contain',
                                            alignSelf: 'center'
                                        }}
                                        defaultSource={ require('@assets/img-default.jpg') }
                                        component={ImageProgress}
                                        source={{ uri: item.preview_url_link }} 
                                        indicator={ProgressCircle} 
                                        />
                                    );
                                })
                                :
                            <Image
                                style={{
                                height: 300,
                                width: width,
                                alignSelf: 'center'
                            }}
                            source={require('@assets/img-default.jpg')}/>
                            }
                        </Carousel>
                    </Modal>
                        {/*
                    <Image 
                        //checkNetwork={false} 
                        //networkAvailable={true}
                        resizeMode="cover"
                        style={[styles.avatar, styles.mybgcover, styles.fullWidthHeightAbsolute]}
                        source={_cover}
                        />*/}

                        <CustomCachedImage
                            style={[styles.avatar, styles.mybgcover]}
                            defaultSource={ require('@assets/img-default.jpg') }
                            component={ImageProgress}
                            source={ _cover } 
                            indicator={ProgressCircle} 
                            onError={(e) => {
            
                                {/* console.log('error image view post : ', e); */}

                                GoogleAnalyticsHelper._trackException('People Listing == '); 

                                const _thumn = _cover.uri;
                                
                                ImageCache.get().clear(_thumn).then(function(e){
                                    console.log('clear thum ', e)
                                    ImageCache.get().bust(_thumn, function(e){
                                        console.log('bust', e);
                                    });
                                });

                            }}
                        />
                    

                        {/*<CacheableImage
                            style={[styles.avatar, styles.mybgcover]}
                            source={require('@assets/img-default.jpg')}
                            defaultSource={_cover}
                        >
                        </CacheableImage>*/}

                    

                    {/*<Image
                        style={[styles.avatar, styles.mybgcover]}
                        source={_cover}>*/}
                        
                        {this.state.isHasPhotos && <TouchableOpacity
                            activeOpacity={1}
                            onPress={()=> { this.setState({
                                modalPhotoGallery: true 
                            }) }}
                            style={{
                            minWidth: 35,
                            padding: 5,
                            margin: 15,
                            backgroundColor: 'rgb(215, 188, 177)',
                            borderRadius: 5,
                            alignSelf: 'flex-end',
                            zIndex:1,
                            position: 'absolute',
                            top: 0,
                            right: 15
                        }}>
                            <Text
                                style={{
                                margin:5,
                                color: 'rgb(74, 74, 74)',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}>
                                1/{ this.getPhotosSortByFeature().length }
                            </Text>
                        </TouchableOpacity>
                        }
                        <TouchableOpacity
                            onPress={()=> { this.setState({
                                modalPhotoGallery: true
                            }) }}
                            style={{
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            position: 'absolute',
                            backgroundColor: 'rgba(52, 52, 52, 0.4)'
                        }}></TouchableOpacity>

                        {/* basic info */}
                        <View style={[styles.mybgOverlay, styles.bgTransparent]} 
                            onPress={() => {
                                {/*this.setState({
                                    modalPhotoGallery: true 
                                })*/}
                            }}>

                            {/* name & talent type */}
                            <View style={[ {paddingHorizontal: 20} ]}>
                                <Text
                                    style={[{
                                        fontSize: 35,
                                        color: 'white'
                                    }
                                ]}>{Helper._getUserFullName(this.props.userInfo.attributes)}</Text>
                                <View style={[styles.tagContainerNormal, styles.paddingBotNavXS]}>
                                    {UserHelper
                                        ._getKind(this.props.userInfo.attributes.kind ? this.props.userInfo.attributes.kind.value : 'N/A')
                                        .map((item, index) => {
                                            return (
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    key={index}
                                                    style={[styles.tagsSelectNormal, styles.withBgGray, styles.tagsSelectAutoWidth, styles.noMargin, styles.marginTopXXS]}>
                                                    <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM]}>
                                                        {Helper._capitalizeText(item.display_name)}
                                                    </Text>

                                                </TouchableOpacity>
                                            )
                                        })}

                                </View>
                            </View>

                            {/* more info */}
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={[ {backgroundColor: 'transparent', paddingHorizontal: 18} ]}>

                                <View style={[ styles.boxWrapContainer, styles.boxWrapContainerNoWrap, {flexDirection: 'row', marginTop: 15, }]}>

                                    { this.state.moreInfo.map((item, index) =>{
                                        {/*console.log(item);*/}
                                        if(!item.isEmployer)
                                            return(
                                                <View key={index} style={[ styles.boxWrapItem, styles.boxWrapItemNoWrap, styles.moreInfoBox, {height: null} ]}>
                                                    <Text style={[ styles.moreInfoBoxLabel ]}>{item.label}</Text>
                                                    <Text style={[ styles.moreInfoBoxValue,  ]}>{item.value}</Text>
                                                </View>
                                            )
                                        else
                                            return null;

                                    })}
                                </View>

                            </ScrollView>


                            {/* favorite & reviews */}
                            {/*<View style={[styles.favorite]}>
                                <View>
                                    <Text style={[styles.favoriteNumber]}>0</Text>
                                    <Text style={[styles.favoriteText]}>Favorites</Text>
                                </View>
                                <View>
                                    <Text style={[styles.favoriteNumber]}>0</Text>
                                    <Text style={[styles.favoriteText]}>Reviews</Text>
                                </View>
                            </View>*/}

                            {/* profile action */}
                            <View
                                style={[
                                styles.txtContainer1, {
                                    flex: 1,
                                    flexDirection: 'row',
                                    paddingHorizontal: 20,
                                }
                            ]}>
                                {/*<TouchableOpacity style={[styles.btnMessage, styles.marginTopMD]}>
                                    <Text style={[styles.flatBtnText, styles.btFontSize]}>8 Reviews</Text>
                                </TouchableOpacity>*/}

                                <TouchableOpacity
                                        activeOpacity={.8}
                                        style={[styles.btnMessage, styles.marginTopMD,  {width: 130, padding: 0}]}
                                        onPress=
                                        {() => this.directToReview() }>
                                        <Text
                                            ref={'review_button'}
                                            style={[styles.flatBtnText, styles.btFontSiz]}>{
                                                this.state.reviewCount === 0?'':this.state.reviewCount + ' '}Review
                                        </Text>
                                </TouchableOpacity>

                                {/*{console.log('User Id: ', this.props.userInfo._id , ', and ', UserHelper.UserInfo.profile._id)}*/}

                                {!Helper._isOtherUser(this.props.userInfo._id)
                                    ? <TouchableOpacity
                                            style={[styles.btnEditProfile, styles.marginTopMD]}
                                            onPress=
                                            {() => this.directToMessage() }>
                                            <Text
                                                style={[
                                                styles.flatBtnText,
                                                styles.btFontSize, {
                                                    color: Colors.buttonColor
                                                }
                                            ]}>Chat</Text>
                                        </TouchableOpacity>

                                    : <TouchableOpacity
                                        activeOpacity={.8}
                                        style={[styles.btnEditProfile, styles.marginTopMD]}
                                        onPress=
                                        {() => this.directToEdit() }>
                                        <Text
                                            style={[
                                            styles.flatBtnText,
                                            styles.btFontSize, {
                                                color: Colors.buttonColor
                                            }
                                        ]}>Edit Profile</Text>
                                    </TouchableOpacity>
                                }
                                {/* {this.state.showFavIcon &&
                                    <TouchableOpacity   
                                        style={{ alignItems:'center', justifyContent:'center', marginTop: 20, marginLeft: 20 }}
                                        onPress={ () => this.requestFavorite() }
                                        activeOpacity={.8} >
                                        <IconAwesome name={this.state.isFavorite?'heart':'heart-o'} style={[styles.heartIcon, {color:this.state.isFavorite?Colors.buttonColor:'white'}]} />
                                    </TouchableOpacity>
                                } */}
                            </View>

                        </View>
                    {/*</Image>*/}
                    {/*</CacheableImage>*/}
                </View>
     
        );

    }
}

var styles = StyleSheet.create({
    ...Styles,
    ...Utilities,
    ...FlatForm,
    ...TagsSelect,
    ...BoxWrap,

    moreInfoBoxContainer:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start', 
        justifyContent: 'flex-start',
        flexWrap: 'nowrap',    
    },

    topSection: {
        height: height - (Helper._isIOS() ? 113 : 125),
        flex: 1,
        justifyContent: 'flex-end'
    },
    middleSection: {
        alignItems: 'stretch',
        height: 300

    },
    bottomSection: {
        backgroundColor: 'white',
        height: 200
    },
    mywrapper: {
        flex: 1
    },
    mybgcover: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    mybgOverlay: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        // padding: 20,
        paddingVertical: 20,
        width: width,
        zIndex: 2
    },
    iconContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myiconUploadAvatar: {
        fontSize: 70,
        color: "rgba(255,255,255,0.6)",
        backgroundColor: 'transparent'
    },
    favorite: {
        paddingTop: 20,
        flexDirection: 'row'
    },
    favoriteNumber: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 120
    },
    favoriteText: {
        color: 'white'
    },
    btnMessage: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 10,
        // marginTop: 5, 
        borderRadius: 5,
        paddingLeft: 30,
        paddingRight: 30,
        borderColor: Colors.buttonColor,
        marginRight: 20
    },
    btnMessageText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '300'
    },
    btnEditProfile: {
        backgroundColor: 'white',
        paddingVertical: 10,
        marginTop: 5,
        borderRadius: 5,
        paddingHorizontal: 30
    },
    imgContainer: {
        flex: 1,
        opacity: 0.5
    },
    alignSpaceBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    closeButton: {
        color: 'white',
        padding: 8,
        textAlign: 'center',
        margin: 10,
        marginTop: 30,
        alignSelf: 'flex-end',
        fontSize:20
    },
    heartIcon: {
        textAlign: 'center',
        fontSize: 30,
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    moreInfoBox: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 0,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,.4)',
        marginHorizontal: 2,
        maxWidth: 200,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    moreInfoBoxLabel: {
        color: 'white'
    },
    moreInfoBoxValue: {
        marginTop: 5,
        fontSize: 15,
        color: 'white',
        fontWeight: 'bold'
    }
});