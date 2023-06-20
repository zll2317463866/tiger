"""
@Project ：QL
@Date ：2023/6/13 10:00
@File ：dwSign.py
@Author ：红尘先生
京东==>我的==>签到领积分\积分加油站
cookie{pt_key=app_openAAJki-cTADAt-pvBl3BsIhYjHH2TdfGzUuY5kt-yqjEVI-YHqXtgSNlhXfoQHS3zAYH639izQCg; pt_pin=jd_xxxxxxxx;}
"""
import hashlib
import re
import time
import requests


# MD5加密算法
def get_md5(n):
    return hashlib.md5(n.encode('utf-8')).hexdigest()


# 签到领积分\积分加油站
def dwSign(cookie):
    url = "https://dwapp.jd.com/user/dwSign"
    t = str(int(time.time() * 1000))
    encTail = t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    encStr = get_md5(encTail)
    payload = '{"t":'+t+',"encStr":"'+encStr+'"}'
    headers = {
        'Host': 'dwapp.jd.com',
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'https://prodev.m.jd.com',
        'User-Agent': 'jdapp;iPhone;11.1.4;;;M/5.0;appBuild/168210;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DwO4DQUyDJdsCNvtDJG5Ctu1DtUyDNHrZNHuCtLsC2UzCtPsCzG2CG%3D%3D%22%2C%22sv%22%3A%22CJUkDG%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1670479422%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
        'Referer': 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
        'Cookie': cookie,
        'Connection': 'keep-alive'
    }
    try:  # 异常捕捉
        res = requests.request("POST", url, headers=headers, data=payload).json()
        # {'code': 302, 'data': {}, 'msg': '点击太快了，请慢些'}
        # {'code': 201, 'data': {}, 'msg': '未登录'}
        # {'code': 200, 'data': {'balanceNum': 4.28, 'frozenNum': 0.0, 'newUserSignSend': False, 'signInfo': {'businessConfigList': [{'dayValue': '7', 'name': '连续签到任务1-配置天数', 'sendValue': '0.2', 'type': 2}], 'continueDay': 1, 'sendCoupon': False, 'signNum': 0.1, 'signStatus': 1, 'totalDay': 7}, 'totalNum': 4.28}, 'msg': '成功'}
        if res['code'] == 200:
            return_str = '签到成功：获得积分' + str(res['data']['signInfo']['signNum'])
        elif res['code'] == 201:
            return_str = '账号已失效!'
        elif res['code'] == 302:
            return_str = '今日份签到已完成，请勿重复操作~'
        else:
            return_str = res['msg']
        # return return_str
        print(return_str)
    except Exception:
        # return 'False'
        print('此项目已更新~~~')


# 活动列表
def dwList(cookie):
    url = "https://api.m.jd.com/api?functionId=dwapp_task_dwList"
    t = str(int(time.time() * 1000))
    encTail = t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    encStr = get_md5(encTail)
    payload = 'appid=h5-sep&functionId=dwapp_task_dwList&body=%7B%22t%22%3A'+t+'%2C%22encStr%22%3A%22'+encStr+'%22%7D&client=m&clientVersion=6.0.0'
    headers = {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://prodev.m.jd.com',
        'User-Agent': 'jdapp;iPhone;11.1.4;;;M/5.0;appBuild/168210;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DwO4DQUyDJdsCNvtDJG5Ctu1DtUyDNHrZNHuCtLsC2UzCtPsCzG2CG%3D%3D%22%2C%22sv%22%3A%22CJUkDG%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1670479422%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
        'Referer': 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
        'Cookie': cookie,
        'Connection': 'keep-alive'
    }
    try:  # 异常捕捉
        res = requests.request("POST", url, headers=headers, data=payload).json()
        if res['code'] == 200:
            for i in range(len(res['data'])):
                id = str(res['data'][i]['id'])
                name =res['data'][i]['name']
                taskDesc = res['data'][i]['taskDesc']
                # 1:已领取积分 0：未浏览
                viewStatus = str(res['data'][i]['viewStatus'])
                if viewStatus == "1":
                    return_str = '<' + name + '：' + taskDesc + '>积分已领取~'
                else:
                    if viewStatus == "0":
                        dwRecord(cookie, id)
                        time.sleep(3)
                    a = dwReceive(cookie, str(res['data'][i]['id']))
                    return_str = '<' + res['data'][i]['taskDesc'] + '>' + a
                print(return_str)
        else:
            return_str = res['msg']
        # return return_str
    except Exception:
        # return 'False'
        print('此项目已更新~~~')


