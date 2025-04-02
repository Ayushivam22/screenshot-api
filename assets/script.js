document.getElementById("screenshot-btn").addEventListener("click", async () => {
  try {
      const response = await fetch(`https://screenshot-api-be.vercel.app/screenshot?url=https://www.google.com`);

      if (!response.ok) {
          throw new Error(`Failed to capture screenshot: ${response.statusText}`);
      }

      // Ensure the response is treated as an image (binary)
      const blob = await response.blob();

      // Create a download link for the image
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "screenshot.jpeg"; // Change to .jpeg format
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } catch (error) {
      console.error("Error taking screenshot:", error);
      alert("Screenshot failed! Ensure the server is running and try again.");
  }
});
