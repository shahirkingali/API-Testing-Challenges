require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})


describe('Message API endpoints', () => {
    beforeEach((done) => {
        const sampleUser = new User({
            _id: SAMPLE_USER_ID,
            username: "megan4",
            password: "Password1234",
          });
          sampleUser
            .save()
            .then(() => {
              return chai.request(app).post("/messages/").send({
                _id: SAMPLE_MESSAGE_ID,
                title: "Subject",
                body: "dinner",
                author: SAMPLE_USER_ID,
              });
            })
            .then(() => {
              done();
            });
    })

    afterEach((done) => {
       Message.deleteMany({ title: { $ne: "" } }).then(() => {
         return User.deleteMany({ username: { $ne: "" } }).then(() => {
            done();
          });
       });
    })

    it('should load all messages', (done) => {
        // TODO: Complete this
      chai
        .request(app)
        .get("/messages")
        .end((error, response) => {
          if (error) done(error);
          expect(response).to.have.status(200);
          done();
        });  
    })

    it('should get one specific message', (done) => {
      console.log(SAMPLE_MESSAGE_ID);
      chai
        .request(app)
        .get(`/messages/${SAMPLE_MESSAGE_ID}`)
        .end((error, response) => {
          if (error) done(error);
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body._id).to.equal(SAMPLE_MESSAGE_ID);
          done();
        });
    })

    it('should post a new message', (done) => {
      chai
        .request(app)
        .post("/messages")
        .send({
          title: "Subject",
          body: "dinner",
          author: "3f291705814",
        })
        .end((error, response) => {
          if (error) {
            done(error);
          }
          expect(response).to.have.status(200);
          expect(response);
          done();
        });
    })

    it('should update a message', (done) => {
      chai
        .request(app)
        .put(`/messages/${SAMPLE_MESSAGE_ID}`)
        .send({ title: "anotherTitle" })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          expect(res.body.message).to.be.an("object");
          expect(res.body.message).to.have.property("title", "anotherTitle");
  
          //check that message is actually inserted into database
          Message.findOne({ title: "anotherTitle" }).then((message) => {
            expect(message).to.be.an("object");
            done();
          });
        });
    })

    it('should delete a message', (done) => {
      chai
        .request(app)
        .delete(`/messages/${SAMPLE_MESSAGE_ID}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          expect(res.body.message).to.equal("Successfully deleted.");
          expect(res.body._id).to.equal(SAMPLE_MESSAGE_ID);
  
          //check that the message is actually deleted from the database
          Message.findOne({ title: "anotherMessage" }).then((message) => {
            expect(message).to.equal(null);
            done();
          });
        });    
    })
})