# 浏览任务
def dwRecord(cookie, id):
    url = 'https://dwapp.jd.com/user/task/dwRecord'
    t = str(int(time.time() * 1000))
    encTail = id + '1' + t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    encStr = get_md5(encTail)
    payload = '{"id":'+id+',"taskType":1,"agentNum":"m","followChannelStatus":"","t":'+t+',"encStr":"'+encStr+'"}'
    headers = {
        'Host': 'dwapp.jd.com',
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'https://prodev.m.jd.com',
        'User-Agent': 'jdapp;iPhone;11.1.4;;;M/5.0;appBuild/168210;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DwO4DQUyDJdsCNvtDJG5Ctu1DtUyDNHrZNHuCtLsC2UzCtPsCzG2CG%3D%3D%22%2C%22sv%22%3A%22CJUkDG%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1670479422%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
        'Referer': 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
        'Cookie': cookie,
        'Connection': 'keep-alive'
    }
    # {"code":200,"data":{"dwUserTask":true},"msg":"成功"}
    requests.request("POST", url, headers=headers, data=payload)


# 领取积分
def dwReceive(cookie, id):
    url = 'https://dwapp.jd.com/user/task/dwReceive'
    t = str(int(time.time() * 1000))
    encTail = id + t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    encStr = get_md5(encTail)
    payload = '{"id":'+id+',"t":'+t+',"encStr":"'+encStr+'"}'
    headers = {
        'Host': 'dwapp.jd.com',
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'https://prodev.m.jd.com',
        'User-Agent': 'jdapp;iPhone;11.1.4;;;M/5.0;appBuild/168210;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DwO4DQUyDJdsCNvtDJG5Ctu1DtUyDNHrZNHuCtLsC2UzCtPsCzG2CG%3D%3D%22%2C%22sv%22%3A%22CJUkDG%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1670479422%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
        'Referer': 'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html',
        'Cookie': cookie,
        'Connection': 'keep-alive'
    }
    # {"code":200,"data":{"errorCode":"200","errorMsg":"成功","giveScoreNum":0.1,"newUserSignSend":false,"num":0,"sendCoupon":false,"sendJf":false,"success":true},"msg":"成功"}
    # {"code":200,"data":{"errorCode":"441","errorMsg":"当前无领取任务","giveScoreNum":0.0,"newUserSignSend":false,"sendCoupon":false,"sendJf":false,"success":false},"msg":"成功"}
    try:  # 异常捕捉
        res = requests.request("POST", url, headers=headers, data=payload).json()
        if res['code'] == 200:
            if res['data']['errorCode'] == '200':
                return_str = '获得积分：'+str(res['data']['giveScoreNum'])
            else:
                return_str = '当前无领取任务!'
        else:
            return_str = '获取任务失败!'
        return return_str
        # print(return_str)
    except Exception:
        return '此项目已更新~~~'
        # print('False')


# main函数
def main(ck):
    pin = re.findall("pt_pin=(.*?);", ck)[0]
    print('----------账号【' + pin + "】开始任务----------")
    # 签到
    dwSign(ck)
    # 查询列表
    dwList(ck)
    # print('----------账号【' + pin + "】结束任务----------")




if __name__ == "__main__":
    # 暂时请自行设置cookie
    main('pt_key=app_openAAJki-cTADAt-pvBl3BsIhYjHH2TdfGzUuY5kt-yqjEVI-YHqXtgSNlhXfoQHS3zAYH639izQCg; pt_pin=jd_xxxxxxxx;')