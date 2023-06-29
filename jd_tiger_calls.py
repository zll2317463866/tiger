"""

京东==>我的==>签到领积分\积分加油站
【tiger仓库】-- q群：664140985
使用前请先导入python依赖   fake_useragent
cron 0 0 0 10 * *
"""
import hashlib
import re
import time
import requests
from os import environ, path
from fake_useragent import UserAgent

'''Env = new Env("京东话费")'''
def get_environ (O0OO0OOOOOOOOO000 ,OO00O00OO00O0000O ="",O00OO0OO0O0O0000O =True ):#line:1:def get_environ(JD_COOKIE, default="", output=True):
    def O0OO0OOO0OOOO000O ():#line:2:def no_read():
        if O00OO0OO0O0O0000O :#line:3:if output:
            print (f"未填写环境变量 {O0OO0OOOOOOOOO000} 请添加")#line:4:print(f"未填写环境变量 {JD_COOKIE} 请添加")
            exit (0 )#line:5:exit(0)
        return OO00O00OO00O0000O #line:6:return default
    return environ .get (O0OO0OOOOOOOOO000 )if environ .get (O0OO0OOOOOOOOO000 )else O0OO0OOO0OOOO000O ()#line:8:return environ.get(JD_COOKIE) if environ.get(JD_COOKIE) else no_read()
def get_md5 (O0000O00O000O0O00 ):#line:11:def get_md5(n):
    return hashlib .md5 (O0000O00O000O0O00 .encode ('utf-8')).hexdigest ()#line:12:return hashlib.md5(n.encode('utf-8')).hexdigest()
ua =UserAgent ()#line:14:ua = UserAgent()
print ('##开始京东话费任务！\n')#line:15:print('##开始京东话费任务！\n')
def dwSign (O000OOOOO0OOOO00O ):#line:18:def dwSign(cookie):
    OOOO000000OO000O0 ="https://api.m.jd.com/api?functionId=DATAWALLET_USER_SIGN"#line:19:url = "https://api.m.jd.com/api?functionId=DATAWALLET_USER_SIGN"
    O0OO0O000O0OO000O =str (int (time .time ()*1000 ))#line:20:t = str(int(time.time() * 1000))
    O00OO000O000O0000 =O0OO0O000O0OO000O +'e9c398ffcb2d4824b4d0a703e38yffdd'#line:21:encTail = t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    OOO0O00O000O0O000 =get_md5 (O00OO000O000O0000 )#line:22:encStr = get_md5(encTail)
    OOO0O00OOOOOO0O00 ='appid=h5-sep&functionId=DATAWALLET_USER_SIGN&body={"t":'+O0OO0O000O0OO000O +',"encStr":"'+OOO0O00O000O0O000 +'"}&client=m&clientVersion=6.0.0'#line:23:payload = 'appid=h5-sep&functionId=DATAWALLET_USER_SIGN&body={"t":'+t+',"encStr":"'+encStr+'"}&client=m&clientVersion=6.0.0'
    O000OOOOO000O0O00 ={'Host':'api.m.jd.com','Accept':'*/*','Content-Type':'application/x-www-form-urlencoded','Origin':'https://prodev.m.jd.com','User-Agent':ua .random ,'Referer':'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html','Cookie':O000OOOOO0OOOO00O ,'Connection':'keep-alive'}#line:33:}
    try :#line:34:try:  # 异常捕捉
        O000O0O0OOOO00000 =requests .request ("POST",OOOO000000OO000O0 ,headers =O000OOOOO000O0O00 ,data =OOO0O00OOOOOO0O00 ).json ()#line:35:res = requests.request("POST", url, headers=headers, data=payload).json()
        if O000O0O0OOOO00000 ['code']==200 :#line:36:if res['code'] == 200:
            OOO0OO000OO0O0000 ='签到成功：获得积分'+str (O000O0O0OOOO00000 ['data']['signInfo']['signNum'])#line:37:return_str = '签到成功：获得积分' + str(res['data']['signInfo']['signNum'])
        elif O000O0O0OOOO00000 ['code']==201 :#line:38:elif res['code'] == 201:
            OOO0OO000OO0O0000 ='账号已失效!'#line:39:return_str = '账号已失效!'
        elif O000O0O0OOOO00000 ['code']==302 :#line:40:elif res['code'] == 302:
            OOO0OO000OO0O0000 ='今日份签到已完成，请勿重复操作~'#line:41:return_str = '今日份签到已完成，请勿重复操作~'
        else :#line:42:else:
            OOO0OO000OO0O0000 =O000O0O0OOOO00000 ['msg']#line:43:return_str = res['msg']
        print (OOO0OO000OO0O0000 )#line:45:print(return_str)
    except Exception :#line:46:except Exception:
        print ('此项目已更新~~~')#line:48:print('此项目已更新~~~')
