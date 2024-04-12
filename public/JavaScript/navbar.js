const toast = document.querySelector(".ct-toast");
const closeIcon = document.querySelector(".close");
const progress = document.querySelector(".progress");

let timer1, timer2;

try {

  closeIcon.addEventListener("click", () => {
    toast.classList.remove("active");

    setTimeout(() => {
      progress.classList.remove("active");
    }, 300);

    clearTimeout(timer1);
    clearTimeout(timer2);
  });

  document.getElementById('logout-btn').addEventListener("click", (event) => {
    if (!confirm("Are you sure you want to log out ?")) event.preventDefault();
  });
} catch (err) {}

window.onload = () => {
  if (success.length || failure.length) {
    toast.classList.add("active");
    progress.classList.add("active");
  
    timer1 = setTimeout(() => {
      toast.classList.remove("active");
    }, 5000); //1s = 1000 milliseconds
  
    timer2 = setTimeout(() => {
      progress.classList.remove("active");
    }, 5300);
  }
};
