import {Dimensions, Platform} from 'react-native'
import { Colors } from '@themes/index'

const { width, height } = Dimensions.get('window')

export default { 
    icon: {
        marginTop: 0,
        fontSize: 22
    },

    customTabContainer: {
        maxHeight: 40,
        
    },

    customTabItem:{
        borderBottomWidth: 2, 
        borderBottomColor: 'transparent', 
        paddingBottom: 8, 
    },

    customTabTextContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },

    customTabItemSelected: {  
        borderBottomColor: Colors.primaryColor,  
    },
    customTabItemText: {
        color: Colors.textBlack,  
        fontWeight: 'bold',
        fontSize: 15,
    },
    costomTabItemTextSelected: {
        color: Colors.primaryColor,
    }

}
