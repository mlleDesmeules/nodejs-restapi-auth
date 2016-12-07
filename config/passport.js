//  ---------------
//      IMPORTS
//  ---------------

const passport      = require( 'passport' );
const User          = require( '../models/user' );
const config        = require( './main' );
const JwtStrategy   = require( 'passport-jwt' ).Strategy;
const ExtractJwt    = require( 'passport-jwt' ).ExtractJwt;
const LocalStrategy = require( 'passport-local' );

//  -------------------
//      LOCAL LOGIN
//  -------------------

const localOptions = { usernameField: 'email' };

const localLogin   = new LocalStrategy(localOptions, function(email, password, done) {
	User
		.findOne({ email: email }, function(err, user) {
			if(err) {
				return done(err);
			}
			if(!user) {
				return done(null, false, { error: 'Your login details could not be verified. Please try again.' });
			}

			/*
				Verify if password is matching
			 */
			user.comparePassword(password, function(err, isMatch) {
				if (err) {
					return done(err);
				}

				if (!isMatch) {
					return done(null, false, { error: "Your login details could not be verified. Please try again." });
				}

				return done(null, user);
			});
		});
});

//  -----------------
//      JWT LOGIN
//  -----------------

const jwtOptions = {
	// Telling Passport to check authorization headers for JWT
	jwtFromRequest: ExtractJwt.fromAuthHeader(),
	// Telling Passport where to find the secret
	secretOrKey: config.secret
};

const jwtLogin   = new JwtStrategy(jwtOptions, function(payload, done) {
	User.findById(payload._id, function(err, user) {
		if (err) { return done(err, false); }

		if (user) {
			done(null, user);
		} else {
			done(null, false);
		}
	});
});

//  ----------------------
//      USE STRATEGIES
//  ----------------------

passport.use(jwtLogin);
passport.use(localLogin);  