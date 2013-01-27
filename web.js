
/**
 * Module dependencies.
 */

urls = []

var express = require('express')
  , app = express()
  , routes = require('./routes')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');


io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 100); 
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function emit () {
    io.sockets.emit('status', urls);
}
function monitor() {
  for (var i = 0; i < urls.length; i++) {
    if (urls[i].in_progress) {
      continue
    }
    urls[i].in_progress = true
    var httping = require('http');
    var start = new Date();
    httping.get(urls[i].link , function (url, start) { return function(res) {
      url.rt = new Date() - start
      if (res.statusCode == 200) {
        url.status = 'ok'
      } else {
        url.status = 'error'
      }
      url.in_progress = false
      emit()
    } }(urls[i], start)).on('error', function (url) { return function(e) {
      url.in_progress = false
      url.status = 'error'
      emit()
    } }(urls[i]));;
  }
}
io.sockets.on('connection', function (socket) {
  socket.on('reload', function (data) {
    emit()
  })
  socket.on('add', function (data) {
    var url = data.website_address
    if (url != '') {
      var url_record = {link:url, status:'pending', rt:'', in_progress:false}
      urls.push(url_record)
    };
    emit()
  });
  socket.on('delete', function (data) {
    urls.splice(data.index, 1)
    emit()
  });
});
setInterval(monitor, 1000)
emit()
