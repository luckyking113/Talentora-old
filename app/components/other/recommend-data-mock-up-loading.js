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
 import BoxAvatarCover from '@styles/components/box-avatar-cover.style';
import _ from 'lodash'

export default class RecommendDataMockUpLoading extends Component {

    _getDataStaticCount = () => {
        let _tmpArray = [{},{},{},{}];
        return _tmpArray;
    }

    _getDataStaticCountLevel2 = () => {
        let _tmpArray = [{},{},{}];
        // console.log('tempArray: ', _tmpArray);
        return _tmpArray;
    }

    render() {

        return (
           
            <ScrollView style={[ styles.justFlexContainer, styles.paddingTopNavSM, styles.mainHorizontalPaddingXS]}>
                <View style={[ {flex:1}, styles.marginTopSM ]}>
                    { this._getDataStaticCount().map((mainItem, mainIndex) => {
                        return (

                            <View key={mainIndex} style={[ styles.boxWrapContainer]}> 
                                
                                { this._getDataStaticCountLevel2().map((item, index) => {

                                    return (
                                        <View  key={ index } style={[ styles.boxWrapItem, styles.boxWrapItemSizeSM, styles.marginBotXXS, styles.grayLessBg, {width: 107}]}>
                                            
                                        </View>   

                                    )}
                                )}

                            </View>

                        )}
                    )}
                </View>

            </ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    ...Utilities,
    ...BoxWrap,
    ...BoxAvatarCover
})
