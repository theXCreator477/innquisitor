try {
    let forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.id !== 'reserve-form') {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) return event.preventDefault();
    
                let button = form.querySelector('button');
                button.disabled = true;
                button.style.opacity = 0.5;
            });
        }
    });
} catch (err) { }