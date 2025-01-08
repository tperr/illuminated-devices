/*
 * from: https://blog.openreplay.com/image-manipulation-with-react-easy-crop/
 */
import { useCallback, useState } from "react";
import Slider from "@mui/material/Slider";
import Cropper from "react-easy-crop";
import getCroppedImg from "./Crop";
import { TailSpin } from 'react-loader-spinner';

function blobToForm(blob, userId) {
  blob.lastModifiedDate = new Date();
  let type;
  switch(blob.type) {
    case("image/jpeg"):
      type = ".jpeg";
      break;
    case("image/jpg"):
      type = ".jpg";
      break;
    case("image/png"):
      type = ".png";
      break;
    default:
      type = "null";
  }
  blob.name = userId + type;
  let form = new FormData();
  form.append('file', blob, blob.name);
  return form;
}

const EasyCrop = ({ image, userId, imageFinishedUploading, setImageFinishedUploading }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageBlobUrl, setCroppedImageBlobUrl] = useState(null);
  const [croppedImageIsUploading, setCroppedImageIsUploading] = useState(null);
  const [uploadError, setUploadError] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadCroppedImage = useCallback(async () => {
    try {
      setCroppedImageIsUploading(true);

      // Get Blob URL
      const cropBlobUrl = await getCroppedImg(
      image,
      croppedAreaPixels,
      // rotation
      );

      // Turn Blob URL into Blob
      let blob = await fetch(cropBlobUrl).then(r => r.blob()); // Convert blobURL to blob
      setCroppedImageBlobUrl(cropBlobUrl);
      setCroppedImage(blob);

      // Blob into file into form
      let form = blobToForm(blob, userId);

      // Send API request with cropped image
      const authorization = 'Bearer ' + sessionStorage.getItem("BLIGHT");
      const fullAddr = "https://illuminated.cs.mtu.edu/ark/u/" + userId + "/pfp/upload";
      const serverRes = await fetch(fullAddr, { // Your POST endpoint
        method: 'POST',
        headers: {
          'Authorization': authorization,
        },
        body: form, // This is your file object
      });

      const serverJsonResponse = await serverRes.json();

      if (serverRes.status !== 200) {
        console.log("serverRes.status: ");
        console.log(serverRes.status);
        console.log(serverRes);
        throw serverRes.status;
      }

      // Debug
      console.log("serverJsonResponse");
      console.log(serverJsonResponse);
      console.log("blob url: ", { cropBlobUrl });
      console.log(blob); 

      await new Promise(r => setTimeout(r, 2000)); // Sleep 2000 ms

      setCroppedImageIsUploading(false);
      setImageFinishedUploading(true);
      window.location.reload();
    } catch (e) {
      console.error(e);
      setCroppedImageIsUploading(false);
      setCroppedImageBlobUrl(null);
      setCroppedImage(null);
      setUploadError(true);
    }
  }, [croppedAreaPixels, image]);

  return (
    <div>
      <div id="easyCrop">
        <div className="container" style={{display: image === null || croppedImage !== null ? "none" : ""}}>
          <div className="cropper">
            <Cropper
              image={image}
              crop={crop}
              // rotation={rotation}
              zoom={zoom}
              zoomSpeed={4}
              maxZoom={3}
              zoomWithScroll={false}
              showGrid={false}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              containerStyle={{backgroundColor: "transparent", borderTopLeftRadius: "12px"}}
              cropShape={"circle"}
              // onRotationChange={setRotation}
            />
          </div>
          <div className="controls">
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="zoom"
                onChange={(e, zoom) => setZoom(zoom)}
                className="range"
              />
          </div>

          <div style={{textAlign: "center", paddingBottom: "24px"}}>
              <button className="pf-button" style={{display: image === null || croppedImage !== null ? "none" : "", backgroundColor: "white", color: "#3A3845"}} onClick={uploadCroppedImage}>
                  Set new profile picture
              </button>
            {uploadError && (
              <div className="login-error" style={{paddingTop: "15px"}}>
                Error uploading profile picture. <br/>
                Accepted File Types: .jpg, jpeg, .png <br/>
                File size limit: 2 MB <br/>
                Please try again.  
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="easyCropped">
        {croppedImageIsUploading && (
            <div className="inner">
              <div className="screenCover"></div>

              <img className="cropped-image" src={croppedImageBlobUrl} alt="cropped" />
              <div style={{marginTop: "20px"}}>
                <TailSpin 
                height="80"
                width="100%"
                color="white"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                />
              </div>
              <p style={{fontFamily: "Poppins-SB", fontSize: "24px", color: "white", paddingBottom: "24px"}}>Uploading...</p>
          </div>
        )}
      </div>
  </div>
  );
};

export default EasyCrop;

/*
const showCroppedImage = useCallback(async () => {
    try {
      const cropBlobUrl = await getCroppedImg(
        image,
        croppedAreaPixels,
        // rotation
      );
      let blob = await fetch(cropBlobUrl).then(r => r.blob()); // Convert blobURL to blob

      console.log("blob url: ", { cropBlobUrl });
      console.log(blob);
      setCroppedImage(cropBlobUrl);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image]);
  */