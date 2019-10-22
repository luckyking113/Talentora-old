import React from 'react'
import {
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';

import Utilities from '@styles/extends/ultilities.style';
import { Colors } from '@themes/index'

const { width, height } = Dimensions.get('window') 


class SearchBox extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchText: this.props.prevText,
            // isLoading: false,
        }
        // console.log('State:', this.props)
    }

    _clearSearch = () => {
        // console.log('clear search');
        let alreadyEmpty = false;

        if(this.state.searchText==''){
            alreadyEmpty = true;
        }

        this.setState({
            searchText: '',
        })

        this.props.onSubmit('', alreadyEmpty);
        // console.log('_clearSearch: ', this.state);
    }

    render() {

        const { tintColor, icon, iconType } = this.props

        return (

            <View style={[styles.justFlexContainer, styles.marginTopSM, styles.mainHorizontalPaddingMD, styles.searchBoxContainer, this.props.margBot && styles.marginBotSM ]}>
                <View style={[styles.justFlexContainer, {width: width-30}]}>
                    <TextInput
                        value={this.state.searchText}
                        autoCapitalize="none"
                        placeholder={this.props.placeholder}
                        autoCorrect={false}
                        returnKeyType={'search'}
                        underlineColorAndroid = 'transparent' 
                        //onFocus={() => this.updateText('onFocus')}
                        //onBlur={() => this.updateText('onBlur')}
                        onChangeText={(text) => this.setState({ searchText: text })}
                        onChange={(event) => { }}
                        onEndEditing={(event) => { 'onEndEditing text: ' + event.nativeEvent.text }}
                        onSubmitEditing={(event) => this.props.onSubmit(event.nativeEvent.text)}
                        onSelectionChange={(event) => { }}
                        onKeyPress={(event) => {
                            //this.updateText('onKeyPress key: ' + event.nativeEvent.key);
                        }}
                        style={[{ height: 35, fontSize: 16 }, styles.searchBox, this.props.customStyle]}
                    />
                    <Icon name={'search'} style={[styles.iconBtn, styles.iconStyle, styles.leftSide]} />

                    { 
                        !this.props.isLoading && <TouchableOpacity style={[styles.iconBtn, styles.rightSide]} activeOpacity={.5} onPress={() => this._clearSearch()}>
                            <Icon name={'close'} style={[styles.iconStyle]} />
                        </TouchableOpacity>
                    }

                    {
                       this.props.isLoading && 
                        <ActivityIndicator animating = {true}
                            style={[styles.iconBtn, styles.rightSide]} size = "small"
                        />
                    }

                </View>
            </View>

        )

    }
}

const styles = StyleSheet.create({
    ...Utilities,
    searchBox: {
        backgroundColor: Colors.componentBackgroundColor,
        paddingHorizontal: 40,
        paddingVertical: 0,
        borderRadius: 4,
    },
    leftSide: {
        left: 0,
    },
    rightSide: {
        right: 0,
    },
    iconBtn: {
        backgroundColor: 'transparent',
        // backgroundColor: 'gray',
        position: 'absolute',
        top: 0,
        bottom: 0,
        paddingVertical: 7,  
        paddingHorizontal: 10,
    },
    iconStyle: {
        fontSize: 22,
        // backgroundColor: 'transparent',
        // position: 'absolute',
        // top:10,
        color: Colors.textColorDark,
    }
})



export default SearchBox;