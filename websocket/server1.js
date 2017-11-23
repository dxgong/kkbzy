//使用websocket搭建聊天室服务器
const http = require("http");
const mysql = require("mysql");
const url = require("url");
const sk = require("socket.io");
const fs = require("fs");

//连接数据库
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'cms'
});
connection.connect();

let server = http.createServer((req, res)=>{



  fs.readFile(`HTML${req.url}`, (err, data)=>{
    if(err){
      res.writeHeader(404);
      res.write('not found');
    }else{
      res.write(data);
    }

    res.end();
  });
}).listen(8081);

const websocket = sk.listen(server);
let aSock = [];
websocket.on('connection',(socket)=>{
  aSock.push(socket);
  let cut_username = '';
  //注册
  socket.on('res',(username, password)=>{
    let selectParams = [];
    if(username == ''){
        socket.emit('res_ret',1,"用户名不能为空");
        return false;
    }else{
        selectParams[0] = username;
    }
    if(password == ''){
      socket.emit('res_ret',1,"密码不能为空");
      return false;
    }else{
      selectParams[1] = password;
    }
    console.log(selectParams[0]+"---"+selectParams[1]);
    let selectStr = 'select username from ry_user where username = ?';

    connection.query(selectStr,selectParams, (err, data)=>{
      if(err){
        console.log(err);
        socket.emit('res_ret',1,"注册失败");
      }else{
        if(data.length == 0){ //可以注册
          let insertStr = 'insert into ry_user (userid,username,password,pre_logintime,ipadress,available) values (UUID(),?,?,Null,1234,0)';
          console.log("注册。。");
          connection.query(insertStr,selectParams,(err, data)=>{
            if(err){
              console.log(err);
              socket.emit('res_ret',1,"注册失败!");

            }else{
              socket.emit('res_ret',0,"注册成功");
            }
          });
        }else{
            socket.emit('res_ret',1,'用户名重复，注册失败');
        }


      }
    });
  });

  //登录

  socket.on('login',(username,password)=>{
    let selectParams = [];
    selectParams[0] = username;
    selectParams[1] = password;

    let selectStr = 'select username from ry_user where username = ? and password = ?';
    connection.query(selectStr,selectParams, (err,data)=>{
      if(err){
        console.log(err);
        socket.emit('login_ret',1,"查询错误");
      }else{
        if(data.length == 0){
          console.log("用户名或者密码错误");
          socket.emit('login_ret',1,"用户名或者密码错误");
        }else{
          let updateStr = 'update ry_user set available = 1 where username = ? and password = ?';
          connection.query(updateStr,selectParams,(err,data)=>{
            if(err){
              console.log(err);
              socket.emit('login_ret',1,"用户名或者密码不正确");
            }else{
              cut_username = username;
              socket.emit('login_ret',0,"登录成功");
            }
          })
        }
      }
    })
  })

  //发信息
  socket.on('message',(msg)=>{
    if(!msg){
      socket.emit('msg_ret',1,'消息不能为空!');
    }else{
      aSock.forEach((item)=>{
        if(item===socket)return;
        console.log("当前发送信息的人是：" + cut_username);
        console.log("当前发送的信息是：" + msg);


        item.emit('message',cut_username,msg);
      })
      socket.emit('msg_ret',0,'发送成功!');
    }

  })

})
