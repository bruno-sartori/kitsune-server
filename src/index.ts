import 'module-alias/register';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import routes from '@routes/index';
import notFoundMiddleware from '@middlewares/404.middleware';
import morgan from 'morgan';
import authConfig from '@config/auth';
import firebase from './database/connection';

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

app.use('/', routes);
app.use(notFoundMiddleware);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
