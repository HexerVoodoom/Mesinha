import https from 'https';

const BASE_URL = 'https://oubdmmaqxnutbbxiqeow.supabase.co/functions/v1/make-server-19717bce';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YmRtbWFxeG51dGJieGlxZW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDE2OTMsImV4cCI6MjA4ODA3NzY5M30.jLMAGrD0jOaId3Tjy1IKDPc4rtDqm4hx-Bv6Mzo0dDw';

async function testFetch(url, options = {}) {
    const fetchOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
            ...options.headers
        }
    };

    const response = await fetch(`${BASE_URL}${url}`, fetchOptions);
    return response.json();
}

async function run() {
    console.log('Fetching items...');
    const data = await testFetch('/items');
    const muralItems = data.items.filter(i => i.category === 'mural');
    if (muralItems.length === 0) {
        console.log('No mural items found.');
        return;
    }

    const testItem = muralItems[0];
    console.log(`Found mural item: ${testItem.id} (likedBy: ${JSON.stringify(testItem.likedBy)})`);

    console.log('Adding test like and foo=bar...');
    const updated = await testFetch(`/items/${testItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ likedBy: ['TestUser'], foo: 'bar', timestamp_test: Date.now() })
    });
    console.log(`Updated item likedBy: ${JSON.stringify(updated.item.likedBy)}, foo: ${updated.item.foo}, timestamp: ${updated.item.timestamp_test}`);

    // Wait to avoid race conditions or caching
    await new Promise(r => setTimeout(r, 2000));

    console.log('Refetching items...');
    const data2 = await testFetch('/items');
    const refetchedItem = data2.items.find(i => i.id === testItem.id);
    console.log(`Refetched item likedBy: ${JSON.stringify(refetchedItem?.likedBy)}, foo: ${refetchedItem?.foo}, timestamp: ${refetchedItem?.timestamp_test}`);
}

run().catch(console.error);
