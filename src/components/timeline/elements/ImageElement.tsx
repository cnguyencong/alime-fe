interface ImageElementProps {
  src: string;
}

const ImageElement = ({ src }: ImageElementProps) => {
  return <img src={src} alt="img" />;
};

export default ImageElement;
