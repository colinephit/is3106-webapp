// changed implementation to support new image storage logic
const uploadImage = async (e, setProgress, setFormDetails, formDetails) => {
  e.preventDefault();

  const files = e.target.files;
  if (!files || files.length === 0) {
    console.error("No file selected");
    return;
  }

  console.log("Uploading file:", files[0]); // Debugging log

  const formData = new FormData();
  formData.append("image", files[0]); // Must match multer field name

  try {
    const response = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image.");
    }

    const data = await response.json();
    console.log("Upload successful. Server response:", data);

    setFormDetails({ ...formDetails, image: data.imageName });
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};

export default uploadImage;
