// Importa el servicio 'service' desde la carpeta 'service'
const serviceService = require("../service/service");
// Importa una utilidad para responder en formato JSON
const jsonResponse = require("../http/response/jsonResponse");
// Importa el Data Transfer Object (DTO) que define la estructura de un 'servicio'
const ServiceDTO = require("../http/request/service/responseDTO");
// Importa Joi para validación de datos
const Joi = require("joi");

class ServiceController {

    // Método estático asíncrono para crear un nuevo servicio
    static async store(req, res) {
        try {
            // Desestructura los campos necesarios para el nuevo servicio desde req.body
            const {
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion,
                telefonoSolicitante,
                tecnicoAsignado,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            } = req.body;

            // Asegura que los campos numéricos sean tratados correctamente
            const gestionInt = parseInt(gestion, 10);
            const tecnicoAsignadoInt = parseInt(tecnicoAsignado, 10);

            // Crea un nuevo servicio utilizando el servicio 'serviceService'
            const { servicios_id } = await serviceService.store({
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion: gestionInt,
                telefonoSolicitante,
                tecnicoAsignado: tecnicoAsignadoInt,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            });

            // Crea un nuevo DTO del servicio con los datos creados
            const newService = new ServiceDTO(
                servicios_id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestionInt,
                telefonoSolicitante,
                tecnicoAsignadoInt,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el servicio ha sido registrado
            return jsonResponse.successResponse(
                res,
                201,
                "Service has been registered successfully",
                newService
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para obtener información de un servicio
    static async show(req, res) {
        try {
            // Obtiene el ID del servicio a través de req.params
            const {
                servicios_id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion,
                telefonoSolicitante,
                tecnicoAsignado,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            } = await serviceService.show(req.params.servicios_id);

            // Crea un DTO con los datos obtenidos del servicio, asegurando que los campos numéricos sean tratados correctamente
            const service = new ServiceDTO(
                servicios_id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                parseInt(gestion, 10),
                telefonoSolicitante,
                parseInt(tecnicoAsignado, 10),
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el servicio existe
            return jsonResponse.successResponse(
                res,
                200,
                "Service exists",
                service
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }

    // Método estático asíncrono para actualizar la información de un servicio
    static async update(req, res) {
        try {
            // Asegura que los campos numéricos sean tratados correctamente
            const {
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion,
                telefonoSolicitante,
                tecnicoAsignado,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            } = req.body;
            const gestionInt = parseInt(gestion, 10);
            const tecnicoAsignadoInt = parseInt(tecnicoAsignado, 10);
            const id = req.params.servicios_id;

            console.log("id ", id);

            // Actualiza el servicio en la base de datos
            await serviceService.update({
                servicios_id: id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestion: gestionInt,
                telefonoSolicitante,
                tecnicoAsignado: tecnicoAsignadoInt,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            }, id);

            // Crea un nuevo DTO con los datos actualizados del servicio
            const updatedService = new ServiceDTO(
                id,
                nombreResponsableEgreso,
                cargoSolicitante,
                informe,
                cargoResponsableEgreso,
                oficinaSolicitante,
                fechaRegistro,
                equipo,
                problema,
                telefonoResponsableEgreso,
                gestionInt,
                telefonoSolicitante,
                tecnicoAsignadoInt,
                observaciones,
                tipoResponsableEgreso,
                estado,
                tipoSolicitante,
                fechaTerminado,
                oficinaResponsableEgreso,
                numero,
                fechaInicio,
                fechaEgreso,
                ciSolicitante,
                nombreSolicitante,
                tipo,
                tecnicoRegistro,
                tecnicoEgreso,
                ciResponsableEgreso
            );

            // Retorna una respuesta exitosa en formato JSON indicando que el servicio ha sido actualizado
            return jsonResponse.successResponse(
                res,
                200,
                "Service has been updated",
                updatedService
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }
    // Método estático asíncrono para eliminar un equipo
    static async destroy(req, res) {
        try {
            const id = req.params.servicios_id;
            console.log("id ", id);

            // Elimina al equipo mediante el servicio 'serviceService'
            await serviceService.destroy(id);

            // Retorna una respuesta exitosa en formato JSON indicando que el equipo ha sido eliminado
            return jsonResponse.successResponse(
                res,
                200,
                "Service has been deleted"
            );
        } catch (error) {
            // Si hay un error de validación de Joi, retorna una respuesta de validación
            return Joi.isError(error) ? jsonResponse.validationResponse(
                res,
                409,
                "Validation error",
                error.details.map(err => err.message)
            ) : jsonResponse.errorResponse(
                res,
                500,
                error.message
            );
        }
    }
}


// Exporta la clase EquipmentController para que pueda ser utilizada en otros archivos
module.exports = ServiceController;