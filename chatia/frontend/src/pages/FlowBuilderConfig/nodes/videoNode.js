import {
  ContentCopy,
  Delete,
  Image,
  Message,
  Videocam
} from "@mui/icons-material";
import React, { memo } from "react";
import { i18n } from "../../../translate/i18n";
import { BACKEND_URL } from "../../../config/env";

import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const link =
    BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : BACKEND_URL;

  const storageItems = useNodeStorage();

  return (
    <div
      style={{ backgroundColor: "#555", padding: "8px", borderRadius: "8px" }}
    >
      <Handle
        type="target"
        position="left"
        style={{ background: "#0000FF" }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 5,
          top: 5,
          cursor: "pointer",
          gap: 6
        }}
      >
        <ContentCopy
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          sx={{ width: "12px", height: "12px", color: "#ffff" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#ffff" }}
        />
      </div>
      {/* <div style={{position: 'absolute', right: 5, top: 5, cursor: 'pointer'}}>
        <Delete sx={{width: '12px', height: '12px', color: '#ffff'}}/>
      </div> */}
      <div
        style={{
          color: "#ededed",
          fontSize: "16px",
          flexDirection: "row",
          display: "flex"
        }}
      >
        <Videocam
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "4px",
            marginTop: "4px"
          }}
        />
        <div style={{ color: "#ededed", fontSize: "16px" }}>{i18n.t("flowBuilderConfig.nodes.video")}</div>
      </div>
      <div style={{ color: "#ededed", fontSize: "12px", width: 180 }}>
        <video controls="controls" width="180px">
          <source src={`${link}/public/${data.url}`} type="video/mp4" />
          {i18n.t("flowBuilderConfig.nodes.audioNode.browserNotSupported")}
        </video>
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ background: "#0000FF" }}
        isConnectable={isConnectable}
      />
    </div>
  );
});
