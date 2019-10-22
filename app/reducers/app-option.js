import * as ActionTypes from '../constants/ActionTypes'

// Will eventually contain all detail items
const initialOption = {
    isReadTutorialScreen: false    
}

export default function(state = null, action) {

    switch(action.type) {

        // Set user object
        case ActionTypes.APP_OPTION:
            // console.log('reducer  chat_obj : ', action.messageObj);
            return action.appOption

        default:
            return state
    }
}
