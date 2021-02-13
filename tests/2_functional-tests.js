/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     console.log('Running test example')
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('#1 Test POST /api/books with title', function(done) {
        console.log('Running test #1');
        chai.request(server)
          .post('/api/books')
          .send({title: 'Try POST Book'})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.typeOf(res.body, 'Object');
            done();
          })
        
      });
      
      test('#2 Test POST /api/books with no title given', function(done) {
        console.log('Running test #2');
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
            done();
          })
        
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('#3 Test GET /api/books',  function(done){
        console.log('Running test #3');
        chai.request(server)
          .get('/api/books')
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.typeOf(res.body, 'array');
            done();
          })
        
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('#4 Test GET /api/books/[id] with id not in db',  function(done){
        console.log('Running test #4');
        let bookid = 'invalidid'
        chai.request(server)
          .get('/api/books'+'/'+bookid)
          .query({_id: bookid})
          .end((err,res)=>{
            console.log('Inside test #4, chai-end');
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          })
        
      });
      
      test('#5 Test GET /api/books/[id] with valid id in db',  function(done){
        console.log('Running test #5');
        chai.request(server)
          .post('/api/books')
          .send({title: 'check book'})
          .then((res)=>{
            id = res.body._id;
            getBook(id);
            })
        const getBook = async (id)=>{
          chai.request(server)
            .get('/api/books'+'/'+id)
            .query({_id: id})
            .end((err,res)=>{
              console.log('Inside test #5, getBook-chai-.end');
              const expected = {
                _id: id,
                title: 'check book',
                comments: [],
                commentcount: 0
              }
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, expected);
              done();
            })
        } 
        
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('#6 Test POST /api/books/[id] with comment', function(done){
        console.log('Running test #6');
        chai.request(server)
          .post('/api/books')
          .send({title: 'Book to have comment added'})
          .then((res)=>{
            id = res.body._id;
            postCmt(id);
            })
        const postCmt = async (id)=>{
          testComment = 'try to add a comment like this'
          chai.request(server)
            .post('/api/books'+'/'+id)
            .send({_id: id, comment: testComment})
            .end((err,res)=>{
              console.log('Inside test #6, postCmt-chai-.end');
              const expected = {
                _id: id,
                title: 'Book to have comment added',
                comments: [testComment],
                commentcount: 1
              }
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, expected);
              done();
            })
        }
          
        
      });

      test('#7 Test POST /api/books/[id] without comment field', function(done){
        console.log('Running test #7');
        chai.request(server)
          .post('/api/books')
          .send({title: 'Book updated without comment field'})
          .then((res)=>{
            id = res.body._id;
            postCmt(id);
            })
        const postCmt = async (id)=>{
          chai.request(server)
            .post('/api/books'+'/'+id)
            .send({_id: id})
            .end((err,res)=>{
              console.log('Inside test #7, postCmt-chai-.end');
              const expected = 'missing required field comment';
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, expected);
              done();
            })
        }
        
      });

      test('#8 Test POST /api/books/[id] with comment, id not in db', function(done){
        console.log('Running test #8');
        chai.request(server)
          .get('/api/books/nonexistid')
          .end((err,res)=>{
            console.log('Inside test #8, chai-.end');
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          })
        
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('#9 Test DELETE /api/books/[id] with valid id in db', function(done){
        console.log('Running test #9');
        chai.request(server)
          .post('/api/books')
          .send({title: 'Book to be deleted'})
          .then((res)=>{
            id = res.body._id;
            deleteBook(id);
            })
        const deleteBook = async (id)=>{
          chai.request(server)
            .delete('/api/books'+'/'+id)
            .end((err,res)=>{
              const expected = 'delete successful';
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, expected);
              done();
            })
        }
        
      });

      test('#10 Test DELETE /api/books/[id] with  id not in db', function(done){
        console.log('Running test #10');
        chai.request(server)
          .delete('/api/books/nonexistid')
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          })
        
      });

    });

  });

});
