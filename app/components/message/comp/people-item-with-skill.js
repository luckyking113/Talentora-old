import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import ListItem from '@styles/components/list-item.style';
import Ultilities from '@styles/extends/ultilities.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';

import { ChatHelper, UserHelper, StorageData, Helper } from '@helper/helper';
import IconMeterial from 'react-native-vector-icons/MaterialIcons';

import _ from 'lodash'

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';
import { Colors } from '@themes/index';

const styles = StyleSheet.create({
    ...Ultilities,
    ...FlatForm,
    ...TagsSelect,
    ...ListItem,
});

// console.log(this);

export default class Row extends React.Component {


    _getCover = (item) => {
        // let item = this.state.jobInfo;
        const _objDetail = _.head(item.job_detail);
        return _.head(_objDetail.reference_detail) ? {uri: _.head(_objDetail.reference_detail).thumbnail_url_link} : require('@assets/img-default.jpg');
    }

    render() {
        //   const movie = this.props.data;
        // console.log('Props : ',this.props);

        const {userInfo, onPressItem, selected} = this.props;

        return (

            <View style={[styles.itemContainer, styles.mainHorizontalPadding]}>

                <TouchableOpacity onPress= {() => this.props.onPressItem(userInfo)} activeOpacity = {0.8} style={[styles.itemSubContainerSM, styles.rowBorderBot, {alignItems: 'center', backgroundColor: 'white', marginBottom: 0,paddingHorizontal: 0,}]}>   

                    {/* avatar */}

                    {/*<Image source={ this._getCover(this.props) } style={styles.itemPhoto} /> */}
                    <CustomCachedImage
                        style={styles.itemPhoto}
                        defaultSource={ require('@assets/job-banner.jpg') }
                        component={ImageProgress}
                        source={ userInfo.photo ? { uri: userInfo.photo.thumbnail_url_link } : require('@assets/job-banner.jpg') }
                        indicator={ProgressCircle} 
                    />
                    <View style={[ styles.infoContainer ]}>

                        <View>
                            {/* name */} 
                            <Text style={[ styles.itemTitle, { } ]}>
                                { Helper._getUserFullName(userInfo.attributes) }
                            </Text>
                        </View>


                        <View style={[styles.tagContainerNormal,styles.paddingBotNavXS]}> 

                            {/*{console.log('Item Type: ', item)}*/}

                            {UserHelper._getKind(userInfo.attributes.kind.value).map((item_sub, index_sub) => {
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
                                UserHelper._getKind(userInfo.attributes.kind.value).length>2 &&  
                                <TouchableOpacity
                                    activeOpacity = {1} 
                                    style={[styles.tagsSelectNormal, styles.tagsSelected, styles.noBorder, styles.noMargin, styles.marginTopXXS, {paddingHorizontal: 5,}]} 
                                >
                                    <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM, styles.tagTitleSelected]}>
                                        {UserHelper._getKind(userInfo.attributes.kind.value).length - 2}+
                                    </Text>
                                    
                                </TouchableOpacity>   
                            }

                        </View>

                    </View>

                    { userInfo.selected  && <View style={[ styles.badgeContainer, {backgroundColor: Colors.componentBackgroundColor,position: 'relative', top: 0,right: 0,width: 35, maxWidth: 35, height: 35} ]}>    
                            <IconMeterial name={'done'} style={[ {color: 'green', fontSize: 22} ]} />
                        </View>}
                        
                    {this.props.status === 'cancel' && <Text style={[ styles.postDate, styles.btFontSizeSM, {color: Colors.primaryColor, alignSelf:'flex-end', marginBottom:-10, fontSize: 12}]}>Closed</Text>}
                </TouchableOpacity>


            </View>

        )
    }
}
