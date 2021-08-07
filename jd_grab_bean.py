#!/usr/local/bin/python
# -*- coding: utf-8 -*-
# @Time    : 2021/7/29 10:34 上午
# @File    : jd_grab_bean.py
# @Project : jd_scripts
# @Cron    : 5 2,22 * * *
# @Desc    : 京东APP->首页->领京豆->抢京豆
import aiohttp
import asyncio
import json
from config import USER_AGENT
from urllib.parse import urlencode
from utils.console import println
from utils.wraps import jd_init
from db.model import Code, CODE_JD_GRAB_BEAN


@jd_init
class JdGrabBean:
    """
    抢京豆
    """
    headers = {
        'user-agent': USER_AGENT,
        'referer': 'https://h5.m.jd.com/rn/3MQXMdRUTeat9xqBSZDSCCAE9Eqz/index.html',

    }

    async def request(self, session, function_id, body=None, method='GET'):
        """
        :param session:
        :param function_id:
        :param body:
        :param method:
        :return:
        """
        try:
            if not body:
                body = {}
            params = {
                'functionId': function_id,
                'appid': 'ld',
                'client': 'android',
                'clientVersion': '10.0.10',
                'networkType': 'wifi',
                'osVersion': '',
                'uuid': '',
                'jsonp': '',
                'body': json.dumps(body),
            }
            url = 'https://api.m.jd.com/client.action?' + urlencode(params)
            if method == 'GET':
                response = await session.get(url)
            else:
                response = await session.post(url)
            await asyncio.sleep(0.5)
            text = await response.text()
            data = json.loads(text)
            return data

        except Exception as e:
            println('{}, 获取数据失败,{}!'.format(self.account, e.args))
            return {
                'code': 9999
            }

    async def _get_index_data(self, session):
        """
        获取首页数据
        :param session:
        :return:
        """
        res = await self.request(session, 'signBeanGroupStageIndex',
                                 {"monitor_refer": "", "rnVersion": "3.9", "fp": "-1", "shshshfp": "-1",
                                  "shshshfpa": "-1", "referUrl": "-1", "userAgent": "-1", "jda": "-1",
                                  "monitor_source": "bean_m_bean_index"})
        if res['code'] != '0':
            println('{}, 获取首页数据失败!'.format(self.account))
            return None
        return res['data']

    async def get_share_code(self, session):
        """
        :return:
        """
        println('{}, 正在获取助力码!'.format(self.account))
        data = await self._get_index_data(session)
        if not data:
            println('{}, 无法获取助力码!'.format(self.account))
            return
        await asyncio.sleep(1)
        await self.request(session, 'signGroupHit', {'activeType': data['activityType']})
        await asyncio.sleep(1)
        data = await self._get_index_data(session)

        if not data:
            println('{}, 无法获取助力码!'.format(self.account))
            return

        code = data['shareCode'] + '@' + data['groupCode']
        Code.insert_code(code_key=CODE_JD_GRAB_BEAN, code_val=code, account=self.account, sort=self.sort)
        println('{}, 助力码: {}'.format(self.account, code))

        return code

    async def help(self, session):
        """
        :return:
        """
        data = await self._get_index_data(session)
        if not data:
            println('{}, 获取首页数据失败, 无法助力好友!'.format(self.account))
            return None

        params = {
            'activeType': data['activityType'],
            'groupCode': '',
            'activeId': str(data['activityMsg']['activityId']),
            'shareCode': '',
            "source": "guest"
        }

        item_list = Code.get_code_list(CODE_JD_GRAB_BEAN)

        for item in item_list:
            try:
                account, code = item.get('account'), item.get('code')
                if account == self.account:
                    continue
                params['shareCode'], params['groupCode'] = code.split('@')
                res = await self.request(session, 'signGroupHelp', params)
                if res.get('code', '-') != '0':
                    println('{}, 无法助力好友:{}, {}!'.format(self.account, account, res.get('errorMessage')))
                    continue
                help_message = res.get('data', dict()).get('helpToast')
                println('{}, 助力好友:{}, {}'.format(self.account, account, help_message))

                if '上限' in help_message:
                    break

                await asyncio.sleep(1)

            except Exception as e:
                println('{}, 助力好友失败, {}!'.format(self.account, e.args))
                continue

    async def run(self):
        """
        :return:
        """
        async with aiohttp.ClientSession(headers=self.headers, cookies=self.cookies) as session:
            await self.get_share_code(session)

    async def run_help(self):
        async with aiohttp.ClientSession(headers=self.headers, cookies=self.cookies) as session:
            await self.help(session)


if __name__ == '__main__':
    from utils.process import process_start
    process_start(JdGrabBean, '抢京豆', process_num=1)

