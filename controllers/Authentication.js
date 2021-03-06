//  ---------------
//      IMPORTS
//  ---------------

const jwt    = require( 'jsonwebtoken' );
const crypto = require( 'crypto' );
const User   = require( '../models/user' );
const config = require( '../config/main' );

/**
 *
 * @param user
 *
 * @returns {*}
 */
function generateToken ( user ) {
	return jwt.sign( user, config.secret, {
		expiresIn : 10080 // in seconds
	} );
}

/**
 *
 * @param request
 *
 * @returns {*}
 */
function setUserInfo ( request ) {
	return {
		_id       : request._id,
		firstName : request.profile.firstName,
		lastName  : request.profile.lastName,
		email     : request.email,
		role      : request.role,
	};
}

//  -------------
//      LOGIN
//  -------------

exports.login = function(req, res, next) {

	var userInfo = setUserInfo(req.user);

	res.status(200).json({
		token: 'JWT ' + generateToken(userInfo),
		user : userInfo
	});
}


//  --------------------
//      REGISTRATION
//  --------------------

exports.register = function(req, res, next) {
	// Check for registration errors
	const email = req.body.email;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const password = req.body.password;

	// Return error if no email provided
	if ( !email ) {
		return res.status( 422 ).send( { error : 'ERR_MISSING_EMAIL' } );
	}

	// Return error if full name not provided
	if ( !firstName || !lastName ) {
		return res.status( 422 ).send( { error : 'ERR_MISSING_FULL_NAME' } );
	}

	// Return error if no password provided
	if ( !password ) {
		return res.status( 422 ).send( { error : 'ERR_MISSING_PASSWORD' } );
	}

	User.findOne({ email: email }, function(err, existingUser) {
		if (err) { return next(err); }

		// If user is not unique, return error
		if (existingUser) {
			return res.status(422).send({ error: 'ERR_USED_EMAIL' });
		}

		// If email is unique and password was provided, create account
		var user = new User( {
			email    : email,
			password : password,
			profile  : { firstName : firstName, lastName : lastName }
		} );

		user.save(function(err, user) {
			if (err) { return next(err); }

			// Respond with JWT if user was created

			var userInfo = setUserInfo(user);

			res.status(201).json({
				                     token: 'JWT ' + generateToken(userInfo),
				                     user: userInfo
			                     });
		});
	});
}

//  ---------------------
//      AUTHORIZATION
//  ---------------------

exports.roleAuthorization = function(role) {
	return function(req, res, next) {
		const user = req.user;

		User.findById(user._id, function(err, foundUser) {
			if (err) {
				res.status(422).json({ error: 'No user was found.' });
				return next(err);
			}

			// If user is found, check role.
			if (foundUser.role == role) {
				return next();
			}

			res.status(401).json({ error: 'You are not authorized to view this content.' });
			return next('Unauthorized');
		})
	}
}