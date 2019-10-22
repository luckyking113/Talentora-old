import { Colors } from '@themes/index'

export default {


    // default style
    itemContainer: {
        flex: 1,
        // padding: 15,
        // flexDirection: 'row',
        // alignItems: 'center',
        // marginTop: 5, 
    }, 
    itemSubContainer: {
        flex: 1,  
        padding: 15,
        flexDirection: 'row',
        // alignItems: 'center',
        marginBottom: 15,
    }, 
    itemSubContainerSM: {
        flex: 1,  
        padding: 15,
        flexDirection: 'row',
        // alignItems: 'center',
        marginBottom: 10,
    }, 

    itemTitle: {
        fontSize: 16,
    },

    itemTitleSub: {
        fontSize: 14,
    },

    itemPhoto: {
        height: 50,
        width: 50,
        // borderRadius: 20,
    },

    infoContainer: {
        flex: 1, 
        marginLeft: 12,
        marginRight: 0,
        // top: -2,
    },

    nameContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    // more style
    boxStyle: {

    },

    postDate: {
        fontSize: 11,
        color: 'gray',
        textAlign: 'right',
        // marginTop: 4
    },

    badgeContainer: {
        flex: 1,
        // flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 35,
        right: 15,
        backgroundColor: 'red',
        borderRadius: 100,
        overflow: 'hidden',
        // padding: 5,
        paddingVertical: 2,
        width: 30,
        // paddingHorizontal: 10,
    },

    badgeNumber: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 11,
    },

    boxWithShadow: {  
        // borderWidth: 1,  
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1.5
        },
        shadowRadius: 3,
        shadowOpacity: 0.18
    },

    // list item normal
    // static item

    rowNormal:{
        // flex
        // height: 45,
        paddingVertical: 5,
    },

    rowBorderBot: { 
        borderBottomWidth: 1,
        borderBottomColor: Colors.componentBackgroundColor,
    },

    itemIcon: {
        fontSize: 22,
        color: 'gray',
        marginRight: 5,
        paddingLeft: 0,
    },

    noIcon: {
        height: 45,
    },

    itemText: {
        fontSize: 16,
        color: 'gray',
    },


}