// Crea un nuevo router para manejar rutas específicas dentro de una aplicación Express
const router = require("express").Router();

// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const user = require("../controller/user");
const LecturasController = require("../controller/LecturasController");



// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/user", user.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/user/:usuarios_id", user.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/user/:usuarios_id", user.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/user/:usuarios_id", user.destroy);

router.get('/user', user.paginate);

//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const type = require("../controller/type");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/type", type.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/type/:tipos_id", type.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/type/:tipos_id", type.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/type/:tipos_id", type.destroy);
router.get('/type', type.paginate);


//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const equipment = require("../controller/equipment");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/equipment", equipment.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/equipment/:equipos_id", equipment.show);


router.get('/equipment', equipment.paginate);
// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/equipment/:equipos_id", equipment.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/equipment/:equipos_id", equipment.destroy);


//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const service = require("../controller/service");

// Rutas de servicio
// Primero las rutas específicas
router.get("/service/board", service.getServicesByTypeAndTechnician);
router.get("/service/date-range", service.getServicesByDateRange);

// Luego las rutas con parámetros
router.get("/service/:servicios_id", service.show);
router.put("/service/:servicios_id", service.update);
router.delete("/service/:servicios_id", service.destroy);

// Y finalmente las rutas genéricas
router.post("/service", service.store);
router.get('/service', service.paginate);



//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const task = require("../controller/task");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/task", task.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/task/:tareas_id", task.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/task/:tareas_id", task.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/task/:tareas_id", task.destroy);



//-----------------------------------------------------------------------------------------------------------
// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const management = require("../controller/management");

// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/management", management.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/management/:gestions_id", management.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/management/:gestions_id", management.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/management/:gestions_id", management.destroy);


//-------------------------------------------------------------------------------------------------------------------------
// Define las rutas
router.post("/lecturas", LecturasController.store);
router.get("/lecturas/:id", LecturasController.show);
router.get("/lecturas", LecturasController.paginate);
router.put("/lecturas/:id", LecturasController.update);
router.delete("/lecturas/:id", LecturasController.destroy);


// Exporta el router para ser utilizado en otras partes de la aplicación, típicamente en el archivo principal del servidor.
module.exports = router;