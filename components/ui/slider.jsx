import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(
  ({ className, value, defaultValue = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const [sliderValue, setSliderValue] = React.useState(value || defaultValue);
    const [isDragging, setIsDragging] = React.useState(false);
    const trackRef = React.useRef(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setSliderValue(value);
      }
    }, [value]);

    const updateValue = React.useCallback(
      (newValue) => {
        setSliderValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    const handleMouseDown = React.useCallback(
      (e, index) => {
        setIsDragging(true);
        const track = trackRef.current;
        if (!track) return;

        const handleMouseMove = (event) => {
          const rect = track.getBoundingClientRect();
          const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          const newValue = Math.round((min + percentage * (max - min)) / step) * step;

          const newValues = [...sliderValue];
          newValues[index] = Math.max(min, Math.min(max, newValue));
          updateValue(newValues);
        };

        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      },
      [sliderValue, min, max, step, updateValue]
    );

    const handleTrackClick = React.useCallback(
      (_e) => {
        if (isDragging) return;

        const track = trackRef.current;
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const newValue = Math.round((min + percentage * (max - min)) / step) * step;

        const newValues = [...sliderValue];
        newValues[0] = Math.max(min, Math.min(max, newValue));
        updateValue(newValues);
      },
      [isDragging, sliderValue, min, max, step, updateValue]
    );

    return (
      <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
        <div
          ref={trackRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary cursor-pointer"
          onClick={handleTrackClick}
        >
          <div
            className="absolute h-full bg-primary"
            style={{
              left: `${((sliderValue[0] - min) / (max - min)) * 100}%`,
              width: `${((sliderValue[0] - min) / (max - min)) * 100}%`,
            }}
          />
        </div>
        {sliderValue.map((val, index) => (
          <div
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            style={{
              left: `${((val - min) / (max - min)) * 100}%`,
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
          />
        ))}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
