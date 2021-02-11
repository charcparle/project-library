/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose')

module.exports = function (app) {

  const Schema = mongoose.Schema;
  const commentSchema = new Schema({
    number: {type: Number, required: true},
    text: {type: String, required: true}
  })  
  const bookSchema = new Schema({
    title: {type: String, required: true},
    comments: [String],
    commentcount: {type: Number, required: true}
  })  

  async function connectAtStart(){
    let connectDB = await mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log(`Connection to the Atlas Cluster db is successful!`)
      })
      .catch((err) => console.error(err));
    mongoose.set('useFindAndModify', false);
  }
  /*
  const connect = async (project)=>{
    let currentDB = await mongoose.connection.useDb(project);
    console.log(`Db: ${project}`);
    return currentDB;
  }
  */
  connectAtStart();

  //let currentDB = await connect(project);
  let Book = mongoose.model('Book', bookSchema);
  let Comment = mongoose.model('Comment', commentSchema);

  app.route('/api/books')
    .get((req, res)=>{
      //response will be array of book objects
      const showList = async ()=>{
        let list = await Book.aggregate([
          {
            $project: {
              "_id": 1,
              "title": 1,
              "comments": 1,
              "commentcount": 1
            }
          }
        ]);
        res.json(list);
      }      
      showList()
        .then(console.log('list shown'))
        .catch((err)=>{
          console.error(err)}
        );
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post((req, res)=>{
      let title = req.body.title;
      console.log(`title: ${title}`);
      const submitBook = async (title)=>{
        let newBook = new Book({
          'title': title,
          'commentcount': 0
        });
        newBook.save((err) => {
           if (err) {
             console.error(err);
           } else {
             res.json({ '_id':newBook._id, title: newBook.title });
           }
        }); 
      }
      if (title==null){
        res.json('missing required field title');
      } else {
        submitBook(title).then(`New book '${title}' submitted`);
      }
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      Book.deleteMany({},(err,result)=>{
        if (err){
          console.error(err);
        } else if (result.deletedCount==0) {
          console.log('no book exists');
          res.json('no book exists');
        } else {
          console.log(`deleted count: ${result.deletedCount}`)
          res.json('complete delete successful')
        }
      })
      //if successful response will be 'complete delete successful'
      
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      
      const showBook = async (bookid)=>{
        
        try {
          bookid = mongoose.Types.ObjectId(bookid)
        } catch (e) {
          console.log(`e: ${e}`);
          bookid = mongoose.Types.ObjectId("000000000000000000000000");
        }

        Book.findById(bookid, (err,result)=>{
          if (err) {
            console.error(err);
          } else if (result==null) {
            res.json('no book exists');
          } else {
            res.json({
              _id: result._id,
              title: result.title,
              comments: result.comments,
              commentcount: result.commentcount
            })
          }
        })
      }

      showBook(bookid)
        .catch((e)=>{console.error(e)});
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      const submitCmt = async (bookid,comment)=>{
        /*
        let newCmt = new Comment({
          'text': comment
        });
        */
        try {
          bookid = mongoose.Types.ObjectId(bookid)
        } catch (e) {
          console.log(`e: ${e}`);
          bookid = mongoose.Types.ObjectId("000000000000000000000000");
        }
        Book.findById(
          {_id: bookid},
          (err,result)=>{
            if (err) {
              console.error(err);
            } else if (comment==null || comment=="") {
              console.log(`comment does not exisit`);
              res.json('missing required field comment');
            } else if (result==null) {
              console.log(`Book '${req.params.id}' not found`);
              res.json('no book exists');
            } else {
              result.comments.push(comment);
              result.commentcount += 1;
              result.save((e)=>{
                if (e) console.error(e);
              })
              console.log(`New comment '${comment}' submitted`)
              let display = {
                _id: result._id,
                title: result.title,
                comments: result.comments,
                commentcount: result.commentcount
              }
              res.json(display)
              console.log(`Comments added in book '${bookid}'`)
            }
          }
        )
      }
      submitCmt(bookid, comment)
        .then(`New comment '${comment}' submitted`)
        .catch((e)=>{console.error(e)})
      //json res format same as .get
    })
    
    .delete((req, res)=>{
      let bookid = req.params.id;
      try {
        bookid = mongoose.Types.ObjectId(bookid)
      } catch (e) {
        console.log(`e: ${e}`);
        bookid = mongoose.Types.ObjectId("000000000000000000000000");
      }
      Book.deleteOne({_id: bookid},(err,result)=>{
        if (err){
          console.error(err);
        } else if (result.deletedCount==0) {
          console.log('no book exists');
          res.json('no book exists');
        } else {
          console.log(`deleted count: ${result.deletedCount}`)
          res.json('delete successful')
        }
      })
      //if successful response will be 'delete successful'
    });
  
};
