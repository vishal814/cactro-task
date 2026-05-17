// using native fetch

async function test() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('Registering Organizer...');
  const orgRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Org 1', email: 'org1@test.com', password: 'password123', role: 'ORGANIZER' })
  });
  console.log('Organizer Register:', await orgRes.json());

  console.log('Logging in Organizer...');
  const orgLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'org1@test.com', password: 'password123' })
  });
  const { token: orgToken } = await orgLoginRes.json();

  console.log('Registering Customer...');
  const custRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Cust 1', email: 'cust1@test.com', password: 'password123', role: 'CUSTOMER' })
  });
  console.log('Customer Register:', await custRes.json());

  console.log('Logging in Customer...');
  const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cust1@test.com', password: 'password123' })
  });
  const { token: custToken } = await custLoginRes.json();

  console.log('Creating Event...');
  const eventRes = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
    body: JSON.stringify({ title: 'Tech Conference', description: 'Awesome conf', date: new Date().toISOString(), totalTickets: 100 })
  });
  const event = await eventRes.json();
  console.log('Event Created:', event);

  console.log('Booking Ticket...');
  const bookRes = await fetch(`${baseUrl}/events/${event.id}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
    body: JSON.stringify({ ticketsCount: 2 })
  });
  console.log('Ticket Booked:', await bookRes.json());

  // Wait a bit so booking confirmation log triggers
  await new Promise(r => setTimeout(r, 2500));

  console.log('Updating Event...');
  const updateRes = await fetch(`${baseUrl}/events/${event.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
    body: JSON.stringify({ title: 'Tech Conference Updated!' })
  });
  console.log('Event Updated:', await updateRes.json());
  
  // Wait a bit so event update notification log triggers
  await new Promise(r => setTimeout(r, 2500));

  console.log('All tests finished.');
  process.exit(0);
}

test();
