const {
  createUserController,
  obtenerUserController,
  obtenerUserGridController,
  updateUserController,
  verificarUsuarioController, // <-- NUEVO
} = require("../Controllers/UserController");

const createUsserHandler = async (req, res) => {
  const {
    dni,
    auth0Id,
    nombre,
    apellido,
    direccion,
    email,
    whatsapp,
    usuario,
    password,
    utypeId,
  } = req.body;
  try {
    const userData = {
      auth0Id,
      dni,
      nombre,
      apellido,
      direccion,
      email,
      whatsapp,
      usuario,
      password,
      utypeId,
    };
    await createUserController(userData);
    return res.status(201).json({ message: "Usuario Creado" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const obtenerUserHandler = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({
        error: "Solicitud incorrecta",
        message: "El Identificador no puede estar vacio.",
      });
    }
    const user = await obtenerUserController(id);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const obtenerUserGridHandler = async (req, res) => {
  try {
    const users = await obtenerUserGridController();
    return res.status(201).json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateUserHandler = async (req, res) => {
  const id = req.params;
  const { nombre, apellido, direccion, email, whatsapp } = req.body;
  const data = { nombre, apellido, direccion, email, whatsapp };
  try {
    await updateUserController(id, data);
    return res.status(201).json("Modificacion Exitosa");
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// NUEVO HANDLER
const verificarUsuarioHandler = async (req, res) => {
  const { email, usuario, dni } = req.body;

  if (!email && !usuario && !dni) {
    return res
      .status(400)
      .json({ message: "Debe enviar email, usuario o dni para verificar" });
  }

  try {
    const user = await verificarUsuarioController({ email, usuario, dni });

    if (user) {
      return res.status(200).json({ registrado: true, usuario: user });
    } else {
      return res.status(200).json({ registrado: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error al verificar el usuario: ${error.message}` });
  }
};

module.exports = {
  createUsserHandler,
  obtenerUserHandler,
  obtenerUserGridHandler,
  updateUserHandler,
  verificarUsuarioHandler, // <-- EXPORTA
};
