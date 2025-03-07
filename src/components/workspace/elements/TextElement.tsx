import { TextElementType } from "polotno/model/text-model";
import { Transformer, Text } from "react-konva";
import React from "react";

interface TextElementProps {
  textEl: TextElementType;
  isSelected: boolean;
  onSelect: any;
  onChange: any;
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
