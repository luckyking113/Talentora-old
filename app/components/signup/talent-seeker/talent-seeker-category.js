// import React from 'react';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AuthActions from '@actions/authentication'

import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback , Alert, StatusBar,
ActivityIndicator } from 'react-native';

import { talent_seeker_category } from '@api/response'

import ButtonBack from '@components/header/button-back'

import { Colors } from '@themes/index';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import Utilities from '@styles/extends/ultilities.style';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { transparentHeaderStyle, titleStyle } from '@styles/components/transparentHeader.style'

import _ from 'lodash'

import { UserHelper, StorageData, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { postApi, putApi } from '@api/request';

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
        const { navigate, goBack, state } = this.props.navigation;
        console.log('Params : ', state.params);

        // this.selectedTag = this.selectedTag.bind(this);
        this.state = {
            talent_seeker_cate : _.cloneDeep(talent_seeker_category),
            user_type_select: '',
            joining: false,
        }
        // console.log('User Info : ',state.params);
        // console.log('Back button: ', state.params);    
    }

    static navigationOptions = ({ navigation }) => ({

            // title: '',
            headerVisible: true,
            headerLeft: navigation.state.params.noBackButton ? null : (<ButtonBack
                isGoBack={ navigation }
                btnLabel= "Who are you"
            />), 
        });

    checkActiveTag = (item) => {
        return item.selected;
    }

    selectedTag = (item, index) => {
        
        let _tmp = this.state.talent_seeker_cate;
        _tmp[index].selected=!_tmp[index].selected;
        this.setState({
            talent_seeker_cate: _tmp
        });

    }

    getTalentSelected = () => {
        // let _talentCate = this.state.talent_cate
        return _.filter(this.state.talent_seeker_cate, function(_item) { return _item.selected; });
    }

    continue() {
        
        let that = this;
        const { navigate, goBack, state } = this.props.navigation;

        // merge info from who-are-you signup info
        var signUpInfo = _.extend({
            talent_category: this.getTalentSelected(),
            // from_route_name : 'Which talent seeker are you?'
        }, state.params ? state.params.sign_up_info : {});

        if(signUpInfo.talent_category.length > 0){

            that.setState({
                joining: true
            });

            let API_URL = '/api/users/me/customs';

            let talentCateStringArray = _.map(signUpInfo.talent_category, function(v, k) {
                return v.category;
            });

            // console.log('talentCateStringArray : ', talentCateStringArray);

            putApi(API_URL,
                JSON.stringify({
                    "kind": {
                        "value": talentCateStringArray,
                        "type":"register-category",
                        "privacy_type": "only-me"
                    },
                })
            ).then((response) => {
                console.log('Response Object: ', response);
                if(response.status=="success"){

                    let _result = response.result;

                    let _userData =  StorageData._saveUserData('SignUpProcess',JSON.stringify(_result)); 
                    UserHelper.UserInfo = _result; // assign for tmp user obj for helper
                    _userData.then(function(result){
                        console.log('complete save sign up process 3'); 
                    });

                    navigate('TalentSeekerWelcome',{ sign_up_info: signUpInfo});
                }
                that.setState({
                    joining: false
                });
            })

        }else{
            Alert.alert('Please choose at least one type');
        }
    }

    componentDidMount() {
        GoogleAnalyticsHelper._trackScreenView('Sign Up - Category - Talent Seeker');         
    }

    render() {
        return (    

            <View style={[ styles.container,styles.mainScreenBg, styles.paddingTopNav ]} onPress={() =>  dismissKeyboard()}>
                
                <View style={[styles.mainPadding]}>

                    <Text style={[styles.blackText, styles.btFontSize]}>
                       Which talent seeker are you?
                    </Text>

                    <Text style={[styles.grayLessText, styles.marginTopXS]}>
                        You may select more than one option.
                    </Text>

                    <View style={[styles.tagContainerNormal,styles.marginTopLG]}> 

                        {this.state.talent_seeker_cate.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    activeOpacity = {0.9}
                                    key={ index } 
                                    style={[styles.tagsSelectNormal, this.checkActiveTag(item) && styles.tagsSelected]} 
                                    onPress={ () => this.selectedTag(item, index) }
                                >
                                    <Text style={[styles.tagTitle, styles.btFontSize, this.checkActiveTag(item) && styles.tagTitleSelected]}>
                                        {item.display_name}

                                        {item.selected}
                                    </Text>
                                    
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


var styles = StyleSheet.create({ ...FlatForm, ...Utilities, ...TagsSelect,
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
