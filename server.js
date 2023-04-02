const http = require('http'),
fs = require('fs'),
url = require('url');

http.createServer((request, response) => {
let addr = request.url,
q = url.parse(addr,true),
filePath='';

fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err)=>{
if (err){
    console.log(err);
} else {
    console.log('Added to log.');
}
});
if (q.pathname.includes('documentation')){
    filePath = (_dirname + '/documentaiton.html');
} else {
    filepath = 'index.html'
}
fs.readFile(filePath, (err, data) => {
    if (err) {
        throw err;
    }
     Response.writeHead(200, { 'Content-Type': 'text/html'});
     Response.write(data);
     Response.end();
});
fs.appendFile('message.txt', 'data to append', function (err) {
    if (err) throw err;
    console.log('File coontent' + data.toString());
  });
}).listen(8080);
console.log('My test server is running on Port 8080.');