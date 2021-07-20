/*
京喜财富岛提现
活动地址: 京喜-财富岛
活动时间：长期
更新时间：2021-06-4 12:00
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
提现金额，可选0.1 0.5 1 2 10  默认0.1
export CFD_CASHOUT_MONEY=0.1

 获取Token方式：
  打开【❗️京喜农场❗️】，手动任意完成<工厂任务>、<签到任务>、<金牌厂长任务>一项，提示获取cookie成功即可，然后退出跑任务脚本
## TOKEN的形式：{"farm_jstoken":"749a90f871adsfads8ffda7bf3b1576760","timestamp":"1610165423873","phoneid":"42c7e3dadfadsfdsaac-18f0e4f4a0cf"}
## MyJxncToken 对应ck编号
## token 是json  多个拼接在字符中所以需要进行转译
MyJxncToken1={\"farm_jstoken\":\"1126cc70d0a640ee55d12d35a2c1a949\",\"timestamp\":\"1620465575092\",\"phoneid\":\"f13e8ecbcdc218d5\"}
MyJxncToken2={\"farm_jstoken\":\"2d65af69867386b0fed959d25aadbcd4\",\"timestamp\":\"1620489451718\",\"phoneid\":\"144925245d4b8372\"}
MyJxncToken3=
export JXNCTOKENS="${MyJxncToken1}&${MyJxncToken2}&${MyJxncToken3}"
=================================Quantumultx=========================
[task_local]
#京喜财富岛提现
0 0 * * * https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jx_cfdtx.js, tag=京喜财富岛提现, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
=================================Loon===================================
[Script]
cron "0 0 * * *" script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jx_cfdtx.js,tag=京喜财富岛提现
===================================Surge================================
京喜财富岛提现 = type=cron,cronexp="0 0 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jx_cfdtx.js
====================================小火箭=============================
京喜财富岛提现 = type=cron,script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jx_cfdtx.js, cronexpr="0 0 * * *", timeout=3600, enable=true
 */
const $ = new Env('京喜财富岛提现');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
/**
 * 提现金额，可选0.1 0.5 1 2 10  默认0.1
 * export CFD_CASHOUT_MONEY=0.1
 */
let money = 0.5
let jdTokenNode = [];
$.tokenArr = [];
$.appId = 10028;
const UA = `jdpingou;iPhone;4.11.0;${Math.ceil(Math.random()*2+12)}.${Math.ceil(Math.random()*4)};${randomString(40)};`
function randomString(e) {
    e = e || 32;
    let t = "abcdefhijkmnprstwxyz2345678", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

let cookieArr = [], cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookieArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };

    money = process.env.CFD_CASHOUT_MONEY ? parseFloat(process.env.CFD_CASHOUT_MONEY) * 100 : money *100;
    if (!getTokens()) return;
} else {
    cookieArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}



!(async () => {
    if (!cookieArr[0]) {
        $.msg('【京东账号一】宠汪汪积分兑换奖品失败', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    }
    await requestAlgo();
    for (let i = 0; i < cookieArr.length; i++) {
        $.cookie = cookieArr[i]+ '';
        $.currentToken = $.tokenArr[i];
        if ( $.cookie) {
            $.userName =  decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1]);
            $.log(`\n开始【京东账号${i + 1}】${$.userName}`);
            if ($.currentToken) {
                await cashOut();
            }else {
                console.log(`未配置token下一个\n`)
            }
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    }).finally(() => {
        $.done();
    })

async function cashOut() {
    const additional = `&ddwMoney=${money}&ddwPaperMoney=${money *10 }&strPgUUNum=${$.currentToken.farm_jstoken}&strPgtimestamp=${$.currentToken.timestamp}&strPhoneID=${$.currentToken.phoneid}`
    const stk = `_cfd_t,bizCode,ddwMoney,ddwPaperMoney,dwEnv,ptag,source,strPgUUNum,strPgtimestamp,strPhoneID,strZone`;
    await taskGet(`user/CashOut`, stk, additional)
}

function taskGet(type, stk, additional){
    return new Promise(async (resolve) => {
        let myRequest = getGetRequest(type, stk, additional)
        $.get(myRequest, async (err, resp, _data) => {
            let data
            try {
                let contents = ''
                console.log('_data',_data)
                data = $.toObj(_data)
                console.log("data",data)
                if(data && data.iRet == 0){
                    console.log(_data)
                }else{
                    // 1771|1771|5001|0|0,1771|75|1023|0|请刷新页面重试
                    // console.log(_data)
                }
                contents = `1771|${opId(type)}|${data.iRet}|0|${data.sErrMsg || 0}`
                await biz(contents)
            }
            catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve(data);
            }
        });
    });
}
function getGetRequest(type, stk='', additional='') {
    let url = ``;

    if(type === 'user/CashOut'){
        url = `https://m.jingxi.com/jxbfd/${type}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_ste=1&_=${Date.now()}&sceneval=2&_stk=${encodeURIComponent(stk)}`;
        url += additional;
    }
    url += `&h5st=${decrypt(Date.now(), stk, '', url)}`;
    return {
        url,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Connection": "keep-alive",
            'Cookie': $.cookie,
            'Host': 'm.jingxi.com',
            "Referer": "https://st.jingxi.com/",
            "User-Agent": UA,

        }
    }
}

