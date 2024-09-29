import React, { useState } from "react";

// Define the Material type for clarity
interface Material {
  material: string;
}

interface Post {
  apiResponse: {
    item: string;
    recyclable: boolean;
    description: string;
    materials: Material[] | null; // Materials array in the API response
    points: number;
  };
  image: string;
}

interface PastPostsProps {
  posts: Post[]; // This data will be passed in from the parent component
}

const PastPosts: React.FC<PastPostsProps> = ({ posts }) => {
  const [expanded, setExpanded] = useState(false); // To toggle between button and expanded view
  const [currentPostIndex, setCurrentPostIndex] = useState(0); // To track the current post

  // Handle Next and Previous buttons
  const handleNext = () => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div style={styles.container}>
      {/* Toggle Button */}
      <button onClick={toggleExpanded} style={styles.button}>
        {expanded ? <>Hide Past Posts ↓</> : <>Show Past Posts ↑</>}
      </button>

      {/* If expanded, show the current post */}
      {expanded && (
        <div style={styles.postContainer}>
          {/* Recyclability banner similar to RecyclableChecker */}
          {posts[currentPostIndex]?.apiResponse?.recyclable !== null && (
            <div
              style={{
                ...styles.resultBanner,
                backgroundColor: posts[currentPostIndex].apiResponse.recyclable
                  ? "#22c55e"
                  : "#ef4444",
              }}
            >
              {posts[currentPostIndex].apiResponse.recyclable
                ? "Recyclable"
                : "Not Recyclable"}
            </div>
          )}

          {/* Display image directly */}
          <img
            src={
              posts[currentPostIndex]?.image
                ? posts[currentPostIndex].image.startsWith("data:image")
                  ? posts[currentPostIndex].image
                  : `data:image/jpeg;base64,${posts[currentPostIndex].image}`
                : ""
            }
            alt="Recycled item"
            style={styles.image}
          />

          {/* Post Content */}
          <div style={styles.postContent}>
            <p>
              <strong>Item:</strong>{" "}
              {posts[currentPostIndex]?.apiResponse?.item || "Unknown"}
            </p>

            <p>
              <strong>Recyclable:</strong>{" "}
              {posts[currentPostIndex]?.apiResponse?.recyclable ? "Yes" : "No"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {posts[currentPostIndex]?.apiResponse?.description || "N/A"}
            </p>

            {/* Ensure that materials is always treated as an array */}
            {Array.isArray(posts[currentPostIndex]?.apiResponse?.materials) &&
              posts[currentPostIndex].apiResponse.materials.length > 0 && (
                <div>
                  <strong>Materials:</strong>
                  <ul>
                    {posts[currentPostIndex].apiResponse.materials.map(
                      (materialObj, index) => (
                        <li key={index}>{materialObj.material}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            <p>
              <strong>Recycling Points:</strong>{" "}
              {posts[currentPostIndex]?.apiResponse?.points || 0}
            </p>
          </div>

          {/* Pagination controls */}
          <div style={styles.pagination}>
            <button
              onClick={handlePrev}
              disabled={currentPostIndex === 0}
              style={styles.pageButton}
            >
              Previous
            </button>
            <span>
              Post {currentPostIndex + 1} of {posts.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPostIndex === posts.length - 1}
              style={styles.pageButton}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling adjustments to match the RecyclableChecker component
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    maxWidth: "400px", // Adjusted to match RecyclableChecker
    margin: "20px auto",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "inline-block", // Ensure button is centered properly
    boxShadow: "none",
    marginBottom: "20px",
  },
  postContainer: {
    marginBottom: "20px",
    padding: "24px", // Match RecyclableChecker's content padding
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Match RecyclableChecker
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "center",
  },
  postContent: {
    textAlign: "left" as React.CSSProperties["textAlign"],
    width: "100%",
    padding: "10px",
  },
  image: {
    width: "100%", // Full width to match RecyclableChecker's image style
    marginBottom: "16px",
    borderRadius: "4px",
    objectFit: "cover" as React.CSSProperties["objectFit"],
  },
  resultBanner: {
    marginBottom: "16px",
    padding: "8px",
    textAlign: "center" as React.CSSProperties["textAlign"],
    color: "white",
    fontWeight: "bold",
    borderRadius: "4px",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "10px",
  },
  pageButton: {
    padding: "10px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default PastPosts;
