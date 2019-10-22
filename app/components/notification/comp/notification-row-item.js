import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import ListItem from '@styles/components/list-item.style';
import Ultilities from '@styles/extends/ultilities.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';

import { ChatHelper, Helper } from '@helper/helper';

import { CachedImage, ImageCache, CustomCachedImage } from "react-native-img-cache";
import ImageProgress from 'react-native-image-progress';
import {ProgressBar, ProgressCircle} from 'react-native-progress';

const styles = StyleSheet.create({
    ...Ultilities,
    ...FlatForm,
    ...TagsSelect,
    ...ListItem,
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
        //   const movie = this.props.data;
        // const _cover = require('@assets/job-banner.jpg')
        const _cover = this._getCover();
        // console.log('Props : ',this.props);
      return (

        <View style={[styles.itemContainer, styles.mainHorizontalPadding]}> 

            <TouchableOpacity onPress= {() => this.props.rowPress(this.props)} activeOpacity = {0.8} style={[styles.itemSubContainerSM, styles.rowBorderBot, {backgroundColor: 'white', marginBottom: 0,paddingHorizontal: 0,}]}>   

                {/* avatar */}
                {/*<Image source={ _cover } style={styles.itemPhoto} /> */}
                <CustomCachedImage
                    style={[styles.itemPhoto]} 
                    defaultSource={ require('@assets/job-banner.jpg') }
                    component={ImageProgress}
                    source={ _cover } 
                    indicator={ProgressCircle} 
                />

                <View style={[ styles.infoContainer ]}>

                    <View>
                        {/* name */} 

                        { this.props.title && <View style={[ { marginBottom: 3 } ]}>
                            <Text style={[ styles.fontBold, { } ]}>{ this.props.title }</Text>
                        </View>}
                        <Text style={[ styles.itemTitleSub, { } ]}>
                            <Text>{ this.props.text }</Text> 
                        </Text>
                        <Text style={[ styles.btFontSizeXXS, styles.grayLess, {marginTop: 5} ]}> { Helper._getTimeFromNow(this.props._created_at) }</Text>
                        
                    </View>

                </View>

            </TouchableOpacity>

            

        </View>

      )
    }
}
