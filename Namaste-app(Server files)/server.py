# import necessary libraries
from flask import Flask,render_template,request,make_response,redirect,jsonify,send_from_directory
from flask_socketio import SocketIO,join_room,leave_room,emit,send
import pymysql
import json
import uuid
import hashlib
import os
from better_profanity import profanity


# set up socketio
app = Flask(__name__)
socketio=SocketIO(app)


# set up database connection
hostname = 'localhost'
username = 'root'
password = ''
database = 'namaste-app'

myconn = pymysql.connect( host=hostname, user=username, password=password, db=database )
conn = myconn.cursor()


data={}
newUsers={}
rooms={}

# routing to home page
@app.route('/')
def sessionBeigns():
    print("sessionBegin")
    result=[]
    if(request.cookies.get("acc")):
        try:
            conn.execute("Select id from users where sha1(tel)='{}'".format(request.cookies.get('acc')))
            result=conn.fetchall()
        except:
            print("Error")
            return redirect("/login")
        finally:
            if(len(result)!=0):

                nonmobile=True
                userAgent=request.headers.get("User-agent")
                phones=["android","iphone"]
                if( any(phone in userAgent.lower() for phone in phones)):
                    nonmobile=False
                    # if(not(request.args.get("mobileUserAgent"))):
                    #     return redirect("/download")

                return render_template("home.html",nonmobile=nonmobile)
            else:
                return redirect("/login")
    else:
        return redirect("/login")


# login page
@app.route('/login')
def login():
    return render_template("login.html")


# signup page 
@app.route('/signup')
def signup():
    return render_template("signup.html")


# login validation
@app.route('/validate', methods=["POST"])
def validate():
    result=[]
    try:
        conn.execute("Select sha1(id) from users where tel='{}' and pass=sha1('{}')".format(request.form.get('tel'),request.form.get('pass')))
        result=conn.fetchall()
    except:
        print("error")
        return "error"
    finally:
        if(len(result)!=0):
            response=make_response("done")
            response.set_cookie("acc",hashlib.sha1(request.form.get('tel').encode()).hexdigest())
            return response
        else:
            return "error"


# registering
@app.route('/register', methods=["POST"])
def register():
    try:
        conn.execute("Insert ito users(id,name,tel.mail,pass) Values(NULL, '{}', '{}', '{}', sha1=('{}'))".format(request.form.get("name"),request.form.get("tel"),request.form.get("mail"),request.form.get("pass")))
        conn.commit()
        response=make_response("done")
        response.set_cookie("acc",hashlib.sha1(request.form.get("tel")).hexdigest())
        return response
    except:
        print("error")
        return "error"


# meet
@app.route("/meet")
def meet():
    return redirect("/meet-{}".format(uuid.uuid4()))


# meet with room id
@app.route("/meet-<room>")
def meetStart(room):
    result=[]
    if(request.cookies.get("acc")):
        try:
            conn.execute("Select name from users where sha1(tel)='{}'".format(request.cookies.get("acc")))
            result=conn.fetchone()
        except:
            print("error")
            return redirect("/login")
        finally:
            if(len(result)!=0):
                print(result)
                print(room)
                userAgent=request.headers.get("User-agent")
                phones=["android","iphone"]
                if( any(phone in userAgent.lower() for phone in phones) and request.args.get("mobileUserAgent")):
                    return render_template("mobileroom.html",roomId=room,name=result[0])
                elif(any(phone in userAgent.lower() for phone in phones) and not(request.args.get("mobileUserAgent"))):
                    return redirect("/download")
                else:
                    return render_template("room.html",roomId=room,name=result[0])
    else:
        return redirect("/login")


# app download page
@app.route("/download")
def downloadlink():
    return render_template("download.html")


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),'logo.png')


# 404 error page
@app.errorhandler(404)
def pagenotfound(e):
    return render_template("404.html")


# socket connection
@socketio.on("connect")
def connect():
    print("user connected: {} , sid: {}".format(request.cookies.get("acc"),request.sid))


# socket event join room (emitted when new user joins a meeting)
@socketio.on("join-room")
def joinRoom(userId,roomId,name):
    print(roomId,userId,name)
    data[request.sid] = {"room":roomId,"user":userId,"name":name}
    print(newUsers)
    try:
        rooms[roomId] += 1
        newUsers[userId] = request.sid
    except:
        rooms[roomId]=1
    finally:
        print("user joining : room => {}, user => {}".format(roomId,userId))
        join_room(roomId)
        socketio.emit("user-connected",{"userId":userId,"name":name},room=roomId,broadcast=True,include_self=False)


# introduce event to share name and peer id
@socketio.on("introduce")
def introduceUser(userId):
    print("introduce phase")
    socketio.emit("introduced",{"userId":data[request.sid]["user"],"name":data[request.sid]["name"]},room=newUsers[userId])
    newUsers.pop(userId)


# message event to share message 
@socketio.on("message")
def sendMessage(message):
    print("message phase")
    print(message)
    socketio.emit("receiveMessage",{"message":profanity.censor(message["data"]),"user":message["user"]},room=message["roomId"],broadcast=True,include_self=False)


# disconnect event (when user disconnects from room) 
@socketio.on("disconnect")
def socketDisconnect():
    print("user disconnected : room => {} , user => {}".format(data[request.sid]["room"],data[request.sid]["user"]))
    socketio.emit("user-disconnected",data[request.sid]["user"],room=data[request.sid]["room"],broadcast=True,include_self=False)
    rooms[data[request.sid]["room"]]-=1
    if(rooms[data[request.sid]["room"]]==0):
        rooms.pop(data[request.sid]["room"])
    data.pop(request.sid)



# main 
if __name__ == '__main__':
    # socketio.run(app, debug=True,host="192.168.42.229")
    profanity.load_censor_words()
    socketio.run(app, debug=True,port=3000, keyfile='key.pem', certfile='cert.pem',host="192.168.18.2")