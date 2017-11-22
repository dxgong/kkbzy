//服务器
const http = require("http");
const mysql = require("mysql");
const url = require("url");

//连接数据库
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'cms'
});
connection.connect();



http.createServer((req, res)=>{
  res.setHeader('content-type', 'text/html;charset=utf8');
  //解析请求
  /*let pathname = url.parse(req.url).pathname;
  let str = url.parse(req.url).query;*/
  let {pathname, query} = url.parse(req.url,true);
    //1, 注册 /res
    //2，登录 /login

  if("/res" == pathname){
    //根据用户名称查询数据库是否有这号人物
    //校验名字和密码不能为空
    let {username,password} = query;
    let selectParams = [];
    if(username == ''){
      res.writeHeader(500);
      res.write("用户名不能为空!");
      res.write();
      return false;
    }else{
        selectParams[0] = username;
    }
    if(password == ''){
      res.writeHeader(500);
      res.write("密码不能为空!");
      res.end();
      return false;
    }else{
      selectParams[1] = password;
    }
    console.log(selectParams[0]+"---"+selectParams[1]);
    let selectStr = 'select username from ry_user where username = ?';

    connection.query(selectStr,selectParams, (err, data)=>{
      if(err){
        console.log(err);
        res.write("用户名校验失败!");
        res.end();
      }else{
        data.forEach((item)=>{
          if(item.username){
            res.write("用户名重复，请重新输入");
            res.end();
          }
        })
        let insertStr = 'insert into ry_user (userid,username,password,pre_logintime,ipadress,available) values (UUID(),?,?,Null,1234,1)';
        connection.query(insertStr,selectParams,(err, data)=>{
          if(err){
            console.log(err);
            res.write("注册失败!");
            res.end();
          }else{
            console.log("注册成功!");
            res.write("注册成功!");
            res.end();
          }

        });
      }
    });


  }else if("/login" == pathname){

  }



}).listen(8081);
