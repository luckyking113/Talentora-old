import React, { Component} from 'react'
import { connect } from 'react-redux'

// import {
//     addNavigationHelpers
// } from 'react-navigation';

import * as AuthActions from '@actions/authentication'

import AllJobPosted from '@components/job/talent-seeker/post-job-list' // for talent seeker (employer)
import AvailableJobApplied from '@navigators/tabs/job-tabs' // for talent (user)

import { StyleSheet, Text, View, AsyncStorage, Alert, TouchableOpacity,ScrollView, TextInput, Modal,Picker } from 'react-native';
import { transparentHeaderStyle, defaultHeaderStyle } from '@styles/components/transparentHeader.style';

import Authenticate from '@components/authentication/authenticate';
import LoadingScreen from '@components/other/loading-screen'; 
import OneSignal from 'react-native-onesignal'; 

import { UserHelper, StorageData, Helper } from '@helper/helper';

import _ from 'lodash'
import { Colors } from '@themes/index';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Styles from '@styles/card.style'
import Utilities from '@styles/extends/ultilities.style';
import BoxStyles from '@styles/components/box-wrap.style';
import BoxWrap from '@styles/components/box-wrap.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';

import Tabs from '@styles/tab.style';

import { headerStyle, titleStyle } from '@styles/header.style'
import ButtonRight from '@components/header/button-right'
import ButtonLeft from '@components/header/button-left'
import ButtonBack from '@components/header/button-back'

import { talent_category } from '@api/response';
import { talent_seeker_category} from '@api/response';
import { ethnicities, hair_colors, eye_colors, languages, ages,heights,weights } from '@api/response'

import CountryPicker, {getAllCountries} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info';
import MinMaxPicker from '@components/ui/minMaxPicker';
import ALL_COUNTRIES from '@store/data/cca2';

// import AvailableJob from '@components/job/talent/available-job'
// import AppliedJob from '@components/job/talent/applied-job'

// var ScrollableTabView = require('react-native-scrollable-tab-view'); 

// import ScrollableTabView, {DefaultTabBar } from 'react-native-scrollable-tab-view';

let _SELF = null;

class feedBack extends Component {

    constructor(props){
        super(props);
        //your codes ....
        this.state = {  
            modalVisible: true,
        }
    }

    // static navigationOptions = ({ navigation }) => {
    //     // console.log('navigation : ', navigation);
    //     _SELF = navigation;
    //     // console.log('_SELF NAV: ',_SELF);
    //     return ({
    //         headerStyle: defaultHeaderStyle,  
    //         // headerTitleStyle :{textAlign: 'center',alignSelf:'center'}, 
    //         // headerVisible: true,
    //         // headerTitle: UserHelper._isEmployer() ? 'Posted Jobs' : 'Jobs',
    //         headerTitle: 'Filters',
    //         headerLeft: (<ButtonBack
    //         isGoBack={ navigation }
    //         btnLabel= ""
    //     />),
    //         headerRight: UserHelper._isEmployer() ? (
                
    //             <View style={[styles.flexVerMenu, styles.flexCenter]}>

    //                 <ButtonRight
    //                     text={"Clear Filters"}
    //                     style={{marginRight: 10}}   
    //                     navigate={navigation.navigate}
    //                     // to="CreatePostJob"
    //                 />

    //             </View>
    //         ) : null,
    //     })};

    componentDidMount() {

    }

    onTabPress = (_tabIndex) => {

    }

