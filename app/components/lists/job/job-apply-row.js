import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import ListItem from '@styles/components/list-item.style';
import Ultilities from '@styles/extends/ultilities.style';
import TagsSelect from '@styles/components/tags-select.style';
import FlatForm from '@styles/components/flat-form.style';

import { UserHelper, StorageData, Helper } from '@helper/helper';


const styles = StyleSheet.create({
    ...Ultilities,
    ...FlatForm,
    ...TagsSelect,
    ...ListItem,
});

// console.log(this);

export default class Row extends React.Component {


    _getKind = () => {
        let _kinds = UserHelper._getKind(this.props.candidate_detail.attributes.kind.value)
        // console.log('Kinds :', _kinds);
        return _kinds;
    }

    _getCover = () => {
        // feature_photo
        if(this.props.feature_photo.photo)
            return { uri: this.props.feature_photo.photo.thumbnail_url_link };
        else
            return require('@assets/job-banner.jpg');

    }

    _chkStatusToShowItem = () => {
        return this.props.status == 'applied';
    }

    render() {
        //   const movie = this.props.data;
        // console.log('Job Row',this); 
        return (
    
            <View style={[styles.itemContainer, styles.mainHorizontalPadding, styles.mainVerticalPaddingXS]}>

                <View style={[styles.itemSubContainer, styles.boxWithShadow]}>   

                    {/* avatar */}
                    <TouchableOpacity style={[ styles.grayBg, styles.grayLessBg, {width: 50, height: 50} ]} onPress={ () => this.props.viewProfileFunc(this.props.candidate) }>
                        <Image source={ this._getCover() } style={styles.itemPhoto} />
                    </TouchableOpacity>

                    <View style={[ styles.infoContainer ]}>

                        <TouchableOpacity onPress={ () => this.props.viewProfileFunc(this.props.candidate) }>
                            {/* name */}
                            <Text style={[ styles.itemTitle, {marginBottom: 2} ]}>

                                {/*{`${props.name.first} ${props.name.last}`}*/}

                                { Helper._getUserFullName(this.props.candidate_detail.attributes) }

                            </Text>
                        </TouchableOpacity>

                        {/* tag normal */}
                        <View style={[ styles.tagContainerNormal, styles.paddingBotNavXS ]}>   

                            { this._getKind().map((item, index) => {
                                return (
                                    <TouchableOpacity 
                                        activeOpacity = {0.9}
                                        key={ index }  
                                        style={[ styles.tagsSelectNormal, styles.withBgGray, styles.tagsSelectAutoWidth, styles.noMargin, styles.marginTopXXS ]}
                                    >
                                        <Text style={[ styles.tagTitle, styles.btFontSize, styles.tagTitleSizeSM ]}>
                                            { Helper._capitalizeText(item.display_name)}
                                        </Text>
                                        
                                    </TouchableOpacity>     
                                )
                            })}

                        </View>


                        {/* application button action */}
                        { this._chkStatusToShowItem() && <View style={[ {flex: 1, flexDirection: 'row', alignItems: 'stretch', height: 37 } ]}>
                
                                <TouchableOpacity activeOpacity = {0.5} style={[ styles.flatButton, styles.flatButtonSizeSM, styles.greenBg, styles.noBorder, {flex: 1, alignItems: 'stretch', marginRight: 5} ]} onPress={() => this.props.func_1(this.props) }>
                                    <Text style={[ styles.flatBtnText, styles.btFontSizeXS, {flex: 1} ]}>Shortlist</Text>
                                </TouchableOpacity>
                
                                <TouchableOpacity activeOpacity = {0.5} style={[ styles.flatButton, styles.flatButtonSizeSM, styles.darkishRedBg, {flex: 1, alignItems: 'stretch', marginRight: 0} ]} onPress={() => this.props.func_2(this.props) }>
                                    <Text style={[ styles.flatBtnText, styles.btFontSizeXS, {flex: 1} ]}>Unsuitable</Text>
                                </TouchableOpacity>

                            </View>
                        }

                    </View>

                </View>


            </View>

        )
    }
}
