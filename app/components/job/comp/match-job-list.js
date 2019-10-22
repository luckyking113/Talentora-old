import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import ListItem from '@styles/components/list-item.style';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';

import BoxWrap from '@styles/components/box-wrap.style';

import { ChatHelper, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import _ from 'lodash'

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

// import CacheableImage from 'react-native-cacheable-image';

// console.log(this);  

export default class MatchJobRow extends React.PureComponent {

    goToJobDetail = (_jobId) => { 
        // console.log(_jobId, '==', this.props.navigation);
        const { navigate, goBack } = this.props.navigation;
        navigate('JobDetail', {job: _jobId});

    }

    _getCover = (item, isFirstError = false) => {
        const _objDetail = _.head(item.job_detail);

        if(isFirstError)
            return _.head(_objDetail.reference_detail) ? {uri: _.head(_objDetail.reference_detail).thumbnail_url_link+'.error.mp4'} : require('@assets/job-banner.jpg');
        else
            return _.head(_objDetail.reference_detail) ? {uri: _.head(_objDetail.reference_detail).thumbnail_url_link} : require('@assets/job-banner.jpg');
    }

    _getKinds = (item) => {
        if(item.criteria)
            return item.criteria.type;
        else
            return [];
    }

    _checkKindsMoreThenFour = (item) => {
        // console.log(item.criteria.type);
        if(item.criteria)
            return item.criteria.type.length > 3;
        else
            return false;
    }


    render() {
        //   const movie = this.props.data;
        // console.log('Match Job List : ',this.props.allJobList);
      return (

            <View style={[ styles.justFlexContainer]}>


                <View style={[ styles.boxWrapContainerNew, styles.mainHorizontalPaddingMD ]}>
                    
                    { this.props.allJobList.map((item, index) => {
                        return (
                            <TouchableOpacity
                                activeOpacity = {0.9} 
                                key={ index }
                                onPress={() => this.goToJobDetail(item)}
                                style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol, index==0 && {  marginRight: 10 }]}   
                            >

                                <View style={[ {flex:1 , height: 200} ]}>
                                    {/*<Image 
                                        style={[styles.bgCover, styles.resizeMode]}  
                                        source={ this._getCover(item) }
                                    />*/}
                                    <CustomCachedImage
                                        style={[styles.bgCover, styles.resizeMode]} 
                                        defaultSource={ require('@assets/job-banner.jpg') }
                                        component={ImageProgress}
                                        source={ this._getCover(item) } 
                                        indicator={ProgressCircle} 
                                        onError={(e) => {

                                            {/* console.log('error image view post : ', e); */}
                                            GoogleAnalyticsHelper._trackException('Job Listing - Talent == '); 

                                            const _thumn = this._getCover(item).uri;

                                            ImageCache.get().clear(_thumn).then(function(e){
                                                console.log('clear thum ', e)
                                                ImageCache.get().bust(_thumn, function(e){
                                                    console.log('bust', e);
                                                });
                                            });

                                        }}
                                    />
                                    {/*<CacheableImage 
                                        resizeMode="cover"
                                        style={[styles.bgCover, styles.resizeMode]}
                                        source={ this._getCover(item) } />*/}
                                </View>

                                <View style={[ styles.fullWidthHeightAbsolute, styles.defaultContainer, styles.infoBottom, styles.mainVerticalPaddingSM, styles.mainHorizontalPaddingMD ]}>

                                    <Text style={[ {color: 'white', textAlign: 'left'}, styles.fontBold, styles.marginBotXXS ]}>{ item.title }</Text> 

                                    <View style={[styles.tagContainerNormal,styles.paddingBotNavXS]}> 

                                        { this._getKinds(item).map((item_sub, index_sub) => {
                                            if(index_sub<3){
                                                return (
                                                    <TouchableOpacity
                                                        activeOpacity = {1}
                                                        key={ index_sub } 
                                                        style={[styles.tagsSelectNormal, styles.tagsSelected, styles.noBorder, styles.noMargin, styles.marginTopXXS, {paddingHorizontal: 5,}]} 
                                                    >
                                                        <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, styles.tagTitleSelected]}>
                                                            { Helper._capitalizeText(item_sub) }
                                                        </Text>
                                                        
                                                    </TouchableOpacity>     
                                                )
                                            }
                                        })}

                                        {
                                            this._checkKindsMoreThenFour(item) && 
                                            <TouchableOpacity
                                                activeOpacity = {1}
                                                style={[styles.tagsSelectNormal, styles.tagsSelected, styles.noBorder, styles.noMargin, styles.marginTopXXS, {paddingHorizontal: 5,}]} 
                                            >
                                                <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, styles.tagTitleSelected]}>
                                                    { this._getKinds(item).length - 3}+
                                                </Text>
                                                
                                            </TouchableOpacity>   
                                        }

                                    </View>

                                </View>

                            </TouchableOpacity>     
                        )
                    })}

                    { this.props.allJobList.length==1 && <View style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol, {opacity:0} ]}></View> }

                </View>


            </View>

      )
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,

})
