document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submit');
    const memoInput = document.getElementById('memoInput');
    const memoList = document.getElementById('memoList');

    // Function to create a memo entry
    function createMemoEntry(text, timestamp) {
        const memoEntry = document.createElement('div');
        memoEntry.className = 'memoEntry';
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'memoTimestamp';
        timestampSpan.textContent = timestamp;
        memoEntry.textContent = text;
        memoEntry.appendChild(timestampSpan);
        memoList.appendChild(memoEntry);
    }
    // Function to create a memo entry
function createMemoEntry(text, timestamp) {
    const memoEntry = document.createElement('div');
    memoEntry.className = 'memoEntry';
    const memoText = document.createElement('p');
    memoText.className = 'memoText'; // Add this line
    memoText.textContent = text;

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'memoTimestamp';
    timestampSpan.textContent = timestamp;

    memoEntry.appendChild(timestampSpan);
    memoEntry.appendChild(memoText); // Append the text below the timestamp
    memoList.appendChild(memoEntry);
}
    // Load existing memos from localStorage
    function loadMemos() {
        const memos = JSON.parse(localStorage.getItem('memos')) || [];
        memos.forEach(memo => {
            createMemoEntry(memo.text, memo.timestamp);
        });
    }

    loadMemos(); // Load memos when the page is loaded

    submitButton.addEventListener('click', function () {
        const memoText = memoInput.value.trim();
        const timestamp = new Date().toLocaleString(); // Get the current timestamp
        if (memoText) {
            createMemoEntry(memoText, timestamp);

            // Save the new memo to localStorage
            const memos = JSON.parse(localStorage.getItem('memos')) || [];
            memos.push({ text: memoText, timestamp: timestamp });
            localStorage.setItem('memos', JSON.stringify(memos));

            memoInput.value = ''; // Clear the input
        }
    });
});
