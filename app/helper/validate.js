var func = require('./validate-email');

module.exports = function(value , type) {  
    
    if(!func(value.val) && type == 'email'){
        return true;
    }
    else if(value.val==''){
        return true;
    }
    
}