let isAccountCreationLocked = false;

const verifyGeneralAdmin = (req, res, next) => {
  if (req.user.role !== 'general_admin') {
    return res.status(403).json({ message: 'Access denied. Only general admins can create accounts.' });
  }
  next();
};

const concurrencyControl = (req, res, next) => {
  if (isAccountCreationLocked) {
    return res.status(423).json({ message: "Account creation is currently locked by another general admin." });
  }
  isAccountCreationLocked = true;

  res.on('finish', () => {
    isAccountCreationLocked = false;
  });

  next();
};

module.exports = {
  verifyGeneralAdmin,
  concurrencyControl,
};
