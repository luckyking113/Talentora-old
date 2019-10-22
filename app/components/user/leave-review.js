import React, { Component } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import ButtonBack from '@components/header/button-back';
import ButtonTextRight from '@components/header/button-text-right';
import TagsSelect from '@styles/components/tags-select.style';
import { postApi } from '@api/request';
import { Helper, UserHelper, GoogleAnalyticsHelper } from '@helper/helper';
import _ from 'lodash';
import { Colors } from '@themes/index';

let _SELF = null;

const EMPLOYER_TYPE = 'employer';
const USER_TYPE = 'user';

export default class LeaveReview extends Component{
    constructor(props){
        super(props);
        let userInfo = this.props.navigation.state.params.user;
        let kinds = userInfo.attributes.kind.value.split(',');
        let talents = [];
        for(let i = 0; i<kinds.length; i++){
            talents.push({
                talentType:kinds[i],
                selected:false
            });
        }
        this.state={
            textExperience:{
                isRequired:false,
                val:''
            },
            goodAt:talents,
            userImage:userInfo.photo.preview_url_link,
            userName:Helper._getUserFullName(userInfo.attributes)
        }
        console.log('userInfo :', userInfo);
    }

    static navigationOptions = ({ navigation }) => ({ 
        headerTitle: 'Leave Review',
        headerLeft: (
            <ButtonBack
                isGoBack={ navigation }
                btnLabel= ""
            />),
        headerRight: (
            <TouchableOpacity style = {{paddingRight:10}}
                activeOpacity = {.8}
                onPress = { () => _SELF.submitReview() }>
                {(navigation.state.params && navigation.state.params.reviewing)?
                <ActivityIndicator size="small"
                    color="gray"/>
                :
                <Text>Submit</Text>}
            </TouchableOpacity>)
    });

    componentWillMount(){
        _SELF = this;
    }

    componentWillUnmount(){
        _SELF = null;
    }

    componentDidMount(){
        GoogleAnalyticsHelper._trackScreenView('Review');         
    }

    checkActiveTag = (item) => {
        return item.selected;
    }

    selectedTag = (item, index) => {
        let _tmp = this.state.goodAt;
        _tmp[index].selected = !_tmp[index].selected;
        this.setState({
            goodAt: _tmp
        });
    }

    submitReview = () => {
        const { goBack } = this.props.navigation;
        if(this.state.textExperience.val.trim() === ''){
            this.setState({
                textExperience:{
                    val:'',
                    isRequired:true
                }
            })
            return;
        }
        if(this.props.navigation.state.params.reviewing){
            return;
        }else{
            this.props.navigation.setParams({
                reviewing: true
            })
        }
        let type ='';
        for(let i = 0; i < this.state.goodAt.length; i++){
            if(this.state.goodAt[i].selected){
                type = type + this.state.goodAt[i].talentType + (i === this.state.goodAt.length - 1?'':',');
            }
        }
        let url = '/api/ratings/profiles';
        let data = {
            'review':this.state.textExperience.val,
            'target_user':this.props.navigation.state.params.user.user._id,
            'types':type,
            'is_endorsed':false
        };
        postApi(url, JSON.stringify(data)).then((response) => {
            if(response.code == 200){
                DeviceEventEmitter.emit('reloadReview',{isReload: true});
                goBack();
            }
            _SELF.props.navigation.setParams({
                reviewing: false
            })
        });
    }

    _checkIsEmployer = () => {
        try{
            return _.head(this.props.navigation.state.params.user.user.activeUserRoles).role.name == EMPLOYER_TYPE;
        }
        catch(e){
            return false;
        }
    }

    render(){

        let _placeHolder = 'Great talent to work with, was professional and able to perform as needed!';

        if(this._checkIsEmployer()){
            _placeHolder = 'Pleasure to work with';
        }
        console.log('_placeHolder == ',_placeHolder);
        return(
            <ScrollView style={styles.container}>
                <View style={styles.topSection}>
                    <Text style={styles.textCenter}>You are leaving a review for</Text>
                    <View style={styles.centerInRow}>
                        <Image style={styles.roundImage}
                            source={this.state.userImage?{uri:this.state.userImage}:require('@assets/icon_profile.png')}/>
                        <Text>{this.state.userName}</Text>
                    </View>
                </View>
                <View style={styles.subContainer}>
                    <Text>{this.state.userName} is good as...</Text>
                    <View style={styles.wrapRow}>
                        {this.state.goodAt.map((item,index) => {return(
                            <TouchableOpacity key={index}
                                activeOpacity={1}
                                onPress={() => this.selectedTag(item, index)}
                                style={[styles.tagsSelectNormal, this.checkActiveTag(item) && styles.tagsSelected]} >
                                <Text style={[styles.tagTitle, styles.btFontSize, this.checkActiveTag(item) && styles.tagTitleSelected]}>
                                    {Helper._capitalizeText(item.talentType)}
                                </Text>
                            </TouchableOpacity>
                        );})}
                    </View>
                    <View style={styles.line}/>
                    <Text style={{color: Colors.textBlack}}>How was your experience?</Text>
                    <TextInput placeholder={_placeHolder}
                        placeholderTextColor = { this.state.textExperience.isRequired ? 'red':'#B9B9B9' }
                        onChangeText={ (text) => { this.setState({textExperience:{
                            val:text
                        }}) } }
                        value = { this.state.textExperience.val }
                        multiline = { true }
                        style = { styles.inputContainer }
                        textAlignVertical={'top'} />
                </View>
            </ScrollView>
        );
    }
}



const styles = StyleSheet.create({
    ...TagsSelect,
    container:{
        flex:1,
        backgroundColor:'rgb(255,255,255)'
    },
    subContainer:{
        flex:1, 
        padding:20,
        backgroundColor:'rgb(255,255,255)'
    },
    topSection:{
        backgroundColor:'rgb(249, 249, 249)', 
        padding:10, 
        alignItems:'center' 
    },
    roundImage:{
        width:30, 
        height:30, 
        borderRadius:15, 
        marginRight:10
    },
    textCenter:{
        textAlign:'center', 
        marginBottom:10
    },
    centerInRow:{
        flexDirection:'row', 
        alignItems:'center'
    },
    wrapRow:{
        flexDirection:'row', 
        flexWrap:'wrap',
        marginBottom:20,
        marginTop:20
    },
    line:{
        backgroundColor:'#000000', 
        height:1, 
        opacity:.05,
        marginBottom:20,
        marginTop:20
    },
    inputContainer:{
        borderRadius:5,
        padding:10,
        marginTop:10,
        // color:'rgb(193,193,193)',
        color: Colors.textBlack,
        height:100,
        backgroundColor:'rgb(246,246,2467)',
        fontSize:14
    },
});