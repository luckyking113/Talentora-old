import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, Image } from 'react-native';
import {
    StackNavigator, NavigationActions
} from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import Camera from 'react-native-camera';

import { Colors } from '../../themes/index';

// import LogInForm from '../Components/Form/LogInForm';


export default class MediaRecord extends React.Component {

  // static navigationOptions = {
  //   title: 'Take Media',
  //   header: () => ({
  //     visible: false
  //   }),
  //   tabBar: () => ({
  //       visible: true,
  //       icon: (props) => { 
  //           return( 
  //               <TouchableHighlight onPress={() => { navigate('Record') }}><Icon name={'photo-camera'} /> </TouchableHighlight>
  //           ); 
  //       }

  //   }),
  // };

    static navigationOptions = ({ navigation }) => ({
            headerVisible: false,
            headerTitle: 'Take Media',
        });

  takePicture() {
    Alert.alert('hi');
    // this.camera.capture()
    //   .then((data) => console.log(data))
    //   .catch(err => console.error(err));
  }

  _handleFocusChanged(event) {
    console.log(event);
    // call capture() here
  }

  _handleZoomChanged(event) {
    console.log(event);
    // call capture() here
  }

  _goPrevScene(){
    NavigationActions.reset({
        index: 0 ,
        routeName : "Home",
        actions: [NavigationActions.navigate({routeName: "Home"})]
    });
  }

  render() {
      
    const { navigate, goBack } = this.props.navigation

    return (    
            
        <View style={styles.container}>
            
          <Camera
            ref={(cam) => {
              this.camera = cam;
            }}

            onZoomChanged = {this._handleZoomChanged(this)}

            onFocusChanged = {this._handleFocusChanged(this)}
            captureAudio = {false}
            defaultOnFocusComponent={true}
            type = {Camera.constants.Type.back}

            style={styles.preview}
            aspect={Camera.constants.Aspect.fill}>

            <View style={[styles.overlay, styles.topOverlay]}>

              {/*<TouchableOpacity onPress={() => goBack()} style={styles.btnBack}>*/}
              {/*<TouchableOpacity onPress={this._goPrevScene()} style={styles.btnBack}>
                <Ionicons
                            name={'md-arrow-back'}
                            size={26}
                            style={{ color: "white" }}
                        />
              </TouchableOpacity>*/}

            </View>


            <View style={[styles.overlay, styles.bottomOverlay]}>

              <TouchableOpacity>
                  <Ionicons
                            name={'ios-flash'}
                            size={45}
                            style={{ color: "white" }}
                        />
              </TouchableOpacity>
              

              <TouchableOpacity style={styles.captureButton} onPress={this.takePicture.bind(this)}>
                <Image style={styles.btnRecord} source={require('../../images/camera/btn-record.png')} />
              </TouchableOpacity>

              <TouchableOpacity>
                  <Entypo
                            name={'upload'}
                            size={35}
                            style={{ color: "white" }}
                        />
              </TouchableOpacity>


            </View>


          </Camera>
        </View>
        
    );
  }

}

var styles = StyleSheet.create({
  description: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    // backgroundColor: 'red'
  },
  btnBack: {
    flex: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'transparent'
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    flex: 1,
    height: 100,
    bottom: 0,
    // backgroundColor: 'rgba(255,255,255,.2)',
    backgroundColor: 'rgba(0,0,0,.2)',
    // backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  captureButton: {
    // paddingVertical: 15,
    marginLeft: 50,
    marginRight: 50
  },
  btnRecord: {
    resizeMode: "contain",
    width: 80,
    height: 60,
    // marginBottom: 40
  },

});