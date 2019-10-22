import { Colors } from '@themes/index'


export default {

    // tag as box
    boxWrapContainer: {
        flex: 2,
        // flexDirection: 'column',
        flexDirection: 'row',
        // justifyContent: 'space-around',
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        flexWrap: 'wrap', 
        // backgroundColor: 'red'
    },

    boxWrapContainerNew: {
        flex: 1,
        // flexDirection: 'column',
        flexDirection: 'row',
        // justifyContent: 'space-around',
        alignItems: 'center', 
        justifyContent: 'space-between',
        // flexWrap: 'wrap', 
        // backgroundColor: 'red'
    },

    boxWrapItem: {  
        // marginBottom: 15,
        overflow: 'hidden',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.componentBackgroundColor,
        // alignItems: 'center',
        justifyContent: 'center',
        // padding: 8,
        // marginRight: 10,
    },
    myWrap:{
        flex:0.3,
        height:100,
        margin:5
    },
    myWrapWhoAreYou:{
        flex:0.4,
        height:170,
        margin:5,
        alignItems:'center'
    },

    boxWrapItemSizeMD: {
        flex: 0.2,
        // width: 150,
        height: 160,
        margin: 7
    },

    boxWrapItemSizeSM: {
        width: 107,
        height: 107,
    },

    boxWrapItemTwoCol: {  
        // width: 160,
        // height: 200,  
        // backgroundColor: 'gray',
        // alignItems: 'flex-start',
        marginBottom: 10,
        flex: 1,
    },

    boxWrapContainerNoWrap:{
        flex: 1,  
        flexDirection: 'column',
        alignItems: 'stretch', 
        flexWrap: 'nowrap',   
    },

    boxWrapItemNoWrap: { 
        height: 160,
    },

    boxWrapSelected: {  
        borderWidth: 5,
        backgroundColor: Colors.buttonColor,
        borderColor: Colors.primaryColor,
    },

    boxFeatured: {   
        backgroundColor: Colors.primaryColor,
        paddingTop: 5,
        paddingBottom: 2,
        // width: 165,
    },

    boxWrapSelectStatus: {
        color: 'white',
        textAlign: 'center',
        fontSize: 12,
    },

    boxWrapSpaceAround: {
        alignItems:'center',
        justifyContent:'space-around',
        flexDirection:'row',
        flexWrap:'wrap',
        padding:10
    },

    iconPlus: {
        color: 'gray',
        fontSize: 26,
        // marginRight: 5,
    },

    iconPlayTopRight: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'transparent',
        // color: Colors.textBlack
    },

    iconPlayTopRightSM: {
        position: 'absolute',
        top: 0,
        right: 10,
        backgroundColor: 'transparent',
        // color: Colors.textBlack
    },

    iconPlayBottomRight: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: 'transparent',
        // color: Colors.textBlack
    },

}