// Crea un nuevo router para manejar rutas específicas dentro de una aplicación Express
const router = require("express").Router();

// Importa el módulo de controlador de usuario donde están definidos los métodos para manejar solicitudes relacionadas con usuarios
const user = require("../controller/user");



// Define una ruta POST para crear un nuevo usuario. Utiliza el método 'store' del controlador de usuario.
router.post("/user", user.store);

// Define una ruta GET para obtener los detalles de un usuario específico por ID. Utiliza el método 'show' del controlador de usuario.
router.get("/user/:usuarios_id", user.show);

// Define una ruta PUT para actualizar un usuario existente por ID. Utiliza el método 'update' del controlador de usuario.
router.put("/user/:usuarios_id", user.update);

// Define una ruta DELETE para eliminar un usuario por ID. Utiliza el método 'destroy' del controlador de usuario.
router.delete("/user/:usuarios_id", user.destroy);


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



// Exporta el router para ser utilizado en otras partes de la aplicación, típicamente en el archivo principal del servidor.
module.exports = router;