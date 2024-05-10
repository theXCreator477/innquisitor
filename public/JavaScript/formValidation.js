(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

try {
  document.getElementById("user-signup").addEventListener("submit", function (event) {
    const createPassInput = document.getElementById("create-pass");
    const confirmPassError = document.querySelector("#confirm-pass + .invalid-feedback");
    const confirmPassInput = document.getElementById("confirm-pass");

    if (createPassInput.value.length && confirmPassInput.value.length && (createPassInput.value !== confirmPassInput.value)) {
      confirmPassInput.value = "";
      confirmPassError.innerText = "Passwords do not match";
      event.preventDefault();
    }
  });

} catch (err) { }


try {
  let form = document.getElementById('add-new');

  form.addEventListener('submit', event => {
    let selected = form.querySelector('.categories-container input:checked');
    if (!selected) {
      event.preventDefault();
      return document.querySelector('.category-feedback').style.display = "block";
    }
  });

} catch (err) { }


try {
  let imgInput = document.querySelector('#img');
  imgInput.addEventListener('change', () => {
    if (imgInput.files.length > 5) {
      alert('Maximum 5 images can be uploaded.');
      imgInput.value = '';
      return;
    }
    if (imgInput.files.length) {
      const files = imgInput.files;
      const maxFileSize = 2 * 1024 * 1024; // 2MB

      for (const file of files) {
        if (file.size > maxFileSize) {
          alert(`File ${file.name} is too large. Maximum file size allowed is 2 MB.`);
          imgInput.value = '';
          return;
        }
      }
    }
  });

} catch (err) { }