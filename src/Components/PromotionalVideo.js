import React, { useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable'; // Import the swipe hook

const PromotionalVideo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = [useRef(null), useRef(null)]; // Use an array of refs

  // This effect handles playing the active video and pausing the inactive one
  useEffect(() => {
    videoRefs.forEach((ref, index) => {
      if (ref.current) {
        if (index === activeIndex) {
          ref.current.play().catch(error => console.log("Autoplay was prevented:", error));
        } else {
          ref.current.pause();
        }
      }
    });
  }, [activeIndex]); // Re-run this effect whenever activeIndex changes

  const updateIndex = (newIndex) => {
    // Ensure the new index is within bounds (0 or 1)
    if (newIndex < 0) {
      newIndex = 1; // Go to the last slide
    } else if (newIndex >= 2) {
      newIndex = 0; // Go to the first slide
    }
    setActiveIndex(newIndex);
  };
  
  // Setup swipe handlers using the react-swipeable hook
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => updateIndex(activeIndex + 1),
    onSwipedRight: () => updateIndex(activeIndex - 1),
    trackMouse: true
  });

  return (
    <section className="promo-slider-section">
      <div className="container">
        <h2 className="section-title">From Problem to Solution: The ClimateOS Vision</h2>
        
        {/* Spread the swipe handlers onto this container */}
        <div {...swipeHandlers} className="slider-container">
          <div
            className="video-wrapper"
            style={{ transform: `translateX(-${activeIndex * 50}%) `}}
          >
            <video
              ref={videoRefs[0]}
              src="/1753448283700.mp4" // Your first video
              loop
              muted
              playsInline // Important for autoplay on mobile
            />
            <video
              ref={videoRefs[1]}
              src="/1753458681723.mp4" // Your second video
              loop
              muted
              playsInline
            />
          </div>
          <button className="slider-nav prev" onClick={() => updateIndex(activeIndex - 1)}>&#10094;</button>
          <button className="slider-nav next" onClick={() => updateIndex(activeIndex + 1)}>&#10095;</button>
        </div>

        <div className="slider-dots">
          {videoRefs.map((_, index) => (
            <span
              key={index}
              className={`dot ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            ></span>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default PromotionalVideo;