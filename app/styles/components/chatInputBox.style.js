import { Colors } from '@themes/index'


export default {

    chatInputContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'white'
    },

    chatInputIcon: {
        fontSize: 25,
        color: Colors.primaryCol,
    }, 

    chatInputIconSend: {
        fontSize: 25,
        color: Colors.primaryCol,        
    },

    uploadContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },

    inputContainer: {
        flex: 1,
        // backgroundColor: 'red',
    },

    chatInputBtnSend: {
        position: 'absolute',
        top: 15,
        right: 15,
    }

}