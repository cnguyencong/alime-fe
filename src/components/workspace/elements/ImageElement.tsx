import { ImageElementType } from "polotno/model/image-model";
import { useRef, useEffect, useState } from "react";
import { Image, Transformer } from "react-konva";
import { TAny } from "../../../shared/types/common";

interface ImageElementProps {
  imageEl: ImageElementType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (e: ImageElementType) => void;
}

const ImageElement: React.FC<ImageElementProps> = ({
  imageEl,
  isSelected,
  onSelect,
  onChange,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<TAny>(null);
  const transformerRef = useRef<TAny>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageEl.src;
    img.onload = () => {
      setImage(img);
    };
  }, []);

  useEffect(() => {
    if (imageRef?.current && isSelected) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    image && (
      <>
        <Image
          ref={imageRef}
          image={image}
          x={imageEl.x}
          y={imageEl.y}
          width={imageEl.width}
          height={imageEl.height}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => {
            onChange({
              ...imageEl,
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformEnd={(_) => {
            const node = imageRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // we will reset it back
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...imageEl,
              x: node.x(),
              y: node.y(),
              // set minimal value
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            });
          }}
        />
        {/* Transformer for Image */}
        {isSelected && <Transformer ref={transformerRef} />}
      </>
    )
  );
};

export default ImageElement;
