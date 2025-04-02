// Render image viewer container
export function renderImageViewer() {
    const container = document.getElementById('expandedImageContainer');
    
    // Nothing to render initially, just set up the global function for image expansion
    window.expandImage = expandImage;
    window.collapseImage = collapseImage;
}

// Function to expand image
function expandImage(imageUrl) {
    const container = document.getElementById('expandedImageContainer');
    
    // Create overlay content
    const overlayContent = document.createElement('div');
    overlayContent.className = 'expanded-image-overlay';
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'expanded-image';
    img.alt = 'Expanded vehicle image';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;
    closeButton.onclick = (e) => {
        e.stopPropagation();
        collapseImage();
    };
    
    // Assemble the components
    overlayContent.appendChild(img);
    overlayContent.appendChild(closeButton);
    
    // Clear and add to container
    container.innerHTML = '';
    container.appendChild(overlayContent);
    container.classList.remove('hidden');
    
    // Add click event to close when clicking outside the image
    overlayContent.onclick = (e) => {
        if (e.target === overlayContent) {
            collapseImage();
        }
    };
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
}

// Function to collapse image
function collapseImage() {
    const container = document.getElementById('expandedImageContainer');
    
    // Properly remove all child elements before hiding
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    container.classList.add('hidden');
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle escape key press
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        collapseImage();
    }
}
