import pg from 'pg'

// Hace que las columnas NUMERIC (precio) vuelvan como número y no como texto
pg.types.setTypeParser(1700, (valor) => parseFloat(valor))

// clase Pool -> hacer consultas simples
const pool = new pg.Pool({
    host: process.env.BD_HOST || 'localhost',
    user: process.env.BD_USER,
    password: process.env.BD_PASS,
    database: process.env.BD_BD,
    port: process.env.BD_PORT
})

export default pool