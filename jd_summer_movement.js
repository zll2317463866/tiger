/*

https://wbbny.m.jd.com/babelDiy/Zeus/2rtpffK8wqNyPBH6wyUDuBKoAbCt/index.html

12 9,11,13,15,17 * * * https://raw.githubusercontent.com/smiek2221/scripts/master/jd_summer_movement.js

需要解密
https://raw.githubusercontent.com/smiek2221/scripts/master/MovementFaker.js

*/
const $ = new Env('燃动夏季');
const jd_MovementFaker = require('./jd_MovementFaker.js')
// const MovementFaker = require('./ZooFaker.js')
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const pKHelpFlag = true;//是否PK助力  true 助力，false 不助力
const pKHelpAuthorFlag = false;//是否助力作者PK  true 助力，false 不助力
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [];
$.cookie = '';
$.inviteList = [];
$.pkInviteList = [];
$.secretpInfo = {};
$.innerPkInviteList = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

$.appid = 'o2_act';
const UA = $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : "JD4iPhone/9.3.5 CFNetwork/1209 Darwin/20.2.0") : ($.getdata('JDUA') ? $.getdata('JDUA') : "JD4iPhone/9.3.5 CFNetwork/1209 Darwin/20.2.0")


!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      $.cookie = cookiesArr[i];
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = $.UserName;
      $.hotFlag = false; //是否火爆
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
      console.log(`\n如有未完成的任务，请多执行几次\n`);
      await movement()
      if($.hotFlag)$.secretpInfo[$.UserName] = false;//火爆账号不执行助力
      // break
    }
  }
  // await showMsg();
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })


async function movement() {
  try {
    $.signSingle = {};
    $.homeData = {};
    $.secretp = ``;
    $.taskList = [];
    $.shopSign = ``;
    await takePostRequest('olympicgames_home');
    $.userInfo =$.homeData.result.userActBaseInfo
    console.log(`\n\n待兑换金额：${Number($.userInfo.poolMoney)}当前等级:${$.userInfo.medalLevel}  ${$.userInfo.poolCurrency}/${$.userInfo.exchangeThreshold}(攒卡领${Number($.userInfo.cash)}元)\n\n`);
    // await $.wait(1000);
    // await takePostRequest('olympicgames_collectCurrency');
    await $.wait(1000);
    await takePostRequest('olympicgames_getTaskDetail');
    await $.wait(1000);
    //做任务
    for (let i = 0; i < $.taskList.length && !$.hotFlag; i++) {
      $.oneTask = $.taskList[i];
      if ([1, 3, 5, 7, 9, 26].includes($.oneTask.taskType) && $.oneTask.status === 1) {
        $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
          await takePostRequest('olympicgames_doTaskDetail');
          if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
            await $.wait(getRndInteger(7000, 8000));
            let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
            await callbackResult(sendInfo)
          } else if ($.oneTask.taskType === 5 || $.oneTask.taskType === 3 || $.oneTask.taskType === 26) {
            await $.wait(2000);
            console.log(`任务完成`);
          } else {
            console.log($.callbackInfo);
            console.log(`任务失败`);
            await $.wait(3000);

          }

        }
        break
      } else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 2){
        console.log(`做任务：${$.oneTask.taskName};等待完成 (实际不会添加到购物车)`);
        $.taskId = $.oneTask.taskId;
        $.feedDetailInfo = {};
        await takePostRequest('olympicgames_getFeedDetail');
        let productList = $.feedDetailInfo.productInfoVos;
        let needTime = Number($.feedDetailInfo.maxTimes) - Number($.feedDetailInfo.times);
        for (let j = 0; j < productList.length && needTime > 0; j++) {
          if(productList[j].status !== 1){
            continue;
          }
          $.taskToken = productList[j].taskToken;
          console.log(`加购：${productList[j].skuName}`);
          await takePostRequest('add_car');
          await $.wait(1500);
          needTime --;
        }
      }else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 0){
        $.activityInfoList = $.oneTask.productInfoVos ;
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：浏览${$.oneActivityInfo.skuName};等待完成`);
          await takePostRequest('olympicgames_doTaskDetail');
          if ($.oneTask.taskType === 2) {
            await $.wait(2000);
            console.log(`任务完成`);
          } else {
            console.log($.callbackInfo);
            console.log(`任务失败`);
            await $.wait(3000);
          }
        }
      }

    }
  } catch (e) {
    $.logErr(e)
  }

}

async function takePostRequest(type) {
  let body = ``;
  let myRequest = ``;
  switch (type) {
    case 'olympicgames_home':
      body = `functionId=olympicgames_home&body={}&client=wh5&clientVersion=1.0.0&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_home`, body);
      break;
    case 'olympicgames_collectCurrency':
      body = await getPostBody(type);
      console.log(body)
      myRequest = await getPostRequest(`olympicgames_collectCurrency`, body);
    case 'olympicgames_getTaskDetail':
      body = `functionId=${type}&body={"taskId":"","appSign":"1"}&client=wh5&clientVersion=1.0.0&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_getTaskDetail`, body);
      break;
    case 'olympicgames_doTaskDetail':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_doTaskDetail`, body);
      break;
    case 'olympicgames_getFeedDetail':
      body = `functionId=olympicgames_getFeedDetail&body={"taskId":"${$.taskId}"}&client=wh5&clientVersion=1.0.0&appid=${$.appid}`;
      myRequest = await getPostRequest(`olympicgames_getFeedDetail`, body);
      break;
    case 'add_car':
      body = await getPostBody(type);
      myRequest = await getPostRequest(`olympicgames_doTaskDetail`,body);
      break;
    default:
      console.log(`错误${type}`);
  }
  if(myRequest){
    return new Promise(async resolve => {
      $.post(myRequest, (err, resp, data) => {
        try {
          // console.log(data);
          dealReturn(type, data);
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve();
        }
      })
    })
  }
}


