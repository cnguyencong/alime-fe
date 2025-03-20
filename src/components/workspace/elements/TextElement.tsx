import { TextElementType } from "polotno/model/text-model";
import { Transformer, Text } from "react-konva";
import React from "react";

interface TextElementProps {
  textEl: TextElementType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (e: TextElementType) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  textEl,
  isSelected,
  onSelect,
  onChange,
}) => {
  const textRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDblClick = (_: Event) => {
    const textNode = textRef.current;
    const stage = textNode.getStage();
    const stageBox = stage.container().getBoundingClientRect();

    const textPosition = textNode.getAbsolutePosition();
    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = textEl.text;
    textarea.style.position = "absolute";
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width()}px`;
    textarea.style.height = `${textNode.height()}px`;
    textarea.style.fontSize = `${textEl.fontSize}px`;
    textarea.style.border = "1px solid #ccc";
    textarea.style.padding = "4px";
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background = "white";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.transformOrigin = "left top";
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    textarea.style.transform = `rotate(${textNode.rotation()}deg)`;
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.fontWeight = textNode.fontStyle();

    textarea.focus();

    const removeTextarea = () => {
      document.body.removeChild(textarea);
      window.removeEventListener("click", handleOutsideClick);
    };

    const setTextAndRemove = () => {
      onChange({
        ...textEl,
        text: textarea.value,
      });
      removeTextarea();
    };

    const handleOutsideClick = (e: any) => {
      if (e.target !== textarea) {
        setTextAndRemove();
      }
    };

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        setTextAndRemove();
      } else if (e.key === "Escape") {
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    });
  };

  return (
    <React.Fragment>
      <Text
        ref={textRef}
        x={textEl.x}
        y={textEl.y}
        text={textEl.text}
        fontSize={textEl.fontSize}
        align={textEl.align}
        fill={textEl.fill}
        width={textEl.width}
        height={textEl.height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDragEnd={(e) => {
          onChange({
            ...textEl,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(_) => {
          const node = textRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...textEl,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {/* Transformer for Text */}
      {isSelected && <Transformer ref={trRef} />}
    </React.Fragment>
  );
};