def dwList (O00OO0OO00OO00O0O ):#line:52:def dwList(cookie):
    OO00OO0OO0O00OOOO ="https://api.m.jd.com/api?functionId=dwapp_task_dwList"#line:53:url = "https://api.m.jd.com/api?functionId=dwapp_task_dwList"
    OOO0OO0OOO00OOO00 =str (int (time .time ()*1000 ))#line:54:t = str(int(time.time() * 1000))
    O00000OO0000000OO =OOO0OO0OOO00OOO00 +'e9c398ffcb2d4824b4d0a703e38yffdd'#line:55:encTail = t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    OOOOO000O000O0O0O =get_md5 (O00000OO0000000OO )#line:56:encStr = get_md5(encTail)
    O0O0O00O0000OO000 ='appid=h5-sep&functionId=dwapp_task_dwList&body=%7B%22t%22%3A'+OOO0OO0OOO00OOO00 +'%2C%22encStr%22%3A%22'+OOOOO000O000O0O0O +'%22%7D&client=m&clientVersion=6.0.0'#line:57:payload = 'appid=h5-sep&functionId=dwapp_task_dwList&body=%7B%22t%22%3A'+t+'%2C%22encStr%22%3A%22'+encStr+'%22%7D&client=m&clientVersion=6.0.0'
    O0OOOO00O000000O0 ={'Host':'api.m.jd.com','Accept':'*/*','Content-Type':'application/x-www-form-urlencoded','Origin':'https://prodev.m.jd.com','User-Agent':ua .random ,'Referer':'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html','Cookie':O00OO0OO00OO00O0O ,'Connection':'keep-alive'}#line:67:}
    try :#line:68:try:  # 异常捕捉
        O00OO0000OOOO0O0O =requests .request ("POST",OO00OO0OO0O00OOOO ,headers =O0OOOO00O000000O0 ,data =O0O0O00O0000OO000 ).json ()#line:69:res = requests.request("POST", url, headers=headers, data=payload).json()
        if O00OO0000OOOO0O0O ['code']==200 :#line:70:if res['code'] == 200:
            for OO0OOOO0O0O0O00OO in range (len (O00OO0000OOOO0O0O ['data'])):#line:71:for i in range(len(res['data'])):
                OO0O0OOO0O00OO0O0 =str (O00OO0000OOOO0O0O ['data'][OO0OOOO0O0O0O00OO ]['id'])#line:72:id = str(res['data'][i]['id'])
                OO00OOO0O0O00O000 =O00OO0000OOOO0O0O ['data'][OO0OOOO0O0O0O00OO ]['name']#line:73:name = res['data'][i]['name']
                O00O0000OO000OO0O =O00OO0000OOOO0O0O ['data'][OO0OOOO0O0O0O00OO ]['taskDesc']#line:74:taskDesc = res['data'][i]['taskDesc']
                O00000OO0OO00O0O0 =str (O00OO0000OOOO0O0O ['data'][OO0OOOO0O0O0O00OO ]['viewStatus'])#line:76:viewStatus = str(res['data'][i]['viewStatus'])
                if O00000OO0OO00O0O0 =="1":#line:77:if viewStatus == "1":
                    O000000OO00OOO000 ='<'+OO00OOO0O0O00O000 +'：'+O00O0000OO000OO0O +'>---积分已领取~'#line:78:return_str = '<' + name + '：' + taskDesc + '>---积分已领取~'
                else :#line:79:else:
                    if O00000OO0OO00O0O0 =="0":#line:80:if viewStatus == "0":
                        dwRecord (O00OO0OO00OO00O0O ,OO0O0OOO0O00OO0O0 )#line:81:dwRecord(cookie, id)
                        time .sleep (3 )#line:82:time.sleep(3)
                    O000OO0OO0000OO00 =dwReceive (O00OO0OO00OO00O0O ,OO0O0OOO0O00OO0O0 )#line:83:a = dwReceive(cookie, id)
                    O000000OO00OOO000 ='<'+OO00OOO0O0O00O000 +'：'+O00O0000OO000OO0O +'>'+O000OO0OO0000OO00 #line:84:return_str = '<' + name + '：' + taskDesc + '>' + a
                print (O000000OO00OOO000 )#line:85:print(return_str)
        else :#line:86:else:
            O000000OO00OOO000 =O00OO0000OOOO0O0O ['msg']#line:87:return_str = res['msg']
            print (O000000OO00OOO000 )#line:88:print(return_str)
    except Exception :#line:89:except Exception:
        print ('此项目已更新~~~')#line:91:print('此项目已更新~~~')
