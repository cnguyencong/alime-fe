import styled from "styled-components";

export const ImageElementContainer = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

interface ImageElementProps {
  src: string;
}

const ImageElement = ({ src }: ImageElementProps) => {
  return <ImageElementContainer src={src} alt="img" />;
};

export default ImageElement;
