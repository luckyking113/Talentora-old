import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, DeviceEventEmitter } from 'react-native';

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

    jobBox:{
        width: 200,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden'
    },
    jobBanner:{
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    titleContainer:{
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    _title:{
        color: 'white',
        textAlign: 'right'
    }
});

// console.log(this);

export default class JobBox extends React.Component {

    componentDidMount(){
        // console.log('Job Box Props',this.props);
    }

    goToJobDetail = (_jobInfo) => {
        // console.log('Job Info in Chat: ', _jobInfo.currentMessage);
        if(_jobInfo.currentMessage.customData){
            DeviceEventEmitter.emit('NavigateToJobDetail', {'job_id' : _jobInfo.currentMessage.customData.job ? _jobInfo.currentMessage.customData.job.id : ''});
        }
    }

    render() {

        const _iconCover = this.props.currentMessage.customData.job.cover  ? {uri: this.props.currentMessage.customData.job.cover} : require('@assets/job-banner.jpg');
        const _textTitle = this.props.currentMessage.customData.job.title;

      return (

        // <View style={[]}>

            <TouchableOpacity onPress= {() => this.goToJobDetail(this.props)} activeOpacity = {0.8} style={[styles.jobBox]}>   

                {/* avatar */}
                <CustomCachedImage
                    style={[styles.jobBanner]} 
                    defaultSource={ require('@assets/job-banner.jpg') }
                    component={ImageProgress}
                    source={ _iconCover } 
                    indicator={ProgressCircle} 
                />
                <View style={[ styles.titleContainer ]}>
                    <Text style={[ styles._title, this.props.position == 'left' && {color: 'black'} ]}>{ _textTitle }</Text>
                </View>

            </TouchableOpacity>

            

        // </View>

      )
    }
}
