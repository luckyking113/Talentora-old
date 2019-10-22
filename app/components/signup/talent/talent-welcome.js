// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, Picker, TouchableWithoutFeedback,
    Modal} from 'react-native';

import ButtonBack from '@components/header/button-back'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import Utilities from '@styles/extends/ultilities.style';
import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style';

import _ from 'lodash'


var func = require('@helper/validate');
const Item = Picker.Item;

const dismissKeyboard = require('dismissKeyboard');

function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component { 
class TalentSeekerWelcome extends Component{
    
     constructor(props){
        
        super(props);

        const { navigate, goBack, state } = this.props.navigation;
        console.log('User Info : ',state.params);
        let _tmpFbDat = {
            firstname : '',
            lastname : '',
            gender : '',
        }
        if(state.params.sign_up_info.fb_data){
            _tmpFbDat = {
                firstname : state.params.sign_up_info.fb_data.profile.first_name,
                lastname : state.params.sign_up_info.fb_data.profile.last_name,
                gender : state.params.sign_up_info.fb_data.profile.gender,
            }
        }

        this.state = {
            firstname: {
                val: _tmpFbDat.first_name || '',
                isErrRequired: false
            },
            lastname: {
                val: _tmpFbDat.last_name || '', 
                isErrRequired: false
            },
            gender: {
                val: this.getValueGender(_tmpFbDat.gender) || '',
                isErrRequired: false
            },             
            age: {
                val: '',
                isErrRequired: false
            },
            selectedGender: this.getValueGender(_tmpFbDat.gender) || 'Gender *',
            mode: Picker.MODE_DIALOG,
            modalVisible: false,      
        };

     }

    static navigationOptions = ({ navigation }) => ({
        // title: '',
        headerVisible: true,
        headerLeft: (<ButtonBack
            isGoBack={ navigation }
            btnLabel= "Which talent are you"
        />),
    });


    getValueGender = (_val) => {
        if(_val == 'M')
            return 'Male';
        else
            return 'Female';
    }

    continue() {
        // Alert.alert('login now');
        // dismissKeyboard();
        if(func(this.state.firstname,'firstname')){
            this.setState({
                firstname: {
                    isErrRequired:true
                }
            })
        }
        if(func(this.state.lastname,'lastname')){
            this.setState({
                lastname:{
                    isErrRequired:true
                }
            })
        }
        if(func(this.state.age,'age')){
            this.setState({
                age: {
                    isErrRequired:true
                }
            })
        }
        let that=this;
        // if(func(this.state.selectedGender,'gender')){
        //     this.setState({
        //         modalVisible:true
        //     })
        // }
        setTimeout(function(){
            // if(!that.state.firstname.isErrRequired && !that.state.lastname.isErrRequired && !that.state.age.isErrRequired ){
                const { navigate, goBack, state } = that.props.navigation;

                var signUpInfo = _.extend({
                    firstname: that.state.firstname.val,
                    lastname: that.state.lastname.val,
                    age: that.state.age.val,
                }, state.params.sign_up_info);

                navigate('TalentDetail', { sign_up_info: signUpInfo});
            // }
	    }, 50);                
    }

    onValueChange = (key, value) => {
        const newState = {};
        newState[key] = value;
        this.setState(newState);
    };

    // state = {
    //     selectedGender: 'Gender *',
    //     mode: Picker.MODE_DIALOG,
    //     modalVisible: false,
    // };

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    focusNextField = (nextField) => {
        this.refs[nextField].focus();
    };

    render() {

        return (    
            <TouchableWithoutFeedback onPress={() =>  {dismissKeyboard()}}>
                <View style={[styles.container,styles.mainScreenBg, styles.paddingTopNav]} >

                    <View style={[styles.mainPadding]}>

                        <View style={[styles.marginBotMD]}>
                            <Text style={[styles.blackText, styles.btFontSize]}>
                                Welcome to Talentora
                            </Text>

                            <Text style={[styles.grayLessText, styles.marginTopXS]}>
                                Before we begin, tell us more about yourself.
                            </Text>
                        </View>

                        <TextInput 
                            onChangeText={(txtFirstname) => this.setState({firstname:{
                                val:txtFirstname   
                            }})}
                            value={this.state.firstname.val}                     
                            placeholder="First Name *"
                            placeholderTextColor={ this.state.firstname.isErrRequired ? 'red' :"#B9B9B9"}
                            returnKeyType="next"
                            keyboardType="email-address"
                            autoCorrect={false}
                            onSubmitEditing={() => this.focusNextField('2')}
                            style={styles.flatInputBox}
                            underlineColorAndroid = 'transparent'
                            textAlignVertical = 'bottom'
                        />

                        <TextInput 
                            onChangeText={(txtLastname) => this.setState({lastname:{

                                val:txtLastname   
                            }})}
                            value={this.state.lastname.val}                     
                            placeholder="Last Name *"
                            placeholderTextColor={ this.state.lastname.isErrRequired ? 'red' :"#B9B9B9"}
                            returnKeyType="next"
                            style={styles.flatInputBox}
                            ref="2"
                            onSubmitEditing={() => this.setModalVisible(true) }
                            underlineColorAndroid = 'transparent'
                            textAlignVertical = 'bottom'
                            autoCorrect = {false}
                        />

                        <Modal
                            animationType={"slide"}
                            transparent={false}
                            onRequestClose={() => {}}
                            visible={this.state.modalVisible}>
                            
                            <View style={{marginTop: 22}}>
                                <View>
                                    <Picker
                                        selectedValue={this.state.selectedGender}
                                        onValueChange={this.onValueChange.bind(this, 'selectedGender')}>
                                        <Item label="please select gender" value=""/>
                                        <Item label="Male" value="Male"/>
                                        <Item label="Female" value="Female" />
                                    </Picker>

                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setModalVisible(!this.state.modalVisible);
                                            this.focusNextField('4')
                                        }}>
                                        <Text>Close Modal</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        <TouchableOpacity
                            onPress={() => {
                                this.setModalVisible(true)
                            }}>
                            <View style = {styles.genderPicker}>
                                <Text placeholder='Gender *' style={ [{fontSize: 17, color: "#B9B9B9"}] }>{this.state.selectedGender}</Text>
                            </View>
                        </TouchableOpacity>

                        <TextInput 
                            onChangeText={(txtAge) => this.setState({age:{

                                val:txtAge   
                            }})}
                            value={this.state.age.val}                     
                            placeholder="Age *"
                            placeholderTextColor={ this.state.age.isErrRequired ? 'red' :"#B9B9B9"}
                            returnKeyType="go"
                            style={[styles.flatInputBox]}
                            ref="4"
                            onSubmitEditing={()=>this.continue()}
                            underlineColorAndroid = 'transparent' 
                            textAlignVertical = 'bottom'                                
                            keyboardType="numeric" 

                        />

                    </View>
                    
                    <View style={styles.absoluteBox}>
                        <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                            <TouchableOpacity style={[styles.flatButton,]} onPress={() => this.continue() }>
                                <Text style={[styles.btn, styles.btFontSize]}>Continue</Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        );
    }
}


var styles = StyleSheet.create({ ...FlatForm, ...Utilities,
    container: {
        flex: 1,
        // padding: 20
    },

    btn: {
        textAlign: 'center',
        color: "white",
        fontWeight: "700",
    },

    help: {
        justifyContent:'center',
        flexDirection: 'row',
        marginTop: 10,
    },

    forget:{
        color: Colors.textColorDark,  
    },

    gethelp:{
        fontWeight: 'bold',
        color: Colors.textColorDark,
    },


    icon:{
        fontSize: 25,
        fontWeight: 'bold',
        color: Colors.textColorDark,
    },

    fbContainer:{
        // flex: 1,
        justifyContent:'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 10,
    },

    fbLogin:{
        fontWeight: 'bold',
        color: Colors.textColor,
        marginLeft: 10,
    },

    txtContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch'
    },
    
    genderPicker:{
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        marginBottom: 10,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 12,
    },

});

export default connect(mapStateToProps, AuthActions)(TalentSeekerWelcome)
