
document
  .getElementById("screenshot-btn")
  .addEventListener("click", async () => {
    try {
      const response =
        await fetch(`https://screenshot-api-be.vercel.app/screenshot?url=https://www.google.com`);
      if (!response.ok) {
        throw new Error(
          "Failed to capture screenshot. Please make sure the backend server is running.",error
        );
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "screenshot.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error taking screenshot:", error);
      alert("Screenshot failed! Ensure the server is running and try again.");
    }
  });
