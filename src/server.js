import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './middlewares/logger.js';
import userRouter from './routes/userRouter.js';
import movieRouter from './routes/movieRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import fileUpload from 'express-fileupload';

// Configurar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Configurar middleware de upload
app.use(fileUpload({
  createParentPath: true, // Criar diretórios se não existirem
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  abortOnLimit: true
}));

// IMPORTANTE: Servir arquivos estáticos - esta linha deve vir ANTES das rotas da API
app.use(express.static(path.join(__dirname, '../public')));

// Adicionar ANTES das rotas da API
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));
app.use('/uploads/posters', express.static(path.join(__dirname, '../uploads/posters')));

// Rotas
app.use('/users', userRouter);
app.use('/movies', movieRouter);
// Rota de reviews aninhada já é definida no movieRouter
// Definir rota de reviews diretamente para acesso admin
app.use('/reviews', reviewRouter);

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API CineLog funcionando!' });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));