def dwRecord (O00O00000OO0OOOOO ,O00OOO0OO00O000OO ):#line:95:def dwRecord(cookie, id):
    OOOOOO00O00O00OOO ='https://dwapp.jd.com/user/task/dwRecord'#line:96:url = 'https://dwapp.jd.com/user/task/dwRecord'
    O000OOO0OO0OO0OO0 =str (int (time .time ()*1000 ))#line:97:t = str(int(time.time() * 1000))
    OOO0O00O00OOOOOO0 =O00OOO0OO00O000OO +'1'+O000OOO0OO0OO0OO0 +'e9c398ffcb2d4824b4d0a703e38yffdd'#line:98:encTail = id + '1' + t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    O0O000OOOO0O000OO =get_md5 (OOO0O00O00OOOOOO0 )#line:99:encStr = get_md5(encTail)
    OO000000OO0O0000O ='{"id":'+O00OOO0OO00O000OO +',"taskType":1,"agentNum":"m","followChannelStatus":"","t":'+O000OOO0OO0OO0OO0 +',"encStr":"'+O0O000OOOO0O000OO +'"}'#line:100:payload = '{"id":'+id+',"taskType":1,"agentNum":"m","followChannelStatus":"","t":'+t+',"encStr":"'+encStr+'"}'
    OOOO0O0OO000OOO00 ={'Host':'dwapp.jd.com','Accept':'*/*','Content-Type':'application/json','Origin':'https://prodev.m.jd.com','User-Agent':ua .random ,'Referer':'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html','Cookie':O00O00000OO0OOOOO ,'Connection':'keep-alive'}#line:110:}
    requests .request ("POST",OOOOOO00O00O00OOO ,headers =OOOO0O0OO000OOO00 ,data =OO000000OO0O0000O )#line:112:requests.request("POST", url, headers=headers, data=payload)
