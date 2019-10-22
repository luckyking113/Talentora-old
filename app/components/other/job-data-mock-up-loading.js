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
 
import _ from 'lodash'

export default class JobDataMockUpLoading extends Component {

    _getDataStaticCount = () => {
        let _tmpArray = new Array(6);
        let _chunkArray = _.chunk(_tmpArray, 2);
        // console.log('_chunkArray : ', _chunkArray);
        return _chunkArray;
    }

    _getDataStaticCountLevel2 = () => {
        let _tmpArray = [{},{}];
        // console.log('tempArray: ', _tmpArray);
        return _tmpArray;
    }

    render() {

        return (
           
            <ScrollView style={[ styles.justFlexContainer, styles.paddingTopNavSM]}>

                { this._getDataStaticCount().map((mainItem, mainIndex) => {
                    return (

                        <View key={mainIndex} style={[ styles.boxWrapContainerNew, styles.mainHorizontalPaddingMD]}> 
                            
                            { this._getDataStaticCountLevel2().map((item, index) => {

                                return (

                                    <View
                                        key={ index }
                                        style={[ styles.boxWrapItem, styles.boxWrapItemTwoCol , index==0 && {  marginRight: 10 }]}   
                                    >

                                        <View style={[ {flex:1 , height: 200, backgroundColor: Colors.componentBackgroundColor} ]}>



                                        </View>

                                    </View>

                                )}
                            )}

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
})
