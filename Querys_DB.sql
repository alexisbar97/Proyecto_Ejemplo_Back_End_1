-- Creación de la Tabla Empleados

CREATE TABLE empleados (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100),
    puesto VARCHAR2(100),
    salario NUMBER
);

-- Query del Procedimiento

create or replace NONEDITIONABLE PROCEDURE insertar_empleado (
    p_id OUT NUMBER,
    p_nombre IN VARCHAR2,
    p_puesto IN VARCHAR2,
    p_salario IN NUMBER
) AS
BEGIN
    SELECT NVL(MAX(id), 0) + 1 INTO p_id FROM empleados;
    INSERT INTO empleados (id, nombre, puesto, salario)
    VALUES (p_id, p_nombre, p_puesto, p_salario);
    COMMIT;
END;