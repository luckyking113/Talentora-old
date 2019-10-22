import * as ActionTypes from '../constants/ActionTypes'
// import { user } from '../api/response'
import { UserHelper, StorageData } from '@helper/helper';

// Fetch and set user
export function message(objAssign) {
    return (dispatch, getState) => {
        console.log('objAssign : ', objAssign);
        // setTimeout( () => { 
            dispatch({
                messageObj: objAssign,
                type: ActionTypes.MESSAGE
            })
        // },200)
 
    }
}