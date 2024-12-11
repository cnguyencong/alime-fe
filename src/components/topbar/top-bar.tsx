import { observer } from "mobx-react-lite";
import {
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
  Popover,
} from "@blueprintjs/core";

import { FaGithub } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { BiCodeBlock } from "react-icons/bi";
import styled from "polotno/utils/styled";

import { useProject } from "../../utils/project";

import { FileMenu } from "./file-menu";
import { DownloadButton } from "./download-button";
import { UserMenu } from "./user-menu";
import { CloudWarning } from "../cloud-warning";
import { Project } from "../../utils/project";
import MdcCloudAlert from "../../assets/icons/mdc-cloud-alert";
import MdcCloudCheck from "../../assets/icons/mdc-cloud.check";
import MdcCloudSync from "../../assets/icons/mdc-cloud-sync";
import { StoreType } from "polotno/model/store";

const NavbarContainer = styled("div")`
  white-space: nowrap;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled("div")`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

type StatusProps = Readonly<{
  project: Project;
}>;

const Status = observer(({ project }: StatusProps) => {
  return (
    <Popover
      content={
        <div style={{ padding: "10px", maxWidth: "300px" }}>
          {!project.cloudEnabled && <CloudWarning />}
          {project.cloudEnabled && project.status === "saved" && (
            <>
              You data is saved with{" "}
              <a href="https://puter.com" target="_blank">
                Puter.com
              </a>
            </>
          )}
          {project.cloudEnabled &&
            (project.status === "saving" || project.status === "has-changes") &&
            "Saving..."}
        </div>
      }
      interactionKind="hover"
    >
      <div style={{ padding: "0 5px" }}>
        {!project.cloudEnabled ? (
          <MdcCloudAlert
            className="bp5-icon"
            style={{ fontSize: "25px", opacity: 0.8 }}
          />
        ) : project.status === "saved" ? (
          <MdcCloudCheck
            className="bp5-icon"
            style={{ fontSize: "25px", opacity: 0.8 }}
          />
        ) : (
          <MdcCloudSync
            className="bp5-icon"
            style={{ fontSize: "25px", opacity: 0.8 }}
          />
        )}
      </div>
    </Popover>
  );
});

type Props = Readonly<{
  store: StoreType;
}>;

export default observer(({ store }: Props) => {
  const project = useProject();

  return (
    <NavbarContainer className="bp5-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FileMenu store={store} project={project} />
          <div
            style={{
              paddingLeft: "20px",
              maxWidth: "200px",
            }}
          >
            <EditableText
              value={window.project.name}
              placeholder="Design name"
              onChange={(name) => {
                window.project.name = name;
                window.project.requestSave();
              }}
            />
          </div>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Status project={project} />

          <AnchorButton
            href="https://polotno.com"
            target="_blank"
            minimal
            icon={
              <BiCodeBlock className="bp5-icon" style={{ fontSize: "20px" }} />
            }
          >
            API
          </AnchorButton>

          <AnchorButton
            minimal
            href="https://github.com/lavrton/polotno-studio"
            target="_blank"
            icon={
              <FaGithub className="bp5-icon" style={{ fontSize: "20px" }} />
            }
          ></AnchorButton>
          <AnchorButton
            minimal
            href="https://twitter.com/lavrton"
            target="_blank"
            icon={
              <FaTwitter className="bp5-icon" style={{ fontSize: "20px" }} />
            }
          ></AnchorButton>
          <NavbarDivider />
          <DownloadButton store={store} />
          <UserMenu />
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
