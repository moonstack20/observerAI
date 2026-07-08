import socket
c=socket.socket()
c.connect(("localhost",1234))
while True:
    print("1.echo")
    print("2.datetime")
    print("3.charecter")
ch=input("enter choice:")
c.send(ch.encode())
if ch=="1":
    msg=input("enter msg:")
    c.send(msg.encode())
print("server ready:",c.recv(1024).decode())

c.close()
