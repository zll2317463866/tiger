#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2021/7/10 22:23 下午
# @File    : jd_beauty.py
# @Project : jd_scripts
# @Desc    : 京东APP->燃动夏季
import random
import re
import aiohttp
import asyncio
import time
import json
from urllib.parse import unquote, quote
from utils.console import println
from config import USER_AGENT, JD_BURNING_SUMMER_CODE
from utils.browser import open_page, open_browser


class JdBurningSummer:
    """
    京东APP燃动夏季
    """
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': USER_AGENT,
        "Host": "api.m.jd.com",
        "Referer": "https://wbbny.m.jd.com/babelDiy/Zeus/2rtpffK8wqNyPBH6wyUDuBKoAbCt/index.html",
        'Origin': 'https://wbbny.m.jd.com',
    }

    def __init__(self, pt_pin, pt_key):

        self._browser = None
        self._page = None
        self._cookies = {
            'pt_pin': pt_pin,
            'pt_key': pt_key
        }
        self._pt_pin = unquote(pt_pin)
        self._code = None
        self._url = 'https://wbbny.m.jd.com/babelDiy/Zeus/2rtpffK8wqNyPBH6wyUDuBKoAbCt/index.html'

        self.browser_cookies = [
            {
                'domain': '.jd.com',
                'name': 'pt_pin',
                'value': pt_pin,
            },
            {
                'domain': '.jd.com',
                'name': 'pt_key',
                'value': pt_key,
            }
        ]

    async def request(self, session, function_id, body=None, method='POST', callback=None):
        try:
            if body is None:
                body = {}
            url = 'https://api.m.jd.com/client.action?advId={}&functionId={}&body={}&client=wh5&clientVersion=1.0.0&' \
                  'uuid=1623732683334633-4613462616133636&appid=o2_act'. \
                format(function_id, function_id, quote(json.dumps(body)))
            if callback:
                url += '&{}'.format(callback)
            if method == 'POST':
                response = await session.post(url=url)
            else:
                response = await session.get(url=url)
            text = await response.text()
            data = json.loads(text)
            if data['code'] != 0:
                return data
            return data['data']
        except Exception as e:
            println('{}, 获取数据失败, {}!'.format(self._pt_pin, e.args))
            return {
                'bizCode': 999,
                'bizMsg': '无法获取服务器数据!'
            }

    async def browser_task_page_view(self, session, task_token):
        """
        访问任务
        """
        try:
            body = {"businessId": "babel", "componentId": "1938322209a94fa9945dfae29abe1fc6", "taskParam": json.dumps({
                'taskToken': task_token, "biz": "babel",
            })}
            url = 'https://api.m.jd.com/?client=wh5&clientVersion=1.0.0' \
                  '&functionId=queryVkComponent&body={}&_timestamp={}'.format(quote(json.dumps(body)),
                                                                              int(time.time()) * 1000)
            response = await session.get(url=url)
            text = await response.text()
            data = json.loads(text)
            if data['code'] == '0':
                return True
            else:
                return False
        except Exception as e:
            println('{}, 访问任务页面失败:{}'.format(self._pt_pin, e.args))

    async def query_task_result(self, session, task_token):
        """
        查询任务结果
        """
        try:
            url = 'https://api.m.jd.com/client.action?functionId=qryViewkitCallbackResult&client=wh5'
            body = 'body={}'.format(quote(json.dumps({
                "dataSource": "newshortAward", "method": "getTaskAward",
                "reqParams": json.dumps({"taskToken": task_token}),
                "sdkVersion": "1.0.0", "clientLanguage": "zh", "onlyTimeId": int(time.time() * 1000),
                "riskParam": {
                    "platform": "3", "orgType": "2", "openId": "-1", "pageClickKey": "Babel_VKCoupon",
                    "eid": "",
                    "fp": "-1", "shshshfp": "",
                    "shshshfpa": "",
                    "shshshfpb": "",
                    "childActivityUrl": "",
                    "userArea": "-1", "client": "", "clientVersion": "", "uuid": "", "osVersion": "",
                    "brand": "", "model": "", "networkType": "", "jda": "-1"}
            })))
            response = await session.post(url=url, data=body)
            text = await response.text()
            data = json.loads(text)
            return data
        except Exception as e:
            println('{}, 查询任务结果失败:{}'.format(self._pt_pin, e.args))

    async def do_task(self, session, task, view_page=False, action_type=1):
        """
        做任务
        """
        if 'waitDuration' in task and task['waitDuration'] > 0:
            timeout = task['waitDuration']
            # timeout = 1
        else:
            timeout = 1

        if task['status'] == 2:
            println('{}, 任务:{}今日已完成!'.format(self._pt_pin, task['taskName']))
            return

        if 'browseShopVo' in task:
            task_item_list = task['browseShopVo']
        elif 'shoppingActivityVos' in task:
            task_item_list = task['shoppingActivityVos']
        elif 'productInfoVos' in task:
            task_item_list = task['productInfoVos']
        elif 'brandMemberVos' in task:
            task_item_list = task['brandMemberVos']
        else:
            task_item_list = []

        for item in task_item_list:
            if 'title' in item:
                title = item['title']
            elif 'shopName' in item:
                title = item['shopName']
            elif 'taskName' in item:
                title = item['taskName']
            elif 'skuName' in item:
                title = item['skuName']
            else:
                println(item)
                title = ''

            if title == '':
                title = '未知'

            if item['status'] == 2: # 已完成
                continue
            ss = await self.get_ss()
            println(ss)
            await asyncio.sleep(1)
            body = {
                "taskId": task['taskId'],
                "taskToken": item['taskToken'],
                "actionType": 1,
                'ss': json.dumps(json.dumps(ss))
            }
            res = await self.request(session, 'olympicgames_doTaskDetail', body)
            await asyncio.sleep(1)

            if res['bizCode'] != 0:
                body = {
                    "taskId": task['taskId'],
                    "taskToken": item['taskToken'],
                    "actionType": 0,
                    "ss": json.dumps(json.dumps(ss))
                }
                res = await self.request(session, 'olympicgames_doTaskDetail', body)
                await asyncio.sleep(1)

            println(res)
            if res['bizCode'] == 0:
                println('{}, 成功领取任务:《{}》!'.format(self._pt_pin, title))
            else:
                println('{}, 无法领取任务:《{}》!'.format(self._pt_pin, title))
                continue

            if not view_page:  # 不需要需要访问页面
                if res['bizCode'] != 0:
                    println('{}, 任务:《{}》执行失败, {}'.format(self._pt_pin, title, res['bizMsg']))
                else:
                    println('{}, 完成任务:《{}》, 获得卡币:{}!'.format(self._pt_pin, title, res['result']['score']))
                continue

            success = await self.browser_task_page_view(session, item['taskToken'])
            if success:
                println('{}, 成功完成任务《{}》!'.format(self._pt_pin, title))
            else:
                println('{}, 无法完成任务《{}》!'.format(self._pt_pin, title))

            println('{}, 正在进行任务:《{}》, 需要等待{}秒!'.format(self._pt_pin, title, timeout))
            await asyncio.sleep(timeout)

            res = await self.query_task_result(session, item['taskToken'])
            if res['code'] == '0':
                println('{}, 任务:{}, {}'.format(self._pt_pin, title, res['toast']['subTitle']))
                continue
            else:
                println('{}, 无法领取任务:《》的奖励!'.format(self._pt_pin, title))

            await asyncio.sleep(1)

    async def get_cookies(self):
        """
        获取拼图验证后的cookies
        :return:
        """
        result_cookies = dict()
        cookies = await self._page.cookies()
        if not cookies:
            return None
        for cookie in cookies:
            result_cookies[cookie['name']] = cookie['value']
        return result_cookies

    async def get_lottery_shop_sign(self, session):
        """
        :param session:
        :return:
        """
        data = await self.request(session, 'qryCompositeMaterials', {
            "qryParam": "[{\"type\":\"advertGroup\",\"id\":\"05559280\",\"mapTo\":\"indexCheckIn\"},"
                        "{\"type\":\"advertGroup\",\"id\":\"05382858\",\"mapTo\":\"indexIconBuy\"},"
                        "{\"type\":\"advertGroup\",\"id\":\"05382925\",\"mapTo\":\"indexPullDown\"},"
                        "{\"type\":\"advertGroup\",\"id\":\"05654322\",\"mapTo\":\"indexPawn\"}]",
                        "openid": "oA1P50DcXZX2rccNJaDy5L8C5rrk", "applyKey": "big_promotion"})
        if not data or data['code'] != '0':
            println('{}, 无法获取免费抽奖数据!'.format(self._pt_pin))
            return None
        return data['data']['indexIconBuy']['list'][0]['link']

    async def receive_coupon_currency(self, session):
        """
        领券得卡币
        """
        # data = await self.request(session, 'qryCompositeMaterials', {
        #     "qryParam": json.dumps([{"type": "advertGroup",
        #                              "id": "05373029",
        #                              "mapTo": "coupon1",
        #                              "next": [{
        #                                  "type": "productSku",
        #                                  "mapKey": "extension.cpSkuId",
        #                                  "mapTo": "sku"}]},
        #                             {"type": "advertGroup",
        #                              "id": "05373048",
        #                              "mapTo": "coupon2",
        #                              "next": [{
        #                                  "type": "productSku",
        #                                  "mapKey": "extension.cpSkuId",
        #                                  "mapTo": "sku"}]}]),
        #     "openid": -1,
        #     "applyKey": "big_promotion"})
        # if data['code'] != '0':
        #     println('{}, 获取优惠券列表失败!'.format(self._pt_pin))
        #     return
        # item_list = data['data']['coupon1']['list']
        # for item in item_list:
            # if item['extension']['soldOut'] != 0:
            #     continue
            # body = {
            #     "activityId": "2rtpffK8wqNyPBH6wyUDuBKoAbCt",
            #     "scene": 1, "args": "key={},roleId={}".format(item['extension']['key'], item['extension']['roleId']),
            #     "actKey": item['extension']['key']}
            # coupon_name = item['extension']['couponTitle']
            # res = await self.request(session, 'newBabelAwardCollection', body)
            # println('{}, 领取优惠券《{}》, {}'.format(self._pt_pin, coupon_name, res['subCodeMsg']))
            # await asyncio.sleep(1)
            # data = await self.request(session, 'olympicgames_collectCurrency', {'type': 4})
            # if data['bizCode'] == 0:
            #     println('{}, 成功领取卡币, 当前卡币:{}!'.format(self._pt_pin, data['result']['poolCurrency']))
            # else:
            #     println('{}, 领取优惠券任务的卡币失败, {}'.format(self._pt_pin, data['bizMsg']))
            #     if data['bizCode'] == -902:
            #         break
            # await asyncio.sleep(1)

        # 不需要领优惠券直接收卡币
        while True:
            data = await self.request(session, 'olympicgames_collectCurrency', {'type': 4})
            if data['bizCode'] == 0:
                println('{}, 成功领取卡币, 当前卡币:{}!'.format(self._pt_pin, data['result']['poolCurrency']))
            else:
                println('{}, 领取优惠券任务的卡币失败, {}'.format(self._pt_pin, data['bizMsg']))
                break
            await asyncio.sleep(1)

    async def receive_cash(self, session):
        """
        收红包
        """
        data = await self.request(session, 'olympicgames_receiveCash', {"type": 6})
        if data['bizCode'] != 0:
            println('{}, 领红包失败, {}!'.format(self._pt_pin, data['bizMsg']))
            return
        println('{}, 成功领取红包, 当前红包总额:{}!'.format(self._pt_pin, data['result']['userActBaseVO']['totalMoney"']))

    async def do_sport(self, session):
        """
        做运动
        """
        body = {
            'ss': "{\"extraData\":{\"log\":\"1626365279647~1rbt56Y2BhiMDF0ZWxZQzAxMQ==.RVNeb3BBXF5udUFQXycGDh1eaywGVFo8PUVJWnV2WFcSaz1FGx80BjMkPj9jICsoCSFMEQ86cyc9VB4kSVgS.32cd9fe2~5,2~28D728A807EB834B054AFB0230097818696B06D2002BAF44DD55C3BD949D60D5~1ov9uwy~C~TxdDXhAKaGscF0FaWBYPbG4eElREXhcPAxkWRkQRCBICAAIDBgIABgIPAgQBCgAJBhcYF0NQUxEIEkdCREFBFhkWQlJSEAoRUFZBQUFBQVQVHxBAV1gSD24FARgHBx8EHAQaBhkFaRkWX10RCAMfFFNGFw4XAw1RUgIJUFVSBwQAUQdQBAMABgMCAg0NAlNSUw4LVFIRGhJbRRYPFnleXUdIE04IA2oCARYZFUcQCgIAAgMGAgAGAg4FBgcfFFpeFw4XVRcbEVRAURQKF0ZZcHN0ZVUSZH1yYFcNQFZXBWRrCndUCw0XGRZbQhcNEXVfXFFcUBV9W1cbFR8QXlJAEg8XVxcYF0RQQBIJbQcFBRgBBAVqHxBCXBQKbhdVFxgXVhEeElIUHBdUFhkWVBUfEFERGhJUF2kZFlxYUhAKEVBWU1NSU0BBFR8QUVkUChdAFhkWVl4RCBJEBR4EGwQXGBdUVW1GEQwSBQQWGRZXUxEIEhEaElhfFg9vBRsDHgBuGhJXWVtSFg8VUhAcEVtDUhcOF1UXSg==~1dtx9rg\",\"sceneid\":\"OY217hPageh5\"},\"random\":\"86910696\"}"
        }

        data = await self.request(session, 'olympicgames_startTraining', body)
        if data['bizCode'] != 0:
            println('{}, 无法进行运动, {}!'.format(self._pt_pin, data['bizMsg']))
            if data['bizCode'] != -601:  # 运动失败，并且不是在运动中, 退出运动!
                return

        while True:
            data = await self.request(session, 'olympicgames_speedTraining')
            if data['bizCode'] != 0:
                println('{}, 运动加速失败, {}!'.format(self._pt_pin, data['bizMsg']))
                break
            else:
                println('{}, 运动加速中!'.format(self._pt_pin))

            println('{}, 等等1s, 进行下一次运动加速!'.format(self._pt_pin))
            await asyncio.sleep(1)

        data = await self.request(session, 'olympicgames_endTraining')
        if data['bizCode'] != 0:
            println('{}, {}!'.format(self._pt_pin, data['bizMsg']))
        else:
            println('{}, 完成运动, 获得卡币:{}!'.format(self._pt_pin, data['result']['currencyNum']))

    async def collect_currency(self, session):
        """
        收取卡币
        """
        ss = await self.get_ss()
        data = await self.request(session, 'olympicgames_collectCurrency', {"type": 1, "ss": ss})
        if data['bizCode'] != 0:
            println('{}, 收取任务卡币失败:{}'.format(self._pt_pin, data['bizMsg']))
        else:
            println('{}, 成功收取任务卡币, 当前卡币:{}!'.format(self._pt_pin, data['result']['poolCurrency']))

        data = await self.request(session, 'olympicgames_collectCurrency', {"type": 2})
        if data['bizCode'] != 0:
            println('{}, 收取运动卡币失败:{}'.format(self._pt_pin, data['bizMsg']))
        else:
            println('{}, 成功收取运动卡币, 当前卡币:{}!'.format(self._pt_pin, data['result']['poolCurrency']))

    async def do_tasks(self, session, app_sign="1"):
        """
        :param session:
        :param app_sign: 1表示京东APP, 2表示微信小程序
        :return:
        """
        data = await self.request(session, 'olympicgames_getTaskDetail', {"taskId": "", "appSign": app_sign})

        if not data or data['bizCode'] != 0:
            println('{}, 获取任务列表失败!'.format(self._pt_pin))
            return

        if app_sign == '1':
            # 邀请码
            self._code = data['result']['inviteId']
            channel = '京东APP'
        else:
            channel = '微信小程序'
        task_list = data['result']['taskVos']
        println('{}, 开始执行{}-每日任务...'.format(self._pt_pin, channel))

        for task in task_list:
            if task['taskType'] == 14:  # 助力任务
                continue
            elif task['taskType'] in [3, 26, 7, 9]: #  3, 26, 7
                await self.do_task(session, task, action_type=1)
            elif task['taskType'] in [21]:
                println('{}, 跳过入会任务!'.format(self._pt_pin))
            # elif task['taskType'] == 2:  # 加购任务
            #     await self.shopping_task(session, task)
            else:
                println('{}, 任务《{}》暂未实现!'.format(self._pt_pin, task['taskType']))

    async def lottery(self, session, channel_sign="1", shop_sign="1000014803"):
        """
        免费抽奖
        """
        data = await self.request(session, 'olympicgames_shopLotteryInfo',
                                  {"channelSign": channel_sign, "shopSign": shop_sign})
        if data['bizCode'] != 0:
            println('{}, 无法获取免费抽奖数据!'.format(self._pt_pin))
            return
        #  抽奖次数 boxLotteryNum
        # 邀请码 inviteId
        task_list = data['result']['taskVos']
        for task in task_list:
            task = str(task)
            task_status = int(re.search(r"'status': (\d+),", task).group(1))
            task_name = re.search(r"'taskName': '(.*?)',", task).group(1)
            task_type = int(re.search(r"'taskType': (\d+),", task).group(1))
            # wait_duration = int(re.search(r"'waitDuration': (\d+)", task).group(1))   # 等等时长
            task_id = int(re.search(r"'taskId': (\d+),", task).group(1))
            task_token = re.search(r"'taskToken': '(.*?)'", task).group(1)

            if task_status == 2:
                println('{}, 免费抽奖任务《{}》今日已完成!'.format(self._pt_pin, task_name))
                continue

            if task_type in [14, 21]:
                println('{}, 免费抽奖任务《{}》跳过!'.format(self._pt_pin, task_name))
                continue

            res = await self.request(session, 'olympicgames_bdDoTask', {
                'taskId': task_id,
                'taskToken': task_token,
                "shopSign": shop_sign,
                "actionType": 1,
                "showErrorToast": False
            })

            if res['bizCode'] == 0:
                println('{}, 成功完成免费抽奖任务:《{}》!'.format(self._pt_pin, task_name))
            else:
                println('{}, 无法完成免费抽奖任务:《{}》!'.format(self._pt_pin, task_name))

        data = await self.request(session, 'olympicgames_shopLotteryInfo',
                                  {"channelSign": channel_sign, "shopSign": shop_sign})

        if data['bizCode'] != 0:
            println('{}, 无法查询当前抽奖次数!'.format(self._pt_pin))
            return
        lottery_num = data['result']['boxLotteryNum']

        if lottery_num < 1:
            println('{}, 当前抽奖次数不足!'.format(self._pt_pin))
            return

        println('{}, 开始执行免费抽奖, 抽奖次数:{}!'.format(self._pt_pin, lottery_num))

        for i in range(lottery_num):
            res = await self.request(session, 'olympicgames_boxShopLottery', {"shopSign": shop_sign})
            if res['bizCode'] != 0:
                println('{}, 第{}次免费抽奖失败!'.format(self._pt_pin, i + 1))
            else:
                println('{}, 第{}次免费抽奖成功!'.format(self._pt_pin, i + 1))

    async def indiana(self, session):
        """
        夺宝
        """
        data = await self.request(session, 'olympicgames_home')
        if data['bizCode'] != 0:
            println('{}, 无法获取每日夺宝数据!'.format(self._pt_pin))
            return

        item_list = data['result']['pawnshopInfo']['betGoodsList']
        for item in item_list:
            if item['score'] > 0:
                println('{}, 夺宝:{}, 已下注!'.format(self._pt_pin, item['skuName']))
                continue
            res = await self.request(session, 'olympicgames_pawnshopBet', {"skuId": item['skuId']})

            if res['bizCode'] == 0:
                println('{}, 夺宝:{}, 成功下注!'.format(self._pt_pin, item['skuName']))
            else:
                println('{}, 夺宝:{}, 下注失败, {}!'.format(self._pt_pin, item['skuName'], res['bizMsg']))

    async def shopping_task(self, session, task):
        """
        加购任务
        """
        if task['status'] == 2:
            println('{}, 今日已完成加购任务!'.format(self._pt_pin))
            return

        data = await self.request(session, 'olympicgames_getFeedDetail', {"taskId": task['taskId']})
        if 'bizCode' not in data or data['bizCode'] != 0:
            println('{}, 获取加购任务列表失败!'.format(self._pt_pin))
            return

        item_list = data['result']['addProductVos'][0]['productInfoVos']

        for item in item_list:
            if item['status'] == 2:
                continue

            body = {
                "taskId": task['taskId'],
                "taskToken": item['taskToken']
            }
            res = await self.request(session, 'olympicgames_doTaskDetail', body)
            if res['bizCode'] != 0:
                println('{}, 加购失败, {}!'.format(self._pt_pin, res['bizMsg']))
                break
            println('{}, 完成一次加购任务!'.format(self._pt_pin))

    async def wish_lottery(self, session, shop_sign="1000014803"):
        """
        心愿抽奖
        """
        data = await self.request(session, 'olympicgames_wishShopLottery', {"shopSign": shop_sign})
        println('{}, 心愿抽奖结果:{}'.format(self._pt_pin, data))

    async def help_friend(self, session):
        """
        助力好友
        :param session:
        :return:
        """
        for code in JD_BURNING_SUMMER_CODE:
            if code == self._code:
                continue
            res = await self.request(session, 'olympicgames_assist', {"inviteId": code, "type": "confirm"})
            if res['bizCode'] == 0:
                if 'hongBaoVO' in res['result']:
                    award = '红包:{}元'.format(res['result']['hongBaoVO']['withdrawCash'])
                else:
                    award = ''
                println('{}, 成功助力好友, 奖励: {}!'.format(self._pt_pin, award))
            else:
                println('{}, 助力好友失败, {}!'.format(self._pt_pin, res['bizMsg']))

    async def login(self, session):
        data = await self.request(session, 'olympicgames_home')
        if data['bizCode'] != 0:
            println('{}, 获取活动首页数据失败!'.format(self._pt_pin))
            return False
        println('{}, 已连续登录:{}天!'.format(self._pt_pin, data['result']['continuedSignDays']))
        return True

    async def get_share_code(self):
        """
        获取助力码
        :return:
        """
        async with aiohttp.ClientSession(headers=self.headers, cookies=self._cookies) as session:
            res = await self.request(session, 'olympicgames_getTaskDetail', {"taskId": "", "appSign": "1"})
            if res['bizCode'] != 0:
                println('{}, 获取助力码失败!'.format(self._pt_pin))
                return
            code = res['result']['inviteId']
            println('{}, 助力码:{}!'.format(self._pt_pin, code))
            return code

    async def get_ss(self):
        """
        获取验证参数
        """
        println('{}, 正在获取验证参数!'.format(self._pt_pin))
        try:
            data = await self._page.evaluate(('''() => {
                                const DATA = {appid:'50085',sceneid:'OY217hPageh5'};
                                window.smashUtils.init({"appid": "50085","sceneid": 'OY217hPageh5', 'uid': '-1'})
                                var t = Math.floor(1e7 + 9e7 * Math.random()).toString();
                                var e = window.smashUtils.get_risk_result({id: t,data: {random: t}}).log;
                                var o = JSON.stringify({extraData: {log:  e || -1, sceneid: DATA.sceneid,},random: t});
                                return o;
                                }'''))
            return data
        except Exception as e:
            println(e.args)

    async def run(self):
        """
        程序入口
        """
        # try:
        #     self._browser = await open_browser()
        #     self._page = await open_page(self._browser, self._url, USER_AGENT, self.browser_cookies)
        # except Exception as e:
        #     println('{}, 程序出错:{}!'.format(self._pt_pin, e.args))
        #
        # if not self._browser:
        #     println('{}, 无法打开浏览器, 退出程序!'.format(self._pt_pin))
        #     return
        #
        # if not self._page:
        #     println('{}, 无法打开页面, 退出程序!'.format(self._pt_pin))
        #     if self._browser:
        #         await self._browser.close()
        #     return
        #
        # cookies = await self.get_cookies()
        # if not cookies:
        #     println('{}, 获取cookies失败, 退出程序!')
        #     return

        async with aiohttp.ClientSession(headers=self.headers, cookies=self._cookies) as session:
            success = await self.login(session)
            if not success:
                println('{}, 无法登录活动首页, 未开启活动或账号已黑!'.format(self._pt_pin))
                return
            await self.help_friend(session)
            await self.do_tasks(session, app_sign='1')
            await self.do_tasks(session, app_sign='2')
            await self.do_sport(session)
            await self.indiana(session)
            await self.lottery(session, channel_sign="1")
            await self.wish_lottery(session)
            wx_shop_sign = await self.get_lottery_shop_sign(session)
            await self.lottery(session, channel_sign="2", shop_sign=wx_shop_sign)
            await self.wish_lottery(session, shop_sign=wx_shop_sign)
            await self.collect_currency(session)  # 收取卡币
            await self.receive_coupon_currency(session)  # 领券得卡币
            await self.receive_cash(session)

        if self._browser:
            await self._browser.close()


def start(pt_pin, pt_key):
    """
    程序入口
    """
    app = JdBurningSummer(pt_pin, pt_key)
    asyncio.run(app.run())


if __name__ == '__main__':
    # from config import JD_COOKIES
    # start(*JD_COOKIES[0].values())
    from utils.process import process_start
    process_start(start, '燃动夏季')
