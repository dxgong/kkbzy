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

websocket.on('connection',(socket)=>{

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


})
