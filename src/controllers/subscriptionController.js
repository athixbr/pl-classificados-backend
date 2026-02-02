import mercadopago from '../config/mercadopago.js';
import { User, Plan, Subscription, Payment } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Criar assinatura no Mercado Pago
// @route   POST /api/subscriptions/create
// @access  Private
export const createSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plan_id, payer_email } = req.body;

    // Buscar usuário e plano
    const user = await User.findByPk(userId);
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    // Se for plano gratuito, não precisa criar assinatura no MP
    if (plan.slug === 'free' || parseFloat(plan.price) === 0) {
      // Atualizar usuário com plano gratuito
      await user.update({
        plan_id: plan.id,
        subscription_status: 'authorized'
      });

      return res.json({
        success: true,
        message: 'Plano gratuito ativado com sucesso',
        data: {
          is_free: true,
          user: user.toSafeObject()
        }
      });
    }

    // Cancelar assinatura anterior se existir
    if (user.subscription_id) {
      try {
        await mercadopago.preapproval.update({
          id: user.subscription_id,
          status: 'cancelled'
        });
      } catch (error) {
        console.error('Erro ao cancelar assinatura anterior:', error);
      }
    }

    // Criar assinatura no Mercado Pago
    const subscription_data = {
      reason: `Assinatura ${plan.name} - PL Classificados`,
      auto_recurring: {
        frequency: 1,
        frequency_type: plan.period === 'yearly' ? 'months' : 'months',
        transaction_amount: parseFloat(plan.price),
        currency_id: 'BRL',
        repetitions: plan.period === 'yearly' ? 12 : 999 // 12 meses para anual, ilimitado para mensal
      },
      back_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      payer_email: payer_email || user.email,
      external_reference: user.id,
      status: 'pending'
    };

    const response = await mercadopago.preapproval.create(subscription_data);

    // Criar registro de assinatura no banco
    const subscription = await Subscription.create({
      user_id: user.id,
      plan_id: plan.id,
      mp_preapproval_id: response.body.id,
      status: 'pending',
      amount: plan.price,
      frequency: 1,
      frequency_type: plan.period === 'yearly' ? 'months' : 'months',
      metadata: response.body
    });

    // Atualizar usuário
    await user.update({
      subscription_id: response.body.id
    });

    res.json({
      success: true,
      message: 'Assinatura criada com sucesso',
      data: {
        subscription_id: response.body.id,
        init_point: response.body.init_point,
        subscription: subscription
      }
    });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    next(error);
  }
};

