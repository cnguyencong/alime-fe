interface TextElementProps {
  text: string;
}

const TextElement = ({ text }: TextElementProps) => {
  return <div>{text}</div>;
};

export default TextElement;
