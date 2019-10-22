import {
    StackNavigator,
    NavigationActions
} from 'react-navigation';

// talent seeker (employer)
import Job from '@components/job/job'
import PostJobList from '@components/job/talent-seeker/post-job-list'
import CreatePostJob from '@components/job/talent-seeker/create-post-job'
import ViewPostJob from '@components/job/talent-seeker/view-post-job'     
import JobDetail from '@components/job/talent-seeker/job-detail'

import AvailableJob from '@components/job/talent/available-job'
import AppliedJob from '@components/job/talent/applied-job'

import ProfileUser from '@components/user/profile'
import MessageDetail from '@components/message/message'

import Review from '@components/user/review';
import LeaveReview from '@components/user/leave-review';

// tabel (user)
// import AvailableAppliedJob from '@components/job/talent/available-applied-job'
import JobTab from '@navigators/tabs/job-tabs'; // talent (user) has tab on job page (available & applied)


import { Colors } from '@themes/index';
import { headerStyle, titleStyle } from '@styles/header.style'

import { UserHelper, StorageData, Helper } from '@helper/helper';

import { transparentHeaderStyle, defaultHeaderStyle } from '@styles/components/transparentHeader.style';


// console.log('sowowo : ', props);
const TabBarComponent = (props) => {
    console.log('TabBarComponent Props: ', props);
}
const options = {
    // initialRouteName: 'CreatePostJob',
    // initialRouteName: 'JobDetail',
    initialRouteName: 'JobList',
    navigationOptions:{
        headerStyle: headerStyle,  
        headerTitleStyle: titleStyle,
        // headerTintColor: Colors.textColorDark,
    }
}

const navOptions =  {   
    headerStyle: defaultHeaderStyle,   
    // headerTintColor: Colors.textColorDark, 
}


const jobStack = StackNavigator({

    // JobList:   { screen: UserHelper._isEmployer() ? PostJobList : JobTab },
    // JobList:   { screen: PostJobList },
    JobList:   { 
        screen: Job,
        navigationOptions: ({ navigation }) => ({ 
            ...navOptions,
        })
    },
    CreatePostJob:   { 
        screen: CreatePostJob,
        navigationOptions: ({ navigation }) => ({ 
            // ...navOptions,
        }) 
    },
    ViewPostJob:   { 
        screen: ViewPostJob,
        navigationOptions: ({ navigation }) => ({ 
            // ...navOptions,
        })
    },
    JobDetail: { 
        screen: JobDetail,
        navigationOptions: ({ navigation }) => ({ 
            // ...navOptions,
        })
    },

    AvailableJob: { 
        screen: AvailableJob,
        navigationOptions: ({ navigation }) => ({ 
            ...navOptions,
        })
    },
    AppliedJob: { 
        screen: AppliedJob,
        navigationOptions: ({ navigation }) => ({ 
            ...navOptions,
        })
    },

    Profile:   { 
        screen: ProfileUser,
        navigationOptions: ({ navigation }) => ({ 
            ...navOptions,
        })
     },
     Message:   { 
        screen: MessageDetail,
        navigationOptions: ({ navigation }) => ({ 
            ...navOptions,
        })
     },
     Review:{
        screen:Review,
        navigationOptions: ({ navigation }) => ({ 
            ...navOptions,
        })
    },
    LeaveReview:{
        screen:LeaveReview,
        navigationOptions: ({ navigation }) =>  ({  
            ...navOptions,
        })
    },
    // AvailableAppliedJob: { screen: JobTab},

}, options);



const navigateOnce = (getStateForAction) => (action, state) => {
  const {type, routeName} = action;
  return (
    state &&
    type === NavigationActions.NAVIGATE &&
    routeName === state.routes[state.routes.length - 1].routeName
  ) ? null : getStateForAction(action, state);
  // you might want to replace 'null' with 'state' if you're using redux (see comments below)
};


jobStack.router.getStateForAction = navigateOnce(jobStack.router.getStateForAction);

export default jobStack;
