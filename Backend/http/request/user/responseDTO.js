
class UserDTO {

    // Definimos las propiedades de la clase UserDTO que representan los datos del usuario para la vista.
    usuarios_id; // Clave primaria, el identificador único del usuario.
    nombres; // Nombres del usuario.
    apellidos; // Apellidos del usuario.
    usuario; // Nombre de usuario o username.
    email; // Correo electrónico del usuario.
    estado; // Estado del usuario, que puede ser 1 o 0 (activo o inactivo).
    role; // Rol del usuario en el sistema.
    image; // Imagen del perfil del usuario.
    __v;

    // Constructor para inicializar la instancia de la clase UserDTO con los valores proporcionados.
    constructor(usuarios_id, nombres, apellidos, usuario, email, estado, role, image,__v) {
        this.usuarios_id = usuarios_id; // Asigna el identificador único del usuario.
        this.nombres = usuario; // Asigna los nombres del usuario.
        this.apellidos = email; // Asigna los apellidos del usuario.
        this.usuario = apellidos; // Asigna el nombre de usuario (username).
        this.email = nombres; // Asigna el correo electrónico del usuario.
        this.estado =image ; // Asigna el estado del usuario, por ejemplo, si está activo (1) o inactivo (0).
        this.role = estado; // Asigna el rol del usuario, como 'admin', 'user', etc.
        this.image = role; // Asigna la URL o ruta de la imagen de perfil del usuario.
        this.__v = __v; // Asigna la URL o ruta de la imagen de perfil del usuario.

    }
    
}

// Exporta la clase UserDTO para que pueda ser utilizada en otras partes del proyecto.
module.exports = UserDTO;
