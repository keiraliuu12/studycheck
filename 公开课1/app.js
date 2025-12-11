document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('image-input');
    const fileNameSpan = document.getElementById('file-name');
    const subtitleHeightInput = document.getElementById('subtitle-height');
    const bgOffsetYInput = document.getElementById('bg-offset-y');
    const fontSizeInput = document.getElementById('font-size');
    const fontColorInput = document.getElementById('font-color');
    const strokeColorInput = document.getElementById('stroke-color');
    const subtitlesTextarea = document.getElementById('subtitles');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let sourceImage = null;

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                sourceImage = new Image();
                sourceImage.onload = () => {
                    generateImage(); 
                };
                sourceImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            fileNameSpan.textContent = '未选择文件';
        }
    });

    generateBtn.addEventListener('click', generateImage);
    saveBtn.addEventListener('click', saveImage);

    function generateImage() {
        if (!sourceImage) {
            alert('请先选择一张图片！');
            return;
        }

        const sliceHeight = parseInt(subtitleHeightInput.value, 10);
        const bgOffsetY = parseInt(bgOffsetYInput.value, 10);
        const fontSize = parseInt(fontSizeInput.value, 10);
        const fontColor = fontColorInput.value;
        const strokeColor = strokeColorInput.value;
        const subtitles = subtitlesTextarea.value.split('\n').filter(line => line.trim() !== '');

        if (subtitles.length === 0) {
            canvas.width = sourceImage.width;
            canvas.height = sourceImage.height;
            ctx.drawImage(sourceImage, 0, 0);
            return;
        }

        // New logic: The final image is the top part of the original image, plus N slices.
        const topPartHeight = sourceImage.height - sliceHeight;
        const totalHeight = topPartHeight + subtitles.length * sliceHeight;
        canvas.width = sourceImage.width;
        canvas.height = totalHeight;

        // 1. Draw the top part of the image (everything above the first subtitle area)
        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, topPartHeight, 0, 0, sourceImage.width, topPartHeight);

        // Prepare text styling
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = fontColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;

        // Define the slice to be used as the repeating background
        const sliceSourceY = sourceImage.height - sliceHeight - bgOffsetY;

        // 2. For each line of text, draw a slice and then the subtitle
        for (let i = 0; i < subtitles.length; i++) {
            const yPos = topPartHeight + i * sliceHeight;
            
            // Draw the slice from the bottom of the source image to create the background
            ctx.drawImage(sourceImage, 0, sliceSourceY, sourceImage.width, sliceHeight, 0, yPos, sourceImage.width, sliceHeight);
            
            // Draw the text on top of the newly drawn slice
            // Vertically center the text within the slice
            const textY = yPos + (sliceHeight / 2) + (fontSize / 3); // Approximation for vertical center
            ctx.strokeText(subtitles[i], canvas.width / 2, textY);
            ctx.fillText(subtitles[i], canvas.width / 2, textY);
        }
    }

    function saveImage() {
        if (!sourceImage) {
            alert('没有可保存的图片。');
            return;
        }
        const link = document.createElement('a');
        link.download = `subtitle_export_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    // Add listeners to auto-update preview on parameter change
    [subtitleHeightInput, bgOffsetYInput, fontSizeInput, fontColorInput, strokeColorInput, subtitlesTextarea].forEach(el => {
        el.addEventListener('input', () => {
            if(sourceImage) generateImage();
        });
    });
});
