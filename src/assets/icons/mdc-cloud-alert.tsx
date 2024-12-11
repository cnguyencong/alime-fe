import { SVGAttributes } from "react";

const MdcCloudAlert = (props: SVGAttributes<SVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    id="mdi-cloud-alert"
    viewBox="0 0 24 24"
  >
    <path d="M21.86 12.5C21.1 11.63 20.15 11.13 19 11C19 9.05 18.32 7.4 16.96 6.04C15.6 4.68 13.95 4 12 4C10.42 4 9 4.47 7.75 5.43S5.67 7.62 5.25 9.15C4 9.43 2.96 10.08 2.17 11.1S1 13.28 1 14.58C1 16.09 1.54 17.38 2.61 18.43C3.69 19.5 5 20 6.5 20H18.5C19.75 20 20.81 19.56 21.69 18.69C22.56 17.81 23 16.75 23 15.5C23 14.35 22.62 13.35 21.86 12.5M13 17H11V15H13V17M13 13H11V7H13V13Z" />
  </svg>
);

export default MdcCloudAlert;