document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("file-input");
    const dropArea = document.getElementById("drop-area");
    const browseLink = document.getElementById("browse-link");
    const imagePreview = document.getElementById("image-preview");
    const form = document.getElementById("upload-form"); // Initialize form element
    const resultDiv = document.getElementById("prediction-result"); // Initialize result element

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when dragging file over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    // Unhighlight drop area when dragging file leaves
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    // Handle click on browse link
    browseLink.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', function(event) {
        const files = event.target.files;
        handleFiles(files);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        fileInput.files = files; // Update file input with dropped files
        handleFiles(files);
    }

    function handleFiles(files) {
        const file = files[0];
        if (!file) {
            console.error("No file selected or dropped.");
            return;
        }
    
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.classList.add('uploaded-image');
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);

            // Clear out the prediction result
            clearPredictionResult();
        };
    
        reader.readAsDataURL(file);
    }

    // Function to clear out the prediction result
    function clearPredictionResult() {
        resultDiv.innerHTML = '';
        resultDiv.style.backgroundColor = "#0000";
    }

    // Handle form submission
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        fetch("/predict", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const prediction = data.prediction;
            resultDiv.innerHTML = `<p>Prediction: ${prediction}</p>`;
            resultDiv.style.backgroundColor = "#f0f0f0"; // Change background color to grey
        })
        .catch(error => {
            console.error("Error:", error);
            resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        });
    });
});
