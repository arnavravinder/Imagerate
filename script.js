const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const database = firebase.database();

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const file = document.getElementById('photoInput').files[0];
    const storageRef = storage.ref('uploads/' + file.name);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        function(snapshot) {
        }, 
        function(error) {
            console.error('Upload failed:', error);
        }, 
        function() {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                const newImageRef = database.ref('images').push();
                newImageRef.set({
                    url: downloadURL,
                    likes: 0,
                    dislikes: 0
                });
            });
        }
    );
});

database.ref('images').on('value', function(snapshot) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';
    snapshot.forEach(function(childSnapshot) {
        const data = childSnapshot.val();
        const div = document.createElement('div');
        const img = document.createElement('img');
        img.src = data.url;
        img.style.width = '100px';
        const likeButton = document.createElement('button');
        likeButton.textContent = 'Like';
        const dislikeButton = document.createElement('button');
        dislikeButton.textContent = 'Dislike';
        div.appendChild(img);
        div.appendChild(likeButton);
        div.appendChild(dislikeButton);
        resultsContainer.appendChild(div);

        likeButton.addEventListener('click', function() {
            childSnapshot.ref.update({ likes: data.likes + 1 });
        });

        dislikeButton.addEventListener('click', function() {
            childSnapshot.ref.update({ dislikes: data.dislikes + 1 });
        });
    });
});
