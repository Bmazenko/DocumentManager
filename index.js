var express = require('express');
var app = express();
var fs = require("fs-extra");
app.disable('x-powered-by');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var formidable = require('formidable');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({extended: true}));

var files = [];

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));


// ROUTES
app.get('/', function(req, res){
    res.render('home');
});
app.get('/startDownload', function(req, res){
   var file = __dirname +"\\uploads\\" + req.query.filename ;
  res.download(file);
});
app.get('/uploads', function(req, res){
    res.render('uploads', {files});
});
app.get('/error', function(req, res){
    res.render('error');
});
app.get('/thankyou', function(req, res){
    res.render('thankyou');
});
app.get('/file-upload', function(req, res){
  var now = new Date();
  res.render('file-upload',{
    year: now.getFullYear(),
    month: now.getMonth() });
  });

  app.post('/file-upload', function(req, res){
    // Parse a file that was uploaded
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, file){
      if(err)
        return res.redirect(303, '/error');
      console.log('Received File');
 
      // Output file information
      console.log(files.length);
      console.log(file.doc.path);

var fileName = file.doc.path;
        fs.exists(fileName, function(exists) {
        if (exists) {
            fs.stat(fileName, function(error, stats) {
            fs.open(fileName, "r", function(error, fd) {
                var buffer = new Buffer(stats.size);

                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                var data = buffer.toString("utf8", 0, buffer.length);
                console.log(data);
                var fileObj = {
          tFile: file,
          tData: data,
          toPath: "/startDownload?filename="   
      };
      files.push(fileObj);
      fs.copy(file.doc.path, __dirname + "\\uploads\\" + file.doc.name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
            }
    });
    




                });
            });
            });
        } else{
            console.log("File does not exist")
        }
        });
      



      console.log(files.length);
      res.redirect( 303, '/thankyou');
  });
});


app.use(function(req, res, next){
    console.log("looking for URL: " + req.url);
    next();
});
app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.render('404');
});
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
// ROUTES -----------------------------------------------


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate');
});



