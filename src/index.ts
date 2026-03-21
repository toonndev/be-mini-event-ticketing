import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './database/data-source';
import app from './app';

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    await AppDataSource.initialize();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
})();
