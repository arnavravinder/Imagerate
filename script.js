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

const auth = firebase.auth();
const storage = firebase.storage();
const database = firebase.database();

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const file = document.getElementById('photoInput').files[0];
    if (!file) return;
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.textContent = 'Uploading...';

    const storageRef = storage.ref('uploads/' + file.name);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        function(snapshot) {
        }, 
        function(error) {
            console.error('Upload failed:', error);
            uploadStatus.textContent = 'Upload failed!';
            uploadStatus.style.color = 'red';
        }, 
        function() {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                const newImageRef = database.ref('images').push();
                newImageRef.set({
                    url: downloadURL,
                    likes: 0,
                    dislikes: 0
                });
                uploadStatus.textContent = 'Upload successful!';
                uploadStatus.style.color = 'green';
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
        const likeButton = document.createElement('button');
        likeButton.textContent = 'Like (' + data.likes + ')';
        const dislikeButton = document.createElement('button');
        dislikeButton.textContent = 'Dislike (' + data.dislikes + ')';
        const likesCount = document.createElement('span');
        const dislikesCount = document.createElement('span');
        div.appendChild(img);
        div.appendChild(likeButton);
        div.appendChild(likesCount);
        div.appendChild(dislikeButton);
        div.appendChild(dislikesCount);
        resultsContainer.appendChild(div);

        likeButton.addEventListener('click', function() {
            childSnapshot.ref.update({ likes: data.likes + 1 });
            likesCount.textContent = `Likes: ${data.likes + 1}`;
        });

        dislikeButton.addEventListener('click', function() {
            childSnapshot.ref.update({ dislikes: data.dislikes + 1 });
            dislikesCount.textContent = `Dislikes: ${data.dislikes + 1}`;
        });
    });
});

document.getElementById('photoInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgPreview = document.createElement('img');
        imgPreview.src = e.target.result;
        imgPreview.style.width = '100px';
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.innerHTML = '';
            previewContainer.appendChild(imgPreview);
        } else {
            const newPreviewContainer = document.createElement('div');
            newPreviewContainer.id = 'previewContainer';
            newPreviewContainer.appendChild(imgPreview);
            document.getElementById('uploadForm').appendChild(newPreviewContainer);
        }
    }
    reader.readAsDataURL(file);
});

const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const profileSection = document.getElementById('profile');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');

loginButton.addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(result => {
        const user = result.user;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline';
        profileSection.style.display = 'block';
        profileName.textContent = `Name: ${user.displayName}`;
        profileEmail.textContent = `Email: ${user.email}`;
    }).catch(error => {
        console.error('Error during login:', error);
    });
});

logoutButton.addEventListener('click', function() {
    auth.signOut().then(() => {
        loginButton.style.display = 'inline';
        logoutButton.style.display = 'none';
        profileSection.style.display = 'none';
    }).catch(error => {
        console.error('Error during logout:', error);
    });
});

auth.onAuthStateChanged(user => {
    if (user) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline';
        profileSection.style.display = 'block';
        profileName.textContent = `Name: ${user.displayName}`;
        profileEmail.textContent = `Email: ${user.email}`;
    } else {
        loginButton.style.display = 'inline';
        logoutButton.style.display = 'none';
        profileSection.style.display = 'none';
    }
});
