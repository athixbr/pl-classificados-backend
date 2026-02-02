export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }

  // Erro de constraint única
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Este registro já existe',
      field: err.errors[0]?.path
    });
  }

  // Erro de foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida'
    });
  }

  // Erro padrão
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
};
