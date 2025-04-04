
let compressedImages = [];

let draggedCard = null;

function initDragAndDrop() {
    const cardSection = document.getElementById('card-section');
    
    cardSection.addEventListener('dragstart', (e) => {
        draggedCard = e.target.closest('.card');
        draggedCard.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    
    cardSection.addEventListener('dragend', (e) => {
        if (draggedCard) {
            draggedCard.classList.remove('dragging');
            draggedCard = null;
        }
    });
    
    cardSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        const card = e.target.closest('.card');
        if (!card || card === draggedCard) return;
        
        const cardRect = card.getBoundingClientRect();
        const draggedRect = draggedCard.getBoundingClientRect();
        const afterElement = (e.clientY - cardRect.top) > (cardRect.height / 2);
        
        if (afterElement) {
            card.after(draggedCard);
        } else {
            card.before(draggedCard);
        }

        const cards = Array.from(cardSection.children);
        compressedImages = cards.map(card => {
            const name = card.querySelector('h3').textContent;
            return compressedImages.find(img => img.name === name)
        });
    });
}


function clearCompressedImages() {
    compressedImages = [];
    const cardSection = document.getElementById('card-section');
    cardSection.innerHTML = '';
    document.getElementById('compressed-images-section').classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', function() {

    initDragAndDrop();


    document.getElementById('hero-title').style.opacity = 1;
    document.getElementById('hero-title').style.transform = 'translateY(0)';
    
    document.getElementById('hero-description').style.opacity = 1;
    document.getElementById('hero-description').style.transform = 'translateY(0)';


    document.getElementById('drop-area-container').style.opacity = 1;
    document.getElementById('drop-area-container').style.transform = 'translateY(0)';
});


function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

document.getElementById('drop-area').addEventListener('drop', function(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
});

document.getElementById('drop-area').addEventListener('dragover', function(event) {
    event.preventDefault();
});

document.getElementById('drop-area').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = function(event) {
        const files = event.target.files;
        handleFiles(files);
    };
    input.click();
});

function handleFiles(files) {
    let processingComplete = false;
    let processedFiles = 0;
    let totalValidFiles = 0;
    let hasCompressedImages = false;
    let largerSizeImages = [];
    
    document.getElementById('loading-progress-bar').style.width = '0%';
    document.getElementById('loading-details').textContent = `0 of ${totalValidFiles} images completed`;

    const cardSection = document.getElementById('card-section');
    
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('loading-progress-bar');
    const loadingText = document.getElementById('loading-text');
    loadingOverlay.classList.add('active');

    // validate files first
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            totalValidFiles++;
        } else {
            processedFiles++;
            showDialog('Invalid File', `${file.name} is not a valid image file.`);
        }
    });

    if (totalValidFiles === 0) {
        loadingOverlay.classList.remove('active');
        return;
    }

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onerror = function() {
                processedFiles++;
                showDialog('Error', `Failed to load image: ${file.name}. The file might be corrupted or not a valid image.`);
                updateLoadingProgress(totalValidFiles);
            };
            img.onload = function() {
                const originalSize = formatBytes(file.size);

                const sliderValue = document.getElementById('compression-level').value;
                // Convert slider value to compression quality (0-1 range)
                const compressionQuality = parseInt(sliderValue, 10) / 100; // Direct percentage to decimal

                // js-image-compressor to compress the image
                const options = {
                    file: file,
                    quality: compressionQuality, 
                    maxWidth: 2000,
                    maxHeight: 2000,
                    beforeCompress: function (result) {
                        console.log('Image size before compression:', result.size);
                        console.log('mime type:', result.type);
                    },
                    success: function (result) {
                        hasCompressedImages = true;
                        // Use original if compressed is larger
                        let finalImage, finalSize;
                        if (result.size > file.size) {
                            finalImage = file;
                            finalSize = formatBytes(file.size);
                            largerSizeImages.push(file.name);
                        } else {
                            finalImage = result;
                            finalSize = formatBytes(result.size);
                        }
                        const url = URL.createObjectURL(finalImage);

                        compressedImages.push({ 
  name: file.name, 
  url: url, 
  blob: finalImage,
  originalSizeBytes: file.size,
  compressedSizeBytes: finalImage.size
});

                        const card = createCard(file.name, originalSize, finalSize, url, file.size, finalImage.size);
                        cardSection.appendChild(card);

                        // Show the section if there are any compressed images
                        processedFiles++;
                        const progress = (processedFiles / totalValidFiles) * 100;
            document.getElementById('loading-details').textContent = `${processedFiles} of ${totalValidFiles} images completed`;
                        progressBar.style.width = `${progress}%`;
                        loadingText.textContent = `Processing image ${processedFiles} of ${files.length}`;

                        if (hasCompressedImages) {
                            document.getElementById('compressed-images-section').classList.remove('hidden');
                        }
                        
                        // Check if all files have been processed
                        if (processedFiles === totalValidFiles && !processingComplete) {
                            processingComplete = true;
                            loadingOverlay.classList.remove('active');
                            progressBar.style.width = '0%';
                            processedFiles = 0;
                            totalValidFiles = 0;
                            
       
                            document.getElementById('compressed-images-section').scrollIntoView({ behavior: 'smooth' });
                            
          
                            if (largerSizeImages.length > 0) {
                                const message = largerSizeImages.length === 1 
                                    ? `The image "${largerSizeImages[0]}" would be larger when compressed. Original image used instead.` 
                                    : `${largerSizeImages.length} images would be larger when compressed. Original images used instead.`;
                                showDialog('Compression Notice', message + ' Try adjusting compression settings for better results.');
                            }
                        }
                    },
                    error: function (msg) {
                        console.error(msg);
                        processedFiles++;
                        showDialog('Compression Error', `Failed to compress image: ${file.name}. ${msg}`);
                        updateLoadingProgress(totalValidFiles);
                    }
                };

                new ImageCompressor(options);
            };
        };
        reader.onerror = function() {
            processedFiles++;
            showDialog('Error', `Failed to read file: ${file.name}. The file might be too large or corrupted.`);
            updateLoadingProgress(totalValidFiles);
        };
        reader.readAsDataURL(file);
    });
}


