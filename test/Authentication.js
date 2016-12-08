process.env.NODE_ENV = "test";

//  ---------------
//      IMPORTS
//  ---------------

const Server   = require( "../server" );
const User     = require( "../models/User" );

const chai     = require( "chai" );
const chaiHttp = require( "chai-http" );

var   should   = chai.should();
var   base_url = "/api/auth";

chai.use(chaiHttp);

describe("Authentication /api/auth", function (  ) {

	beforeEach("Remove all Users", function (done) {
		User
			.remove({}, function (err) {
				done();
			});
	});

	describe("registration /register", function (  ) {

		it("should NOT create a new user without email", function ( done ) {
			var user = { firstName : "test", lastName : "test", password : "aaa" };

			chai
				.request(Server)
				.post(base_url + "/register")
				.send(user)
				.end(function (err, res) {

					res.should.have.status(422);

					res.body.should.be.a("object");
					res.body.should.have.property("error").be.eql("ERR_MISSING_EMAIL");

					done();
				});
		});

		it("should NOT create a new user without full name", function ( done ) {
			var user = { email : "test@test.com", firstName : "test", password : "aaa" };

			chai
				.request(Server)
				.post(base_url + "/register")
				.send(user)
				.end(function (err, res) {

					res.should.have.status(422);

					res.body.should.be.a("object");
					res.body.should.have.property("error").be.eql("ERR_MISSING_FULL_NAME");

					done();
				});
		});

		it("should NOT create a new user without password", function ( done ) {
			var user = { email : "test@test.com", firstName : "test", lastName : "test" };

			chai
				.request(Server)
				.post(base_url + "/register")
				.send(user)
				.end(function (err, res) {

					res.should.have.status(422);

					res.body.should.be.a("object");
					res.body.should.have.property("error").be.eql("ERR_MISSING_PASSWORD");

					done();
				});
		});
		
		it("should NOT create a new user with an existing email", function ( done ) {
			var newuser = { email : "test@test.com", password : "aaa1", profile : { firstName : "test2", lastName : "test2" } };
			var user    = { email : "test@test.com", password : "aaa1", firstName : "test2", lastName : "test2" };

			new User(newuser)
				.save(function ( err, doc ) {
					chai
						.request(Server)
						.post(base_url + "/register")
						.send(user)
						.end(function ( err, res ) {
							res.should.have.status(422);

							res.body.should.be.a("object");
							res.body.should.have.property("error").be.eql("ERR_USED_EMAIL");

							done();
						});
				});

		});

		it("should create a new user", function ( done ) {
			var user = { email : "test@test.com", firstName : "test", lastName : "test", password : "aaa" };

			chai
				.request(Server)
				.post(base_url + "/register")
				.send(user)
				.end(function (err, res) {

					res.should.have.status(201);

					res.body.should.be.a("object");

					res.body.should.have.property("token");
					res.body.should.have.property("user").be.a("object");

					done();
				});
		});

	});

	describe("login /login", function (  ) {

		var user = { email : "test@test.com", password : "aaa1", profile : { firstName : "test2", lastName : "test2" } };

		it("should NOT log a user in with wrong email", function ( done ) {
			chai
				.request(Server)
				.post(base_url + "/login")
				.send({ email : "test@test.com" })
				.end(function ( err, res ) {
					res.should.have.status(400);

					done();
				});
		});

		it("should NOT log a user in with wrong email/password", function ( done ) {
			var newuser = { email : "test@test.com", password : "aaa1", profile : { firstName : "test2", lastName : "test2" } };

			new User(newuser)
				.save(function ( err, doc ) {
					chai
						.request(Server)
						.post(base_url + "/login")
						.send({ email : "test@test.com", password : "wrong" })
						.end(function ( err, res ) {
							res.should.have.status(401);

							done();
						});
				});
		});

		it("should log the user in", function ( done ) {
			var newuser = { email : "test@test.com", password : "aaa1", profile : { firstName : "test2", lastName : "test2" } };

			new User(newuser)
				.save(function ( err, doc ) {
					chai
						.request(Server)
						.post(base_url + "/login")
						.send({ email : "test@test.com", password : "aaa1" })
						.end(function ( err, res ) {
							res.should.have.status(200);

							done();
						});
				});
		});

	});

});