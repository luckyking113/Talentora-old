import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as AppOption from '@actions/app-option'

import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity
} from 'react-native'

import { UserHelper, StorageData, NotificationHelper, ChatHelper, Helper, GoogleAnalyticsHelper } from '@helper/helper';

import { Colors } from '@themes/index';

import ButtonLeft from '@components/header/button-left'
import Utilities from '@styles/extends/ultilities.style'; 
import ListItem from '@styles/components/list-item.style'; 
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import _ from 'lodash'
let pre;
const { width, height } = Dimensions.get('window') 
class Intro extends Component {

    constructor(props){
        super(props);

        this.state = {
            header:[
                {
                    imgSrc:require('@assets/intro/create.jpg'),
                    mainTitle:'GPS TRACKING',
                    subTitle:'Allows our users to see where they are located and asks you where you want to go.'
                },
                {
                    imgSrc:require('@assets/intro/discover.jpg'),
                    mainTitle:'HOT SPOT',
                    subTitle:'Don\'t know where to go for Dinner? Our HOT SPOT feature\'s will provide you with a list of the newest vibrant places to visit.'
                },
                {
                    imgSrc:require('@assets/intro/jobs.jpg'),
                    mainTitle:'TAXI METER',
                    subTitle:'Our meter will show you the cost you pay before you confirm a driver to pick you up.'
                },
                {
                    imgSrc:require('@assets/intro/review.jpg'),
                    mainTitle:'TOUR PACKAGES',
                    subTitle:'Allow our tour guided drivers show you around town in style. See Phnom Penh\'s history come to life, by booking a tour with us.'
                },
                {
                    imgSrc:require('@assets/intro/videos.jpg'),
                    mainTitle:'FREE WIFI',
                    subTitle:'With our FREE WIFI, you can now upload your pictures and share with your friends. Don’t forget to use the hashtag #GoTukTuk while your exploring the city.',
                    isFinish: true
                },

            ],
            allIcon:[
                {
                    page:'0',
                    isSelected:true
                },
                {
                    page:'1',
                    isSelected:false
                },
                {
                    page:'2',
                    isSelected:false
                },
                {
                    page:'3',
                    isSelected:false
                },
                {
                    page:'4',
                    isSelected:false
                }
            ],
        }

        // console.log('intro this props :', this.props);

    }

	static navigationOptions = ({ navigation }) => ({
        header: null,
        tabBarVisible: false,
        headerLeft: null
    });
    
    _getStart = () => {
        // const { navigate, goBack, state } = this.props.navigation;
        // navigate('LogIn');
        let _userInfo = _.cloneDeep(UserHelper.UserInfo);

        _.extend({
            isVisitedTutorialScreen: true,
        }, _userInfo)
        // console.log('_userInfo', _userInfo);

        UserHelper.UserInfo = _userInfo;

        this.props.setAppOption({
            isReadTutorialScreen: true
        });
        
        // setTimeout(function() {
        //     console.log('This Props', this.props)
        // }, 2000);
        
    }

