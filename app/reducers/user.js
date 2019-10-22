import * as ActionTypes from '../constants/ActionTypes'

export default function(state = null, action) {

    switch(action.type) {

        // Set user object
        case ActionTypes.SET_USER:
            // console.log('reducer : ', action.user);
            return action.user

        default:
            return state
    }
}
