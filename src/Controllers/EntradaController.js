const { Entrada, SubtipoEntrada } = require("../DbIndex");

const agregarEntradasController = async (data) => {
  try {
    // Validación básica
    const validate = [
      "eventoId", 
      "tipo_entrada",
      "cantidad_total",
      "subtipos"
    ];
    
    for (const valid of validate) {
      if (!data[valid]) {
        throw new Error(`El campo ${valid} es requerido`);
      }
    }

    // Validar que subtipos sea un array y no esté vacío
    if (!Array.isArray(data.subtipos) || data.subtipos.length === 0) {
      throw new Error("Debe incluir al menos un subtipo de entrada");
    }

    // Validar estructura de subtipos
    for (const subtipo of data.subtipos) {
      if (!subtipo.nombre || !subtipo.precio || !subtipo.cantidad_disponible) {
        throw new Error("Cada subtipo debe tener: nombre, precio y cantidad_disponible");
      }
    }

    // VALIDAR QUE LA SUMA DE SUBTIPOS NO EXCEDA CANTIDAD TOTAL
    const totalSubtipos = data.subtipos.reduce((total, subtipo) => 
      total + parseInt(subtipo.cantidad_disponible), 0
    );
    
    if (totalSubtipos > data.cantidad_total) {
      throw new Error(
        `La suma de cantidades de subtipos (${totalSubtipos}) no puede exceder la cantidad total (${data.cantidad_total})`
      );
    }

    // Verificar si ya existe entrada con ese tipo para el evento
    const entradaExistente = await Entrada.findOne({
      where: { 
        tipo_entrada: data.tipo_entrada, 
        eventoId: data.eventoId
      }
    });

    if (entradaExistente) {
      return {
        success: false,
        message: "Ya existe una entrada con ese tipo para el evento",
      };
    }

    // Crear entrada principal
    const entrada = await Entrada.create({
      tipo_entrada: data.tipo_entrada,
      descripcion: data.descripcion || null,
      cantidad_total: data.cantidad_total,
      cantidad_real: data.cantidad_total,
      fecha_inicio_venta: data.fecha_inicio_venta || null,
      fecha_fin_venta: data.fecha_fin_venta || null,
      estatus: data.estatus || 'disponible',
      eventoId: data.eventoId
    });

    // Crear subtipos asociados
    const subtipesData = data.subtipos.map((subtipo, index) => ({
      nombre: subtipo.nombre,
      descripcion: subtipo.descripcion || null,
      precio: subtipo.precio,
      cantidad_disponible: subtipo.cantidad_disponible,
      cantidad_vendida: 0,
      cantidad_reservada: 0,
      edad_minima: subtipo.edad_minima || null,
      edad_maxima: subtipo.edad_maxima || null,
      requiere_documentacion: subtipo.requiere_documentacion || false,
      orden_visualizacion: index + 1,
      estatus: 'activo',
      EntradaId: entrada.id
    }));

    const subtipos = await SubtipoEntrada.bulkCreate(subtipesData);

    return {
      success: true,
      message: "Entrada y subtipos creados exitosamente",
      entradaId: entrada.id,
      subtipos: subtipos.length,
      cantidad_real_restante: entrada.cantidad_real
    };

  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const obtenerEntradasController = async (eventoId) => {
  try {
    if (!eventoId) {
      throw new Error(`El campo eventoId es requerido`);
    }

    const entradas = await Entrada.findAll({
      where: { eventoId: eventoId },
      include: [{
        model: SubtipoEntrada,
        as: 'subtipos',
        where: { estatus: ['activo', 'agotado'] },
        required: false,
        order: [['orden_visualizacion', 'ASC']]
      }],
      order: [['createdAt', 'ASC']]
    });

    // Calcular totales por entrada
    const entradasConResumen = entradas.map(entrada => {
      const subtipos = entrada.subtipos || [];
      const totalVendidas = subtipos.reduce((sum, s) => sum + s.cantidad_vendida, 0);
      const totalDisponibles = subtipos.reduce((sum, s) => 
        sum + (s.cantidad_disponible - s.cantidad_vendida - s.cantidad_reservada), 0
      );
      const totalAsignados = subtipos.reduce((sum, s) => sum + s.cantidad_disponible, 0);
      const precios = subtipos.map(s => parseFloat(s.precio));
      
      return {
        ...entrada.toJSON(),
        resumen: {
          total_vendidas: totalVendidas,
          total_disponibles: totalDisponibles,
          total_asignados_subtipos: totalAsignados,
          cantidad_real_restante: entrada.cantidad_total - totalAsignados,
          precio_minimo: precios.length > 0 ? Math.min(...precios) : 0,
          precio_maximo: precios.length > 0 ? Math.max(...precios) : 0,
          cantidad_subtipos: subtipos.length
        }
      };
    });

    return { 
      success: true, 
      data: entradasConResumen 
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al obtener entradas: ${error.message}`,
    };
  }
};

const deleteEntradaController = async (entradaId) => {
  try {
    if (!entradaId) {
      throw new Error(`El campo entradaId es requerido`);
    }

    // Verificar que existe la entrada
    const entrada = await Entrada.findByPk(entradaId, {
      include: [{
        model: SubtipoEntrada,
        as: 'subtipos'
      }]
    });

    if (!entrada) {
      return {
        success: false,
        message: `No se encontró ninguna entrada con id: ${entradaId}`,
      };
    }

    // Verificar si hay ventas
    const tieneVentas = entrada.subtipos?.some(s => s.cantidad_vendida > 0);
    if (tieneVentas) {
      return {
        success: false,
        message: `No se puede eliminar la entrada porque ya tiene ventas registradas`,
      };
    }

    // Eliminar entrada (CASCADE eliminará subtipos automáticamente)
    const resultado = await Entrada.destroy({
      where: { id: entradaId },
    });

    return {
      success: true,
      message: `Entrada y subtipos eliminados correctamente`,
      deletedCount: resultado,
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar entrada: ${error.message}`,
    };
  }
};

const actualizarEntradaController = async (data) => {
  try {
    if (!data.id) {
      throw new Error("El campo id es requerido para actualizar");
    }

    const entrada = await Entrada.findByPk(data.id, {
      include: [{
        model: SubtipoEntrada,
        as: 'subtipos',
        where: { estatus: ['activo', 'agotado'] },
        required: false
      }]
    });

    if (!entrada) {
      return {
        success: false,
        message: `No se encontró entrada con id: ${data.id}`,
      };
    }

    // Si se actualiza cantidad_total, validar que sea suficiente para los subtipos existentes
    if (data.cantidad_total !== undefined) {
      const totalSubtipos = entrada.subtipos?.reduce((total, subtipo) => 
        total + subtipo.cantidad_disponible, 0
      ) || 0;

      if (data.cantidad_total < totalSubtipos) {
        throw new Error(
          `La nueva cantidad total (${data.cantidad_total}) no puede ser menor que la suma actual de subtipos (${totalSubtipos})`
        );
      }
    }

    // Campos actualizables de Entrada
    const camposActualizables = [
      "tipo_entrada",
      "descripcion", 
      "cantidad_total",
      "fecha_inicio_venta",
      "fecha_fin_venta",
      "estatus",
    ];

    camposActualizables.forEach((campo) => {
      if (data[campo] !== undefined) {
        entrada[campo] = data[campo];
      }
    });

    // Recalcular cantidad_real si se actualiza cantidad_total
    if (data.cantidad_total !== undefined) {
      const totalSubtipos = entrada.subtipos?.reduce((total, subtipo) => 
        total + subtipo.cantidad_disponible, 0
      ) || 0;
      entrada.cantidad_real = data.cantidad_total - totalSubtipos;
    }

    await entrada.save();

    return {
      success: true,
      message: "Entrada actualizada correctamente",
      entrada: entrada,
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al actualizar entrada: ${error.message}`,
    };
  }
};

const agregarSubtipoController = async (data) => {
  try {
    const validate = ["EntradaId", "nombre", "precio", "cantidad_disponible"];
    
    for (const valid of validate) {
      if (!data[valid]) {
        throw new Error(`El campo ${valid} es requerido`);
      }
    }

    // Verificar que la entrada existe y obtener subtipos actuales
    const entrada = await Entrada.findByPk(data.EntradaId, {
      include: [{
        model: SubtipoEntrada,
        as: 'subtipos',
        where: { estatus: ['activo', 'agotado'] },
        required: false
      }]
    });

    if (!entrada) {
      throw new Error("La entrada especificada no existe");
    }

    // VALIDAR QUE NO SE EXCEDA LA CANTIDAD TOTAL
    const totalSubtiposActuales = entrada.subtipos?.reduce((total, subtipo) => 
      total + subtipo.cantidad_disponible, 0
    ) || 0;
    
    const nuevaCantidadTotal = totalSubtiposActuales + parseInt(data.cantidad_disponible);
    
    if (nuevaCantidadTotal > entrada.cantidad_total) {
      throw new Error(
        `No se puede agregar el subtipo. Cantidad disponible en entrada: ${entrada.cantidad_total - totalSubtiposActuales}, solicitada: ${data.cantidad_disponible}`
      );
    }

    const subtipo = await SubtipoEntrada.create(data);

    // Actualizar cantidad_real de la entrada
    entrada.cantidad_real = nuevaCantidadTotal;
    await entrada.save();

    return {
      success: true,
      message: "Subtipo creado exitosamente",
      subtipoId: subtipo.id,
      cantidad_real_restante: entrada.cantidad_real
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al crear subtipo: ${error.message}`,
    };
  }
};

const actualizarSubtipoController = async (data) => {
  try {
    if (!data.id) {
      throw new Error("El campo id es requerido");
    }

    // Obtener el subtipo con su entrada y todos los otros subtipos
    const subtipo = await SubtipoEntrada.findByPk(data.id);
    
    if (!subtipo) {
      return {
        success: false,
        message: `No se encontró subtipo con id: ${data.id}`,
      };
    }

    // Obtener la entrada con todos sus subtipos (excluyendo el actual)
    const entrada = await Entrada.findByPk(subtipo.EntradaId, {
      include: [{
        model: SubtipoEntrada,
        as: 'subtipos',
        where: { 
          estatus: ['activo', 'agotado'],
          id: { [require('sequelize').Op.ne]: data.id } // Excluir el subtipo actual
        },
        required: false
      }]
    });

    // VALIDAR CANTIDAD_DISPONIBLE SI SE ESTÁ ACTUALIZANDO
    if (data.cantidad_disponible !== undefined) {
      const totalOtrosSubtipos = entrada.subtipos?.reduce((total, s) => 
        total + s.cantidad_disponible, 0
      ) || 0;
      
      const nuevaCantidadTotal = totalOtrosSubtipos + parseInt(data.cantidad_disponible);
      
      if (nuevaCantidadTotal > entrada.cantidad_total) {
        throw new Error(
          `No se puede actualizar. La suma de subtipos (${nuevaCantidadTotal}) excedería la cantidad total de la entrada (${entrada.cantidad_total}). Cantidad máxima permitida para este subtipo: ${entrada.cantidad_total - totalOtrosSubtipos}`
        );
      }

      // Validar que la nueva cantidad no sea menor que lo ya vendido/reservado
      const totalComprometido = subtipo.cantidad_vendida + subtipo.cantidad_reservada;
      if (parseInt(data.cantidad_disponible) < totalComprometido) {
        throw new Error(
          `No se puede reducir la cantidad disponible a ${data.cantidad_disponible}. Ya hay ${totalComprometido} entradas comprometidas (${subtipo.cantidad_vendida} vendidas + ${subtipo.cantidad_reservada} reservadas)`
        );
      }
    }

    const camposActualizables = [
      "nombre", "descripcion", "precio", "cantidad_disponible", 
      "edad_minima", "edad_maxima", "requiere_documentacion", "estatus"
    ];

    const cantidadAnterior = subtipo.cantidad_disponible;

    camposActualizables.forEach((campo) => {
      if (data[campo] !== undefined) {
        subtipo[campo] = data[campo];
      }
    });

    await subtipo.save();

    // Si cambió la cantidad, actualizar cantidad_real de la entrada
    if (data.cantidad_disponible !== undefined) {
      const diferencia = parseInt(data.cantidad_disponible) - cantidadAnterior;
      entrada.cantidad_real -= diferencia;
      await entrada.save();
    }

    return {
      success: true,
      message: "Subtipo actualizado correctamente",
      subtipo: subtipo,
      cantidad_real_restante: entrada.cantidad_real
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al actualizar subtipo: ${error.message}`,
    };
  }
};

module.exports = {
  agregarEntradasController,
  obtenerEntradasController,
  deleteEntradaController,
  actualizarEntradaController,
  agregarSubtipoController,
  actualizarSubtipoController,
};