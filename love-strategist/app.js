document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('upload-button');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const analyzeButton = document.getElementById('analyze-button');
    const analysisResult = document.getElementById('analysis-result');
    const resultContent = document.getElementById('result-content');

    let uploadedFiles = [];

    uploadButton.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileData = {
                        id: Date.now() + Math.random(),
                        file: file,
                        dataUrl: e.target.result
                    };
                    uploadedFiles.push(fileData);
                    renderPreviews();
                    updateAnalyzeButtonState();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    function renderPreviews() {
        imagePreview.innerHTML = '';
        uploadedFiles.forEach(fileData => {
            const container = document.createElement('div');
            container.classList.add('preview-image-container');
            
            const img = document.createElement('img');
            img.src = fileData.dataUrl;
            img.classList.add('preview-image');
            
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-image');
            removeBtn.textContent = '×';
            removeBtn.onclick = () => {
                uploadedFiles = uploadedFiles.filter(f => f.id !== fileData.id);
                renderPreviews();
                updateAnalyzeButtonState();
            };
            
            container.appendChild(img);
            container.appendChild(removeBtn);
            imagePreview.appendChild(container);
        });
    }

    function updateAnalyzeButtonState() {
        analyzeButton.disabled = uploadedFiles.length < 5;
    }

    analyzeButton.addEventListener('click', async () => {
        // Show loading state
        analysisResult.classList.remove('hidden');
        resultContent.innerHTML = '<p>AI正在分析中，请稍候...</p>';
        analyzeButton.disabled = true;
        
        const formData = new FormData();
        uploadedFiles.forEach(fileData => {
            formData.append('images', fileData.file);
        });

        try {
            // This will be the endpoint of our Python server
            const response = await fetch('http://127.0.0.1:5000/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Display result
            resultContent.innerHTML = data.analysis.replace(/\n/g, '<br>');

        } catch (error) {
            console.error('Error during analysis:', error);
            resultContent.innerHTML = '<p style="color: red;">分析失败，请稍后再试。</p>';
        } finally {
            updateAnalyzeButtonState();
        }
    });
});
