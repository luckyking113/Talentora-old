import * as ActionTypes from '../constants/ActionTypes'
import { user } from '../api/response'
import { UserHelper, StorageData } from '@helper/helper';

// Fetch and set user
export function authenticate(opts) {
    return (dispatch, getState) => {

        // it may be delay for show the launch screen for (500ms)
        setTimeout( () => {

            dispatch({
                type: ActionTypes.SET_USER,
                user: UserHelper.UserInfo,
            })

            // check background on first launch the app
            if(opts){
                opts.setState({  
                    isLoading: false,
                })
            }

        }, 500)
    }
}