function createCard(name, originalSize, newSize, url, originalSizeBytes, newSizeBytes) {
    const card = document.createElement('div');
    card.className = 'card p-6 bg-gray-50 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300';
    card.draggable = true;
    
    const sizeDiff = ((newSizeBytes - originalSizeBytes) / originalSizeBytes) * 100;
    const statusColor = sizeDiff < 0 ? '#22c55e' : sizeDiff === 0 ? '#eab308' : '#ef4444';
    const statusText = sizeDiff < 0 ? `${Math.abs(sizeDiff).toFixed(1)}% smaller` : sizeDiff === 0 ? 'No change' : `${sizeDiff.toFixed(1)}% larger`;

    card.innerHTML = `
      <div class="image-container relative mb-4 overflow-hidden rounded-md">
        <img src="${url}" alt="${name}" class="w-full object-cover transition-transform duration-300 hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 transition-opacity duration-300 flex items-center justify-center rounded-md opacity-0 hover:opacity-100" style="backdrop-filter: blur(3px);">
          <button class="text-white bg-gray-900 p-4 rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" onclick="deleteImage('${url}', '${name}')" aria-label="Delete image">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="flex flex-col">
        <h3 class="text-xl font-semibold text-gray-800 mb-3 truncate" title="${name}">${name}</h3>
        
        <div class="grid grid-cols-2 gap-2 mb-5">
          <div class="space-y-2">
            <p class="text-sm flex justify-between">
              <span class="text-gray-500 font-medium">Original:</span>
              <span class="text-gray-700">${originalSize}</span>
            </p>
            <p class="text-sm flex justify-between">
              <span class="text-gray-500 font-medium">New:</span>
              <span class="text-blue-600 font-medium">${newSize}</span>
            </p>
          </div>
          
          <div class="flex items-center justify-end">
            <div class="bg-red-50 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full border border-red-100 flex items-center" style="background-color: ${statusColor}10; border-color: ${statusColor}20; color: ${statusColor}700;">
              <span class="w-2 h-2 rounded-full mr-1.5" style="background-color: ${statusColor}"></span>
              ${statusText}
            </div>
          </div>
        </div>
        
        <button class="download-btn text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-800 transition duration-300 w-full flex items-center justify-center shadow-sm hover:shadow group" onclick="downloadImage('${url}', '${name}')">
          <i class="fas fa-download mr-2 group-hover:animate-bounce"></i>
          Download File
        </button>
      </div>
    `;
    return card;
}

function deleteImage(url, filename) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (card.querySelector('h3').textContent === filename) {
            card.remove();
        }
    });
    
    compressedImages = compressedImages.filter(img => img.name !== filename);
    
    if (compressedImages.length === 0) {
        document.getElementById('compressed-images-section').classList.add('hidden');
    }
}

function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function updateLoadingProgress(totalValidFiles) {
    // Update progress calculation to use totalValidFiles
    if (!totalValidFiles) return;
    const progress = (processedFiles / totalValidFiles) * 100;
    progressBar.style.width = `${progress}%`;
    loadingText.textContent = `Processing image ${processedFiles} of ${totalValidFiles}`;
    document.getElementById('loading-details').textContent = `${processedFiles} of ${totalValidFiles} images completed`;

    if (processedFiles === totalValidFiles) {
        loadingOverlay.classList.remove('active');
        progressBar.style.width = '0%';
        if (hasCompressedImages) {
            document.getElementById('compressed-images-section').scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function downloadAllImages() {
    if (compressedImages.length === 0) {
        showDialog('No Images', 'There are no compressed images to download.');
        return;
    }

    const zip = new JSZip();
    const promises = [];

    compressedImages.forEach(image => {
        const promise = fetch(image.url)
            .then(response => response.blob())
            .then(blob => {
                zip.file(image.name, blob);
            });
        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        if (compressedImages.length === 0) {
            showDialog('Download Error', 'Failed to prepare files for download. Please try again.');
            return;
        }
        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'compressed_images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
}