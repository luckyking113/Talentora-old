import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import * as AuthActions from '@actions/authentication';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import CustomizeTabBar from '@components/ui/scroll-tab-view-custom-tab/customize-tab-item';
import Tab from '@components/tabs/tab';
import { UserHelper, StorageData, GoogleAnalyticsHelper, Helper } from '@helper/helper';
import { Colors } from '@themes/index';
import Styles from '@styles/card.style';
import Utilities from '@styles/extends/ultilities.style';
import BoxWrap from '@styles/components/box-wrap.style';
import Tabs from '@styles/tab.style';
import MessageList from '@components/message/message-list'

class MessageContainer extends Component{
    static navigationOptions = ({ navigation }) => {
        return ({
            headerTitle: 'Message',
        });
    };
    render(){
        return(
            <View style={[ styles.justFlexContainer, styles.mainScreenBg ]}>
                <ScrollableTabView
                    style={[{marginTop: 0}]}
                    //renderTabBar={() => <ScrollableTabBar tabsContainerStyle={[ styles.tabItem, {padding: 0}, styles.tabsContainer ]} tabStyle={[styles.scrollableTabBar]} style={[{ borderColor: Colors.lineColor } ]} />}
                    //tabBarUnderlineStyle={[{ backgroundColor: Colors.primaryColor,height:2 }, styles.tabBarUnderline]}                    
                    renderTabBar={() => <CustomizeTabBar style={[{ borderColor: Colors.componentBackgroundColor } ]} />} 
                    tabBarUnderlineStyle={[{ backgroundColor: Colors.primaryColor,height:2 }]}
                    tabBarBackgroundColor='white'
                    tabBarPosition='overlayTop'
                    tabBarActiveTextColor={ Colors.primaryColor }
                    tabBarInactiveTextColor={ Colors.textBlack }
                    scrollWithoutAnimation={false}
                    tabBarTextStyle={{fontSize: 16}}
                    onChangeTab={ this.onChangeTab }
                    prerenderingSiblingsNumber={1} // load content in all tav
                    ref={'scrollableTabView'}
                    locked={ Helper._isIOS() ? false : true }>
                    <MessageList  tabLabel='Chat' navigation={this.props.navigation} discoverState={this.state}/>
                    <MessageList  tabLabel='Favorite' navigation={this.props.navigation} discoverState={this.state}/>
                </ScrollableTabView>
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

const styles = StyleSheet.create({ ...Styles, ...Utilities, ...Tabs,
    tabItem: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    tabsContainer:{
        justifyContent: 'center'
    },
    scrollableTabBar: {
        width: 120,
        height: 64,
        marginLeft: 20,
        marginRight: 20,
        paddingBottom: 10 
        // paddingTop: 20
    },
    tabBarUnderline: {
        //  height: 4,
        //  bottom: 5,
        //  borderRadius: 5,
         marginLeft: 50,
         width: 60,
        //  backgroundColor: '#57a8f5'
    },
})

export default connect(mapStateToProps, AuthActions)(MessageContainer)