    componentDidMount(){
        // this.props.navigation.navigate('DrawerOpen'); // open drawer
    }
    handleScroll=(event) => {
        // console.log("handle scroll event",event.nativeEvent);
        let contentOffset = event.nativeEvent.contentOffset;
        let viewSize = event.nativeEvent.layoutMeasurement;

        // console.log('X : ', contentOffset.x, '  width: ', viewSize.width);

        if(contentOffset.x<0)
            return;

        // Divide the horizontal offset by the width of the view to see which page is visible
        let pageNum = Math.floor(contentOffset.x / viewSize.width);
        // return pageNum;
        // console.log('scrolled to page ', pageNum);
        let tmpSelect=_.cloneDeep(this.state.allIcon);
        let mytmp=[];
        _.each(tmpSelect,function(v,k){
            if(v.page==pageNum){
                v.isSelected=true
            }
            else{
                v.isSelected=false
            }
            mytmp.push(v);
        })
        this.setState({
            allIcon:mytmp
        })
    }
    gotoPage=(item)=>{
        // console.log("go to page",item.page);

        if(item.page=='0'){ 
            this.refs.intro_scrollview.scrollTo({x:0, y:0,animated:true});
        }
        if(item.page=='1'){ 
            this.refs.intro_scrollview.scrollTo({x:width, y:0,animated:true});
        }     
        if(item.page=='2'){ 
            this.refs.intro_scrollview.scrollTo({x:width*2, y:0,animated:true});
        }
        if(item.page=='3'){ 
            this.refs.intro_scrollview.scrollTo({x:width*3, y:0,animated:true});
        }
        if(item.page=='4'){ 
            this.refs.intro_scrollview.scrollTo({x:width*4, y:0,animated:true});
        }
    }
    render() { 
        return (
            <View style={[ styles.viewContainerOfScrollView, styles.primaryBg, {backgroundColor: 'white'}]} >  
                <ScrollView ref={"intro_scrollview"} pagingEnabled={true} scrollEventThrottle={0} horizontal={true} showsHorizontalScrollIndicator={false} onScroll={this.handleScroll}>

                    {this.state.header.map((item, index) => {

                        return (
                            
                            <View key={index} style1={[styles.mainHorizontalPadding,styles.boxWrapContainer,styles.boxWrapContainerNoWrap,{width:width, height: height,justifyContent:'center',alignItems:'center'}]}>
                                 
          
                                
                                    {/* <View style={[styles.introContainer]}>
                                        <Image source={item.imgSrc} style={[styles.img]}/>
                                    </View>
                                    <View style={{maxHeight:250,alignSelf:'center',bottom:0,paddingTop: 15,paddingBottom: 15}}>
                                        <View style={{flex:1,maxHeight:250}}>
                                            <View style={[styles.mainTitle]}>
                                                <Text style={{fontSize:24,color:'white',textAlign:'center'}}>{item.mainTitle}</Text>
                                            </View>
                                            <Text style={{fontSize:18,color:'white',textAlign:'center'}}>{item.subTitle}</Text>
                                        </View>
                                        </View> 
                                
                                
                                <TouchableOpacity onPress={this._getStart}>
                                    <Text style={{fontSize:24,color:'white',textAlign:'center'}}>
                                        Login Now
                                    </Text>        
                                </TouchableOpacity> */}

                                <Image source={item.imgSrc} style={[styles.img]}/>
                                

                            </View>                   
                            
                        )


                    })}
                    {/* </View> */}
                </ScrollView>
                <View style={[ styles.paging ]} style1={[{flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:30}]}>

                    <View style={[ {flexDirection:'row',alignItems:'center',justifyContent:'center'} ]}>
                        {this.state.allIcon.map((item, index) => {                              
                            return(
                                <TouchableOpacity activeOpacity={1} key={index} style={{marginRight:10,width:20,height:3,borderRadius:5,backgroundColor:item.isSelected ? 'white':'rgba(255,255,255,.4)' }} onPress={()=>this.gotoPage(item)}/>
                            )
                        })}
                    </View>

                    <TouchableOpacity onPress={this._getStart} style={[ {paddingHorizontal: 15 , height: 40, flexDirection:'row',alignItems:'center',justifyContent:'center'} ]}>
                        <Text style={{fontSize: 18,color:'white',textAlign:'center'}}>
                            Get Started
                        </Text>        
                    </TouchableOpacity>

                </View>
            </View>
        );
    }
} 

var styles = StyleSheet.create({ ...Utilities,   ...BoxWrap,
    container:{
        flex:1,
        backgroundColor:'grey'
    },
    introMainContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    introContainer:{

    },
    paging: {
        // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        // backgroundColor: 'rgba(0,0,0,.7)',
        backgroundColor: Colors.primaryColor,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingLeft:15,
        height: 50,
    },
    img:{
        resizeMode: "contain",
        width: width,
        height: height-50,
        // justifyContent:'center'
    },
    mainTitle:{
        paddingVertical:20
    },
    txtContainer:{
        flex:1,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems: 'center'
    }
});


function mapStateToProps(state) {
    return {
        user: state.user,
        appOption: state.appOption,        
    }
}

export default connect(mapStateToProps, AppOption)(Intro)
