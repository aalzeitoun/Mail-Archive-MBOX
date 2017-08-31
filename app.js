const express = require('express')
const app = express();
const port = "3000";
const simpleParser = require('mailparser').simpleParser;
const dateFormat = require('dateformat');
const prettysize = require('prettysize');
var fs = require('fs');

var Mbox = require('node-mbox');
var mbox  = new Mbox('test.mbox', { });
var id = 1;
app.locals.allemails =[];

mbox.on('message', function(msg) {
	simpleParser(msg, (err, mail)=>{
		var from_add = mail.headers.get('from');
		var to_add = mail.headers.get('to');
		var cc_add = mail.headers.get('cc');
		var bcc_add = mail.headers.get('bcc');
		var subject = mail.headers.get('subject');
		var body = mail.textAsHtml;
		var em_date = dateFormat(mail.headers.get('date'), "mm/dd/yyyy");
		var em_attachments = [];
		var attachment_no = mail.attachments.length;

		if(attachment_no>0){
			em_attachments = mail.attachments;
			// console.log(attachment_no);
			//console.log(mail.attachments);
			 for(i=0; i<attachment_no; i++){
					 if(mail.attachments[i].filename){
						var attach_dir = 'attachments/'+id;
						if (!fs.existsSync(attach_dir)){
						    fs.mkdirSync(attach_dir);
						}
						 fs.writeFile(attach_dir+'/'+mail.attachments[i].filename, mail.attachments[i].content, function(err) {
								if(err) {
										return console.log(err);
								}
							  //console.log(id);
							});
					 }
			 }
		}




		var item = {id: id, from: from_add, to: to_add, cc: cc_add, bcc: bcc_add, subject: subject, body: body, date: em_date, attachment: em_attachments};
		app.locals.allemails.push(item);

		id += 1;
	});
});

mbox.on('error', function(err) {
  console.log('got an error', err);
});

mbox.on('end', function() {
  console.log('done reading mbox file');
});


app.set('view engine', 'ejs');

//home
app.get('/', (req, res) => {
  // render `home.ejs` with the list of posts
  res.render('home', { allemails: app.locals.allemails, prettysize: prettysize })
})

//post
app.get('/post/:id', (req, res) => {
  // find the post in the `posts` array
  const allemail = app.locals.allemails.filter((allemail) => {
    return allemail.id == req.params.id
  })[0]

  // render the `post.ejs` template with the post content
  res.render('post', {
		allemail: app.locals.allemails,
		id: allemail.id,
    from: allemail.from,
    to: allemail.to,
    cc: allemail.cc,
    bcc: allemail.bcc,
    subject: allemail.subject,
    body: allemail.body,
    date: allemail.date,
    attachment: allemail.attachment,
		prettysize: prettysize
  })
});

//to download the attachments
app.get('/attachments/:file(*)', function(req, res, next){
  var file = req.params.file
    , path = __dirname + '/attachments/' + file;
  res.download(path);
});

app.get('/', function (req, res) {
	res.send(body)
 })

app.listen(port, function () {
  console.log('Project listening on port '+port+'!')

})
