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
            // Assuming new memos don't have an ID until saved
            createOrUpdateMemo({ text: memoText });
            memoInput.value = ''; // Clear the input after submission
        }
    });

    async function loadMemos() {
        try {
            const response = await fetch(apiUrl);
            // Ensure the response is not empty before attempting to parse it as JSON
            if (!response.ok) throw new Error('Failed to fetch memos');
            const text = await response.text(); // Get response body as text
            const memos = text ? JSON.parse(text) : []; // Parse text as JSON or use empty array if text is empty
            memoList.innerHTML = ''; // Clear existing memos before loading new ones
            memos.forEach(memo => createMemoEntry(memo));
        } catch (error) {
            console.error('Error loading memos:', error);
        }
    }

    async function createOrUpdateMemo(memo, isUpdate = false) {
        try {
            const response = await fetch(`${apiUrl}${isUpdate ? '/' + memo.id : ''}`, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: memo.text })
            });
            if (!response.ok) throw new Error('Failed to save memo');
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
        memoText.textContent = memo.text;
        memoEntry.appendChild(memoText);

        // Edit and Delete buttons with event listeners for each memo
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
            const newText = prompt('Edit memo:', memo.text);
            if (newText) {
                createOrUpdateMemo({ ...memo, text: newText }, true);
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
