import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as Actions from '../../actions/detail'
import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    Image,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

// component
import ButtonRight from '@components/header/button-right'
import ButtonBack from '@components/header/button-back'
import FeedList from '@components/lists/feed/feed-list'

// style
import profileStyles from '@styles/profile.style'
import VerticalMenu from '@styles/components/vertical-menu.style'
import Ultilities from '@styles/extends/ultilities.style'
import { headerStyle, titleStyle } from '@styles/header.style'


function mapStateToProps(state) {
    return {
        detail: state.detail
    }
}

class Profile extends Component {

    /*static navigationOptions = {
        // title: ({ state }) => `${state.params.item.title}`,
        title: ({ state }) => `Panhna`,
        header: ({ state, navigate }, defaultHeader) => ({
            style: headerStyle,
            titleStyle: titleStyle, 
            right: (
                <ButtonRight
                    icon="settings"
                    navigate={navigate}
                    to="Settings"
                />
            ),
        }),
        drawer: () => ({
            label: 'Menu'
         }),
    }*/

    static navigationOptions = ({ navigation }) => ({
            headerTitle: 'Panhna',
            headerRight:(<ButtonRight
                    icon="settings"
                    navigate={navigation.navigate}
                    to="Settings"
                />),
            drawerLabel: 'Menu'
        });

    // If no detail items loaded, load now 
    componentWillMount() {


    }

    // Link right header button to component
    // In this case we want the button to bookmark the detail item
    componentDidMount() { 

    }


    render() {


        return (
            <ScrollView style={[ styles.wrapper ]}>

                {/*avatar container*/}                
                <View style={[styles.avatarContainer, styles.shadowBox]}>
                    <Image
                        style={[styles.avatar, styles.bgCover]} 
                        source={require('@assets/tmp/user-profile.jpg')}  
                    />
                    <View style={[styles.bgOverlay, { height: 300, opacity: 0.2,}]} />
                    <TouchableOpacity style={styles.btnUploadAvatar}>
                        <Icon 
                            tintColor="#fff"
                            name={'photo-camera'}
                            style={[ styles.iconUploadAvatar ]}
                        />
                    </TouchableOpacity>
                </View>

                {/*user info*/}                
                <View style={styles.infoContainer}>
                    <Text style={styles.userName}>Panhna Seng, 26</Text>
                    <TouchableOpacity style={styles.btnEdit}>
                        <Icon
                            name={'edit'}
                            style={[ styles.iconEdit ]}
                        />
                    </TouchableOpacity>
                </View>

                {/*vertical menu for follower, following, ...*/}
                <View style={[styles.verticalMenuContainer, styles.flexVerMenu]}>

                    <TouchableOpacity style={[styles.verticalMenuItem]}>
                        <Text style={[styles.activityVal, styles.textCenter]}>23</Text>
                        <Text style={[styles.activityLabel, styles.textCenter]}>Follower</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.verticalMenuItem]}>
                        <Text style={[styles.activityVal, styles.textCenter]}>12</Text>
                        <Text style={[styles.activityLabel, styles.textCenter]}>Following</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.verticalMenuItem]}>
                        <Text style={[styles.activityVal, styles.textCenter]}>5</Text>
                        <Text style={[styles.activityLabel, styles.textCenter]}>Review</Text>
                    </TouchableOpacity>

                </View>

                {/*feed list*/}
                <FeedList></FeedList>
                

            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({ 
    ...Ultilities,
    ...profileStyles,
    ...VerticalMenu,
})

// Also connect detail screen to store
// Ensures this route can be accesed from anywhere within the app without having to connect
export default connect(mapStateToProps, Actions)(Profile)
