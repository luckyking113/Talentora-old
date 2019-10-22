import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Colors } from '@themes/index';
// import { GiftedChat } from 'react-native-gifted-chat';

import { SEND_BRID_APP_ID } from '@constants/Consts';


import Chat from '@components/message/chat/chat' 

import SendBird from 'sendbird';



let sb = null;

export default class Message extends React.Component {

  constructor(props) {
    super(props);

    // sb = SendBird.getInstance();

    this.state = {
        messages: []
    };
    this.onSend = this.onSend.bind(this);
  }


    static navigationOptions = ({ navigation }) => ({
            headerTitle: 'Talentora',
        });

  componentWillMount() {
 
  }

  componentDidMount(){
      sb = new SendBird({appId: SEND_BRID_APP_ID});
      console.log('SendBird',sb);
  }

  _onPressCreateChannel() {
    var _SELF = this;

    // For typical 1-to-1 chat which is unique between two users
    sb.GroupChannel.createChannelWithUserIds(['another_user_id'], true, name, coverFile, data, customType, function(createdChannel, error){
        if (error) {
            console.error(error);
            return;
        }

    });

  }

  onSend(messages = []) {

  }


    render() {
        return (    

            <View>

            </View>
              
        );
    }

}

var styles = StyleSheet.create({


});