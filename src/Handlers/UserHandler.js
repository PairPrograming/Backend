const {
  createUserController,
  obtenerUserController,
  obtenerUserGridController,
  updateUserController,
  verificarUsuarioController,
  verificarUsuarioPorNombreController,
  deleteUserController,
  softDeleteUserController,
  obtenerUsuariosController,
  changePasswordController,
  updateUserRoleController,
} = require("../Controllers/UserController");

const createUserHandler = async (req, res) => {
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
    rol,
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
      rol: rol || "comun", // Asegurar rol predeterminado
    };
    await createUserController(userData);
    return res.status(201).json({ message: "Usuario Creado" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const crearUsuarioAdminHandler = async (req, res) => {
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
    rol,
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
      rol: rol || "comun", // Asegurar rol predeterminado
    };
    await createUserController(userData);
    return res.status(201).json({ message: "Usuario creado por admin" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const verificarUsuarioPorNombreHandler = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({
      message: "El nombre de usuario es requerido para la verificación",
    });
  }

  try {
    const result = await verificarUsuarioPorNombreController({ usuario });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: `Error al verificar el nombre de usuario: ${error.message}`,
    });
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

    const formattedUser = {
      ...user,
      whatsapp: user.whatsapp || "",
      dni: user.dni || "",
      direccion: user.direccion || "",
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      details: "Error al obtener datos del usuario",
    });
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

  const data = {
    nombre: nombre || null,
    apellido: apellido || null,
    direccion: direccion || null,
    email: email || null,
    whatsapp: whatsapp || null,
    usuario: usuario || null,
    dni: dni || null,
  };

  try {
    await updateUserController(id, data);
    return res.status(200).json({
      message: "Modificación exitosa",
      updatedFields: Object.keys(data).filter((key) => data[key] !== null),
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      details: "Error en la actualización",
    });
  }
};

const verificarUsuarioHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email es requerido para verificación con Auth0",
    });
  }

  try {
    const user = await verificarUsuarioController({ email });

    if (user) {
      const userData = {
        id: user.id,
        email: user.email,
        usuario: user.usuario,
        dni: user.dni,
        nombre: user.nombre,
        apellido: user.apellido,
        isActive: user.isActive,
        rol: user.rol || "comun",
      };

      return res.status(200).json({
        registrado: true,
        usuario: userData,
      });
    } else {
      return res.status(200).json({ registrado: false });
    }
  } catch (error) {
    console.error("Error en verificarUsuarioHandler:", error);
    return res.status(500).json({
      message: `Error al verificar el usuario: ${error.message}`,
    });
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
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res
      .status(400)
      .json({ message: "El parámetro 'isActive' es obligatorio" });
  }

  try {
    await softDeleteUserController(id, isActive);
    return res.status(200).json({
      message: `Usuario marcado como ${isActive ? "activo" : "inactivo"}`,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const obtenerUsuariosHandler = async (req, res) => {
  const { status } = req.query;

  try {
    let isActive;
    if (status === "true") isActive = true;
    else if (status === "false") isActive = false;

    const usuarios = await obtenerUsuariosController(isActive);
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const changePasswordHandler = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    await changePasswordController(id, data);
    return res.status(201).json("Contraseña Actualizada");
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateUserRoleHandler = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!rol || !["admin", "vendor", "comun", "graduado"].includes(rol)) {
    return res.status(400).json({
      message: "El rol debe ser 'admin', 'vendor', 'comun' o 'graduado'",
    });
  }

  try {
    await updateUserRoleController(id, rol);
    return res.status(200).json({ message: `Rol actualizado a ${rol}` });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createUserHandler,
  crearUsuarioAdminHandler,
  obtenerUserHandler,
  obtenerUserGridHandler,
  updateUserHandler,
  verificarUsuarioHandler,
  verificarUsuarioPorNombreHandler,
  deleteUserHandler,
  softDeleteUserHandler,
  obtenerUsuariosHandler,
  changePasswordHandler,
  updateUserRoleHandler,
};
