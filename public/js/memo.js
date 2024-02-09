document.addEventListener('DOMContentLoaded', function () {
    const memoInput = document.getElementById('memoInput');
    const memoList = document.getElementById('memoList');

    // Load memos on page load
    loadMemos();

    // Submit button event listener
    document.getElementById('submit').addEventListener('click', function () {
        const memoText = memoInput.value.trim();
        if (memoText) {
            createOrUpdateMemo({ text: memoText });
            memoInput.value = ''; // Clear the input after submission
        }
    });

    async function loadMemos() {
        const response = await fetch('/api/memo');
        const memos = await response.json();
        memoList.innerHTML = ''; // Clear existing memos before loading
        memos.forEach(memo => createMemoEntry(memo));
    }

    async function createOrUpdateMemo(memo, isUpdate = false) {
        const method = isUpdate ? 'PUT' : 'POST';
        await fetch(`/api/memo${isUpdate ? '/' + memo.id : ''}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: memo.text })
        });
        loadMemos(); // Reload memos to reflect changes
    }

    async function deleteMemo(id) {
        await fetch(`/api/memo/${id}`, { method: 'DELETE' });
        loadMemos(); // Reload memos to reflect changes
    }

    function createMemoEntry(memo) {
        const memoEntry = document.createElement('div');
        memoEntry.className = 'memoEntry';

        const memoText = document.createElement('p');
        memoText.className = 'memoText';
        memoText.textContent = memo.text;
        memoEntry.appendChild(memoText);

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
            const newText = prompt('Edit memo:', memo.text);
            if (newText) {
                createOrUpdateMemo({ ...memo, text: newText }, true);
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
