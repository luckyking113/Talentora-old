export default {
    wrapper: {
        flex: 1,
        backgroundColor: '#fff'
    },
    h1: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    item: {
        // height: 200,
        backgroundColor: '#efefef',
        marginBottom: 10
    },
    imgThumnail: {
        resizeMode: "cover",
        // width: 400,
        height: 200,
    },
    overlay: {
        flex: 1,
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        width: 400
    },
    cardInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: "#efefef",
    },
    userInfo:{
        flex: 5,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarContainer: {
        overflow: 'hidden',
        borderRadius: 100,
        borderWidth: 2,
        borderColor: 'white'
    },
    userAvatar: {
        width: 35,
        height: 35,
    },
    userAction: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // textAlign: 'right'
    },
    userName: {
        flex: 1,
        color: "black",
        fontSize: 16, 
        paddingLeft: 10,
        overflow: 'hidden'
    },
    textInfo: {
        flex: 1,
        paddingLeft: 10,
        overflow: 'hidden'
    },
    cardTitle: {
        color: "black",
        fontSize: 16, 
    },
    icon: {
        // fontSize: 22
    },
    favIcon: {
        fontSize: 22,
        color: "black"
    }
}
