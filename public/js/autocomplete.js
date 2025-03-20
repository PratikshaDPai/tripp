document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("name");
  const dropdown = document.getElementById("autocompleteDropdown");
  const locationIdInput = document.getElementById("locationId");
  const activitiesDropdown = document.getElementById("activities");
  const imageInput = document.getElementById("image");

  // Fetch location suggestions and activities on input change
  searchBox.addEventListener("input", async function () {
    const query = searchBox.value.trim();
    if (!query) {
      dropdown.innerHTML = "";
      locationIdInput.value = "";
      activitiesDropdown.innerHTML =
        "<option disabled selected>Select activities</option>";
      return;
    }

    try {
      const response = await fetch(`/search-location?q=${query}`);
      const locations = await response.json();

      dropdown.innerHTML = ""; // Clear previous suggestions

      locations.forEach((loc) => {
        const li = document.createElement("li");
        li.textContent = `${loc.name}, ${loc.city}, ${loc.country}`;
        li.dataset.id = loc._id;
        li.dataset.activities = JSON.stringify(loc.activities); // Store activities in data attribute

        li.addEventListener("click", function () {
          searchBox.value = loc.name;
          locationIdInput.value = loc._id;
          dropdown.innerHTML = "";

          // Populate activities dropdown
          populateActivitiesDropdown(JSON.parse(li.dataset.activities));
        });

        dropdown.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  });

  // Populate activities dropdown and set event listener for image updates
  function populateActivitiesDropdown(activities) {
    activitiesDropdown.innerHTML =
      "<option disabled selected>Select activities</option>"; // Reset dropdown
    activities.forEach((activity) => {
      const option = new Option(activity.title, activity._id);
      option.dataset.image = activity.imageUrl || ""; // Store image URL in data attribute
      activitiesDropdown.appendChild(option);
    });

    // Listen for activity selection and update the image URL field
    activitiesDropdown.addEventListener("change", function () {
      const selectedOption =
        activitiesDropdown.options[activitiesDropdown.selectedIndex];
      const selectedImageUrl = selectedOption.dataset.image;
      if (selectedImageUrl) {
        imageInput.value = selectedImageUrl; // Auto-fill the image URL field
      }
    });
  }

  // Hide dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== searchBox) {
      dropdown.innerHTML = "";
    }
  });
});