function biz(contents){
    return new Promise(async (resolve) => {
        let myRequest = {
            url:`https://m.jingxi.com/webmonitor/collect/biz.json?contents=${contents}&t=${Math.random()}&sceneval=2`,
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Connection": "keep-alive",
                'Cookie': $.cookie,
                'Host': 'm.jingxi.com',
                "Referer": "https://st.jingxi.com/",
                "User-Agent": UA,
            }
        }
        $.get(myRequest, async (err, resp, _data) => {
            try {
                // console.log(_data)
            }
            catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        });
    });
}

function opId(type){
    let opId = 5001
    if(type == "user/QueryUserInfo") opId = 1
    if(type == "user/GetMgrAllConf") opId = 3
    if(type == "story/QueryUserStory") opId = 5
    if(type == "user/GetJdToken") opId = 11
    if(type == "story/CouponState") opId = 13
    if(type == "story/WelfareDraw") opId = 15
    if(type == "story/GetWelfarePage") opId = 17
    if(type == "story/SendWelfareMoney") opId = 19
    if(type == "user/SetMark") opId = 23
    if(type == "user/GetMark") opId = 25
    if(type == "user/guideuser") opId = 27
    if(type == "user/createbuilding") opId = 29
    if(type == "user/BuildLvlUp") opId = 31
    if(type == "user/CollectCoin") opId = 33
    if(type == "user/GetBuildInfo") opId = 35
    if(type == "user/SpeedUp") opId = 37
    if(type == "story/AddNoticeMsg") opId = 39
    if(type == "user/breakgoldenegg") opId = 41
    if(type == "user/closewindow") opId = 43
    if(type == "user/drawpackprize") opId = 45
    if(type == "user/GetMoneyDetail") opId = 47
    if(type == "user/EmployTourGuide") opId = 49
    if(type == "story/sellgoods") opId = 51
    if(type == "story/querystorageroom") opId = 53
    if(type == "user/queryuseraccount") opId = 55
    if(type == "user/EmployTourGuideInfo") opId = 57
    if(type == "consume/TreasureHunt") opId = 59
    if(type == "story/QueryAppSignList") opId = 61
    if(type == "story/AppRewardSign") opId = 63
    if(type == "task/addCartSkuNotEnough") opId = 123
    if(type == "story/GetActTask") opId = 125
    if(type == "story/ActTaskAward") opId = 127
    if(type == "story/DelayBizReq") opId = 131
    if(type == "story/queryshell") opId = 65
    if(type == "story/QueryRubbishInfo") opId = 67
    if(type == "story/pickshell") opId = 69
    if(type == "story/CollectorOper") opId = 71
    if(type == "story/MermaidOper") opId = 73
    if(type == "story/RubbishOper") opId = 75
    if(type == "story/SpecialUserOper") opId = 77
    if(type == "story/GetUserTaskStatusList") opId = 79
    if(type == "user/ExchangeState") opId = 87
    if(type == "user/ExchangePrize") opId = 89
    if(type == "user/GetRebateGoods") opId = 91
    if(type == "user/BuyGoods") opId = 93
    if(type == "user/UserCashOutState") opId = 95
    if(type == "user/CashOut") opId = 97
    if(type == "user/GetCashRecord") opId = 99
    if(type == "user/CashOutQuali") opId = 101
    if(type == "user/GetAwardList") opId = 103
    if(type == "story/QueryMailBox") opId = 105
    if(type == "story/MailBoxOper") opId = 107
    if(type == "story/UserMedal") opId = 109
    if(type == "story/QueryMedalList") opId = 111
    if(type == "story/GetTakeAggrPage") opId = 113
    if(type == "story/GetTaskRedDot") opId = 115
    if(type == "story/RewardSign") opId = 117
    if(type == "story/helpdraw") opId = 119
    if(type == "story/helpbystage") opId = 121
    if(type == "story/AddSuggest") opId = 133
    return opId
}

