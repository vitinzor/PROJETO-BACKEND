// controllers/user/loginUserController.js
import { getUserByEmail } from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export default asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // src/controllers/user/loginUserController.js (linha 12)
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { 
    expiresIn: '1h' 
  });

  // Remove a senha e inclui todos os outros dados, incluindo a role
  const { password: _, ...userSafe } = user;
  
  // Enviamos o token e o usuário sem a senha na resposta
  res.json({ 
    token, 
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,  // Explicitamente incluindo a role
    ...userSafe 
  });
});