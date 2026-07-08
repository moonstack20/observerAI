import socket

c = socket.socket()
c.connect(("localhost", 1234))

while True:

    msg = input("Client: ")
    c.send(msg.encode())

    if msg.lower() == "bye":
        break

    reply = c.recv(1024).decode()
    print("Server:", reply)

    if reply.lower() == "bye":
        break

c.close()
