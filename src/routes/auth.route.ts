import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { collection, getDocs, query, where } from 'firebase/firestore';
import db from 'database/connection';

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH2_CLIENT_ID,
      clientSecret: process.env.OAUTH2_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const q = query(
        collection(db, "devices"),
        where("email", "==", profile?.emails?.[0].value)
      );

      const querySnapshot = await getDocs(q);
      const user = querySnapshot.docs[0];
      
      if (user) {
        done(null, user.data());
      } else {
        return done(null, false, {
          message: "You do not have access to this feature. Please speak with your manager for more information."
        });
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  // Code to serialize user data
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  // Code to deserialize user data
  done(null, user);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, redirect or handle the user as desired
  res.redirect('/');
});

export default router;