    applyFeedBack =()=>{
        console.log("Apply Filter selectedGender",this.state);
    }   
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    closeModal=()=>{
        let that=this;
        setTimeout(function(){
            that.setState({modalVisible:false})
        }, 500);
    }
    render() {
        // console.log(this.props.user, this.state.userData);
         const { navigate, goBack } = this.props.navigation;

            return (
                // <View style={{flex:1, backgroundColor:'white'}}>
                //     <View style={{flexDirection:'row', marginTop:30, paddingLeft:20, paddingBottom:20, marginBottom:1,borderBottomWidth:1,borderBottomColor:'grey'}}>
                //         <TouchableOpacity
                //             onPress={() => goBack()}
                //             activeOpacity={.8}>
                //             <Icon name={'close'}
                //                 style={{fontSize:20}} />
                //         </TouchableOpacity>
                //         <Text style={{flex:1, textAlign:'center', fontSize:16, fontWeight:'bold'}}>
                //             Filters
                //         </Text>
                //         <TouchableOpacity>
                //             <Text>Clear Filters</Text>
                //         </TouchableOpacity>
                //     </View>
                //     <View>
                //         <Text style={[{fontSize:15}]}>How was your experience?</Text>
                //         <View style={[{flexDirection:'row'}]}>
                //             <Icon name={"sentiment-dissatisfied"} style={[ styles.languageNavIcon,{fontSize:20}]} />
                //             <Icon name={"sentiment-neutral"} style={[ styles.languageNavIcon ,{fontSize:20}]} />
                //             <Icon name={"sentiment-satisfied"} style={[ styles.languageNavIcon ,{fontSize:20}]} />
                //         </View>
                //     </View>
                    
                // </View>

                // <View style={{flex:1}}>
                //     <Modal 
                //         animationType={"slide"}
                //         transparent={false}
                //         visible={this.state.modalVisible}>
                //         <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center',alignItems: 'center'}}>
                            
                //                 <TouchableOpacity style={{width:300,height:300,backgroundColor:'pink'}} onPressOut={() => {this.setModalVisible(false)}}>
                //                     <View style={{
                //                         flex: 1,
                //                         flexDirection: 'column',
                //                         justifyContent: 'center',
                //                         alignItems: 'center'}}>
                                       
                //                             <Text style={[{fontSize:15}]}>How was your experience?</Text>
                //                             <View style={[{flexDirection:'row'}]}>
                //                                 <Icon name={"sentiment-dissatisfied"} style={[ styles.languageNavIcon,{fontSize:20}]} />
                //                                 <Icon name={"sentiment-neutral"} style={[ styles.languageNavIcon ,{fontSize:20}]} />
                //                             <Icon name={"sentiment-satisfied"} style={[ styles.languageNavIcon ,{fontSize:20}]} />
                //                             </View>
                //                         </View>
                //                         <TouchableOpacity onPress={()=>{this.closeModal()}}>
                //                             <Text>Don't submit listing</Text>
                //                         </TouchableOpacity>
                //                 </TouchableOpacity>
                            
                //         </View>
                //     </Modal>
                // </View>
                <View style={{marginTop: 22}}>
                    <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {}}
                    >
                    <View style={{marginTop: 22}}>
                    <View>
                        <Text>Hello World!</Text>

                        <TouchableOpacity onPress={() => {
                        this.setModalVisible(!this.state.modalVisible)
                        }}>
                        <Text>Hide Modal</Text>
                        </TouchableOpacity>

                    </View>
                    </View>
                    </Modal>

                    <TouchableOpacity onPress={() => {
                    this.setModalVisible(true)
                    }}>
                    <Text>Show Modal</Text>
                    </TouchableOpacity>

                </View>
            );

        
    }
}

function mapStateToProps(state) {
    // console.log('main state',state);
    return {
        // user: state.user,
        // navigation: state.navigation,
        // nav: state.navigation
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...Tabs, ...FlatForm, ...TagsSelect, ...BoxWrap,
    txtContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch'
    },
    btn: {
        textAlign: 'center',
        color: "white",
        fontWeight: "700",
    },
    btnContainer: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 15,
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.buttonColor
    },
    titleBold:{
        fontWeight:'bold'
    },
    inputBox:{
        flex:0.6,
        textAlign:'right',
        paddingVertical: 0
    },
    itemPicker:{
        backgroundColor: 'transparent',
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'stretch',
        paddingLeft: 10,
        minHeight:20
    },
    pickerTitleContainer:{
        flexDirection: 'row',
        backgroundColor: Colors.componentDarkBackgroundColor,
        height: 35,
    },
    languageNav:{
        flexDirection : 'row', 
        height : 50, 
        paddingBottom: 15, 
        paddingTop: 15, 
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowRadius: 3,
        shadowOpacity: 0.2
    },
    languageNavIcon:{
         color:'black',
         fontSize: 20,  
         left: 17
    },
    languageNavTitle:{
        flex: 1,
        // backgroundColor: 'yellow',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    languageNavStatus:{
        flex: 1,
        // backgroundColor: 'red',
        textAlign: 'right',
        right: 17,
        fontSize: 15,
        color: 'red'
    }
})

export default connect(mapStateToProps, AuthActions)(feedBack)
