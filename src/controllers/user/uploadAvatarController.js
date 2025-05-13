import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Controller para upload de avatar usando express-fileupload
export default asyncHandler(async (req, res) => {
  try {
    // Verificar se há arquivo enviado
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const avatarFile = req.files.avatar;
    console.log('Recebido arquivo:', avatarFile.name, 'tipo:', avatarFile.mimetype);

    // Verificar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(avatarFile.mimetype)) {
      return res.status(400).json({ error: 'Formato de imagem não suportado. Use JPEG, PNG ou GIF.' });
    }

    // Verificar tamanho do arquivo (5MB máximo)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Tamanho máximo permitido é 5MB' });
    }

    // Criar diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const userId = req.user.id;
    const timestamp = Date.now();
    const fileExt = path.extname(avatarFile.name);
    const fileName = `user_${userId}_${timestamp}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Mover o arquivo para o diretório de uploads
    await avatarFile.mv(filePath);

    // Gerar URL do avatar - OBSERVE QUE É UM CAMINHO RELATIVO
    const avatarUrl = `/uploads/avatars/${fileName}`;
    
    console.log('Arquivo salvo em:', filePath);
    console.log('URL do avatar para o banco de dados:', avatarUrl);
    
    // Atualizar usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });
    
    // Remover a senha antes de enviar a resposta
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({ 
      message: 'Avatar atualizado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({ error: 'Erro ao atualizar avatar no banco de dados' });
  }
});