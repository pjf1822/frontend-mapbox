import React, { useRef, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// IMAGES
import ramSkull from "./assets/RAM.png";
import logo from "./assets/tatty-transformed.png";
import tattooLogo from "./assets/output-onlinepngtools.png";
import { createAddress, deleteAddress, fetchAddresses } from "./api";
import PopupContent from "./components/PopupContent";

mapboxgl.accessToken =
  "pk.eyJ1IjoicGpmMTgyMiIsImEiOiJjbGZybHJsMXMwMmd3M3BwMmFiZXlvZjczIn0.68xXIxxj_-iONU42ihPWZA";

export default function App() {
  const [listOfAddresses, setListOfAddresses] = useState([]);
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");
  const [addressSelected, setAddressSelected] = useState(false);

  //  map things
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [zoom, setZoom] = useState(3);

  // Toast
  const notify = (message) => {
    if (message === "Your pin has been added!") {
      toast.success(message, { position: toast.POSITION.TOP_LEFT });
    } else if (message === "Select an address from the dropdown") {
      toast.warning(message, { position: toast.POSITION.TOP_LEFT });
    } else {
      toast(message); // Default
    }
  };
  // Fetch addresses
  const getAllAddresses = async () => {
    try {
      const data = await fetchAddresses();

      setListOfAddresses(data);
    } catch (error) {
      console.error(
        "An error occurred while fetching the transactions:",
        error
      );
    }
  };
  // EFFECT TO RUN THE INITAL API CALL
  useEffect(() => {
    getAllAddresses();
  }, []);

  const deleteShop = async (featureId) => {
    try {
      await deleteAddress(featureId);

      const updatedAddresses = listOfAddresses.filter(
        (address) => address._id !== featureId
      );
      setListOfAddresses(updatedAddresses);

      notify("Address deleted successfully!");
    } catch (error) {
      notify("Failed to delete address.");
      console.error("An error occurred while deleting the address:", error);
    }
  };

  // POPULATE THE STATE AND THE MAP
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/pjf1822/clekajgr3000001l8y22r3psx",
      center: [lng, lat],
      zoom: zoom,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });

    geocoder.on("result", (e) => {
      setAddressSelected(true); // Set the state to true when an address is selected
      // You can also access the selected address's details using e.result
    });

    map.addControl(geocoder);

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // change state based on where we moved
    map.on("move", () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // add icons
    map.on("load", () => {
      map.loadImage(tattooLogo, (error, image) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage("inkpen", image, {
          content: [20, 20, 20, 20],
          pixelRatio: 4, // place text over left half of image, avoiding the 16px border
          stretchX: [[16, 100]], // stretch everything horizontally except the 16px border
          stretchY: [[16, 84]], // stretch everything vertically except the 16px border
        });
        map.addSource("places", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: listOfAddresses.map((add) => {
              return {
                type: "Feature",
                properties: {
                  description: add.description,
                  link: add.link,
                  id: add._id,
                },
                geometry: { type: "Point", coordinates: add.coordinates },
              };
            }),
          },
        });
        // Add a layer showing the places.
        map.addLayer({
          id: "places",
          type: "symbol",
          source: "places",

          layout: {
            "icon-image": "inkpen",
            "icon-allow-overlap": true,
          },
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on("click", "places", (e) => {
          // Copy coordinates array.
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;
          const id = e.features[0].properties.id;
          const newLink = e.features[0].properties.link;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          const div = document.createElement("div");
          createRoot(div).render(
            <PopupContent
              description={description}
              newLink={newLink}
              ramSkull={ramSkull}
              id={id}
              deleteFunction={deleteShop}
            />
          );

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setDOMContent(div)
            .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on("mouseenter", "places", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        map.on("mouseleave", "places", () => {
          map.getCanvas().style.cursor = " ";
        });
      });
    });

    // Clean up on unmount
    return () => map.remove();
  }, [listOfAddresses]);

  // Post new address
  const submitGeoLocateStuff = async (e) => {
    e.preventDefault();

    if (!addressSelected) {
      notify("Select an address from the dropdown");
      return;
    }

    const payload = {
      coordinates: { theLng: lng, theLat: lat },
      link,
      description: desc,
    };

    try {
      await createAddress(payload);
      fetchAddresses();
      setDesc("");
      setLink("");
      notify("Your pin has been added!");
      // Handle success
      await getAllAddresses();
    } catch (error) {}

    return;
  };

  return (
    <div className="page-wrapper">
      <img src={logo} className="logo-wrapper" />

      <div ref={mapContainer} className="map-container" />

      <form className="form-wrapper" onSubmit={submitGeoLocateStuff}>
        <div
          className="form-div"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="input-wrapper">
            <div className="single-input-wrapper">
              <label className="form-label" htmlFor="desc">
                Description
              </label>
              <input
                type="string"
                label="desc"
                id="desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="description"
                className="form-input"
              />
            </div>
            <div className="single-input-wrapper">
              <label className="form-label" htmlFor="link">
                Link
              </label>
              <input
                type="url"
                label="link"
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="form-input"
                placeholder="link"
              />
            </div>
          </div>
          <button className="form-button" type="submit">
            Submit
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
