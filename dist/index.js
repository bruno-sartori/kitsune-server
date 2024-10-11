"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./config/auth"));
const connection_1 = __importDefault(require("./database/connection"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const firestore_1 = require("firebase/firestore");
const google_home_service_1 = __importDefault(require("./services/google-home.service"));
const auth_2 = __importDefault(require("./middlewares/auth"));
const SALT_ROUNDS = 10;
// Initialize express app
const app = (0, express_1.default)();
app.use((req, res, next) => {
    // @ts-ignore
    req.firebase = connection_1.default;
    next();
});
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, express_session_1.default)({ secret: auth_1.default.secret, resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.OAUTH2_CLIENT_ID,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(profile);
    try {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(connection_1.default, "users"), (0, firestore_1.where)("email", "==", (_a = profile === null || profile === void 0 ? void 0 : profile.emails) === null || _a === void 0 ? void 0 : _a[0].value));
        const querySnapshot = yield (0, firestore_1.getDocs)(q);
        const user = querySnapshot.docs[0];
        if (user) {
            console.log('User: ', Object.assign({ id: user.id }, user.data()));
            done(null, Object.assign({ id: user.id }, user.data()));
        }
        else {
            return done(null, false, {
                message: "You do not have access to this feature. Please speak with your manager for more information."
            });
        }
    }
    catch (error) {
        return done(error, false);
    }
})));
passport_1.default.serializeUser((user, done) => {
    console.log('AQWUIII');
    console.log(`AQUIIIII`, user);
    // @ts-ignore
    done(null, user.id); // Serializando apenas o ID do usuário
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('DESERIUALIZE');
    try {
        const q = (0, firestore_1.query)((0, firestore_1.collection)(connection_1.default, 'users'), (0, firestore_1.where)('id', '==', id));
        const querySnapshot = yield (0, firestore_1.getDocs)(q);
        const user = (_a = querySnapshot.docs[0]) === null || _a === void 0 ? void 0 : _a.data();
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
app.get('/', (req, res) => {
    console.log(req.headers);
    res.status(200).json({ message: 'Hello World!' });
});
app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport_1.default.authenticate('google' /*, { failureRedirect: '/' }*/), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('CALLBACK');
    const userEmail = req.user.email;
    // Gerar o authorizationCode e salvar no Firestore
    try {
        const authorizationCode = yield generateAuthorizationCode(userEmail);
        console.log('Authorization code:', authorizationCode);
        res.json({ authorizationCode });
    }
    catch (error) {
        console.error('Error generating authorization code:', error);
        res.status(500).json({ error: 'Error generating authorization code' });
    }
}));
app.post('/auth/token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { grant_type, client_id, client_secret, code, redirect_uri, refresh_token } = req.body;
    if (!grant_type || !client_id || !client_secret) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    if (grant_type === 'authorization_code') {
        if (!code || !redirect_uri) {
            return res.status(400).json({ error: 'Authorization code and redirect_uri are required' });
        }
        try {
            const { valid, user, message } = yield verifyAuthorizationCode(code);
            if (!valid) {
                return res.status(401).json({ error: message });
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId: user === null || user === void 0 ? void 0 : user.userId, email: user === null || user === void 0 ? void 0 : user.email }, auth_1.default.secret, {
                expiresIn: auth_1.default.expiresIn
            });
            const plainRefreshToken = `${user === null || user === void 0 ? void 0 : user.email}-${new Date().getTime()}`;
            const refreshToken = yield bcryptjs_1.default.hash(plainRefreshToken, SALT_ROUNDS);
            const usersCollection = (0, firestore_1.collection)(connection_1.default, 'users');
            const userRef = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('email', '==', user === null || user === void 0 ? void 0 : user.email));
            const userSnapshot = yield (0, firestore_1.getDocs)(userRef);
            if (userSnapshot.empty) {
                throw new Error('User not found');
            }
            const userDoc = userSnapshot.docs[0].ref;
            yield (0, firestore_1.updateDoc)(userDoc, { refreshToken });
            return res.json({
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: 3600,
                refresh_token: refreshToken
            });
        }
        catch (error) {
            console.error('Error during token exchange:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    else if (grant_type === 'refresh_token') {
        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        try {
            const usersCollection = (0, firestore_1.collection)(connection_1.default, 'users');
            const q = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('refreshToken', '==', refresh_token));
            const querySnapshot = yield (0, firestore_1.getDocs)(q);
            const user = querySnapshot.docs[0];
            if (!user) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }
            const userData = user.data();
            const accessToken = jsonwebtoken_1.default.sign({ userId: userData.userId, email: userData.email }, auth_1.default.secret, {
                expiresIn: auth_1.default.expiresIn
            });
            return res.json({
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: 3600
            });
        }
        catch (error) {
            console.error('Error during refresh token exchange:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    else {
        return res.status(400).json({ error: 'Unsupported grant type' });
    }
}));
function generateAuthorizationCode(userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const plainRefreshToken = `${userEmail}-${new Date().getTime()}`;
        const authorizationCode = yield bcryptjs_1.default.hash(plainRefreshToken, SALT_ROUNDS);
        const usersCollection = (0, firestore_1.collection)(connection_1.default, 'users');
        const userRef = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('email', '==', userEmail));
        const userSnapshot = yield (0, firestore_1.getDocs)(userRef);
        if (userSnapshot.empty) {
            throw new Error('User not found');
        }
        const userDoc = userSnapshot.docs[0].ref;
        const codeExpiresAt = Date.now() + 10 * 60 * 1000;
        yield (0, firestore_1.updateDoc)(userDoc, {
            authorizationCode,
            codeExpiresAt
        });
        return authorizationCode;
    });
}
function verifyAuthorizationCode(authorizationCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const usersCollection = (0, firestore_1.collection)(connection_1.default, 'users');
            const q = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('authorizationCode', '==', authorizationCode));
            const querySnapshot = yield (0, firestore_1.getDocs)(q);
            if (querySnapshot.empty) {
                return { valid: false, message: 'No previously saved authorizationCode' };
            }
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            if (userData.codeExpiresAt && userData.codeExpiresAt < Date.now()) {
                return { valid: false, message: 'Authorization code expired' };
            }
            return { valid: true, user: userData };
        }
        catch (error) {
            console.error('Error verifying authorization code:', error);
            return { valid: false, message: 'Server error' };
        }
    });
}
app.post('/google-home/intent', auth_2.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    let { user } = req;
    const googleHomeService = new google_home_service_1.default(connection_1.default);
    try {
        switch (payload.inputs[0].intent) {
            case 'action.devices.SYNC':
                {
                    const response = yield googleHomeService.syncDevices(payload, user.id);
                    res.status(200).json({ data: response });
                }
                break;
            case 'action.devices.QUERY':
                {
                    const response = yield googleHomeService.queryDevices(payload, user.id);
                    res.status(200).json({ data: response });
                }
                break;
            case 'action.devices.EXECUTE':
                {
                    const response = yield googleHomeService.execDevices(payload, user.id);
                    res.status(200).json({ data: response });
                }
                break;
        }
    }
    catch (error) {
        console.error("Error executing intent:", error);
        res.status(400).json({ error });
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
