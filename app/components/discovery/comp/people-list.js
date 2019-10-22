import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StatusBar
} from 'react-native'


import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';

import BoxWrap from '@styles/components/box-wrap.style';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'

import _ from 'lodash'
import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

// import CacheableImage from 'react-native-cacheable-image';


function mapStateToProps(state) {
    return {
        // detail: state.detail
    }
}

// const _talentType = [{
//                         id: '1',
//                         category: 'actor',
//                         display_name: 'Actor'
//                     },
//                     {
//                         id: '3',
//                         category: 'musician',
//                         display_name: 'Musician'
//                     },
//                     {
//                         id: '2',
//                         category: 'singer',
//                         display_name: 'Singer'
//                     },
//                     {
//                         id: '4',
//                         category: 'dancer',
//                         display_name: 'Dancer'
//                     },
//                     {
//                         id: '5',
//                         category: 'model',
//                         display_name: 'Model'
//                     },
//                     {
//                         id: '6',
//                         category: 'host',
//                         display_name: 'Host'
//                     }];


class PeopleList extends React.PureComponent {

    constructor(props){
        super(props)

        this.state = {
            allJobList: this.props.allData,
        }
        //console.log('all job list: ', this.state.allJobList);
    }

    render() {

        /*if(_.isEmpty(this.state.allJobList))
            return (
                
                <View style={[ styles.defaultContainer ]}>

                    <Text style={[styles.blackText, styles.btFontSize]}>
                        You’ve not post any jobs yet.
                    </Text>

                    <Text style={[styles.grayLessText, styles.marginTopXS]}>
                        Post a job in less than 30 seconds.
                    </Text>

                </View>
            );
        else{*/
            return (

                <View style={[ styles.justFlexContainer, styles.mainScreenBg, this.props.id == 1 && styles.marginTopSM ]}>

                    {/*{this.state.allJobList.map((itemMain, indexmain) => {*/}
                        {/*return(*/}
                            <View  style={[ styles.boxWrapContainerNew, styles.mainHorizontalPaddingMD]}>
                                
                                {this.state.allJobList.map((item, index) => { 
                                    {/*console.log('item : ',this.state.allJobList.length, " and " ,  index);*/}
                                    return (
                                        <TouchableOpacity
                                                activeOpacity = {0.9} 
                                                key={index}  
                                                onPress={() => this.props.onPressItem(item)}
                                                style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol, index==0 && {  marginRight: 10 }, {height: 200}]}   
                                            >

                                            {/*<Image 
                                                style={[styles.userAvatarFull, {height: 200, flex: 1 }]} 
                                                source={{ uri: item.photo.thumbnail_url_link }}
                                            />*/}

                                            <CustomCachedImage
                                                style={[styles.userAvatarFull, {height: 200, flex: 1 }]} 
                                                defaultSource={ require('@assets/job-banner.jpg') }
                                                component={ImageProgress}
                                                source={ item.photo ? { uri: item.photo.thumbnail_url_link } : require('@assets/job-banner.jpg') } 
                                                indicator={ProgressCircle}
                                                onError={(e) => {
        
                                                    {/* console.log('error image view post : ', e); */}
        
                                                    GoogleAnalyticsHelper._trackException('People Listing == '); 
        
                                                    const _thumn = item.photo.thumbnail_url_link;
                                                    
                                                    ImageCache.get().clear(_thumn).then(function(e){
                                                        console.log('clear thum ', e)
                                                        ImageCache.get().bust(_thumn, function(e){
                                                            console.log('bust', e);
                                                        });
                                                    });
        
                                                }}
                                            />

                                            <View style={[ styles.fullWidthHeightAbsolute, styles.defaultContainer, styles.infoBottom, styles.mainVerticalPaddingSM, styles.mainHorizontalPaddingMD, {height: 200} ]}>

                                                <Text style={[ {color: 'white', textAlign: 'left'}, styles.fontBold, styles.marginBotXXS ]}>{ Helper._getUserFullName(item.attributes) }</Text> 

                                                <View style={[styles.tagContainerNormal,styles.paddingBotNavXS]}> 

                                                    {/*{console.log('Item Type: ', item)}*/}

                                                    {UserHelper._getKind(item.attributes.kind.value).map((item_sub, index_sub) => {
                                                        {/*console.log('Index sub: ', index_sub);*/}
                                                        if(index_sub < 2){
                                                            return ( 
                                                                <TouchableOpacity
                                                                    activeOpacity = {1}
                                                                    key={ index_sub } 
                                                                    style={[styles.tagsSelectNormal, styles.tagsSelected, styles.noBorder, styles.noMargin, styles.marginTopXXS, {paddingHorizontal: 5}]} 
                                                                >
                                                                    <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, styles.tagTitleSelected, {fontSize:11}]}>   
                                                                        {Helper._capitalizeText(item_sub.display_name)}
                                                                    </Text>
                                                                    
                                                                </TouchableOpacity>     
                                                            )
                                                        }
                                                    })}

                                                    {
                                                        UserHelper._getKind(item.attributes.kind.value).length>2 &&  
                                                        <TouchableOpacity
                                                            activeOpacity = {1} 
                                                            style={[styles.tagsSelectNormal, styles.tagsSelected, styles.noBorder, styles.noMargin, styles.marginTopXXS, {paddingHorizontal: 5,}]} 
                                                        >
                                                            <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, styles.tagTitleSelected]}>
                                                                {UserHelper._getKind(item.attributes.kind.value).length - 2}+
                                                            </Text>
                                                            
                                                        </TouchableOpacity>   
                                                    }

                                                </View>

                                            </View>

                                        </TouchableOpacity>     
                                    )
                                })}

                                { this.state.allJobList.length==1 && <View style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol, {opacity:0} ]}></View> }

                            </View>
                        {/*)*/}
                    {/*})}*/}

                </View>

            );
        }
    // }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,

})

// Smart Component
// Fetches detail items and maps to component props
export default connect(mapStateToProps)(PeopleList)
