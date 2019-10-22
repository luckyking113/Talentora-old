import React, { Component } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style'; 
import Styles from '@styles/card.style';

import _ from 'lodash'

export default class JobDataMockUpLoading extends Component {

    _getDataStaticCount = () => {
        return [{},{},{}];
    }


    render() {
        let _staticHeight = 180;
        return (
           
            <ScrollView style={[ styles.justFlexContainer]}>
                { this._getDataStaticCount().map((item, index) => {
                    return (
                        <View key={index} style={[ styles.justFlexContainer]}>  

                            <View style={[styles.middleSection, { height: _staticHeight }]}>

                                <View style={[styles.imgContainer, { height: _staticHeight }]}>                                                  

                                    <View style={[ styles.justFlexContainer, {backgroundColor: Colors.componentDarkBackgroundColor, height: _staticHeight} ]}>

                                    </View> 

                                </View>

                                <View activeOpacity={.8} style={[styles.iconContainer ]}>
                                    
                                        <Icon 
                                            tintColor={"#fff"}
                                            name={'play-circle-filled'}  
                                            style={[ styles.myiconUploadAvatar ]}
                                        />
                                </View>

                            </View>
                            
                            <View style={[styles.cardInfo,{paddingLeft:10,paddingRight:0, backgroundColor: Colors.lineColor}]}>
                                <View style={[styles.userInfo,{flex:2, justifyContent: 'flex-start'}]}>

                                    <View style={[styles.userAvatar,{borderRadius:20, backgroundColor: Colors.componentDarkBackgroundColor}]}/>

                                    <View style={[ styles.textInfo, { marginLeft: 0, height: 20} ]}> 
                                        <View style={[ styles.textInfo, {maxWidth: 160, height: 12, backgroundColor: Colors.componentDarkBackgroundColor} ]}></View>
                                        <View style={[ styles.textInfo, {maxWidth: 80, height: 8, backgroundColor: Colors.componentDarkBackgroundColor, marginTop: 5} ]}></View>
                                    </View> 
                                    
                        
                                </View>

                            </View> 
                            
                        </View>
                    )
                })}

            </ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    ...Styles,
    ...Utilities,
    ...BoxWrap,
    ...FlatForm,
    ...TagsSelect,
    iconContainer:{
        position:'absolute',
        top:0,
        bottom:0,
        left:0,
        right:0,
        alignItems:'center',
        justifyContent:'center'
    },
    myiconUploadAvatar:{
        fontSize: 70,
        color: "rgba(255,255,255,0.6)",
        backgroundColor: 'transparent'
    },
})
