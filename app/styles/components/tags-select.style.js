import { Colors } from '@themes/index'


export default {

    // tag as box
    tagContainer: {
        flex: 2,
        flexDirection: 'row',
        // justifyContent: 'space-around',
        // alignItems: 'stretch', 
        justifyContent: 'space-between',
        flexWrap: 'wrap', 
        
    },

    tagsSelect: {  
        width: 165,
        height: 180,
        // backgroundColor: Colors.textColor,
        padding: 20,
        marginBottom: 5,
        overflow: 'hidden',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.componentBackgroundColor,
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    // simple tag
    tagContainerNormal: {
        // flex: 2,
        flexDirection: 'row',
        // justifyContent: 'space-around',
        alignItems: 'center', 
        // justifyContent: 'space-between',
        flexWrap: 'wrap', 
        
    },

    tagsSelectNormal: {  
        // minWidth: 75,
        // minHeight: 180,
        marginRight: 5,
        padding: 5,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginBottom: 5,
        overflow: 'hidden',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.componentBackgroundColor,
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    tagSelectedGreen: { 
        backgroundColor: Colors.secondaryCol,
        borderWidth: 0,
    },

    tagTitleSelectedGreen: { 
        color: 'white'
    },

    infoBottom:{ 
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },

    withBgGray: { 
        backgroundColor: Colors.componentBackgroundColor,
        borderWidth: 1,
        borderColor: Colors.componentDarkBackgroundColor,
    },
    withBgPinkOld:{
        backgroundColor: Colors.buttonColor,
        borderWidth: 1,
        borderColor: Colors.buttonColor,
    },
    tagsSelectMinWidth:{
        minWidth: 75,
    },

    tagsSelected: {  
        backgroundColor: Colors.buttonColor,
        borderColor: Colors.primaryColorDark
    },

    tagTitle: {
        color: Colors.textBlack,
        // fontWeight: 'bold',
    },

    tagTitleSizeSM: {
        fontSize: 11.5, 
    },

    tagTitleSelected: {
        color: 'white',
    },

    tagStatusContainer: {
        // position: 'absolute',
        // bottom:0,
        // left: 0,
        // backgroundColor: 'red',
        width: 165,
        // paddingVertical: 10,
        // flex:1,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems: 'center'
    },

    tagSelectStatus: {
        color: 'white',
        textAlign: 'center',
    },

    iconCheck: {
        color: 'white',
        fontSize: 18,
        marginRight: 5,
    },



    

}