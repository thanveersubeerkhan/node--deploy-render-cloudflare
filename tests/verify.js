import fetch from 'node-fetch';
import FormData from 'form-data';

const NODE_URL = 'http://localhost:4000';
const WORKER_URL = 'http://localhost:8787';

async function testServer(baseUrl, label) {
    console.log(`\n--- Testing ${label} at ${baseUrl} ---`);
    try {
        // 1. Root
        const root = await fetch(`${baseUrl}/`).then(res => res.text());
        console.log(`[PASS] Root: ${root}`);

        // 2. POST /items
        const postRes = await fetch(`${baseUrl}/items`, {
            method: 'POST',
            body: JSON.stringify({ name: `Test Item ${label}`, value: 'Some data' }),
            headers: { 'Content-Type': 'application/json' }
        });
        const item = await postRes.json();
        const itemId = item.id;
        console.log(`[PASS] POST /items: Created ID ${itemId}`);

        // 3. GET /items
        const items = await fetch(`${baseUrl}/items`).then(res => res.json());
        console.log(`[PASS] GET /items: Found ${items.length} items`);

        // 4. GET /items/:id
        const itemDetail = await fetch(`${baseUrl}/items/${itemId}`).then(res => res.json());
        console.log(`[PASS] GET /items/:id: Found ${itemDetail.name}`);

        // 5. PUT /items/:id
        const putRes = await fetch(`${baseUrl}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ name: `Updated ${label}` }),
            headers: { 'Content-Type': 'application/json' }
        });
        const updatedItem = await putRes.json();
        console.log(`[PASS] PUT /items/:id: Updated to ${updatedItem.name}`);

        // 6. POST /files/upload
        const form = new FormData();
        form.append('file', Buffer.from('test file content'), { filename: 'test.txt', contentType: 'text/plain' });
        const uploadRes = await fetch(`${baseUrl}/files/upload`, {
            method: 'POST',
            body: form
        });
        const uploadData = await uploadRes.json();
        const fileId = uploadData.fileId;
        console.log(`[PASS] POST /files/upload: File ID ${fileId}`);

        // 7. GET /files/:id
        const fileRes = await fetch(`${baseUrl}/files/${fileId}`);
        const fileContent = await fileRes.text();
        console.log(`[PASS] GET /files/:id: Downloaded ${fileContent.length} bytes`);

        // 8. DELETE /items/:id
        const delRes = await fetch(`${baseUrl}/items/${itemId}`, { method: 'DELETE' });
        const delData = await delRes.json();
        console.log(`[PASS] DELETE /items/:id: Result ${JSON.stringify(delData)}`);

    } catch (err) {
        console.error(`[FAIL] ${label}: ${err.message}`);
    }
}

async function runTests() {
    await testServer(NODE_URL, 'Node.js');
    await testServer(WORKER_URL, 'Cloudflare Worker');
}

runTests();
