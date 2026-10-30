import pg from 'pg';

const pool = new pg.Pool({
  host: '127.0.0.1',
  port: 5433, // <--- MUDADO AQUI
  user: 'teste1',
  password: 'testado123',
  database: 'bancoTeste',
});

console.log('⏳ Tentando conectar no Postgres do Windows...');

pool.query('SELECT 1')
  .then(() => {
    console.log('✅ SUCESSO! O Windows consegue conectar no Docker.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ ERRO DE CONEXÃO:', err.message);
    process.exit(1);
  });