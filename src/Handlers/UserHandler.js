const {
  createUserController,
  obtenerUserController,
  obtenerUserGridController,
  updateUserController,
  verificarUsuarioController,
  deleteUserController,
  softDeleteUserController,
  obtenerUsuariosController, // <-- Nueva función del controlador
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
        message: "El Identificador no puede estar vacío.",
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
  const { id } = req.params;
  const { nombre, apellido, direccion, email, whatsapp, usuario, dni } =
    req.body;

  const data = { nombre, apellido, direccion, email, whatsapp, usuario, dni };

  try {
    await updateUserController(id, data);
    return res.status(200).json({ message: "Modificación exitosa" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

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

const deleteUserHandler = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteUserController(id);
    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const softDeleteUserHandler = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // Aceptamos el parámetro isActive (true o false)

  if (isActive === undefined) {
    return res
      .status(400)
      .json({ message: "El parámetro 'isActive' es obligatorio" });
  }

  try {
    await softDeleteUserController(id, isActive); // Pasamos el parámetro isActive
    return res.status(200).json({
      message: `Usuario marcado como ${isActive ? "activo" : "inactivo"}`,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// NUEVO HANDLER
const obtenerUsuariosHandler = async (req, res) => {
  const { status } = req.query; // Filtrar por "status" (activo/inactivo)

  try {
    // Determinamos el valor del filtro para isActive
    let isActive;
    if (status === "true") {
      isActive = true; // Solo usuarios activos
    } else if (status === "false") {
      isActive = false; // Solo usuarios inactivos
    }

    const usuarios = await obtenerUsuariosController(isActive);

    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createUsserHandler,
  obtenerUserHandler,
  obtenerUserGridHandler,
  updateUserHandler,
  verificarUsuarioHandler,
  deleteUserHandler,
  softDeleteUserHandler,
  obtenerUsuariosHandler, // <-- Exportamos la nueva función de obtener usuarios
};
