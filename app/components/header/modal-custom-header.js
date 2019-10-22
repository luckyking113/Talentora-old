import React, { Component } from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    PixelRatio,
    Text,
    View
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@themes/index';

class ModalCustomHeader extends Component {

    render() {

        const { navigate, goBack, state, self, title } = this.props
        // console.log('Modal Customer Header Props: ', this.props);
        return (

            <View style={[ styles.headerContainer ]}>
                <View style={[ styles.container ]}>
                    <TouchableOpacity
                        onPress={() => goBack()}
                        style={ [styles.leftBtn] }
                        >
                        <Icon name={'close'}
                            style={{fontSize:20}} />
                    </TouchableOpacity>
                    <View style={[ styles.centerTitle ]}>
                        <Text style={{textAlign:'center', fontSize:16, fontWeight:'bold', color: Colors.textBlack }}>
                            { title }
                        </Text>
                    </View>
                    {!this.props.noLeftBtn && <TouchableOpacity onPress={() => self._clearFilters() } style={ [styles.rightBtn] }>
                        <Text>Clear Filters</Text>
                    </TouchableOpacity> }
                </View>
            </View>

        )
    }
}

const styles = StyleSheet.create({

    headerContainer: {
        // flex: 1,
        // flexDirection: 'row',
        // backgroundColor: 'red',
        // height: 60,
        // paddingVertical: 20,
        
        paddingTop: 20,
        backgroundColor: 'white',
        height: 64,
        borderBottomColor: Colors.componentDarkBackgroundColor,
        // borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: 1,
        // paddingHorizontal: 10,
        shadowColor: 'rgba(0,0,0,0.8)',
        elevation: 4,
    },

    container: {
        flex: 1,
        flexDirection: 'row',
    },

    rightBtn: {
        position: 'absolute',
        right: 15,
        top:0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    leftBtn: {
        position: 'absolute',
        left: 15,
        top:0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    centerTitle: {
        position: 'absolute',
        left: 70,
        top:0,
        right: 70,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },

})

export default ModalCustomHeader
