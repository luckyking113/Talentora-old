import * as ActionTypes from '../constants/ActionTypes'

export default function(state = null, action) {

    switch(action.type) {

        // Set user object
        case ActionTypes.NOTIFICATION:
            // console.log('reducer  chat_obj : ', action.messageObj);
            return action.notification

        default:
            return state
    }
}
