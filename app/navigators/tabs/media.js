import {
    StackNavigator,
} from 'react-navigation';

import MediaRecord from '../../components/media/media-record'
// import ProfileUser from '../../components/user/profile'
import { Colors } from '@themes/index';
import { headerStyle, titleStyle } from '../../styles/header.style'

const options = {
    headerMode: 'screen',
    initialRouteName: 'Record',

    navigationOptions:{
        headerStyle: headerStyle,  
        headerTitleStyle: titleStyle,
        // headerTintColor: Colors.textColorDark,
    }

}


export default StackNavigator({

    Record:   { screen: MediaRecord },
    // Detail: { screen: ProfileUser }

}, options);
