import express from 'express';
import cors from 'cors';
import giteeRoutes from './routes/gitee';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/gitee', giteeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
