#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
@Project ：QL
@Date ：2023/7/18 8:42
@File ：1.py
@Author ：红尘先生
"""
#对Curtinlv大佬的脚本进行二改
import logging
import re

'''
Author: tiger
功能：东东农场-仅助力使用
cron: 0 5 * * *
new Env('东东农场-助力');
'''
# 是否按ck顺序助力, true: 按顺序助力 false：按指定用户助力，默认true
ddnc_isOrder = "true"
# 东东农场助力名单(当ddnc_isOrder="false" 才生效), ENV 环境设置 export ddnc_help_list="&用户2&用户3"
ddnc_help_list = ["", "用户2", "用户3"]
#是否开启通知，Ture：发送通知，False：不发送
isNotice = False

count = {}

import os, sys
if "WSKEY_DEBUG" in os.environ or 0:  # 判断调试模式变量
    logging.basicConfig(level=logging.DEBUG, format='%(message)s')  # 设置日志为 Debug等级输出
    logger = logging.getLogger(__name__)  # 主模块
    logger.debug("\nDEBUG模式开启!\n")  # 消息输出
else:  # 判断分支
    logging.basicConfig(level=logging.INFO, format='%(message)s')  # Info级日志
    logger = logging.getLogger(__name__)  # 主模块


try:
    import requests
except Exception as e:
    logger.info(e, "\n缺少requests 模块，请执行命令安装：requests")
    exit(3)
import jdEnv
import time

import urllib3
urllib3.disable_warnings()

from urllib.parse import unquote
# requests.packages.urllib3.disable_warnings()

pwd = os.path.dirname(os.path.abspath(__file__)) + os.sep





if "ddnc_isOrder" in os.environ:
    if len(os.environ["ddnc_isOrder"]) > 1:
        ddnc_isOrder = os.environ["ddnc_isOrder"]
if "ddnc_help_list" in os.environ:
    if len(os.environ["ddnc_help_list"]) > 1:
        ddnc_help_list = os.environ["ddnc_help_list"]
        if '&' in ddnc_help_list:
            ddnc_help_list = ddnc_help_list.split('&')
        logger.info("已获取并使用Env环境 ddnc_help_list:", ddnc_help_list)
if not isinstance(ddnc_help_list, list):
    ddnc_help_list = ddnc_help_list.split(" ")


# 青龙面板，环境变量获取ck,返回ck数组
def get_cookies():
    CookieJDs = []
    Cookiepins = []
    if os.environ.get("JD_COOKIE"):
        logger.info("已获取并使用Env环境 Cookie")
        if '&' in os.environ["JD_COOKIE"]:
            CookieJDs = os.environ["JD_COOKIE"].split('&')
        elif '\n' in os.environ["JD_COOKIE"]:
            CookieJDs = os.environ["JD_COOKIE"].split('\n')
        else:
            CookieJDs = [os.environ["JD_COOKIE"]]
    else:
        if os.path.exists("JD_COOKIE.txt"):
            with open("JD_COOKIE.txt", 'r') as f:
                JD_COOKIEs = f.read().strip()
                if JD_COOKIEs:
                    if '&' in JD_COOKIEs:
                        CookieJDs = JD_COOKIEs.split('&')
                    elif '\n' in JD_COOKIEs:
                        CookieJDs = JD_COOKIEs.split('\n')
                    else:
                        CookieJDs = [JD_COOKIEs]
                    CookieJDs = sorted(set(CookieJDs), key=CookieJDs.index)
        else:
            logger.info("未获取到正确✅格式的京东账号Cookie")
            sys.exit(0)
    for i in CookieJDs:
        pin = re.findall("pt_pin=(.*?);", i)[0]
        Cookiepins.append(pin)
    logger.info(f"====================共{len(CookieJDs)}个京东账号Cookie=========\n")
    logger.info(f"==================脚本执行- 北京时间(UTC+8)：{time.strftime('%Y/%m/%d %H:%M:%S', time.localtime())}=====================\n")
    return CookieJDs, Cookiepins



## 获取通知服务
class msg(object):
    def __init__(self, m):
        self.str_msg = m
        self.message()
    def message(self):
        global msg_info
        logger.info(self.str_msg)
        try:
            msg_info = "{}\n{}".format(msg_info, self.str_msg)
        except:
            msg_info = "{}".format(self.str_msg)
        sys.stdout.flush()
    def getsendNotify(self, a=0):
        if a == 0:
            a += 1
        try:
            url = 'https://gitee.com/curtinlv/Public/raw/master/sendNotify.py'
            response = requests.get(url)
            if 'curtinlv' in response.text:
                with open('sendNotify.py', "w+", encoding="utf-8") as f:
                    f.write(response.text)
            else:
                if a < 5:
                    a += 1
                    return self.getsendNotify(a)
                else:
                    pass
        except:
            if a < 5:
                a += 1
                return self.getsendNotify(a)
            else:
                pass
    def main(self):
        global send
        cur_path = os.path.abspath(os.path.dirname(__file__))
        sys.path.append(cur_path)
        if os.path.exists(cur_path + "/sendNotify.py"):
            try:
                from sendNotify import send
            except:
                self.getsendNotify()
                try:
                    from sendNotify import send
                except:
                    logger.info("加载通知服务失败~")
        else:
            self.getsendNotify()
            try:
                from sendNotify import send
            except:
                logger.info("加载通知服务失败~")
        ###################
msg("").main()
##############


def buildHeaders(ck):
    headers = {
        'Cookie': ck,
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'Referer': '',
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'Host': 'api.m.jd.com',
        'User-Agent': jdEnv.get_UA()
    }
    return headers


def farmA(ck):
    url1 = 'https://api.m.jd.com/client.action?functionId=farmAssistInit&body=%7B%22version%22%3A14%2C%22channel%22%3A1%2C%22babelChannel%22%3A%22120%22%7D&appid=wh5'
    resp = requests.get(url1, headers=buildHeaders(ck), timeout=10).json()
    if resp['status'] == 2:
        return True
    else:
        return False


def getSuccess(ck, user):
    global count
    url = 'https://api.m.jd.com/client.action?functionId=receiveStageEnergy&body=%7B%22version%22%3A14%2C%22channel%22%3A1%2C%22babelChannel%22%3A%22120%22%7D&appid=wh5'
    resp = requests.get(url,  headers=buildHeaders(ck), timeout=10).json()
    if resp['code'] == '0':
        logger.info(f"☺️{user}, 收货水滴【{resp['amount']}g】")
        try:
            count[user] += resp['amount']
        except:
            count[user] = resp['amount']


def getShareCode(ck):
    url = f'https://api.m.jd.com/client.action?functionId=initForFarm&body=%7B%22shareCode%22%3A%22%22%2C%22imageUrl%22%3A%22%22%2C%22nickName%22%3A%22%22%2C%22version%22%3A14%2C%22channel%22%3A2%2C%22babelChannel%22%3A3%7D&appid=wh5'
    response = requests.get(url=url, headers=buildHeaders(ck), timeout=10).json()
    return response['farmUserPro']['shareCode']


def ddnc_help(ck, nickname, shareCode, masterName):
    try:
        url = f'https://api.m.jd.com/client.action?functionId=initForFarm&body=%7B%22shareCode%22%3A%22{shareCode}%22%2C%22imageUrl%22%3A%22%22%2C%22nickName%22%3A%22%22%2C%22version%22%3A14%2C%22channel%22%3A2%2C%22babelChannel%22%3A3%7D&appid=wh5'
        response = requests.get(url=url, headers=buildHeaders(ck), timeout=10).json()
        help_result = response['helpResult']['code']
        if help_result == "0":
            logger.info(f"\t└👌{nickname} 助力成功～")
        elif help_result == "8":
            logger.info(f"\t└😆{nickname} 已没有助力机会~  ")
        elif help_result == "10":
            msg(f"\t└☺️ {masterName} 今天好友助力已满～")
            return True
        else:
            logger.info(f"\t└😄 {nickname} 助力 {masterName} ")

        return False
    except Exception as e:
        logger.info(f"{nickname} 助力失败～", e)
        return False


def start():
    try:
        scriptName = '### 东东农场-助力 ###'
        logger.info(scriptName)
        global cookiesList, userNameList, ckNum
        cookiesList, userNameList = get_cookies()
        if ddnc_isOrder == "true":
            for ck, user in zip(cookiesList, userNameList):
                try:
                    m_ck = ck
                    logger.info(f"开始助力 {user}")
                    try:
                        shareCode = getShareCode(ck)
                    except Exception as e:
                        logger.info(e)
                        continue
                    for ck, nickname in zip(cookiesList, userNameList):
                        if nickname == user:
                            logger.info(f"\t└😓{user} 不能助力自己，跳过~")
                            continue
                        result = ddnc_help(ck, nickname, shareCode, user)
                        if farmA(m_ck):
                            getSuccess(m_ck, user)
                        if result:
                            for n in range(4):
                                if farmA(m_ck):
                                    time.sleep(2)
                                    getSuccess(m_ck, user)
                            break
                except:
                    continue

        elif ddnc_isOrder == "false":
            if not ddnc_help_list:
                logger.info("您未配置助力的账号，\n助力账号名称：可填用户名 或 pin的值不要; \nenv 设置 export ddnc_help_list=\"用户1&用户2\"  多账号&分隔\n本次退出。")
                sys.exit(0)
            for ckname in ddnc_help_list:
                try:
                    ckNum = userNameList.index(ckname)
                except Exception as e:
                    try:
                        ckNum = userNameList.index(unquote(ckname))
                    except:
                        msg(f"请检查被助力账号【{ckname}】名称是否正确？提示：助力名字可填pt_pin的值、也可以填账号名。")
                        continue
                masterName = userNameList[ckNum]
                shareCode = getShareCode(cookiesList[ckNum])
                logger.info(f"开始助力 {masterName}")
                for ck, nickname in zip(cookiesList, userNameList):
                    try:
                        if nickname == masterName:
                            logger.info(f"\t└😓{masterName} 不能助力自己，跳过~")
                            continue
                        result = ddnc_help(ck, nickname, shareCode, masterName)
                        if farmA(cookiesList[ckNum]):
                            getSuccess(cookiesList[ckNum], masterName)
                        if result:
                            for n in range(4):
                                if farmA(cookiesList[ckNum]):
                                    time.sleep(2)
                                    getSuccess(cookiesList[ckNum], masterName)
                            break
                    except:
                        continue
        else:
            logger.info("😓请检查ddnc_isOrder 变量参数是否正确填写。")
        msg("*"*30)
        for i in count:
            msg(f"💧账号【{i}】本次助力收获水滴:{count[i]}g 💧")
        msg("*" * 30)
        if isNotice:
            send(scriptName, msg_info)
    except Exception as e:
        logger.info(e)

if __name__ == '__main__':
    start()