def dwReceive (O000O0OO00O0O0O0O ,O0O00O00O0OOO0OOO ):#line:116:def dwReceive(cookie, id):
    O0OOOOOO0O00000OO ='https://dwapp.jd.com/user/task/dwReceive'#line:117:url = 'https://dwapp.jd.com/user/task/dwReceive'
    OO0OO0O00O000O0O0 =str (int (time .time ()*1000 ))#line:118:t = str(int(time.time() * 1000))
    OOO0OO00OOO00OOOO =O0O00O00O0OOO0OOO +OO0OO0O00O000O0O0 +'e9c398ffcb2d4824b4d0a703e38yffdd'#line:119:encTail = id + t + 'e9c398ffcb2d4824b4d0a703e38yffdd'
    O0OO0O00O0000000O =get_md5 (OOO0OO00OOO00OOOO )#line:120:encStr = get_md5(encTail)
    O00OOOO0OO0OOOOOO ='{"id":'+O0O00O00O0OOO0OOO +',"t":'+OO0OO0O00O000O0O0 +',"encStr":"'+O0OO0O00O0000000O +'"}'#line:121:payload = '{"id":'+id+',"t":'+t+',"encStr":"'+encStr+'"}'
    OO0OO000OO000O0O0 ={'Host':'dwapp.jd.com','Accept':'*/*','Content-Type':'application/json','Origin':'https://prodev.m.jd.com','User-Agent':ua .random ,'Referer':'https://prodev.m.jd.com/mall/active/eEcYM32eezJB7YX4SBihziJCiGV/index.html','Cookie':O000O0OO00O0O0O0O ,'Connection':'keep-alive'}#line:131:}
    try :#line:134:try:  # 异常捕捉
        OOOO000O0O0O00O00 =requests .request ("POST",O0OOOOOO0O00000OO ,headers =OO0OO000OO000O0O0 ,data =O00OOOO0OO0OOOOOO ).json ()#line:135:res = requests.request("POST", url, headers=headers, data=payload).json()
        if OOOO000O0O0O00O00 ['code']==200 :#line:136:if res['code'] == 200:
            if OOOO000O0O0O00O00 ['data']['errorCode']=='200':#line:137:if res['data']['errorCode'] == '200':
                O0O00O00O0OO0O0O0 ='获得积分：'+str (OOOO000O0O0O00O00 ['data']['giveScoreNum'])#line:138:return_str = '获得积分：'+str(res['data']['giveScoreNum'])
            else :#line:139:else:
                O0O00O00O0OO0O0O0 ='当前无领取任务!'#line:140:return_str = '当前无领取任务!'
        else :#line:141:else:
            O0O00O00O0OO0O0O0 =OOOO000O0O0O00O00 ['msg']#line:142:return_str = res['msg']
        return O0O00O00O0OO0O0O0 #line:143:return return_str
    except Exception :#line:145:except Exception:
        return '此项目已更新~~~'#line:146:return '此项目已更新~~~'
def main (O00OOO0OO0OO0OOOO ,O0O0O0OOO00OO0O0O ):#line:151:def main(ck,num):
    O0000OO0O0OOOO00O =re .findall ("pt_pin=(.*?);",O00OOO0OO0OO0OOOO )[0 ]#line:152:pin = re.findall("pt_pin=(.*?);", ck)[0]
    print ('----------账号'+str (O0O0O0OOO00OO0O0O )+'【'+O0000OO0O0OOOO00O +"】开始任务----------")#line:153:print('----------账号'+str(num)+'【' + pin + "】开始任务----------")
    dwSign (O00OOO0OO0OO0OOOO )#line:155:dwSign(ck)
    dwList (O00OOO0OO0OO0OOOO )#line:158:dwList(ck)
if __name__ =="__main__":#line:164:if __name__ == "__main__":
    print ('【tiger仓库】-- q群：664140985\n')#line:166:print('【tiger仓库】-- q群：664140985\n')
    token =get_environ ("JD_COOKIE")#line:167:token = get_environ("JD_COOKIE")
    cks =token .split ("&")#line:169:cks = token.split("&")
    print ("===========检测到{}个ck记录---开始任务！===========".format (len (cks )))#line:170:print("===========检测到{}个ck记录---开始任务！===========".format(len(cks)))
    num =0 #line:171:num = 0
    for ck_all in cks :#line:172:for ck_all in cks:
        cookie =ck_all .split ("&")#line:173:cookie = ck_all.split("&")
        for i in cookie :#line:174:for i in cookie:
            num =num +1 #line:175:num = num + 1
            main (i ,num )#line:176:main(i,num)
