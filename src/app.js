import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { getSignups, addSignup, removeSignup, getPasscode as storeGetPasscode, setPasscode as storeSetPasscode } from './storage/store.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  const COOKIE_SECRET = process.env.COOKIE_SECRET || 'kapcqlunch-secret';

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use('/public', express.static(path.join(__dirname, '..', 'public')));
  app.use(cookieParser(COOKIE_SECRET));

  function getPasscode() {
    return storeGetPasscode();
  }

  function requirePasscode(req, res, next) {
    return next();
  }

  app.get('/passcode', (req, res) => {
    return res.redirect('/');
  });

  app.post('/passcode', async (req, res) => {
    return res.redirect('/');
  });

  app.get('/', requirePasscode, async (req, res) => {
    const today = dayjs().format('YYYY-MM-DD');
    const rows = await getSignups(today);
    res.render('index', { today, signups: rows });
  });

  app.post('/signup', requirePasscode, async (req, res) => {
    const nameRaw = (req.body.name || '').trim();
    if (!nameRaw) {
      return res.redirect('/');
    }
    const name = nameRaw.slice(0, 100);
    const today = dayjs().format('YYYY-MM-DD');
    await addSignup(today, name, dayjs().toISOString());
    res.redirect('/');
  });

  app.post('/remove', requirePasscode, async (req, res) => {
    const nameRaw = (req.body.name || '').trim();
    if (!nameRaw) {
      return res.redirect('/');
    }
    const name = nameRaw.slice(0, 100);
    const today = dayjs().format('YYYY-MM-DD');
    await removeSignup(today, name);
    res.redirect('/');
  });

  app.get('/admin', requirePasscode, (req, res) => {
    const ok = req.query.ok === '1';
    const err = req.query.err === '1';
    res.render('admin', { ok, err });
  });

  app.post('/admin', requirePasscode, async (req, res) => {
    const current = (req.body.current_passcode || '').trim();
    const next = (req.body.new_passcode || '').trim();
    if (!current || !next) {
      return res.redirect('/admin?err=1');
    }
    const now = await storeGetPasscode();
    if (current !== now) {
      return res.redirect('/admin?err=1');
    }
    await storeSetPasscode(next);
    return res.redirect('/admin?ok=1');
  });

  return app;
}



