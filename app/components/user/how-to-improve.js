import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as DetailActions from '@actions/detail'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StatusBar,
    Alert,
    Picker,
    Platform,
    Modal,
    Dimensions,
    InteractionManager
} from 'react-native'

import { view_profile_category } from '@api/response'


import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style'; 

import ButtonRight from '@components/header/button-right'
import ButtonTextRight from '@components/header/button-text-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import { UserHelper, StorageData, Helper } from '@helper/helper';
function mapStateToProps(state) {
    // console.log('wow',state)
    return {
        user: state.user,
    }
}
class HowToImprove extends Component {
    constructor(props){
        super(props);
    }
    static navigationOptions = ({ navigation }) => ({ 
        // title: '', 
        headerVisible: false,
        headerTitle: 'Setting',
        headerLeft: (<ButtonBack
            isGoBack={ navigation }
            btnLabel= ""
        />),
    });
    render() {        
         return (
            <View>
                <Text>Hello HOW TO IMPROVE</Text>
            </View>
        );
    }
}
var styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,

});
export default connect(mapStateToProps)(HowToImprove)                  