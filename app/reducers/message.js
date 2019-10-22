import * as ActionTypes from '../constants/ActionTypes'

export default function(state = null, action) {

    switch(action.type) {

        // Set user object
        case ActionTypes.MESSAGE:
            // console.log('reducer  chat_obj : ', action.messageObj);
            return action.messageObj

        default:
            return state
    }
}
