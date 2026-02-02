import jwt from 'jsonwebtoken';
import { User, Plan } from '../models/index.js';
import { sendWelcomeEmail, sendPlanConfirmationEmail } from '../utils/emailService.js';

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, type, plan_id } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Determinar o plano
    let selectedPlan = null;
    if (plan_id) {
      selectedPlan = await Plan.findByPk(plan_id);
    } else {
      // Buscar plano gratuito como padrão
      selectedPlan = await Plan.findOne({ where: { slug: 'free' } });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      phone,
      type: type || 'user',
      plan_id: selectedPlan?.id
    });

    const token = generateToken(user.id);

    // Enviar email de boas-vindas (não bloqueia o registro se falhar)
    sendWelcomeEmail(user, null).catch(err => {
      console.error('Erro ao enviar email de boas-vindas:', err);
    });

    // Se um plano foi selecionado, enviar email de confirmação
    if (selectedPlan && selectedPlan.slug !== 'free') {
      sendPlanConfirmationEmail(user, selectedPlan).catch(err => {
        console.error('Erro ao enviar email de confirmação de plano:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    console.log('📥 Login request received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha'
      });
    }

    // Buscar usuário
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Plan, as: 'plan' }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o suporte.'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter perfil do usuário logado
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Plan, as: 'plan' }]
    });

    res.json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar perfil
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;

    if (req.file) {
      user.avatar = req.file.location;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça a senha atual e a nova senha'
      });
    }

    const user = await User.findByPk(req.user.id);
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
