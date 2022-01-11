*/
# 多ck去重，每10个隔一行输出，ck格式：
#ck1&ck2&ck3&……
#频道：https://t.me/+pellEgrbUethMGZl
'''
'Env =new Env("检测ck去重")'
'''
#觉得不错麻烦点个star谢谢
#代码
\*
import re
 
 
data1 = ''
data2 = ''
#data3 = ''
#data4 = ''
temp1 = data1.split('&')
temp2 = data2.split('&')
#temp3 = data3.split('&')
#temp4 = data4.split('&')
temp = temp1 + temp2
#temp = temp1 + temp2 + temp3 + temp4
temp = list(set(temp))
pin = []
for i in temp:
    tp = re.finditer("pt_pin=",i)
    for j in tp:
        t = j.span()[1]
        pin.append(i[t:-1])
pin = list(set(pin))
result = []
for i in temp:
    tp = re.finditer("pt_pin=",i)
    for j in tp:
        t = j.span()[1]
        if (i[t:-1]) in pin:
            result.append(i)
            pin.remove(i[t:-1])
print('ck总计：{}'.format(len(result)))
cout = 0
for i in result:
    print(i)
    cout+=1
    if cout%10 == 0:
        print(' ')
