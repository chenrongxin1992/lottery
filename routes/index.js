var express = require('express');
var router = express.Router();
var crypto = require("crypto");
const request = require('request')
const wxuserinfo = require('../db/userinfo')

//微信接口的哈希加密方法  
function sha1(str) {  
    var md5sum = crypto.createHash("sha1");  
    md5sum.update(str);  
    str = md5sum.digest("hex");  
    return str;  
} 

//二维码进入，跳进授权链接
router.get('/guide',function(req,res){
	console.log('redirect')
	res.redirect(302,'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx711b069e8a1bbdcb&redirect_uri=http%3A%2F%2Fbdsc.szu.edu.cn%2Flottery%2Fgetuserinfo&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect')
})

/* GET home page. */
router.get('/', function(req, res, next) {
	let signature = req.query.signature,
		timestamp = req.query.timestamp,
		nonce = req.query.nonce,
		echostr = req.query.echostr
	console.log('check args -->',signature,timestamp,nonce)
	let oriArr = new Array()
	oriArr[0] = nonce
	oriArr[1] = timestamp
	oriArr[2] = 'weixin_szucssetoken'
	oriArr.sort()
	let original = oriArr.join('')
	let scyptostring = sha1(original)
	console.log('拼接字符-->',original)
	if(signature === scyptostring){
		console.log('----- 签名一致 -----')
		return res.end(echostr)
	}
	else{
		console.log('----- 签名不一致 -----')
		return res.end('false')
	}
  //res.render('index', { title: 'Express' });
});

const appId = 'wx711b069e8a1bbdcb',
	  secret = '67787bf4b37e5b82a73905a7f2c532d8'
const redirecturi = encodeURIComponent('http://bdsc.szu.edu.cn/lottery/getuserinfo')
const getcodeurl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + redirecturi + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect' 

router.get('/getuserinfo',function(req,res){
	//1.引导用户同意授权,获取code
	let code = req.query.code,
		state = req.query.state
	console.log('code && state-->',code,state)
	//2.使用code换取网页授权access_token
	//https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
	let get_access_token_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appId + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code'
	request.get(get_access_token_url,function(err,response,body){
		if(err){
			console.log(err)
			return res.json({'errMsg':err})
		}
		if(!err && response.statusCode == 200){
			console.log('body-->',typeof(body))
			let access_token = JSON.parse(body).access_token,
				openid = JSON.parse(body).openid,
				refresh_token = JSON.parse(body).refresh_token
			console.log('access_token && openid && refresh_token -->',access_token,openid,refresh_token)
			//3.拉去用户信息
			//https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN 
			let getuserinfo_url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN'
			request.get(getuserinfo_url,function(err_1,response_1,body_1){
				if(err_1){
					console.log(err_1)
					return res.json({'errMsg':err_1})
				}
				if(!err_1 && response_1.statusCode == 200){
					console.log('----- getuserinfo success -----')
					let _wxuserinfo = new wxuserinfo({
						openid : JSON.parse(body_1).openid,
						nickname : JSON.parse(body_1).nickname,
						sex : JSON.parse(body_1).sex,
						province : JSON.parse(body_1).province,
						city : JSON.parse(body_1).city,
						country : JSON.parse(body_1).country,
						headimgurl : JSON.parse(body_1).headimgurl
					})
					console.log('_wxuserinfo-->',_wxuserinfo)
					wxuserinfo.findOne({'openid':JSON.parse(body_1).openid},function(e,doc){
						if(e){
							console.log(e)
							return res.json({'errMsg':e})
						}
						if(doc && doc.length != 0){
							console.log('----- 该用户已存在，只更新头像链接 -----')
							wxuserinfo.update({'_id':doc._id},{$set:{'headimgurl':JSON.parse(body_1).headimgurl}},function(ee){
								if(ee){
									console.log('----- 更新出错 -----')
									return res.json({'errMsg':'error occured'})
								}
								console.log('----- 更新成功 -----')
								return res.render('welcome')
								//return res.json({'errMsg':'更新成功 render a page'})
							})
						}
						if(!doc || doc.length ==0){
							console.log('----- 没有该用户信息，保存 -----')
							_wxuserinfo.save(function(error){
								if(error){
									console.log(error)
									return res.json({'errMsg':'error occured'})
								}
								console.log('----- save _wxuserinfo success ----')
								return res.render('welcome')
								//return res.json({'errMsg':'success render a page'})
							})
						}
					})
				}
			})
		}
	})
})

router.get('/nianhui',function(req,res){
	res.render('nianhui');
})

function randomsort(a, b) {
   return Math.random()>.5 ? -1 : 1; //通过随机产生0到1的数，然后判断是否大于0.5从而影响排序，产生随机性的效果。
}

router.get('/getheadimgdata',function(req,res){
	let newdata = new Array()
	let search = wxuserinfo.find({})
		search.exec(function(err,docs){
			if(err){
				console.log(err)
				return false
			}
			console.log(docs)
			//format data
			if(docs){
				for(let k=0;k<docs.length;k++){
					let tmp = {}
						tmp['name'] = docs[k].nickname,
						tmp['avatar'] = docs[k].headimgurl,
						tmp['data'] =  {}
						tmp['data']['xueyuan'] = '计算机与软件学院'
						newdata.push(tmp)
						tmp = {}
				}
				console.log('newdata-->',newdata)
				newdata.sort(randomsort)
				console.log('乱序-->',newdata)
				return res.json({'errCode':0,'data':newdata})
			}
			if(!docs){
				console.log('----- no result -----')
				return false
			}
		})
})

router.get('/add',function(req,res){
	let _wxuserinfo = new wxuserinfo({
		openid : 'ddd',
		nickname : 'daaa',
		sex : 'aadfa',
		province : 'afasdfew',
		city : 'fadf',
		country : 'dddaer',
		headimgurl : 'http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoM9YQgo16wrfwRVaULnjONpINwoJb9R4BnicE09x0v8vicCBZnvURzjRXEm4PyqtAocmCdiavMKbRXg/0'
	})
	_wxuserinfo.save(function(err){
		return res.json({'errMsg':'success'})
	})
})

router.get('/test',function(req,res){
	let newdata = new Array()
	let search = wxuserinfo.find({ is_used:{ $ne:1}})
		search.exec(function(err,docs){
			if(err){
				console.log('err-->',err)
				return res.json({'err':err})
			}
			if(docs){
				//console.log('newdata-->',newdata)
				docs.sort(randomsort)
				console.log('乱序-->',docs)
				return res.render('test',{userinfo:docs})
			}
			if(!docs){
				console.log('----- no result -----')
				return false
			}
			// console.log('docs-->',docs)
			// res.render('test',{userinfo:docs})
		})
})
router.post('/delete_el',function(req,res){
	let _id = req.body._id
	console.log('check _id-->',_id)
	wxuserinfo.remove({'_id':_id},function(err){
		if(err){
			console.log('err-->',err)
			return res.json({'errCode':-1,'errMsg':err})
		}
		return res.json({'errCode':0,'errMsg':'remove success'})
	})
})
module.exports = router;
