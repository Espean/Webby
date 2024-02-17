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
                const memos = await response.json(); // Assuming the response is in JSON format
                memoList.innerHTML = ''; // Clear existing memos before loading new ones
                memos.forEach(memo => {
                    createMemoEntry(memo);
                });
            } else if (response.status === 204) {
                memoList.innerHTML = '<p>No memos found. Add some memos!</p>'; // Display message if no memos
            } else {
                throw new Error(`Failed to fetch memos, status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading memos:', error);
            memoList.innerHTML = '<p>Error loading memos. Please try again later.</p>'; // Display error message
        }
    }

    async function createOrUpdateMemo(memo, isUpdate = false) {
        try {
            const fetchOptions = {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memo)
            };
            const url = isUpdate ? `${apiUrl}/${memo.id}` : apiUrl;
            const response = await fetch(url, fetchOptions);
            if (!response.ok) throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} memo`);
            loadMemos(); // Reload memos to reflect changes
        } catch (error) {
            console.error('Error saving memo:', error);
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
        memoText.textContent = memo.text; // Display memo text
        memoEntry.appendChild(memoText);

        const memoTimestamp = document.createElement('div');
        memoTimestamp.className = 'memoTimestamp';
        const date = new Date(memo.timestamp);
        memoTimestamp.textContent = date.toLocaleString();
        memoEntry.appendChild(memoTimestamp);

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
            const newText = prompt('Edit memo:', memo.text);
            if (newText) {
                memo.text = newText; // Update the text of the memo
                createOrUpdateMemo({...memo, text: newText}, true); // Update the memo
            }
        };
        memoEntry.appendChild(editButton);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteMemo(memo.id);
        memoEntry.appendChild(deleteButton);

        memoList.appendChild(memoEntry);
    }
});
