//Componentes para validaciones de email y contraseña

const validations = (email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return emailRegex.test(email) && passwordRegex.test(password);
};

module.exports = { validations };
