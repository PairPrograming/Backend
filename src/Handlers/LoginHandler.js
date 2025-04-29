const { login } = require("../Controllers/LoginController");

const loginHandler = async (req, res) => {
  const { userIdentifier, password } = req.body;

  if (!userIdentifier || !password) {
    return res
      .status(400)
      .json({ message: "Usuario/Email y contraseña son requeridos" });
  }

  try {
    const { token } = await login(userIdentifier, password);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  loginHandler,
};
