function toggleSidebar() {
  const sidenav = document.querySelector(".sidenav");
  sidenav.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const tripLinks = document.querySelectorAll(".trip-nav-name");

  tripLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent the default link navigation

      const daysList = link.nextElementSibling;

      if (daysList && daysList.classList.contains("days-list")) {
        daysList.style.display =
          daysList.style.display === "block" ? "none" : "block";
      }
    });
  });
});
