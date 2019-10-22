import React, { Component } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, Linking, Clipboard, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BoxStyles from '@styles/components/box-wrap.style';
import { ShareDialog, MessageDialog } from 'react-native-fbsdk';
import ModalCustomHeader from '@components/header/modal-custom-header';
import _ from 'lodash';
import Share from 'react-native-share';
import { Helper, GoogleAnalyticsHelper } from '@helper/helper';

const shareLinkContent = {
            contentType: 'link',
            contentUrl: "http://www.talentora.co",
    contentDescription: 'CREATIVE VIDEOS • TALENT DISCOVERY • JOBS',
}; 

const shareMessageContent = {
            contentType: 'link',
            contentUrl: "http://www.talentora.co",
    contentDescription: 'CREATIVE VIDEOS • TALENT DISCOVERY • JOBS',
}; 

const _SELF = null;

import { IconCustom } from '@components/ui/icon-custom';

export default class InviteFriend extends Component{

    constructor(props){
        super(props)
        let SOCIALS=[
            {
                id:1,
                name:'Facebook',
                image:require('@assets/invite_facebook.png'),
                icon: 'invite-facebook',
                func:() => this.shareFb()
            },{
                id:2,
                name:'Messenger',
                image:require('@assets/invite_messenger.png'),
                icon: 'invite-messenger',
                func:() => this.shareMessenger()
            },{
                id:3,
                name:'Twitter',
                image:require('@assets/invite_twitter.png'),
                icon: 'invite-twitter',
                func:() => this.shareTwitter()
            },{
                id:4,
                name:'Instagram',
                image:require('@assets/invite_instagram.png'),
                icon: 'invite-instagram',
                func:() => this.shareInstagram()
            },{
                id:5,
                name:'WhatsApp',
                image:require('@assets/invite_whatsapp.png'),
                icon: 'invite-whatsapp',
                func:() => this.shareWhatsApp()
            },{
                id:6,
                name:'Line',
                image:require('@assets/invite_line.png'),
                icon: 'invite-line',
                func:() => this.shareLine()
            },{
                id:7,
                name:'Email',
                image:require('@assets/invite_email.png'),
                icon: 'invite-email',
                fontSize: 52,
                func:() => this.shareEmail()
            },{
                id:8,
                name:'Message',
                image:require('@assets/invite_message.png'),
                icon: 'invite-message',
                func:() => this.shareMessage()
            },{
                id:9,
                name:'Copy link',
                image:require('@assets/invite_link.png'),
                icon: 'invite-link',
                func:() => this.copyLink()
            }
        ];
        this.state = {
            socials:_.chunk(SOCIALS, 3)
        };
        console.log(this.state.socials);
    }

    static navigationOptions = ({ navigation }) => {
        // console.log('navigation : ', navigation);
        return ({
            // headerStyle: defaultHeaderStyle,  
            header: () => <ModalCustomHeader {...navigation} self={_SELF} title={'Invite your friends'} noLeftBtn={true} />,
    })};

    shareFb = () => {
        console.log('Share FB : ');
        var tmp = this;
        ShareDialog.canShow(shareLinkContent).then(
            function(canShow) {
                if (canShow) {
                    return ShareDialog.show(shareLinkContent);
                }
            }
        ).then(
            function(result) {
                if (result.isCancelled) {
                    // alert('Share operation was cancelled');
                } else {
                    // alert('Share was successful with postId: ' + result.postId);
                    GoogleAnalyticsHelper._trackSocialInteraction('Facebook','Share');
                }
            },
            function(error) {
                // alert('Share failed with error: ' + error.message);
            }
        );
    };

    shareMessenger = () => {
        MessageDialog.canShow(shareMessageContent).then(function(canShow) {
            return MessageDialog.show(shareMessageContent);
            }).then(function(result) {

                if (typeof result == "undefined")
                    return;

                if (result.isCancelled) {
                    // alert('Share operation was cancelled');
                } else {
                    // alert('Share was successful with postId: ' + result.postId);
                    GoogleAnalyticsHelper._trackSocialInteraction('Messenger','Share');
                }
            },
            function(error) {
                // alert('Share failed with error: ' + error);
                // alert('Messager App Not Installed');
            }
        );
    };

