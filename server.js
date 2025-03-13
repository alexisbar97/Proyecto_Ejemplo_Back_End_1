const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const bodyParser = require('body-parser');
const { environment } = require('./environment');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuración de la Conexión a Oracle
const dbConfig = {
    user: environment.USER,
    password: environment.PASSWORD,
    connectString: environment.CONNECT_STRING,
    autoCommit: true
};

// Ruta para la Raíz del Backend
app.get('/empleados', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Obtener todos los empleados
        const empleadosResult = await connection.execute('SELECT * FROM empleados ORDER BY id ASC');
        const empleados = empleadosResult.rows.map(row => ({
            id: row[0],
            nombre: row[1],
            puesto: row[2],
            salario: row[3]
        }));

        // Enviar una respuesta JSON con la lista de empleados
        res.status(200).json({ message: 'Lista de empleados obtenida', data: empleados });
    } catch (err) {
        console.error('Error al obtener empleados:', err);
        res.status(500).json({ message: 'Error al obtener empleados', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

// Ruta para Insertar un Empleado
app.post('/empleados', async (req, res) => {
    let connection;
    try {
        const { nombre, puesto, salario } = req.body;
        connection = await oracledb.getConnection(dbConfig);

        // Ejecutar el procedimiento almacenado
        const result = await connection.execute(
            `BEGIN insertar_empleado(:id, :nombre, :puesto, :salario); END;`,
            {
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                nombre,
                puesto,
                salario
            }
        );

        // Obtener la lista actualizada de empleados
        const empleadosResult = await connection.execute('SELECT * FROM empleados ORDER BY id ASC');
        const empleados = empleadosResult.rows.map(row => ({
            id: row[0],
            nombre: row[1],
            puesto: row[2],
            salario: row[3]
        }));

        // Enviar una respuesta JSON con la lista actualizada
        console.log('Respuesta enviada al frontend:', { message: 'Empleado insertado', data: empleados });
        res.status(201).json({ message: 'Empleado insertado', data: empleados });
    } catch (err) {
        console.error('Error al ejecutar el procedimiento almacenado:', err);
        res.status(500).json({ message: 'Error al insertar empleado', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

app.delete('/empleados/:id', async (req, res) => {
    let connection;
    try {
        const idToDelete = parseInt(req.params.id, 10);
        console.log('ID a eliminar:', idToDelete); // Depuración
        connection = await oracledb.getConnection(dbConfig);

        // Eliminar el empleado con el ID especificado
        const result = await connection.execute(
            `DELETE FROM empleados WHERE id = :id`,
            { id: idToDelete },
            { autoCommit: true } // Asegura que los cambios se guarden
        );

        console.log('Resultado de la eliminación:', result); // Depuración

        // Verificar si se eliminó algún registro
        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        // Obtener la lista actualizada de empleados
        const empleadosResult = await connection.execute('SELECT * FROM empleados ORDER BY id ASC');
        const empleados = empleadosResult.rows.map(row => ({
            id: row[0],
            nombre: row[1],
            puesto: row[2],
            salario: row[3]
        }));

        // Enviar una respuesta JSON con la lista actualizada
        res.status(200).json({ message: 'Empleado eliminado', data: empleados });
    } catch (err) {
        console.error('Error al eliminar empleado:', err);
        res.status(500).json({ message: 'Error al eliminar empleado', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

// Iniciar el Servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});