const API_URL = 'http://localhost:3000';

async function run() {
  console.log('⏳ 1. Criando uma nova carteira com 100.00...');
  const resWallet = await fetch(`${API_URL}/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: crypto.randomUUID(), amount: '100.00', currency: 'BRL' })
  });
  const wallet = await resWallet.json();
  console.log(`✅ Carteira criada: ${wallet.id}\n`);

  console.log('🔥 2. TESTE DE CONCORRÊNCIA: Duas apostas de 80.00 AO MESMO TEMPO...');
  const aposta1 = fetch(`${API_URL}/wagering/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId: 'P1', externalId: 'TX-CONC-1', walletId: wallet.id, kind: 'BET', amount: '80.00', currency: 'BRL' })
  });

  const aposta2 = fetch(`${API_URL}/wagering/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId: 'P2', externalId: 'TX-CONC-2', walletId: wallet.id, kind: 'BET', amount: '80.00', currency: 'BRL' })
  });

  const [result1, result2] = await Promise.all([aposta1, aposta2]);
  const data1 = await result1.json();
  const data2 = await result2.json();
  
  console.log('📌 RESPOSTA 1:', JSON.stringify(data1, null, 2));
  console.log('📌 RESPOSTA 2:', JSON.stringify(data2, null, 2));
  console.log('--------------------------------------------------\n');

  console.log('🔥 3. TESTE DE IDEMPOTÊNCIA: Mesma aposta DUAS VEZES AO MESMO TEMPO...');
  const payloadIdem = { providerId: 'P3', externalId: 'TX-IDEM-1', walletId: wallet.id, kind: 'BET', amount: '10.00', currency: 'BRL' };
  
  const idem1 = fetch(`${API_URL}/wagering/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadIdem) });
  const idem2 = fetch(`${API_URL}/wagering/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadIdem) });

  const [resIdem1, resIdem2] = await Promise.all([idem1, idem2]);
  const dataIdem1 = await resIdem1.json();
  const dataIdem2 = await resIdem2.json();

  console.log('📌 RESPOSTA IDEMPOTÊNCIA 1:', JSON.stringify(dataIdem1, null, 2));
  console.log('📌 RESPOSTA IDEMPOTÊNCIA 2:', JSON.stringify(dataIdem2, null, 2));
}

run();