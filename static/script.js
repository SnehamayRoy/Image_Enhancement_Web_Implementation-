document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission

  const imageInput = document.getElementById("image-input");
  const file = imageInput.files[0];
  if (!file) return;

  // Create a FileReader to read the file
  const reader = new FileReader();

  reader.onload = async () => {
    // Create an image element to load the file content
    const img = new Image();
    img.src = reader.result;

    // Create a canvas to resize the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 256; // Desired width and height

    // Wait for the image to load
    img.onload = () => {
      // Set the canvas dimensions
      canvas.width = size;
      canvas.height = size;

      // Draw the resized image onto the canvas
      ctx.drawImage(img, 0, 0, size, size);

      // Convert the canvas content back to a Blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const resizedFile = new File([blob], file.name, {
          type: file.type,
        });

        // Create a FormData and append the resized image
        const formData = new FormData();
        formData.append("image", resizedFile);

        document.querySelector(".progress").style.display = "block";

        try {
          const response = await fetch("http://127.0.0.1:5000/enhance", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const enhancedBlob = await response.blob();
          const enhancedImageUrl = URL.createObjectURL(enhancedBlob);

          // Display the original image (resized for preview)
          const originalImageElement =
            document.getElementById("original-image");
          originalImageElement.src = URL.createObjectURL(blob); // Use the resized blob for preview
          originalImageElement.style.display = "block";

          // Display the enhanced image
          const enhancedImageElement =
            document.getElementById("enhanced-image");
          enhancedImageElement.src = enhancedImageUrl;
          enhancedImageElement.style.display = "block"; // Show the enhanced image

          // Show the download button
          const downloadButton = document.getElementById("download-button");
          downloadButton.style.display = "inline"; // Make the button visible

          // Store the enhanced image URL for downloading
          downloadButton.onclick = function () {
            const a = document.createElement("a"); // Create an anchor element
            a.href = enhancedImageUrl; // Set the href to the enhanced image URL
            a.download = "enhanced-image.jpg"; // Set default file name
            document.body.appendChild(a); // Append to body (required for Firefox)
            a.click(); // Trigger the download
            document.body.removeChild(a); // Remove the anchor from the document
          };
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while enhancing the image.");
        } finally {
          document.querySelector(".progress").style.display = "none"; // Hide progress indicator
        }
      }, "image/jpeg");
    };
  };

  // Read the image file as a data URL
  reader.readAsDataURL(file);
});
const toggleButton = document.getElementById("dark-mode-toggle");
const body = document.body;
const header = document.querySelector("header");
const footer = document.querySelector("footer");

toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  header.classList.toggle("dark-mode");
  footer.classList.toggle("dark-mode");
  toggleButton.classList.toggle("dark-mode");

  // Change the icon based on the mode
  if (body.classList.contains("dark-mode")) {
    toggleButton.textContent = "☀️"; // Sun icon for light mode
  } else {
    toggleButton.textContent = "🌙"; // Moon icon for dark mode
  }
});