// @desc    Webhook do Mercado Pago
// @route   POST /api/subscriptions/webhook
// @access  Public (protegido por validação MP)
export const handleWebhook = async (req, res, next) => {
  try {
    console.log('📥 Webhook recebido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Query params:', req.query);

    const { type, data } = req.body;

    // Responder rapidamente ao MP
    res.status(200).send('OK');

    // Processar webhook de forma assíncrona
    if (type === 'subscription_preapproval') {
      await handleSubscriptionUpdate(data.id);
    } else if (type === 'payment') {
      await handlePaymentUpdate(data.id);
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    // Não fazer next(error) aqui para não travar o webhook
  }
};

// Função auxiliar para processar atualização de assinatura
const handleSubscriptionUpdate = async (preapprovalId) => {
  try {
    console.log('🔄 Processando atualização de assinatura:', preapprovalId);

    // Buscar dados da assinatura no MP
    const response = await mercadopago.preapproval.get(preapprovalId);
    const mpSubscription = response.body;

    console.log('📦 Dados da assinatura MP:', mpSubscription);

    // Buscar assinatura no banco
    const subscription = await Subscription.findOne({
      where: { mp_preapproval_id: preapprovalId }
    });

    if (!subscription) {
      console.log('⚠️ Assinatura não encontrada no banco:', preapprovalId);
      return;
    }

    // Mapear status do MP para nosso sistema
    const statusMap = {
      'pending': 'pending',
      'authorized': 'authorized',
      'paused': 'paused',
      'cancelled': 'cancelled'
    };

    const newStatus = statusMap[mpSubscription.status] || 'pending';

    // Atualizar assinatura
    await subscription.update({
      status: newStatus,
      start_date: mpSubscription.date_created,
      next_payment_date: mpSubscription.next_payment_date,
      metadata: mpSubscription
    });

    // Atualizar usuário
    const user = await User.findByPk(subscription.user_id);
    if (user) {
      const updateData = {
        subscription_status: newStatus
      };

      // Se foi autorizada, atualizar plano e data de expiração
      if (newStatus === 'authorized') {
        updateData.plan_id = subscription.plan_id;
        
        // Calcular data de expiração (30 dias a partir de agora)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        updateData.subscription_expires_at = expiresAt;
      }

      await user.update(updateData);
      console.log('✅ Usuário atualizado:', user.id, 'Status:', newStatus);
    }

  } catch (error) {
    console.error('❌ Erro ao processar assinatura:', error);
  }
};

// Função auxiliar para processar atualização de pagamento
const handlePaymentUpdate = async (paymentId) => {
  try {
    console.log('💳 Processando pagamento:', paymentId);

    // Buscar dados do pagamento no MP
    const response = await mercadopago.payment.get(paymentId);
    const mpPayment = response.body;

    console.log('📦 Dados do pagamento MP:', mpPayment);

    // Buscar assinatura relacionada
    const subscription = await Subscription.findOne({
      where: { mp_preapproval_id: mpPayment.external_reference }
    });

    if (!subscription) {
      console.log('⚠️ Assinatura não encontrada para pagamento:', paymentId);
      return;
    }

    // Criar ou atualizar registro de pagamento
    const [payment, created] = await Payment.findOrCreate({
      where: { mp_payment_id: paymentId },
      defaults: {
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        mp_payment_id: paymentId,
        status: mpPayment.status,
        status_detail: mpPayment.status_detail,
        amount: mpPayment.transaction_amount,
        payment_method: mpPayment.payment_method_id,
        payment_type: mpPayment.payment_type_id,
        description: mpPayment.description,
        payer_email: mpPayment.payer?.email,
        paid_at: mpPayment.status === 'approved' ? new Date() : null,
        metadata: mpPayment
      }
    });

    if (!created) {
      await payment.update({
        status: mpPayment.status,
        status_detail: mpPayment.status_detail,
        paid_at: mpPayment.status === 'approved' ? new Date() : null,
        metadata: mpPayment
      });
    }

    // Se pagamento foi aprovado, estender assinatura
    if (mpPayment.status === 'approved') {
      const user = await User.findByPk(subscription.user_id);
      if (user) {
        const currentExpires = user.subscription_expires_at || new Date();
        const newExpires = new Date(currentExpires);
        newExpires.setDate(newExpires.getDate() + 30); // Adicionar 30 dias

        await user.update({
          subscription_expires_at: newExpires
        });

        console.log('✅ Assinatura estendida até:', newExpires);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
  }
};

// @desc    Cancelar assinatura
// @route   POST /api/subscriptions/cancel
// @access  Private
export const cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user.subscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui assinatura ativa'
      });
    }

    // Cancelar no Mercado Pago
    await mercadopago.preapproval.update({
      id: user.subscription_id,
      status: 'cancelled'
    });

    // Atualizar banco
    await Subscription.update(
      { status: 'cancelled' },
      { where: { mp_preapproval_id: user.subscription_id } }
    );

    await user.update({
      subscription_status: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter status da assinatura do usuário
// @route   GET /api/subscriptions/status
// @access  Private
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      include: [
        { model: Plan, as: 'plan' },
        {
          model: Subscription,
          as: 'subscriptions',
          include: [
            { model: Plan, as: 'plan' },
            {
              model: Payment,
              as: 'payments',
              order: [['created_at', 'DESC']],
              limit: 5
            }
          ],
          order: [['created_at', 'DESC']],
          limit: 1
        }
      ]
    });

    // Contar anúncios ativos
    const { Listing } = await import('../models/index.js');
    const activeListings = await Listing.count({
      where: {
        user_id: userId,
        status: 'active'
      }
    });

    // Contar anúncios destacados no mês atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const highlightedListings = await Listing.count({
      where: {
        user_id: userId,
        featured: true,
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        plan: user.plan,
        current_subscription: user.subscriptions?.[0] || null,
        usage: {
          active_listings: activeListings,
          max_listings: user.plan?.ads_limit || 1,
          highlighted_listings: highlightedListings,
          max_highlighted: user.plan?.highlighted || 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Listar histórico de pagamentos
// @route   GET /api/subscriptions/payments
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [{ model: Plan, as: 'plan' }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};
