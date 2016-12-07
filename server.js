//  ---------------
//      IMPORTS
//  ---------------

const config     = require( './config/main' );
const bodyParser = require( 'body-parser' );
const bcrypt     = require( 'bcrypt-nodejs' )
const express    = require( 'express' );
const logger     = require( 'morgan' );
const mongoose   = require( 'mongoose' );
const router     = require( './router' );

//  ----------------
//      DATABASE
//  ----------------

mongoose.connect(config.database);

//  --------------------
//      APP & SERVER
//  --------------------

const app     = express();
const Server  = app.listen(config.port, function (  ) {
	console.log("Server is running on port " + config.port);
});

//  ------------------
//      MIDDLEWARE
//  ------------------

//  Log request to API with morgan.
app.use(logger("dev"));

//  Parse urlencoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//  Enable CORS
app.use(function ( req, res, next ) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "DELETE, GET, POST, PUT, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
	res.header("Access-Control-Allow-Credentials", "true");

	next();
});

//  --------------
//      ROUTER
//  --------------

router(app);