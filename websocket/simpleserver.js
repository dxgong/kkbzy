const http = require("http");
const url = require("url");

http.createServer((req,res)=>{
  let pathname = url.parse(req.url).pathname;
  let str = url.parse(req.url).query;

  console.log(str);
  res.write("success");
  res.end();

}).listen(8080);
