document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission

  const formData = new FormData();
  const imageInput = document.getElementById("image-input");
  const file = imageInput.files[0];
  formData.append("image", file);

  document.querySelector(".progress").style.display = "block";

  try {
    const response = await fetch("http://127.0.0.1:5000/enhance", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const enhancedImageUrl = URL.createObjectURL(blob);

    // Display the original image
    const originalImageElement = document.getElementById("original-image");
    originalImageElement.src = URL.createObjectURL(file);
    originalImageElement.style.display = "block";

    // Display the enhanced image
    const enhancedImageElement = document.getElementById("enhanced-image");
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
});
