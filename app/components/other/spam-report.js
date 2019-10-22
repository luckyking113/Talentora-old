import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Modal, Alert } from 'react-native';
import { postApi } from '@api/request';
import Styles from '@styles/card.style';
import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Utilities from '@styles/extends/ultilities.style';
import IconAwesome from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

const dismissKeyboard = require('dismissKeyboard');

export default class SpamReport extends Component{

    constructor(props){
        super(props);
        this.state = {
            selectIcon: [{selected: true, text: "It's annoying or not interesting."},
            {selected: false, text: "I think it shouldn't be on Talentora."},
                {selected: false, text: "It's spam."}
            ],
            description: '',
        }
    }

    sendReport = () => {
        dismissKeyboard();
        if(_.isEmpty(this.state.description)){
            Alert.alert('Report', 'Please input description');
            return;
        }
        let  url = '';
        if(this.props.type == 'video')
            url = '/api/reports/media/' + this.props.reportId;
        else if(this.props.type == 'user')
            url = '/api/reports/users/' + this.props.reportId;
        else if(this.props.type == 'post')
            url = '/api/reports/posts/' + this.props.reportId;        
        let reportType = '';
        for(let data of this.state.selectIcon){
            if(data.selected){
                reportType = data.text;
                break;
            }
        }
        postApi(url, JSON.stringify({
            report_type: reportType,
            comment: this.state.description
        })).then((response) => {
            console.log('send report', url, response);            
        });
        this.setModalVisible(false);
    }

    setSelectedOption = (selectedIndex) => {
        this.setState({
            selectIcon: [{selected: 1 == selectedIndex, text: "It's annoying or not interesting."},
                {selected: 2 == selectedIndex, text: "I think it shouldn't be on Talentora."},
                {selected: 3 == selectedIndex, text: "It's spam."}
        ]
        });
    }

    setModalVisible = (visible) => {
        let that = this;
        if(!visible){
            setTimeout(function() {
                that.setSelectedOption(1);
                that.setState({
                    description: ''
                });
            }, 500);
        }
        this.props.setModalVisible(visible);
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Modal 
                    visible={this.props.visible}
                    animationType={"slide"}
                    onRequestClose={() => {}}
                    transparent={true}>
                    <TouchableWithoutFeedback onPress={() =>  {dismissKeyboard()}}>
                        <View style={ {flex: 1, backgroundColor:"rgba(0,0,0,0.8)"} }>
                            <View style={{ flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                                <TouchableOpacity activeOpacity={1} style={[styles.modalProp]} onPress={() =>  {dismissKeyboard()}}>
                                    <View style={{flex: 1,padding:30,alignItems:'center'}}>
                                        <Text style={[{fontSize:16,fontWeight:'bold',color:Colors.textBlack, marginBottom: 10}]}>What's going on?</Text>
                                        <View style={{flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center'}}>
                                            <TouchableOpacity   
                                                style={{ padding: 5 }}
                                                onPress={ () => this.setSelectedOption(1) }
                                                activeOpacity={.8} >
                                                <IconAwesome name = { this.state.selectIcon[0].selected?'dot-circle-o':'circle-o' }
                                                    style = {{ fontSize: 20, color: this.state.selectIcon[0].selected?Colors.buttonColor:'black' }}/>
                                            </TouchableOpacity>
                                            <Text>It's annoying or not interesting.</Text>
                                        </View>
                                        <View style={{flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center'}}>
                                            <TouchableOpacity   
                                                style={{ padding: 5 }}
                                                onPress={ () => this.setSelectedOption(2) }
                                                activeOpacity={.8} >
                                                <IconAwesome name = { this.state.selectIcon[1].selected?'dot-circle-o':'circle-o' }
                                                    style = {{ fontSize: 20, color: this.state.selectIcon[1].selected?Colors.buttonColor:'black' }}/>
                                            </TouchableOpacity>
                                            <Text>I think it shouldn't be on Talentora.</Text>
                                        </View>
                                        <View style={{flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center'}}>
                                            <TouchableOpacity   
                                                style={{ padding: 5 }}
                                                onPress={ () => this.setSelectedOption(3) }
                                                activeOpacity={.8} >
                                                <IconAwesome name = { this.state.selectIcon[2].selected?'dot-circle-o':'circle-o' }
                                                    style = {{ fontSize: 20, color: this.state.selectIcon[2].selected?Colors.buttonColor:'black' }}/>
                                            </TouchableOpacity>
                                            <Text>It's spam.</Text>
                                        </View>
                                        <TextInput 
                                            onChangeText={(txtDescription) => this.setState({description: txtDescription})}
                                            //returnKeyType="done"
                                            //onSubmitEditing={() => this._closeJob()}
                                            placeholder={"Describe your reason here (Required)."}
                                            editable = {true} 
                                            numberOfLines = {4} 
                                            style={[styles.inputBox, styles.textInputMultiLine]} 
                                            underlineColorAndroid = 'transparent' 
                                            value={this.state.description} 
                                            multiline={true}
                                            textAlignVertical={'top'}>
                                        </TextInput>
                                        <View style={[{flexDirection:'row',marginVertical:20}]}>
                                            <TouchableOpacity style={[styles.btnContainer,{marginRight:5}]} onPress={()=>this.sendReport()}>
                                                <Text style={{color:'white'}}>Submit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.btnContainer,{backgroundColor:'transparent'}]} onPress={()=>this.setModalVisible(false)}>
                                                <Text style={{color:Colors.buttonColor}}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>   
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        );
    }

}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...FlatForm, ...TagsSelect, ...BoxWrap,
    modalProp:{
        width:300,
        height:350,
        backgroundColor:'white',
        borderRadius:8,
        overflow:'hidden'
    },btnContainer: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.buttonColor
    },textInputMultiLine:{
        width: 240,
        height:100,
        borderRadius:4,
        backgroundColor:Colors.componentBackgroundColor,
        textAlign:'auto',
        padding:10,
        fontSize:15,
        marginTop: 10
    }
});