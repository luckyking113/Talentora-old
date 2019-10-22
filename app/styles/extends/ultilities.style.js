import {Dimensions, Platform} from 'react-native'
import { Colors } from '@themes/index'

const { width, height } = Dimensions.get('window')

export default {

    mainPadding: {
        padding: 20
    },

    marginTopBig: {
        marginTop: 20
    },

    marginTopLG: {
        marginTop: 50
    },

    marginTopMDD: {
        marginTop: 30
    },

    marginTopMD: {
        marginTop: 20
    },

    marginTopSM: { 
        marginTop: 15
    },
 
    marginTopXS: { 
        marginTop: 10
    },

    marginTopXXS: { 
        marginTop: 5
    },

    noMargin: { 
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },

    marginBotLG: {
        marginBottom: 50
    },

    marginBotMD: {
        marginBottom: 20
    },

    marginBotSM: { 
        marginBottom: 15
    },

    marginBotXS: { 
        marginBottom: 10
    },

    marginBotXXS: { 
        marginBottom: 5
    },

    paddingTopNav: { 
        paddingTop: 30
    },

    paddingTopNavMD: { 
        paddingTop: 20
    }, 

    paddingTopNavSM: { 
        paddingTop: 10
    },
    paddingBotNavSM: { 
        paddingBottom: 10
    },
    paddingBotNavXS: { 
        paddingBottom: 5
    },

    mainVerticalPaddingMD: {
        paddingVertical: 40,
    },

    mainVerticalPadding: {
        paddingVertical: 20,
    },

    mainVerticalPaddingMDD: {
        paddingVertical: 15,  
    },

    mainVerticalPaddingSM: {
        paddingVertical: 10,
    },
    mainVerticalPaddingXS: {
        paddingVertical: 2,
    },

    mainHorizontalPadding: {
        paddingHorizontal: 20,
    },

    mainHorizontalPaddingMD: {
        paddingHorizontal: 15,
    },

    mainHorizontalPaddingSM: {
        paddingHorizontal: 10,
    },

    mainHorizontalPaddingXS: {
        paddingHorizontal: 5,
    },

    mainScreenBg: {
        backgroundColor: Colors.screenBg
    },

    // text color

    grayLessText: {
        color: Colors.textColorDark  
    },

    darkGrayText:{
        color: Colors.textColorDark,
    },

    fontBold: {
        fontWeight: 'bold',
    },

    blackText:{
        fontWeight: 'bold',
        color:Colors.textBlack,
    },

    grayLess:{
        color: Colors.placeHolder,
    },

    // text setting
    centerEle: {
        // textAlign: 'center'
        justifyContent: 'center',
        alignItems: 'center'       
    },

    // font size
    btFontSize: {
        fontSize: 16, 
    },
    btFontSizeSM: {
        fontSize: 14, 
    },
    btFontSizeXS: {
        fontSize: 12, 
    },
    btFontSizeXXS: {
        fontSize: 10, 
    },

    // shadow box
    shadowBox: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 3,
        shadowOpacity: 0.2
    },


    // image
    bgCover: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },

    // image 
    bgContain: {
        resizeMode: 'contain'
    },


    // other
    bgOverlay: {
        flex: 1,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        width: width, 
    },

    fullWidthHeightAbsolute: {
        backgroundColor: 'rgba(0,0,0,.15)',
        flex: 1,
        position: 'absolute', 
        alignItems: 'center', 
        justifyContent: 'center',
        top: 0,
        left: 0 ,
        right: 0,
        bottom: 0,
        // right: 40
    },

    defaultContainer:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    justFlexContainer: {
        flex: 1
    }, 

    // align
    textCenter: {
        textAlign: 'center'
    },

    // flex align
    flexCenter: {
        alignItems: 'center'
    },

    // flex align
    flexStretch: {
        alignItems: 'stretch'
    },

    // avarta
    userAvatarFull: {
        flex: 1,
    },
 
    // flexbox
    flexVerMenu : {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        // alignItems: 'stretch',
    },

    spaceBetween: {
        justifyContent: 'space-between',
    },

    // flexbox
    flexVer : {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    // line with text center
    lineWithTextCenterContainer:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 60
    },
    lineWithTextCenter:{
        height: 1,
        width: 150,
        alignSelf:'center',
        backgroundColor: Colors.lineColor,
        marginLeft: 5,
        marginRight: 5
    },

    lineWithText:{
        textAlign: 'center',
        textAlignVertical: 'top',
        fontWeight: 'bold',
        color:Colors.textColor,
    },

    // box
    absoluteBox: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: Colors.componentBackgroundColor,
        paddingTop: 15,
        paddingBottom: 15,
        position: 'absolute',
        bottom:0,
        left: 0,
    },

    // box absolute bottom
    absoluteBoxBottom: { 
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        bottom:0,
        left: 0,
    },

    // box absolute bottom
    absoluteBoxBottomRight: { 
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        bottom:0,
        right: 0,
    },

    // clear style
    noBorder:{
        borderWidth: 0,
    },

    noRadius: {
        borderRadius: 0
    },

    whiteBorder: {
        borderWidth: 2,
        borderColor: 'rgba(225,255,255,.8)',
    },

    // background color
    bgTransparent: {
        backgroundColor: 'transparent',
    },
    darkishRedBg: {
        backgroundColor: Colors.darkishRed,
    },
    grayBg: { 
        backgroundColor: Colors.textColorDark,
    },
    grayLessBg:{
        backgroundColor: Colors.componentDarkBackgroundColor
    },
    greenBg: {
        backgroundColor: Colors.secondaryCol,
    },

    // scroll view style
    viewContainerOfScrollView:{
        flex: 1,
        backgroundColor: Colors.screenBg 
    },

    defaultScrollContainer: {
        justifyContent: 'flex-start',
        backgroundColor: Colors.screenBg        
    },


    // icon
    volumnIcon: {
        fontSize: 22
    },
    inputLabelFontSize:{
        fontSize:14
    },
    inputValueFontSize:{
        fontSize:13
    },

    selectedBox: {
        // backgroundColor: Colors.secondaryCol,
    }

}