async function dealReturn(type, result) {
  try {
    data = JSON.parse(result);
  } catch (e) {
    console.log(`返回异常：${result}`);
    return;
  }
  switch (type) {
    case 'olympicgames_home':
      if (data.code === 0) {
        if (data.data['bizCode'] === 0) {
          $.homeData = data.data;
        }
      }
      break;
    case 'olympicgames_collectCurrency':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`收取成功，获得：${data.data.result.poolCurrency}`);
      }else{
        console.log(result);
      }
      if(data.code === 0 && data.data && data.data.bizCode === -1002){
        $.hotFlag = true;
        console.log(`该账户脚本执行任务火爆，暂停执行任务，请手动做任务或者等待解决脚本火爆问题`)
      }
      break;
    case 'olympicgames_getTaskDetail':
      if (data.code === 0) {
        console.log(`互助码：${data.data.result && data.data.result.inviteId || '助力已满，获取助力码失败'}`);
        if (data.data.result && data.data.result.inviteId) {
          $.inviteList.push({
            'ues': $.UserName,
            'secretp': $.secretp,
            'inviteId': data.data.result.inviteId,
            'max': false
          });
        }
        $.taskList = data.data.result && data.data.result.taskVos || [];
      }
      break;
    case 'olympicgames_doTaskDetail':
      $.callbackInfo = data;
      break;
    case 'olympicgames_getFeedDetail':
      // console.log(result)
      if (data.code === 0) {
        $.feedDetailInfo = data.data.result.addProductVos[0] || [];
      }
      break;
    case 'add_car':
      if (data.code === 0) {
        let acquiredScore = data.data.result.acquiredScore;
        if(Number(acquiredScore) > 0){
          console.log(`加购成功,获得金币:${acquiredScore}`);
        }else{
          console.log(`加购成功`);
        }
      }else{
        console.log(result);
        console.log(`加购失败`);
      }
      break
    default:
      console.log(`未判断的异常${type}`);

  }

}

async function getPostBody(type) {
  return new Promise(async resolve => {
    let taskBody = '';
    try {
      const log = await MovementFaker.getBody($)
      if (type === 'olympicgames_collectCurrency') {
        taskBody = `functionId=olympicgames_collectCurrency&body=${JSON.stringify({"type":2,"ss" : log})}&client=wh5&clientVersion=1.0.0&appid=${$.appid}`;
      } else if(type === 'add_car'){
        taskBody = `functionId=olympicgames_doTaskDetail&body=${JSON.stringify({"taskId": $.taskId,"taskToken":$.taskToken,"ss" : log})}&client=wh5&clientVersion=1.0.0&appid=${$.appid}`
      }else{
        taskBody = `functionId=${type}&body=${JSON.stringify({"taskId": $.oneTask.taskId,"actionType":1,"taskToken" : $.oneActivityInfo.taskToken,"ss" : log})}&client=wh5&clientVersion=1.0.0&appid=${$.appid}`
      }
      //console.log(taskBody)
    } catch (e) {
      $.logErr(e)
    } finally {
      resolve(taskBody);
    }
  })
}

