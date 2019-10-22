import React, { Component } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView
} from 'react-native'

import { Colors } from '@themes/index';
import Utilities from '@styles/extends/ultilities.style';
import BoxWrap from '@styles/components/box-wrap.style';
 import ListItem from '@styles/components/list-item.style';

import _ from 'lodash'

export default class JobDataMockUpLoading extends Component {

    _getDataStaticCount = () => {
        let _tmp = [];
        _.each(new Array(8), function(v,k){
            _tmp.push({});
        })
        return _tmp;
    }

    render() {

        return (
           
            <ScrollView style={[ styles.justFlexContainer, styles.paddingTopNavSM]}>

                { this._getDataStaticCount().map((mainItem, mainIndex) => {
                    return (

                        <View key={mainIndex} style={[styles.itemContainer, styles.mainHorizontalPaddingMD, styles.mainVerticalPaddingXS1]}>

                            <View style={[styles.itemSubContainerSM, styles.boxWithShadow, {backgroundColor: 'white'}]}>   

                                <View
                                    style={[styles.itemPhoto, {backgroundColor: Colors.componentDarkBackgroundColor}]} 
                                />

                                <View style={[ styles.infoContainer ]}>

                                    <View style={[ styles.nameContainer ]}>
                                        <Text style={[ styles.itemTitle, {width: 160, height: 12, backgroundColor: Colors.componentDarkBackgroundColor} ]}></Text>
                                    </View>
                                    <View style={[ styles.nameContainer ]}>
                                        <Text style={[ styles.postDate, {width: 100, height: 10, backgroundColor: Colors.componentDarkBackgroundColor} ]}></Text>
                                    </View>

                                </View>

                            </View>

                            

                        </View>

                    )}
                )}

            </ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    ...Utilities,
    ...BoxWrap,
    ...ListItem,
})
