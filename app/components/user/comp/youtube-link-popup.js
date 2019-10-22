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
    InteractionManager,
    ActivityIndicator
} from 'react-native'

import { view_profile_category } from '@api/response'

import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';

import Styles from '@styles/card.style'
import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style'; 

import _ from 'lodash'

import { UserHelper, StorageData, Helper } from '@helper/helper';

const dismissKeyboard = require('dismissKeyboard');
const {width, height} = Dimensions.get('window')


class YouTubeLink extends Component {
    constructor(props){
        super(props);
        
        this.state ={
            // youtube_link: {
            //     val: '',
            //     isErrRequired: false,
            // },
            // caption: {
            //     val: '',
            //     isErrRequired: false,
            // }
        }

        console.log('YouTubeLink : ', this.props);

    }


    submitYoutubeLink = () => {
        
        if(_.isEmpty(this.props.youtube_link.val)){
            alert('Please input youtube url');
            return;
        }

        if(_.isEmpty(this.props.caption.val)){
            alert('Please input video title');            
            return;
        }

        this.props.submitLink(this.props.youtube_link.val, this.props.caption.val);

    }


    render() {        
         return (
            <Modal 
                visible={this.props.showYoutubePopup}
                animationType={"slide"}
                onRequestClose={() => {}}
                transparent={true}>
                <TouchableWithoutFeedback onPressOut1={() => {this.setModalVisible(false)}}  onPress={() =>  {dismissKeyboard()}}>
                    <View style={ {flex: 1, backgroundColor:"rgba(0,0,0,0.8)"} }>
                        <View style={{ flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                            
                            <TouchableOpacity activeOpacity={1} style={[styles.modalProp]} onPress={() =>  {dismissKeyboard()}}>
                                <View style={{flex: 1,padding:20,alignItems:'center', justifyContent: 'center'}}>
                                
                                    <View>

                                        <Text style={[{fontSize:16,fontWeight:'bold', textAlign: 'center',color:Colors.textBlack}]}>Please input youtube url</Text>

                                        <View style={[{ flex:1 ,paddingVertical: 15}]}>
                                            
                                            <TextInput 
                                                ref= {(el) => { this.txtLink = el; }}
                                                onChangeText={(txtLink) => this.props.self.setState({
                                                    youtube_link : {
                                                        val: txtLink
                                                    
                                                }})}
                                                value={this.props.youtube_link.val}
                                                placeholder="Youtube URL *"
                                                placeholderTextColor={ this.props.youtube_link.isErrRequired ? 'red' :"#B9B9B9"}
                                                returnKeyType="done"
                                                //keyboardType="email-address"
                                                autoCorrect={false}
                                                autoCapitalize = "none"
                                                onSubmitEditing={()=> this.refs.caption.focus() }
                                                style={[styles.input,this.props.youtube_link.isErrRequired && {color:'red'}, {marginBottom: 20}]}
                                                underlineColorAndroid = 'transparent'
                                                textAlignVertical = 'bottom'
                                            />
                                            
                                            <TextInput 
                                                ref= "caption"
                                                onChangeText={(caption) => this.props.self.setState({ 
                                                    caption:{
                                                        val:caption
                                                    
                                                }})}
                                                //value={this.props.caption.val}
                                                placeholder="Title *"
                                                placeholderTextColor={ this.props.caption.isErrRequired ? 'red' :"#B9B9B9"}
                                                returnKeyType="done"
                                                //keyboardType="email-address"
                                                autoCorrect={false}
                                                autoCapitalize = "none"
                                                onSubmitEditing={() => this.submitYoutubeLink()}
                                                style={[styles.input,this.props.caption.isErrRequired && {color:'red'}]}
                                                underlineColorAndroid = 'transparent'
                                                textAlignVertical = 'bottom'
                                            />

                                        </View>

                                        <View style={[{flex:1,flexDirection:'row', marginTop: 5, maxHeight: 40}]}>

                                            <TouchableOpacity activeOpacity={.8} style={[styles.btnContainer,{backgroundColor:'transparent'}]} onPress={()=>this.props.popupAction()}>
                                                <Text style={{color:Colors.buttonColor}}>Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity activeOpacity={.8} style={[styles.btnContainer,{marginRight:5}]} onPress={()=>this.submitYoutubeLink()}>
                                                { !this.props.loadingSubmitLink && <Text style={{color:'white'}}>Submit</Text> }
                                                { this.props.loadingSubmitLink && <ActivityIndicator color="white" animating={true} /> }
                                            </TouchableOpacity>

                                        </View>

                                    </View>

                                </View>
                            </TouchableOpacity>
                            
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }

}
var styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,

    modalProp:{
        flex: 1,
        maxWidth:310,
        maxHeight:240,
        backgroundColor:'white',
        borderRadius:8,
        overflow:'hidden'
    },
    input: {
        flex: 1,
        height: 30,
        width: 250,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.componentDarkBackgroundColor,
        backgroundColor: Colors.componentBackgroundColor,
    },
    btnContainer:{
        flex:1,
        backgroundColor:Colors.buttonColor,
        justifyContent:'center',
        alignItems: 'center',
        borderRadius:4,
        height:40
    },

});
export default YouTubeLink;                 