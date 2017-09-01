const express = require('express')
const app = express();
const port = "3000";
const simpleParser = require('mailparser').simpleParser;
const dateFormat = require('dateformat');
const prettysize = require('prettysize');
var fs = require('fs');
const bodyParser = require('body-parser');
//var lodash = require('lodash');
var Mbox = require('node-mbox');

app.locals.allemails =[];
app.locals.uploadf = "";



fs.readFile('uploads.json', 'utf8', function (err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data); //now it an object
		var no = obj.table.length - 1;
		//console.log(obj.table[no].name);
		console.log(obj.table[no].name);
    //obj.table.push({id: 2, name:"Nayef"}); //add some data
    // json = JSON.stringify(obj); //convert it back to json
    // fs.writeFile('uploads.json', json, 'utf8'); // write it back


//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

// const testFolder = './upload/';
// fs.readdirSync(testFolder).forEach(file => {
//   //console.log(file);
// })


			var mbox  = new Mbox('./upload/'+obj.table[no].name, { });
			var id = 1;



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

	}});

								/////////////////////////////////////////////////
								/////////////////////////////////////////////////

app.set('view engine', 'ejs');

//home
// app.get('/', (req, res) => {
//   // render `home.ejs` with the list of posts
//   res.render('home', { allemails: app.locals.allemails, prettysize: prettysize })
// })

//inbox
app.get('/inbox', (req, res) => {
  // render `home.ejs` with the list of posts'
  res.render('inbox', { allemails: app.locals.allemails, prettysize: prettysize })
})

//post
app.get('/email/:id', (req, res) => {
  // find the post in the `posts` array
  const allemail = app.locals.allemails.filter((allemail) => {
    return allemail.id == req.params.id
  })[0]

  // render the `post.ejs` template with the post content
  res.render('email', {
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


app.use(bodyParser());
// app.post('/',function(req, res, next){
//     var txt_folder_name = req.body.txtFolderName;
//     //...
// 		console.log(txt_folder_name);
// });
//
app.post('/', function(req, res){
  var searchText = req.body.searchText;
	if(typeof searchText == 'undefined')
	 res.redirect('/');
 else
 //res.render('items',{title:'My Service - Message', message:req.body.message, items:items});
 res.render('inbox', { allemails: app.locals.allemails, prettysize: prettysize,searchText: searchText  })
	//return req.body.searchText = req.params.searhparam;
  // var html = 'Hello: ' + userName + '.<br>' +
  //            '<a href="/">Try again.</a>';
  console.log(searchText);
	//res.render('search', { searchText: searchText })
});

///////////////////////////////////
///////////////////////////////////

app.get('/', (req, res) => {
  // render `home.ejs` with the list of posts'
  res.render('upload', { })
})

const fileUpload = require('express-fileupload');

app.use(fileUpload());

app.post('/inbox', function(req, res) {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
 //console.log(sampleFile.name);
  // Use the mv() method to place the file somewhere on your server
  fs.writeFile('upload/'+sampleFile.name, sampleFile.data, function(err) {
								if(err) {
										return console.log(err);
								}

fs.readFile('uploads.json', 'utf8', function (err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data); //now it an object
		var setId = obj.table.length + 1;
    obj.table.push({id: setId, name:sampleFile.name}); //add some data
    json = JSON.stringify(obj); //convert it back to json
    fs.writeFile('uploads.json', json, 'utf8'); // write it back
}});
								//console.log(app.locals.uploadf);


	res.render('inbox', {uploadfile: app.locals.uploadf, allemails: app.locals.allemails, prettysize: prettysize})
							});
});
///////////////////////////////////


app.get('/', function (req, res) {
	res.send(body)
 })

app.listen(port, function () {
  console.log('Project listening on port '+port+'!')

})
