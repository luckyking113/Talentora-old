import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

import ListItem from '@styles/components/list-item.style';
import Ultilities from '@styles/extends/ultilities.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';
import BoxWrap from '@styles/components/box-wrap.style';

import { ChatHelper, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

const styles = StyleSheet.create({
    ...Ultilities,
    ...FlatForm,
    ...TagsSelect,
    ...ListItem,
    ...BoxWrap,
});
const {width, height} = Dimensions.get('window');

// console.log(this);

export default class Row extends React.PureComponent {


    _getCover = () => {

    }

    render() {
        const item = this.props;
        const defaultCover = require('@assets/job-banner.jpg')
        return (

            <View style={[styles.itemContainer, {padding: 5, margin: 0, maxWidth: (width/2)-10}]}> 


                <TouchableOpacity
                    activeOpacity = {0.9}  
                    //key={ index }  
                    onPress={() => this.props.goToJobDetail(item)}
                    style={[ styles.boxWrapItem, {flex: 1, margin: 0}]}   
                >

                    {/*<Image 
                        style={[styles.userAvatarFull, {height: 200, width: null }]} 
                        source={ item.reference_detail && item.reference_detail.length>0 ? { uri:item.reference_detail[0].thumbnail_url_link } : this.state.defaultCover}
                    />*/}

                    <CustomCachedImage
                        style={[styles.userAvatarFull, {height: 200, flex: 1, margin: 0 }]}  
                        defaultSource={ require('@assets/job-banner.jpg') }
                        component={ImageProgress}
                        source={ item.reference_detail && item.reference_detail.length>0 ? { uri:item.reference_detail[0].thumbnail_url_link } : defaultCover } 
                        indicator={ProgressCircle} 
                        //onError={() => {
                            //  ImageCache.get().bust(item.reference_detail && item.reference_detail.length>0 ? item.reference_detail[0].thumbnail_url_link : this.state.defaultCover)
                        //}}
                        onError={(e) => {

                            {/* console.log('error image view post : ', e); */}

                            GoogleAnalyticsHelper._trackException('Job Listing - Talent Seeker == Error-Image-Load'); 

                            try{
                                const _thumn = item.reference_detail[0].thumbnail_url_link;
                                
                                ImageCache.get().clear(_thumn).then(function(e){
                                    console.log('clear thum ', e)
                                    ImageCache.get().bust(_thumn, function(e){
                                        console.log('bust', e);
                                    });
                                });
                            }
                            catch(e){

                            }

                        }}
                    />


                    <View style={[ styles.fullWidthHeightAbsolute, styles.defaultContainer, styles.infoBottom, styles.mainVerticalPaddingSM, styles.mainHorizontalPaddingMD, {margin: 0} ]}>

                        <Text style={[ {color: 'white', textAlign: 'left'}, styles.fontBold, styles.marginBotXXS ]}>{ item.sub_reference_detail.title }</Text> 
                        {/* tag normal */}
                        <View style={[ styles.tagContainerNormal, styles.paddingBotNavXS]}>   

                            <View style={[ styles.tagsSelectNormal, styles.withBgGray, item.sub_reference_detail.job_applied_count>0 && styles.tagSelectedGreen, styles.tagsSelectAutoWidth, styles.noMargin, styles.marginTopXXS ]}>
                                <Text style={[ styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, item.sub_reference_detail.job_applied_count>0 && styles.tagTitleSelectedGreen ]}>
                                    { item.sub_reference_detail.job_applied_count } applicants
                                </Text>
                                
                            </View>      

                        </View>
                    </View>

                </TouchableOpacity>  
                

            </View>

        )
    }
}
