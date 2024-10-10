import 'module-alias/register';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import morgan from 'morgan';
import authConfig from '@config/auth';
import firebase from './database/connection';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { collection, getDocs, query, where } from 'firebase/firestore';
import GoogleHomeService from '@services/google-home.service';

// Initialize express app
const app = express();

app.use((req, res, next) => {
  // @ts-ignore
  req.firebase = firebase;
  next();
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(session({ secret: authConfig.secret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH2_CLIENT_ID,
      clientSecret: process.env.OAUTH2_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const q = query(
        collection(firebase, "devices"),
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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, redirect or handle the user as desired
  res.redirect('/');
});

app.post('/google-home/intent', async (req, res) => {
  const payload = req.body;
  let { user } = req;

  const googleHomeService = new GoogleHomeService(firebase);

  if (!user) {
    user = {
      id: 1,
      name: 'Bruno Sartori',
      login: 'brunosartori.dev@gmail.com',
      password: '$2a$10$MmHGsvxXz16IfxgvVVZUQew1fM2LlDCBzCXex/mzIPFIYFKzvVodi',
      createdAt: '2024-10-09T15:15:57.000Z',
      updatedAt: '2024-10-09T15:15:57.000Z'
    };
  }

  try {
    switch(payload.inputs[0].intent) {
      case 'action.devices.SYNC': {
        const response = await googleHomeService.syncDevices(payload, user.id);
        res.status(200).json({ data: response });
      } break;
      case 'action.devices.QUERY': {
        const response = await googleHomeService.queryDevices(payload, user.id);
        res.status(200).json({ data: response });
      } break;
      case 'action.devices.EXECUTE': {
        const response = await googleHomeService.execDevices(payload, user.id);
        res.status(200).json({ data: response });
      } break;
    }

  } catch (error) {
    console.error("Error executing intent:", error);
    res.status(400).json({ error });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