async function requestAlgo() {
    $.fp = (getRandomIDPro({ size: 13 }) + Date.now()).slice(0, 16);
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        headers: {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://st.jingxi.com',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': UA,
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://st.jingxi.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "1.0",
            "fp": $.fp,
            "appId": $.appId,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    return new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                const { ret, msg, data: { result } = {} } = JSON.parse(data);
                $.token = result.tk;
                $.genKey = new Function(`return ${result.algo}`)();
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
function getTokens() {
    if ($.isNode()) {
        // 判断github action里面是否有京喜农场 token
        if (process.env.JXNCTOKENS) {
            console.log(process.env.JXNCTOKENS)
            if (process.env.JXNCTOKENS.indexOf('&') > -1) {
                console.log(`您的京喜农场 token 选择的是用&隔开\n`)
                jdTokenNode = process.env.JXNCTOKENS.split('&');
            } else if (process.env.JXNCTOKENS.indexOf('\n') > -1) {
                console.log(`您的京喜农场 token 选择的是用换行隔开\n`)
                jdTokenNode = process.env.JXNCTOKENS.split('\n');
            } else {
                jdTokenNode = process.env.JXNCTOKENS.split();
            }
        } else if (process.env.JD_COOKIE) {
            console.log(`由于您secret里面未提供 tokens，当种植 APP 种子时，将不能正常进行任务，请提供 token 或 种植非 APP 种子！`)
        }

        Object.keys(jdTokenNode).forEach((item) => {
            $.tokenArr.push(jdTokenNode[item] ? JSON.parse(jdTokenNode[item]) : '');
        })
    } else {
        $.tokenArr = JSON.parse($.getdata('jx_tokens') || '[]');
    }
    if (!$.tokenArr[0]) {
        $.msg(
            $.name,
            "【⏰提示】请先获取京喜Token\n获取方式见脚本说明"
        );
        return false;
    }
    return true;
}

function getRandomIDPro() {
    var e,
        t,
        a = void 0 === (n = (t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).size) ? 10 : n,
        n = void 0 === (n = t.dictType) ? 'number' : n,
        i = '';
    if ((t = t.customDict) && 'string' == typeof t) e = t;
    else
        switch (n) {
            case 'alphabet':
                e = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'max':
                e = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
                break;
            case 'number':
            default:
                e = '0123456789';
        }

    for (; a--;) i += e[(Math.random() * e.length) | 0];
    return i;
}
function decrypt(time, stk, type, url) {
    stk = stk || (url ? getUrlQueryParams(url, '_stk') : '')
    if (stk) {
        const timestamp = format("yyyyMMddhhmmssSSS", time);
        const hash1 = $.genKey($.token, $.fp.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getUrlQueryParams(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
        })
        const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
        return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fp.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
    } else {
        return encodeURIComponent('20210713151140309;3329030085477162;10032;tk01we5431d52a8nbmxySnZya05SXBQSsarucS7aqQIUX98n+iAZjIzQFpu6+ZjRvOMzOaVvqHvQz9pOhDETNW7JmftM;3e219f9d420850cadd117e456d422e4ecd8ebfc34397273a5378a0edc70872b9')
    }
}

function format(a, time) {
    if (!a) a = 'yyyy-MM-dd';
    var t;
    if (!time) {
        t = Date.now();
    } else {
        t = new Date(time);
    }
    var e,
        n = new Date(t),
        d = a,
        l = {
            'M+': n.getMonth() + 1,
            'd+': n.getDate(),
            'D+': n.getDate(),
            'h+': n.getHours(),
            'H+': n.getHours(),
            'm+': n.getMinutes(),
            's+': n.getSeconds(),
            'w+': n.getDay(),
            'q+': Math.floor((n.getMonth() + 3) / 3),
            'S+': n.getMilliseconds(),
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, ''.concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    Object.keys(l).forEach(e => {
        if (new RegExp('('.concat(e, ')')).test(d)) {
            var t,
                a = 'S+' === e ? '000' : '00';
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[e] : ''.concat(a).concat(l[e]).substr(''.concat(l[e]).length));
        }
    });
    return d;
}

function getUrlQueryParams(url_string, param) {
    let reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
    let r = url_string.split('?')[1].substr(0).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    };
    return '';
}

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}put(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"put";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
