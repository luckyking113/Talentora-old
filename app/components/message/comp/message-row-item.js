import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { Colors } from '@themes/index';
import ListItem from '@styles/components/list-item.style';
import Ultilities from '@styles/extends/ultilities.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';
import IconMeterial from 'react-native-vector-icons/MaterialIcons';

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

export default class Row extends React.Component {

    

    render() {
        //   const movie = this.props.data;
        // console.log('Props : ',this.props);

        const _iconCover = Helper._getFileExtenstion(this.props.photo) ? {uri:this.props.photo} : require('@assets/icon_profile.png');

        let  _isHasSendJobCustomData = false;



        try{
            if(this.props.lastMessage.customType == 'send-job')
                _isHasSendJobCustomData = JSON.parse(this.props.lastMessage.data).job.title ? true : false;
        }catch(e){
            console.log('_isHasSendJobCustomData', e);
        }

        return (

            <View style={[styles.itemContainer, styles.mainHorizontalPaddingMD, styles.mainVerticalPaddingXS1]}>

                <TouchableOpacity onPress= {() => this.props.messageDetail(this.props)} activeOpacity = {0.8} 
                    style={[styles.itemSubContainerSM, styles.boxWithShadow, {backgroundColor: 'white'}, 
                    styles.defaultContainer,
                    
                    ]}>   

                    {/* avatar */}
                    {/*<Image source={ _iconCover } style={styles.itemPhoto} /> */}

                    <CustomCachedImage
                        style={[styles.itemPhoto]} 
                        defaultSource={ require('@assets/job-banner.jpg') }
                        component={ImageProgress}
                        source={ _iconCover } 
                        indicator={ProgressCircle} 
                    />

                    <View style={[ styles.infoContainer ]}>

                        <View style={[ styles.nameContainer ]}>
                            {/* name */} 
                            <Text style={[ styles.itemTitle, { } ]}>
                                { this.props.name }
                            </Text>
                            { (!this.props.isSendJob && this.props.lastMessage) && <Text style={[ styles.postDate ]}>
                                { Helper._getTimeFromNow(this.props.lastMessage.createdAt) } 
                            </Text>}
                        </View>


                        {/* tag normal */}
                        {!this.props.isSendJob && <View style={[ styles.tagContainerNormal, styles.paddingBotNavXS , {paddingRight: this.props.unreadMessageCount> 0 ? 35 : 0, overflow: 'hidden', flexDirection: 'row'}]}>   

                            { !_isHasSendJobCustomData && <Text numberOfLines={1} style={[ ]}>
                                { ChatHelper._getLastMessage(this.props.lastMessage) }
                            </Text> }

                            { _isHasSendJobCustomData && <Text numberOfLines={1} style={[ ]}>
                                <Text style={[ {color: Colors.primaryColor} ]}>Job Opportunity </Text>
                                : { ChatHelper._getLastMessage(this.props.lastMessage,true) } 
                            </Text> }
    
                        </View> }


                    </View>

                    { this.props.unreadMessageCount> 0  && <View style={[ styles.badgeContainer ]}>    
                        <Text style={[ styles.badgeNumber ]}>
                            { this.props.unreadMessageCount } 
                        </Text>
                    </View>}

                </TouchableOpacity>

                

            </View>

        )
    }
}
