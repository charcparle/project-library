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
    comments: [commentSchema],
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
      submitBook(title).then(`New book '${title}' submitted`)
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
