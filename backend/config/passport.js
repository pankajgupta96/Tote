const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { User } = require("../models/User");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              isVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "http://localhost:3000/auth/facebook/callback",
//       profileFields: ["id", "displayName", "emails"] // Required to get email
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ facebookId: profile.id });

//         if (!user) {
//           user = await User.findOne({ email: profile.emails?.[0]?.value });

//           if (user) {
//             user.facebookId = profile.id;
//             await user.save();
//           } else {
//             user = await User.create({
//               facebookId: profile.id,
//               name: profile.displayName,
//               email: profile.emails?.[0]?.value || "",
//               isVerified: true
//             });
//           }
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "http://localhost:3000/auth/facebook/callback",
//       profileFields: ["id", "displayName", "emails"], // Request email
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ facebookId: profile.id });

//         if (!user) {
//           user = await User.findOne({ email: profile.emails?.[0]?.value });

//           if (user) {
//             // Link Facebook to existing email
//             user.facebookId = profile.id;
//             await user.save();
//           } else {
//             // Create new user
//             user = await User.create({
//               facebookId: profile.id,
//               name: profile.displayName,
//               email: profile.emails?.[0]?.value || "",
//               isVerified: true,
//             });
//           }
//         }

//         done(null, user);
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );


passport.use('facebook', new FacebookStrategy(  // 👈 Give explicit name 'facebook'
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ["id", "displayName", "emails"]
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { facebookId: profile.id },
          { email: profile.emails?.[0]?.value }
        ]
      });

      if (!user) {
        user = await User.create({
          facebookId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || `temp-${profile.id}@facebook.com`,
          isVerified: true
        });
      } else if (!user.facebookId) {
        // Link existing account
        user.facebookId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));




module.exports = passport;
