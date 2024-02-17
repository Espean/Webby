document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('blogPostForm');
    const postsContainer = document.getElementById('postsContainer');

    // Load existing posts on page load
    loadPosts();

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const postData = new FormData(form);
        postData.append('action', 'create'); // Specify the action for the Azure Function to handle

        // Placeholder URL for Azure Function endpoint
        const functionUrl = 'https://webbyapi.azurewebsites.net/api/blogg';

        fetch(functionUrl, {
            method: 'POST',
            body: postData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadPosts(); // Reload posts after successful submission
                form.reset(); // Reset form fields
            } else {
                alert('Failed to create post.');
            }
        })
        .catch(error => console.error('Error creating post:', error));
    });

    function loadPosts() {
        // Placeholder URL for Azure Function endpoint
        const functionUrl = 'https://webbyapi.azurewebsites.net/api/blogg?action=fetch';

        fetch(functionUrl)
        .then(response => response.json())
        .then(posts => {
            postsContainer.innerHTML = ''; // Clear existing posts
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => console.error('Error loading posts:', error));
    }

    function createPostElement(post) {
        const element = document.createElement('div');
        element.className = 'blogPost';
        element.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <!-- Display post images or files if any -->
        `;
        // Add more functionality here for editing and deleting posts
        return element;
    }

    // Add more functions here for editing and deleting posts
});
