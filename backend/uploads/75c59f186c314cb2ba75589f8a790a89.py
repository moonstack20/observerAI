import socket
import datetime
import string
s=socket.socket()
s.bind(("localhost",1234))
s.listen(1)
print("tcp echo server ready")
while True:
    c,addr=s.accept()
    choice=c.recv(1024).decode()
    if ch=="1":
        msg=c.recv(1024).decode()
        c.send(msg.encode())
    elif ch=="2":
        now=str(datetime.datetime.now())
        c.send(now.encode())
    elif ch=="3":
        c.send(string.ascii_uppercase.encode())
        c.close()
        

