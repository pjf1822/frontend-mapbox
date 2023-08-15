import React, { useState } from "react";

const PopupContent = ({
  description,
  newLink,
  ramSkull,
  id,
  deleteFunction,
}) => {
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

  const handleDeleteClick = () => {
    if (isDeleteConfirmed) {
      deleteFunction(id);
    } else {
      setIsDeleteConfirmed(true);
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f5f4", padding: "0px 30px" }}>
      <h3 style={{ marginBottom: "5px" }}>{description}</h3>
      <br />
      <img
        src={ramSkull}
        style={{ height: "100px", width: "100px", objectFit: "contain" }}
      />
      <br />
      {newLink && (
        <h4 style={{ fontSize: "14px" }}>
          <a href={newLink} target="_blank" rel="noopener noreferrer">
            Instagram Page
          </a>
        </h4>
      )}
      <button
        style={{
          marginBottom: 10,
          backgroundColor: isDeleteConfirmed ? "red" : "initial",
        }}
        onClick={handleDeleteClick}
      >
        {isDeleteConfirmed ? "Are you sure?" : "Delete This Shop"}
      </button>
    </div>
  );
};

export default PopupContent;
