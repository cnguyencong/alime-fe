import React, { useState } from "react";

interface TextOverlayControlsProps {
  onAddText: (text: string, fontSize: number, color: string) => void;
}

const TextOverlayControls: React.FC<TextOverlayControlsProps> = ({
  onAddText,
}) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState("#ffffff");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddText(text, fontSize, color);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border bg-gray-400 rounded-lg"
          placeholder="Enter text..."
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Font Size</label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min="12"
            max="100"
            className="w-24 px-3 py-2 bg-gray-400 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-20"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add Text
      </button>
    </form>
  );
};

export default TextOverlayControls;
