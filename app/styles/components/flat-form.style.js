import { Colors } from '@themes/index'


export default {

    flatInputBoxFont: {
        fontSize: 16,
        // fontWeight: 'bold',
    },

    flatInputBox:{
        height: 45,
        backgroundColor: Colors.componentBackgroundColor,
        marginBottom: 10,
        color: Colors.textBlack,
        paddingHorizontal: 12,
        borderRadius: 5,  
        borderWidth: 1,
        borderColor: '#fff',
    },

    flatInputBoxSM:{
        height: 40, 
        fontSize: 14
    },

    flatButton: {
        backgroundColor: Colors.buttonColor,
        paddingVertical: 15,
        marginTop: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.buttonColor
    },

    flatBtnText:{
        textAlign: 'center',
        color: "white",
        fontWeight: "700",
    },

    flatButtonSizeSM:{
        minWidth: 120,
        paddingVertical: 8,
    },


    // search box
    searchBoxContainer:{
 
    },
    searchBox: {
        backgroundColor: Colors.componentBackgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 0,
        borderRadius: 4,
    }

}