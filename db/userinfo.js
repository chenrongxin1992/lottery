/**
 *  @Author:    chenrongxin
 *  @Create Date:   2017-12-10
 *  @Description:   用户信息
 */
var mongoose = require('./db'),
    Schema = mongoose.Schema,
    moment = require('moment')

var wxuserinfoSchema = new Schema({          
    openid :{type : String },//
    nickname :{type:String},//
    sex :{type:String},//
    province :{type:String},//
    city :{type:String},//
    country : {type:String},
    headimgurl :{type:String},//
    createTime : {type : String, default : moment().format('YYYY-MM-DD HH:mm:ss') },  
    createTimeStamp : {type : String,default:moment().format('X')},
    is_used : {type:Number,default:0}//0未使用，1已使用
})

module.exports = mongoose.model('wxuserinfo',wxuserinfoSchema);