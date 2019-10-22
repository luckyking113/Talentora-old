// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback , Alert, StatusBar, ActivityIndicator } from 'react-native';

import { user_type } from '@api/response'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import Utilities from '@styles/extends/ultilities.style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BoxWrap from '@styles/components/box-wrap.style';

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import _ from 'lodash'

import { postApi } from '@api/request';
import { UserHelper, StorageData, GoogleAnalyticsHelper } from '@helper/helper';


const dismissKeyboard = require('dismissKeyboard');

function mapStateToProps(state) {
    // console.log(state)
    return {
        user: state.user,
        // navigation: state.navigation
    }
}

// export default class SignUpInfo extends React.Component {
class WhatAreYou extends Component{

    constructor(props){
        super(props);
        //your codes ....

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            user_type_select: '',  
            joining: false
        }

        const { navigate, goBack, state } = this.props.navigation;
        //console.log('Who Are You (DATA) : ', state.params);
    }

    static navigationOptions = ({ navigation }) => ({
            // title: '',
            headerVisible: false,
            headerLeft: null
        });

    checkActiveTag = (item) => {
        // console.log(item);
        return this.state.user_type_select.type == item.type;
    }

    selectedTag = (item) => {
        // console.log(item);
        this.setState({
            user_type_select: item
        })
    }

    continue() {
        // Alert.alert('login now');
        // dismissKeyboard();

        if(!this.state.user_type_select.role){
            Alert.alert('Please select one type');
            return;
        }

        if(!this.state.joining){

            const { navigate, goBack, state } = this.props.navigation;

            // merge info from who-are-you signup info
            var signUpInfo = _.extend({
                talent_type: this.state.user_type_select,
            }, state.params ? state.params.sign_up_info : {});
        
            this.setState({
                joining: true
            });
            
            // **** pls dont fucking delete my beauty code. !! get out of my code ****

            console.log('Role : ',this.state.user_type_select.role);
            
            let that = this;  

            let API_URL = '/api/users/me/roles/change';

            postApi(API_URL,
                JSON.stringify({
                    "role": that.state.user_type_select.role
                })
            ).then((response) => {
                console.log('Response Object: ', response);
                if(response.status=="success"){
                    // console.log('Response Object: ', response);
                    // that._saveUserData(response);

                    let _result = response.result;

                    let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_result)); 
                    UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                    _userData.then(function(result){
                        console.log('complete save sign up process 2'); 
                    });

                    if(that.state.user_type_select){
                        if(that.state.user_type_select.type == 'talent-seeker')
                            navigate('TalentSeekerCategory', { sign_up_info: signUpInfo});
                        else
                            navigate('TalentCategory', { sign_up_info: signUpInfo});
                    }

                }
                that.setState({
                    joining: false
                });
            })

        }

    }

    componentDidMount(){
        GoogleAnalyticsHelper._trackScreenView('Sign Up - Who Are You');                                 
    }
 
    render() {
        
        return (    

            <View style={[styles.container,styles.mainScreenBg, styles.paddingTopNav]}>
                {/*<StatusBar barStyle="light-content" />*/}
                
                <View style={[styles.mainPadding]}>

                    <Text style={[styles.blackText, styles.btFontSize]}>
                        Who are you?
                    </Text>

                    {/*<Text style={[styles.grayLessText, styles.marginTopXS]}>
                        You may only select one. This can be easily changed later in your account settings.
                    </Text>*/}
                    <Text style={[styles.grayLessText, styles.marginTopXS]}>
                        You may only select one. 
                    </Text>

                    <View style={[styles.tagContainer,styles.marginTopLG]}> 

                        {user_type.map((item, index) => {
                            {/*console.log(item);*/}
                            return (
                        
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity = {0.9}
                                    style={[styles.boxWrapItem,styles.myWrapWhoAreYou,this.checkActiveTag(item) && styles.tagsSelected]} 
                                    onPress={ () => this.selectedTag(item) }
                                >
                                    <Text style={[styles.tagTitle, styles.btFontSize, this.checkActiveTag(item) && styles.tagTitleSelected]}>
                                        {item.display_name}
                                    </Text>

                                    {this.checkActiveTag(item) && (
                                       
                                        <View style={[styles.absoluteBox,{backgroundColor: 'transparent'}]}>
                                            <View style={[styles.tagStatusContainer,styles.mainHorizontalPadding]}> 
                                                <Icon
                                                    name="check"
                                                    style={[ styles.iconCheck ]} 
                                                />
                                                <Text style={[styles.tagSelectStatus]}>
                                                    Selected
                                                </Text>
                                            </View>
                                        </View> 
                                    )
                                        
                                    }

                                    
                                </TouchableOpacity>    
                  
                            )
                        })}

                    </View>

                </View>
                
                <View style={styles.absoluteBox}>
                    <View style={[styles.txtContainer,styles.mainHorizontalPadding]}>

                        <TouchableOpacity style={[styles.flatButton]} onPress={() => this.continue() }>
                                {   
                                    !this.state.joining ? <Text style={[styles.btn, styles.btFontSize]}>Continue</Text> : <ActivityIndicator color="white" animating={true} /> 
                                }
                        </TouchableOpacity>

                    </View>
                </View>

            </View>
        );
    }
}


var styles = StyleSheet.create({ ...FlatForm, ...Utilities, ...TagsSelect, ...BoxWrap,
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

});

export default connect(mapStateToProps, AuthActions)(WhatAreYou)
