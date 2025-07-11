const { request } = require("express");
const { Contrato } = require("../DbIndex");

const crearContratoController = async (data) => {
  if (!data || !data.eventoId)
    throw new Error("No puede enviar un formulario vacio!!");
  try {
    const [contrato, created] = await Contrato.findOrCreate({
      where: { eventoId: data.eventoId },
      defaults: data,
    });
    console.log(contrato.id);
    if (!created) throw new Error("Ya existe un contrato para este evento");
    return { success: true, message: "Contrato agregado", id: contrato.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const eliminarContratoController = async (id) => {
  if (!id) throw new Error("Id Requerido");
  try {
    const contrato = await Contrato.findByPk(id);
    if (!contrato) throw new Error("Contrato no encontrado");
    await contrato.destroy();
    return { success: true, message: "Contrato eliminado correctamente" };
  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar el contrato ${error.message}`,
    };
  }
};

const actContratoController = async (requestData) => {
  const { id, ...data } = requestData;
  if (!id) {
    throw new Error("ID requerido");
  }
  if (!data || Object.keys(data).length === 0) {
    throw new Error("No hay datos para actualizar");
  }
  try {
    const contrato = await Contrato.findByPk(id);
    if (!contrato) {
      throw new Error("No se encontró el contrato o no existe");
    }
    const [updatedRows] = await Contrato.update(data, { where: { id } });
    if (updatedRows === 0) {
      throw new Error("No se pudo actualizar el contrato");
    }
    return { success: true, message: "Se actualizo correctamente" };
  } catch (error) {
    return {
      success: false,
      message: `Error al actualizar el contrato ${error.message}`,
    };
  }
};

const obtenerContratoController = async (id) => {
  if (!id) {
    return { success: false, message: "Falta id" };
  }
  
  try {
    const contratos = await Contrato.findAll({
      where: { eventoId: id }
    });
    
    if (contratos.length === 0) {
      return { success: false, message: "No se encontraron contratos para este evento" };
    }
    
    return { success: true, data: contratos };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  crearContratoController,
  eliminarContratoController,
  actContratoController,
  obtenerContratoController,
};
