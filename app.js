const express = require('express')
const app = express();
const simpleParser = require('mailparser').simpleParser;
const dateFormat = require('dateformat');




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
		var em_date = dateFormat(mail.headers.get('date'), "mm/dd/yyyy");
		//filename, size, headers, content, contentType
		console.log("---------------------------------------------------------------------------------");
		if(mail.attachments.filename){
			//console.log(mail.attachments);
		}



		var item = {id: id, from: from_add, to: to_add, cc: cc_add, bcc: bcc_add, subject: mail.headers.get('subject'), body: mail.textAsHtml, date: em_date, attachment: mail.attachments};
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
app.get('/', (req, res) => {
  // render `home.ejs` with the list of posts
  res.render('home', { allemails: app.locals.allemails })
})
app.get('/post/:id', (req, res) => {
  // find the post in the `posts` array
  const allemail = app.locals.allemails.filter((allemail) => {
    return allemail.id == req.params.id
  })[0]

  // render the `post.ejs` template with the post content
  res.render('post', {
    from: allemail.from,
    to: allemail.to,
    cc: allemail.cc,
    bcc: allemail.bcc,
    subject: allemail.subject,
    body: allemail.body,
    date: allemail.date,
    attachment: allemail.attachment
  })
})



app.get('/', function (req, res) {
	res.send(body)
 })

app.listen(3000, function () {
  console.log('Project listening on port 3000!')

})
