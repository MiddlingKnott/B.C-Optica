const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
    // Definimos las columnas de la tabla Clientes
    id_cliente: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    edad: {
        type: DataTypes.VIRTUAL, // Campo Virtual (No se guarda en la BD, se calcula)
        get() {
            const fechaNac = this.getDataValue('fecha_nacimiento');
            if (!fechaNac) return null; // Si no hay fecha, no hay edad

            const hoy = new Date();
            const nacimiento = new Date(fechaNac); // Aseguramos que sea objeto Date

            // Cálculo matemático de la edad exacta
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();

            // Si aún no ha pasado su cumpleaños este año, restamos 1
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
            }

            return edad;
        }
    }

}, {
    // Opciones del modelo
    tableName: 'Clientes', // Nombre exacto de la tabla en MySQL
    timestamps: false     // No agregar createdAt/updatedAt
});

module.exports = Cliente;