async function getPostRequest(type, body) {
  let url = `https://api.m.jd.com/client.action?advId=${type}`;
  // if(type === 'listTask' || type === 'acceptTask' ){
  //   url = `https://ms.jr.jd.com/gw/generic/hy/h5/m/${type}`;
  //   url = `https://ms.jr.jd.com/gw/generic/hy/h5/m/${type}`;
  // }
  const method = `POST`;
  const headers = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",
    'Cookie': $.cookie,
    "Origin": "https://wbbny.m.jd.com",
    "Referer": "https://wbbny.m.jd.com/",
    "User-Agent": "jdapp;iPhone;9.2.0;14.1;",

  };
  return {url: url, method: method, headers: headers, body: body};
}


//领取奖励
function callbackResult(info) {
  return new Promise((resolve) => {
    let url = {
      // https://api.m.jd.com/client.action?functionId=qryViewkitCallbackResult&client=wh5
      url: `https://api.m.jd.com/?functionId=qryViewkitCallbackResult&client=wh5&clientVersion=1.0.0&body=${info}&_timestamp=` + Date.now(),
      headers: {
        'Origin': `https://bunearth.m.jd.com`,
        'Cookie': $.cookie,
        'Connection': `keep-alive`,
        'Accept': `*/*`,
        'Host': `api.m.jd.com`,
        'User-Agent': "jdapp;iPhone;10.0.2;14.3;8a0d1837f803a12eb217fcf5e1f8769cbb3f898d;network/wifi;model/iPhone12,1;addressid/4199175193;appBuild/167694;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        'Accept-Encoding': `gzip, deflate, br`,
        'Accept-Language': `zh-cn`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://bunearth.m.jd.com'
      }
    }

    $.get(url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(data.toast.subTitle)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}

/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
 function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

// 随机数
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

// HcmphLbwLgz3e4GeFdc0gyCnu5wlLizkvmSWIFXp22aPrXt7J52xeOZdxQbiZfu8JBSaLVWZdlLd895623Ef7A
// P225KkcRkoc91DVIx2hkfALcgFjRWn667zB4ACWD52H9DkYC9bLg
// {"taskId":1,"taskToken":"P225KkcRkoc91DVIx2hkfALcgFjRWn667zB4ACWD52H9DkYC9bLg","ss":"{\"extraData\":{\"log\":\"1625681591610~1gRLzpIpjr3MDFnU3VRUDAxMQ==.VmVHZGZfYkdgYFZgQi9oMAFCaRNVMjtnLlZ/Q31lS2ELYy5WLRQBBCZzMAsqMRIRMj4/BSNgHhU3ECYBWm4L.306c2479~5,2~46BA39D9DA866D59B975C915589D04334A6B14921AD218047D9AEE6B82EB7DF7~1chssz4~C~SRVBWxcLbm8YFEVYWBANbmsZE1JAWhQLBBkQREYUDxMEBAYDBw4EBwQMBgUHBwANABMaF0VSURQPE0FGQEJFFBkQQFBXFwsXVFJCRUNBR1YXGhdBUVwWDGoHBh4FBwYZBBkFGAIdB2geFV9cFwsGHhZVQhQPEFVUVwEEDQIFBQIEAVcGDARWBA1RAlcFBAQDAwMBUFMDEBgUX0YXCBViX1sCBxAYFEUUDwMBBwMDCQQHDQcHBwUeFV9dFwsXUxYaE1BFUBUPFFRhYXMUc2tMY3NTVlhtZ2MDekRVU0JjCggUGRNbRBYME3FaXVBZUxV4W1EaFB0UW1NBFwwXAAMFAg8FFBkQRFZEFwtuCwYAHQIHCmoZFEdeFwhvFFAUGRBWFxoXUBceFlcTGhdTFRkUVBMZEFUUbBoXW1hUFA8TU1RSUFdQQUYVGRRUWxcIFkMTGhdRXhcMF0YGHAUYARQZEFRTaUMTDxAEBxMaF1BTFwwXQ1RcUFlcCwcLBwABAQUEEBgUXFwXCGwFGgUdBW8YFFNaWlUVDxRUExkQWUVWFA8QVhdL~0s0cmu4\",\"sceneid\":\"OY217hPageh5\"},\"random\":\"29057441\"}","actionType":1}
// olympicgames_getMyFriend
  



// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
