document.addEventListener('DOMContentLoaded', function () {
    const memoInput = document.getElementById('memoInput');
    const memoList = document.getElementById('memoList');
    const apiUrl = 'https://webbyapi.azurewebsites.net/api/memo';

    // Load memos on page load
    loadMemos();

    // Event listener for the submit button
    document.getElementById('submit').addEventListener('click', function () {
        const memoText = memoInput.value.trim();
        if (memoText) {
            createOrUpdateMemo({ text: memoText });
            memoInput.value = ''; // Clear the input after submission
        }
    });

    async function loadMemos() {
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const memos = await response.json(); // Assuming the API returns JSON data
                memoList.innerHTML = ''; // Clear existing memos before loading new ones
                memos.forEach(blob => {
                    const memo = JSON.parse(blob); // Assuming each blob's content is a JSON string of memo data
                    memo.id = blob.name
                    createMemoEntry(memo);
                });
            } else {
                console.log('Failed to load memos:', response.status);
                memoList.innerHTML = '<p>Error loading memos.</p>';
            }
        } catch (error) {
            console.error('Error loading memos:', error);
            memoList.innerHTML = '<p>Error loading memos.</p>';
        }
    }


async function createOrUpdateMemo(memo, oldId = null) {
    try {
        const fetchOptions = {
            method: 'POST', // Always use POST to create a new memo
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memo)
        };
        const response = await fetch(apiUrl, fetchOptions);
        if (!response.ok) throw new Error('Failed to create memo');

        if (oldId) {
            // If there's an old memo ID, delete the old memo after successfully creating a new one
            await deleteMemo(oldId);
        }

        loadMemos(); // Reload memos to reflect changes
    } catch (error) {
        console.error('Error saving memo:', error);
    }
}
editButton.onclick = () => {
    const newText = prompt('Edit memo:', memo.text);
    if (newText) {
        const newMemo = { text: newText, timestamp: new Date().toISOString() }; // Create a new memo object
        createOrUpdateMemo(newMemo, memo.id); // Pass the new memo object and the old memo's ID
    }
}

async function deleteMemo(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete memo');
        loadMemos(); // Reload memos to reflect changes
    } catch (error) {
        console.error('Error deleting memo:', error);
    }
}
    function createMemoEntry(memo) {
        const memoEntry = document.createElement('div');
        memoEntry.className = 'memoEntry';

        const memoText = document.createElement('p');
        memoText.className = 'memoText';
        memoText.textContent = memo.text;
        memoEntry.appendChild(memoText);

        const memoTimestamp = document.createElement('div');
        memoTimestamp.className = 'memoTimestamp';
        const date = new Date(memo.timestamp);
        memoTimestamp.textContent = date.toLocaleString();
        memoEntry.appendChild(memoTimestamp);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
            const newText = prompt('Edit memo:', memo.text);
            if (newText) {
                memo.text = newText; // Update the text of the memo
                createOrUpdateMemo(memo, true); // Pass the entire memo object, including the ID
            }
        };
        memoEntry.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteMemo(memo.id);
        memoEntry.appendChild(deleteButton);

        memoList.appendChild(memoEntry);
    }
});
