import { combineReducers } from 'redux'
import navigation from './navigation'
import detail from './detail'
import user from './user'
import app_option from './app-option'
import message from './message'
import notification from './notification'

const rootReducer = combineReducers({
    navigation,
    detail,
    message,
    notification,
    user,
    app_option,
})

export default rootReducer
