import 'module-alias/register';
import express from 'express';
import util from 'util';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import morgan from 'morgan';
import authConfig from './config/auth';
import firebase from './database/connection';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { collection, documentId, getDocs, query, updateDoc, where } from 'firebase/firestore';
import GoogleHomeService from './services/google-home.service';
import authMiddleware from './middlewares/auth';

const SALT_ROUNDS = 10;

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
      console.log(profile);

      try {
        const q = query(
          collection(firebase, "users"),
          where("email", "==", profile?.emails?.[0].value)
        );

        const querySnapshot = await getDocs(q);
        const user = querySnapshot.docs[0];

        if (user) {
          console.log('User: ', { id: user.id, ...user.data() });
          done(null, { id: user.id, ...user.data() });
        } else {
          return done(null, false, {
            message: "You do not have access to this feature. Please speak with your manager for more information."
          });
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {

  console.log('AQWUIII')
  console.log(`AQUIIIII`, user);
  // @ts-ignore
  done(null, user.id); // Serializando apenas o ID do usuário
});

passport.deserializeUser(async (id, done) => {
  console.log('DESERIUALIZE', id)
  try {
    const q = query(collection(firebase, 'users'), where(documentId(), '==', id));
    console.log('AQAQUI', q);
    const querySnapshot = await getDocs(q);
    console.log('AQUI')
    const user = querySnapshot.docs[0]?.data();
    console.log('AQUI user', user)
    done(null, user);
  } catch (error) {
    console.error(error);
    done(error, null);
  }
});

app.get('/', (req, res) => {
  console.log(req.headers)
  res.status(200).json({ message: 'Hello World!' });
});

app.get('/login', (req, res) => {
  res.send(`<html>
<body>
<form action="/login" method="post">
<input type="hidden" name="response_url" value="${req.query.response_url}" />
<button type="submit" style="font-size:14pt">Link this service to Google</button>
</form>
</body>
</html>
`);
});

app.post('/login', async (req, res) => {
  // Here, you should validate the user account.
  // In this sample, we do not do that.
  const responseUrl = decodeURIComponent(req.body.response_url as string);
  return res.redirect(responseUrl);
});

app.get('/auth/google', (req, res, next) => { console.log('AUITH', req.body, req.query); next(); }, passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google'/*, { failureRedirect: '/' }*/), async (req, res) => {
  console.log('CALLBACK')
  console.log(req.body, req.query)
  const userEmail = req.user.email;

  // Gerar o authorizationCode e salvar no Firestore
  try {
    const authorizationCode = await generateAuthorizationCode(userEmail);
    console.log('Authorization code:', authorizationCode);
    
    const responseUrl = util.format(
      '%s?code=%s&state=%s',
      decodeURIComponent(req.query.redirect_uri as string || 'https://oauth-redirect.googleusercontent.com/r/pcsmart'),
      authorizationCode,
      req.query.state
    );
    const redirectUrl = `/login?response_url=${encodeURIComponent(responseUrl)}`;
    console.log('redirect:', redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error generating authorization code:', error);
    res.status(500).json({ error: 'Error generating authorization code' });
  }
});

app.post('/auth/token', async (req, res) => {
  const { grant_type, client_id, client_secret, code, redirect_uri, refresh_token } = req.body;

  if (!grant_type || !client_id || !client_secret) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (grant_type === 'authorization_code') {
    if (!code || !redirect_uri) {
      return res.status(400).json({ error: 'Authorization code and redirect_uri are required' });
    }

    try {
      const { valid, user, message } = await verifyAuthorizationCode(code);

      if (!valid) {
        return res.status(401).json({ error: message });
      }

      const accessToken = jwt.sign({ userId: user?.userId, email: user?.email }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      });

      const plainRefreshToken = `${user?.email}-${new Date().getTime()}`;
      const refreshToken = await bcrypt.hash(plainRefreshToken, SALT_ROUNDS);

      const usersCollection = collection(firebase, 'users');
      const userRef = query(usersCollection, where('email', '==', user?.email));
      const userSnapshot = await getDocs(userRef);

      if (userSnapshot.empty) {
        throw new Error('User not found');
      }

      const userDoc = userSnapshot.docs[0].ref;
      await updateDoc(userDoc, { refreshToken });

      return res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken
      });

    } catch (error) {
      console.error('Error during token exchange:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

  } else if (grant_type === 'refresh_token') {
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
      const usersCollection = collection(firebase, 'users');
      const q = query(usersCollection, where('refreshToken', '==', refresh_token));

      const querySnapshot = await getDocs(q);
      const user = querySnapshot.docs[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const userData = user.data();

      const accessToken = jwt.sign({ userId: userData.userId, email: userData.email }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      });

      return res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600
      });

    } catch (error) {
      console.error('Error during refresh token exchange:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

  } else {
    return res.status(400).json({ error: 'Unsupported grant type' });
  }
});

async function generateAuthorizationCode(userEmail: string) {
  const plainRefreshToken = `${userEmail}-${new Date().getTime()}`;
  const authorizationCode = await bcrypt.hash(plainRefreshToken, SALT_ROUNDS);

  const usersCollection = collection(firebase, 'users');
  const userRef = query(usersCollection, where('email', '==', userEmail));
  const userSnapshot = await getDocs(userRef);

  if (userSnapshot.empty) {
    throw new Error('User not found');
  }

  const userDoc = userSnapshot.docs[0].ref;
  const codeExpiresAt = Date.now() + 10 * 60 * 1000;

  await updateDoc(userDoc, {
    authorizationCode,
    codeExpiresAt
  });

  return authorizationCode;
}

async function verifyAuthorizationCode(authorizationCode: string) {
  try {
    const usersCollection = collection(firebase, 'users');
    const q = query(usersCollection, where('authorizationCode', '==', authorizationCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false, message: 'No previously saved authorizationCode' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.codeExpiresAt && userData.codeExpiresAt < Date.now()) {
      return { valid: false, message: 'Authorization code expired' };
    }

    return { valid: true, user: userData };

  } catch (error) {
    console.error('Error verifying authorization code:', error);
    return { valid: false, message: 'Server error' };
  }
}

app.post('/google-home/intent', authMiddleware, async (req, res) => {
  const payload = req.body;
  let { user } = req;

  const googleHomeService = new GoogleHomeService(firebase);

  try {
    switch (payload.inputs[0].intent) {
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
