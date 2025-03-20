import styled from "styled-components";

export const TextElementContainer = styled.div`
  width: 100%;
  height: 100%;
  padding-left: 6px;
`;

interface TextElementProps {
  text: string;
}

const TextElement = ({ text }: TextElementProps) => {
  return <TextElementContainer>{text}</TextElementContainer>;
};

export default TextElement;
