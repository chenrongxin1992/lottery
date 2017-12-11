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
    createTimeStamp : {type : String,default:moment().format('X')}
})

module.exports = mongoose.model('wxuserinfo',wxuserinfoSchema);