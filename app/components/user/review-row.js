import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Styles from '@styles/card.style';
import Utilities from '@styles/extends/ultilities.style';
import FlatForm from '@styles/components/flat-form.style';
import TagsSelect from '@styles/components/tags-select.style';
import BoxWrap from '@styles/components/box-wrap.style';
import { Helper } from '@helper/helper';

export default class ReviewRow extends React.PureComponent{

    _showRecommendText = () => {
        let raterName = this._getUserFullName(this.props.item.owner_profile.attributes);
        let rateeName = this._getUserFullName(this.props.item.profile.attributes);
        return(
            <Text style={{fontSize:12}}><Text style={[{fontWeight:'bold'}]}>{raterName}</Text>{this.props.item.types[0] !== '' && <Text style={{fontSize:12}}> would recommend {rateeName} as:</Text>}</Text>
        );
    };

    _getUserFullName = (attributes) => {
            return attributes.first_name.value + ' ' + attributes.last_name.value;
    }

    render(){
        return(
            <View style={[ styles.justFlexContainer, styles.mainVerticalPaddingMDD, styles.mainHorizontalPaddingMD ,
                {flex:1, flexDirection:'row', borderBottomColor:"#F6F6F6", borderBottomWidth:1, marginRight:15, marginLeft:15, paddingRight:0, paddingLeft:0},]}> 
                <View style={[{alignItems:'center',marginRight:20}]}>
                    <Image
                        style={{
                        width:70,
                        height:70,
                        borderRadius:10,
                        resizeMode:'cover'
                        }}
                        source={{uri:this.props.item.owner_profile.photo.preview_url_link}}/>
                </View>
                <View style={[{flex:0.7}]}>
                    {this._showRecommendText()}
                    {this.props.item.types[0] !== '' && <View style={[styles.tagContainerNormal, styles.paddingBotNavXS,{marginVertical:10, marginTop:0, marginBottom:0}]}>
                        {this.props.item.types.map((itemsub, indexsub) => {
                                if(!itemsub) return null;
                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        key={indexsub}
                                        style={[styles.tagsSelectNormal, styles.withBgGray, styles.tagsSelectAutoWidth, styles.noMargin, styles.marginTopXXS]}>
                                        <Text style={[styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM]}>
                                            {Helper._capitalizeText(itemsub)}
                                        </Text>

                                    </TouchableOpacity>
                                )
                            })}                                
                    </View>}
                    <Text>{this.props.item.review}</Text>    
                </View>
            </View> 
        );
    }
}
const styles = StyleSheet.create({ 
    ...Styles, ...Utilities, ...FlatForm, ...BoxWrap, ...TagsSelect,




});


