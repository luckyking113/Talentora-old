import React from 'react'
import {
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Text,
    Picker,
    ScrollView
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';

import Utilities from '@styles/extends/ultilities.style';
import { Colors } from '@themes/index'

import { ages } from '@api/response'
import { Helper } from '@helper/helper';
const Item = Picker.Item;
class minMaxPicker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            myheight:{
                val:this.props.type == 'height' && this.props.default?this.props.default:''
            },
            myweight:{
                val: this.props.type == 'weight' && this.props.default?this.props.default:''
            },
            age:{
                val:this.props.type == 'age' && this.props.default?this.props.default:''
            },
            ageModalVisible:false,
            weightModalVisible:false,
            heightModalVisible:false
        }
        // console.log("Props Object",this.props);
    }

    setModalVisible(visible, type) {
        if(type == 'age'){
            this.setState({ageModalVisible: visible})
        }else if(type == 'height'){
            this.setState({heightModalVisible: visible})
        }else if(type == 'weight'){
            this.setState({weightModalVisible: visible})
        }
    }
    // onMyModalVisible=(visible,type)=>{
    //     console.log("onMyModalVisible is calling");
    //     if(type=='age'){
    //         this.setState({ageModalVisible:visible})
    //         this.props.onMyModalVisible(true,'age');
    //     }else if(type=="height"){
    //         this.setState({heightModalVisible:visible})
    //         this.props.onMyModalVisible(true,'height');
    //     }else if(type=="weight"){
    //         this.setState({weightModalVisible:visible})
    //         this.props.onMyModalVisible(true,'weight');
    //     }
    // }
    onPickerChange(text, type){
        if(type == 'age'){
            this.setState({age: {
                val:text
            }})
        }else if(type == 'height'){
            this.setState({myheight:{
                val:text
            }})
        }else if(type == 'weight'){
            this.setState({myweight:{
                val:text
            }})
        }
        this.props.onPickerChangeValue(text,type);
        if(Helper._isAndroid()){
            (type=='age' ? this.setModalVisible(false,'age'):(type=='weight' ? this.setModalVisible(false,'weight'):this.setModalVisible(false,'height')));            
        }
    }  

    onHeightChanged(text){
        let reSing=/^[0-9]{0,3}$/;
        if(reSing.test(text)){
            this.setState({ height:{
                val:text
            } })
        }
        // this.props.onPickerChangeValue(text,"height");
    }

    onWeightChanged(text){
        let reSing=/^[0-9]{0,3}$/;
        if(reSing.test(text)){
            this.setState({ weight: {val:text} })
        }
        // this.props.onPickerChangeValue(text,"weight");
    }

    onAgeChange(text){
        // console.log('Ethnicity: ', text);
        this.setState({age: {
            age:text
        }})
        // this.props.onPickerChangeValue(text,"age");
    } 
    // genderSelect=(item,index,type,itemObject)=>{
    //     console.log("my item in gender select",item);
    //     console.log("my type",type);
    //     (type=='age' ? this.setModalVisible(false,'age'):(type=='weight' ? this.setModalVisible(false,'weight'):this.setModalVisible(false,'height')));
    //     return;
    //     let temp=(type=='age' ? this.state.Genders: (type=='ethnicity'? ethnicities:(type=='hair'? hair_colors:eye_colors)));
    //     console.log("temp in genderselect",temp);
    //     let selectedvalue;
    //     _.map(temp,function(v,k){
    //         if(v.id==item.id){
    //             selectedvalue=v.display_name;
    //         }
    //     });
    //     (type=='genderAndroid'? this.setState({selectedGender:selectedvalue=='Both(Male & Female)' ? 'B':(selectedvalue=='Male' ? 'M':'F'),displayGendersAndroid:selectedvalue}):(type=='ethnicity' ? this.setState({selectedEthnicity:selectedvalue}):(type=='hair'? this.setState({myhaircolor:{val:selectedvalue}}):this.setState({myeyecolor:{val:selectedvalue}}))));
    //     (type=='age' ? this.setModalVisible(false,'age'):(type=='weight' ? this.setModalVisible(false,'weight'):this.setModalVisible(false,'height')));
    //     console.log("After Set State",this.state);
    // }
    render() {

        const { tintColor, icon, iconType } = this.props
        let that=this;
        const itemObject=this.props.myData;
        const type=this.props.type;
        return (
            
            <View style={[styles.justFlexContainer]}>
 
                { Helper._isAndroid()  && 
                    <View style = {[ {flex: 1} ]}>
                        {/*<Picker
                            selectedValue={ type == 'age' ? this.state.age.val :
                                (type == 'height' ? this.state.myheight.val : this.state.myweight.val)}
                            onValueChange={(item) => this.onPickerChange(item, type)}>
                            {
                                itemObject.map((item, index) => {
                                    return(
                                        <Item key={index} label={item.minMax} value={item.minMax} />
                                    )
                                })
                            }  
                        </Picker>*/}
                        <View style = {[ {flex: 1} ]}>
                            <Modal
                                transparent={true}
                                onRequestClose={() => {}}
                                visible = {type == 'age' ? this.state.ageModalVisible:(type=='height' ? this.state.heightModalVisible: this.state.weightModalVisible)}>
                                <TouchableOpacity style={[ styles.justFlexContainer, styles.mainVerticalPadding, {flex:1,flexDirection:'column',paddingBottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.8)'}]} onPressOut={() => {this.setModalVisible(false,type)}}>
                                    <View style={{width:300,height:260,backgroundColor:'white'}}>
                                        <View style={[styles.languageNav ]} >
                                            <Text style={[ styles.languageNavTitle,styles.inputLabelFontSize,{textAlign:'left'} ]} >Please select {type}</Text>
                                            {/*<Text style={[ styles.languageNavStatus ]} >{this.state.selectedLanguagesCount} /3 selected</Text>*/}
                                        </View>
                                    {/*Language Search*/}
                                    {/*<View style={[styles.mainHorizontalPadding, {marginTop: 20}]}>
                                        <TextInput
                                            style={{marginBottom:7, height: Helper._isAndroid()?40:30, borderColor:Colors.componentBackgroundColor, borderRadius:5,textAlign:'center', backgroundColor:Colors.componentBackgroundColor,borderWidth: 1}}
                                            onChangeText={(text) => this.onLanguageSearch(text)}
                                            value={this.state.text}
                                            placeholder="Search"
                                        />
                                    </View>*/}
                                        <ScrollView contentContainerStyle={[styles.mainVerticalPadding, styles.mainHorizontalPadding ]}>
                                            {itemObject.map((item, idx) => {
                                                return (
                                                    <View key={idx} >
                                                        {/*{console.log('Item ZIN: ', lang, idx)}*/}
                                                        {/* {when search first time click on the row is not work cus not yet lost focus from text input */}
                                                        <TouchableOpacity onPress={() => this.onPickerChange(item.minMax,type) } activeOpacity={.8}
                                                            style={[ styles.flexVer, styles.rowNormal, {justifyContent:'space-between'}]}>
                                                            <Text style={[ styles.itemText, {paddingTop: 7, paddingBottom:7, 
                                                                color: item.selected ? 'red' : 'black'} ]}>   
                                                                { item.minMax }
                                                            </Text>
                                                            {item.selected && <Icon name={"done"} style={[ styles.itemIcon, 3, {color:'red' }]} /> }
                                                        </TouchableOpacity>
                                                        <View style={[{borderWidth:1,borderColor:Colors.componentBackgroundColor}]}></View>
                                                    </View>
                                                )
                                            })}
                                        </ScrollView>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                            {/*Old Picker*/}
                            {/*<Picker
                                ref = 'genderPicker'
                                selectedValue={this.state.selectedGender}
                                onValueChange={this.onValueChange.bind(this, 'selectedGender')}>
                                <Item label="Please select gender" value=""/>  
                                <Item label="Male" value="M" /> 
                                <Item label="Female" value="F" />
                            </Picker>*/}
                        </View>
                        <TouchableOpacity onPress={() => {
                                this.setModalVisible(true, type)}}>
                            <View style = {[styles.itemPicker,{flex:0.7}]}>
                                <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {color:type=="age" ? (this.state.age.val? 'black':'#9B9B9B'):(type=="weight" ? (this.state.myweight.val? 'black':'#9B9B9B'):(this.state.myheight.val? 'black':'#9B9B9B')),textAlign:'right'}]}>{ type=='age'? this.state.age.val|| 'Select age range' :(type=='weight' ? this.state.myweight.val||'Select weight range' :this.state.myheight.val|| 'Select height range') }</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                } 

                
                

                { Helper._isIOS()  && 
                    <View style={[styles.justFlexContainer]}>
                            
                        <Modal
                            animationType={"slide"}
                            transparent={true}
                            onRequestClose={() => {}}
                            visible={ type == 'age' ? this.state.ageModalVisible : 
                            (type == 'height' ? this.state.heightModalVisible : this.state.weightModalVisible)}>

                            <View onPress = {()=>{ }} style={{flex: 1, justifyContent: 'flex-end',marginTop: 22}}>
                                <View style = {styles.pickerTitleContainer}>
                                    <Text style={[styles.fontBold, styles.inputValueFontSize,{textAlign: 'left', padding:10, left: 10} ]}>Select {type == 'age' ? type : type + ' color'} </Text>
                                    <TouchableOpacity activeOpacity = {0.8}
                                        style={[ {backgroundColor: Colors.componentDarkBackgroundColor, position:'absolute', padding:10, right:10} ]}
                                        onPress={() => {
                                            this.setModalVisible(false, type)
                                        }}>
                                        <Text style={[styles.fontBold,styles.inputLabelFontSize, {textAlign: 'right', color: '#3b5998'} ]}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[ {backgroundColor: 'white'} ]}>
                                    <Picker
                                        selectedValue={ type == 'age' ? this.state.age.val :
                                            (type == 'height' ? this.state.myheight.val : this.state.myweight.val)}
                                        onValueChange={(item) => this.onPickerChange(item, type)}>
                                        {
                                            itemObject.map((item, index) => {
                                                return(
                                                    <Item key={index} label={item.minMax} value={item.minMax} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>
                            </View>
                        </Modal>

                        <TouchableOpacity
                            onPress={() => {
                                this.setModalVisible(true, type)
                                let val = type == 'age' ? this.state.age.val : 
                                (type == 'height' ? this.state.myheight.val : this.state.myheight.val);
                                if(val == '')
                                    this.onPickerChange(itemObject[0].min, type);
                            }}>
                            <View style = {styles.itemPicker}>
                                {
                                    type == 'age' && 
                                    <Text style={[ styles.flatInputBoxFont, styles.inputValueFontSize,{textAlign:'right',color:this.state.age.val? 'black':'#9B9B9B'}]}>{ this.state.age.val || 'Select age range' }</Text>
                                }

                                {
                                    type == 'height' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {textAlign:'right',color:this.state.myheight.val? 'black':'#9B9B9B'}]}>{ this.state.myheight.val || 'Select height range' }</Text>
                                }

                                {
                                    type == 'weight' && 
                                    <Text style={[ styles.flatInputBoxFont,styles.inputValueFontSize, {textAlign:'right',color:this.state.myweight.val? 'black':'#9B9B9B'}]}>{ this.state.myweight.val || 'Select weight range' }</Text>
                                }
                            </View>
                        </TouchableOpacity>
                        
                </View> }

            </View>

        )

    }
}

const styles = StyleSheet.create({
    ...Utilities,
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
    languageNavIcon:{
         color:'black',
         fontSize: 20,
         backgroundColor: 'transparent',
         left: 17
    },
    languageNavTitle:{
        flex: 1,
        // backgroundColor: 'yellow',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    languageNav:{
        flexDirection : 'row', 
        height : 50, 
        paddingTop: 15, 
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowRadius: 3,
        shadowOpacity: 0.2,
        paddingHorizontal:15
    },
})



export default minMaxPicker;