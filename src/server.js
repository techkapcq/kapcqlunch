import { createApp } from './app.js';
const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Lunch signup app listening on http://localhost:${PORT}`);
});


