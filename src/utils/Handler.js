const genericHandler = (controller) => {
    return async (req, res) => {
      try {
        let data;
  
        switch (req.method) {
          case 'GET':
            // Para GET se puede usar params o query
            data = req.params.id || req.query.id || (Object.keys(req.query).length > 0 ? req.query : req.params);
            break;
          case 'POST':
            data = req.body;
            break;
          case 'PUT':
            // PUT normalmente lleva params + body (por ejemplo id en params y datos en body)
            data = { ...req.params, ...req.body };
            break;
          case 'DELETE':
            // DELETE normalmente usa params o body, según la implementación
            // Aquí consideramos params o body, o query si hace falta
            data = req.params.id || req.body || req.query.id || req.query;
            break;
          default:
            data = req.body;
            break;
        }
  
        const result = await controller(data);
  
        if (result.success) {
          return res.status(200).json(result);
        } else {
          return res.status(400).json(result);
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Error interno del servidor',
        });
      }
    };
  };
  
  module.exports = {
    genericHandler,
  };
  