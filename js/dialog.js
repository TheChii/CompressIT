function showDialog(title, message) {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';


    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';

    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'dialog-header';
    dialogHeader.innerHTML = `<h3 class="text-lg font-medium">${title}</h3>`;

   
    const dialogBody = document.createElement('div');
    dialogBody.className = 'dialog-body';
    dialogBody.innerHTML = `<p>${message}</p>`;

    const dialogFooter = document.createElement('div');
    dialogFooter.className = 'dialog-footer';


    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'bg-black text-white px-4 py-2 rounded hover:bg-gray-800';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(dialogOverlay);
    });


    dialogFooter.appendChild(confirmBtn);

    dialogBox.appendChild(dialogHeader);
    dialogBox.appendChild(dialogBody);
    dialogBox.appendChild(dialogFooter);


    dialogOverlay.appendChild(dialogBox);

    document.body.appendChild(dialogOverlay);

    setTimeout(() => {
        dialogOverlay.classList.add('active');
    }, 10);


    dialogOverlay.addEventListener('click', (event) => {
        if (event.target === dialogOverlay) {
            dialogOverlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(dialogOverlay);
            }, 300); 
        }
    });
}

