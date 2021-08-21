import React from "react";
import { useDropzone } from "react-dropzone";

import { FormGroup, Label, Jumbotron } from "reactstrap";

export default function FileUpload({ label }) {
  return (
    <FormGroup>
      {label && <Label>{label}:</Label>}
      <Jumbotron>
        <p className="text-muted text-center">Drag n drop files</p>
      </Jumbotron>
    </FormGroup>
  );
}