    shareTwitter = () => {
        let shareOptions = {
            title: "Talentora",
            message: "Hey, Talentora is for talent and talent-seekers like you and me. Download it here:",
            url: "http://www.talentora.co/download",
            subject: "Share Link",
            social:"twitter"
        };
        Share.shareSingle(shareOptions);

        GoogleAnalyticsHelper._trackSocialInteraction('Twitter','Share');
        
    };

    shareInstagram = () => {
        GoogleAnalyticsHelper._trackSocialInteraction('Instagram','Share');
        
        Clipboard.setString('Hey, Talentora is for talent and talent-seekers like you and me. Download it here: http://www.talentora.co/download');        
        Linking.openURL('instagram://app').catch(err => 
            {
                Linking.openURL('https://www.instagram.com')
            }
        );
    };

    shareWhatsApp = () => {
        GoogleAnalyticsHelper._trackSocialInteraction('WhatsApp','Share');
        
        let shareOptions = {
            title: "Talentora",
            message: "Hey, Talentora is for talent and talent-seekers like you and me. Download it here:",
            url: "http://www.talentora.co/download",
            subject: "Share Link",
            social:"whatsapp"
        };
        Share.shareSingle(shareOptions);
    };

    shareLine = () => {
        GoogleAnalyticsHelper._trackSocialInteraction('Line','Share');
        
        if(Helper._isIOS()){
            Linking.openURL('line://msg/text/Hey, Talentora is for talent and talent-seekers like you and me. Download it here: http://www.talentora.co/download').catch(err => 
                {
                    Linking.openURL('https://line.me/en/')
                }
            );
        }else{
            let shareOptions = {
                title: "Talentora",
                message: "Hey, Talentora is for talent and talent-seekers like you and me. Download it here:",
                url: "http://www.talentora.co/download",
                subject: "Share Link",
                social:"line"
            };
            Share.shareSingle(shareOptions);
        }
    };

    shareEmail = () => {
        GoogleAnalyticsHelper._trackSocialInteraction('Email','Share');
        
        let shareOptions = {
            title: "Talentora",
            message: "Hey, Talentora is for talent and talent-seekers like you and me. Download it here:",
            url: "http://www.talentora.co/download",
            subject: "Talentora",
            social:"email"
        };
        Share.shareSingle(shareOptions);
    };
 
    shareMessage = () => {
        GoogleAnalyticsHelper._trackSocialInteraction('Message','Share');
        
        if(Helper._isIOS()){
             Linking.openURL('sms:&body=Hey, Talentora is for talent and talent-seekers like you and me. Download it here: http://www.talentora.co/download').catch(err => 
                {
                    alert('No message app on this device. Please try to install the message app.')
                }
            );
        }else{
            Linking.openURL('sms:?body=Hey, Talentora is for talent and talent-seekers like you and me. Download it here: http://www.talentora.co/download').catch(err => 
                {
                    alert('No message app on this device. Please try to install the message app.')
                }
            );
        }
    };
  
    copyLink = () => {
        Clipboard.setString('Hey, Talentora is for talent and talent-seekers like you and me. Download it here: http://www.talentora.co/download');
    };

    componentDidMount(){
        _SELF = this;

        GoogleAnalyticsHelper._trackScreenView('Invite Friend');        
        
    }

    render(){
        
        const { navigate, goBack } = this.props.navigation;

        return(
            <View style={{flex:1, backgroundColor:'white', justifyContent:'center'}}>
                {this.state.socials.map((items,index) => {
                    return(<View key={index}
                        style={[BoxStyles.boxWrapSpaceAround, {marginBottom:20, flexWrap:'nowrap'}]}>
                        {items.map((item, index) => {
                            return(
                                <TouchableOpacity key={index}
                                    onPress={item.func}
                                    activeOpacity={.8}>
                                    <View style={{marginRight:20, marginLeft:15, marginBottom:20}}>
                                        <IconCustom name={item.icon} style={{ fontSize: item.fontSize ? item.fontSize : 60, }} />
                                    </View>
                                    <Text style={{textAlign:'center'}}>
                                        {item.name}                                    
                                    </Text>
                                </TouchableOpacity>)
                        })}
                    </View>)})}
            </View>
        );
    }
}