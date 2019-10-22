import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import ListItem from '@styles/components/list-item.style';
import Ultilities from '@styles/extends/ultilities.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';
import BoxWrap from '@styles/components/box-wrap.style';

import { ChatHelper, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '@themes/index';
import { IconCustom } from '@components/ui/icon-custom';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

const styles = StyleSheet.create({
    ...Ultilities,
    ...FlatForm,
    ...TagsSelect,
    ...ListItem,
    ...BoxWrap
});

// console.log(this);

export default class Row extends React.PureComponent {


    _getCover = () => {
        let _cover = require('@assets/icon_profile.png');
        const _createByInfo = this.props._created_by;
        if(this.props._created_by){
            if(_createByInfo.profile){
                if(_createByInfo.profile.photo){
                    _cover = {uri: _createByInfo.profile.photo._thumbnail_url_link ? _createByInfo.profile.photo._thumbnail_url_link : _createByInfo.profile.photo.preview_url_link};
                }
            }
        }
        return _cover;
    }

    render() {

        const item = this.props;

        // console.log('ITEM: ', item);

        if(item.boxType == 'add_more')

            return(
                <View style={[ styles.justFlexContainer ]}>
                    <TouchableOpacity 
                    
                    activeOpacity = {0.9}
                    style={[ styles.justFlexContainer, styles.boxWrapItem, styles.myWrap, styles.flexCenter, item.isBigSize && styles.boxWrapItemSizeMD ]} 
                    onPress={() => this.props.chooseImage()} >

                        {/* <IconCustom
                            name="plus-gray-icon"
                            style={[ styles.iconPlus ]} 
                        /> */}

                        { this.props.uploading ? <ActivityIndicator color="gray" animating={true} /> : <IconCustom
                            name="plus-gray-icon"
                            style={[ styles.iconPlus ]} 
                        /> }

                    </TouchableOpacity>
                </View>
            )

        else if(item.boxType == 'photo')

            return (

                <View style={[ styles.justFlexContainer ]}>

                    <View style={[styles.boxWrapItem, styles.myWrap, item.isBigSize && styles.boxWrapItemSizeMD, this.props.checkActiveTag(item) && styles.boxWrapSelected, item.isBigSize && {marginBottom: 0}]} >
                        <TouchableOpacity
                            activeOpacity = {0.9}
                            style={[{flex:1}]} 
                            onPress={ () => this.props.selectedTag(item) }>

                            { !item.tmpSource && <CustomCachedImage
                                style={styles.bgCover}
                                defaultSource={ require('@assets/job-banner.jpg') }
                                component={ImageProgress}
                                source={ {uri: item.uri}  }  
                                indicator={ProgressCircle} 
                                onError={(e) => {
                                    
                                    {/* console.log('error image view post : ', e); */}

                                    GoogleAnalyticsHelper._trackException('Image Load Photos Edit Profile == ');

                                    const _thumn = item.tmpSource || item.uri;
                                    
                                    ImageCache.get().clear(_thumn).then(function(e){
                                        console.log('clear thum ', e, ' -===-', _thumn)
                                        ImageCache.get().bust(_thumn, function(e){
                                            console.log('bust', e);
                                        });
                                    });

                                }}

                            /> }

                            {item.tmpSource && <Image
                                style={styles.bgCover}
                                source={ {uri: item.tmpSource}  }  
                            /> }

                            {this.props.checkActiveTag(item) && (
                            
                                <View style={[styles.absoluteBox,styles.boxFeatured]}> 
                                    <View style={[styles.boxWrapStatusContainer,styles.mainHorizontalPaddingSM]}> 
                                        <Text style={[styles.boxWrapSelectStatus, styles.fontBold]}>
                                            Featured
                                        </Text>
                                    </View>
                                </View> 

                            )}
                    
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        activeOpacity={0.8}
                        style={[{
                                position:'absolute', 
                                right: -4,  
                                top: -4, 
                                backgroundColor: Colors.primaryColorDark,
                                borderRadius: 12,
                                padding: 3,
                                zIndex: 10
                            }]}
                        onPress={ () => this.props._mediaOption(item)}>
                        <Icon
                            name={"close"}
                            style={[ styles.iconPlus,{fontSize:16,color:'white', backgroundColor: 'transparent'} ]} 
                        />
                    </TouchableOpacity>

                </View>

            )

        else

            return(
                <View style={[ styles.justFlexContainer ]}> 

                </View>
            )

    }
}
