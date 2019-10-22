import { StyleSheet } from 'react-native'
import { Colors } from '@themes/index'

export const transparentHeaderStyle = {
    backgroundColor: Colors.screenBg,   
    // backgroundColor: Colors.secondaryCol,   
    borderBottomColor: 'transparent',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    shadowColor: 'transparent',
    elevation: 0,
}

export const titleStyle = {
    fontSize: 16,
    color: '#333',
    // fontFamily: ''
}

export const defaultHeaderStyle = {
    backgroundColor: Colors.screenBg,   
    // backgroundColor: Colors.secondaryCol,
    // flex: 1,
    // justifyContent: 'center',    
    // alignItems: 'center',   
    borderBottomColor: 'transparent',
    borderBottomWidth: 0,
    // paddingHorizontal: 10,
    shadowColor: 'transparent',
    elevation: 0,
}

export const defaultHeaderWithShadowStyle = {
    backgroundColor: Colors.screenBg,   
    // backgroundColor: Colors.secondaryCol,
    // flex: 1,
    // justifyContent: 'center',    
    // alignItems: 'center',   
    borderBottomColor: Colors.lineColor,
    // borderBottomWidth: 0,
    // paddingHorizontal: 10,
    // shadowColor: 'transparent',
    // elevation: 0,
}

