import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { createDatapointsFromData } from './dataCreationHelpers';

const useStyles = makeStyles((theme) => ({
  root: {
    width:"100%",
    height:window._screen.height * 0.7,
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
  },
  dropZone:{
    width:"90%",
    height:"90%",
    background:props => props.importState === "importing" ? "#00008B" : (props.importState === "entered" ? "blue" : "aqua"),
    borderRadius: "10% 10% 10% 10%",
    display:"flex",
    justifyContent:"center",
    alignItems:props => !props.importState ? "center" : "start",
    color:"white"
  },
  btn:{
    width:"80px",
    height:"30px",
    margin:"5px",
    fontSize:"1rem",
  },
}))

//width and height may be full screen, but may not be
const ImportData = ({ datasets, submit }) => {
  const [importState, setImportState] = useState("");
  console.log("ImportData...datasets", datasets)
  const styleProps = { importState };
  const classes = useStyles(styleProps) 

  useEffect(() => {
  }, [])

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.setData("text", e.target.id);
    setImportState("entered");
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    if(importState === "entered"){
      setImportState("");
    }
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e,d) => {
    e.preventDefault();
    e.stopPropagation();
    setImportState("importing");

    let dt = e.dataTransfer
    let files = dt.files
    const input = files[0];
    if(input.type !== "text/csv"){
      alert("Please export the file to CSV format first. Thanks!")
      setImportState("");
      return;
    }
    const filename = input.name.split(".")[0];
    console.log("filename", filename)
    //todo - name convention is as follows:
    //part 1 ie nameParts[0] is import type
    //parts 2 onwards are info identifiers for the specific import type

    const nameParts = filename.split("-");
    const importType = nameParts[0];
    const info = nameParts.slice(1, nameParts.length);
    if(!importType){
      alert("Sorry, the file name must start with a valid import type");
      setImportState("");
      return;
    }
    console.log("import_type", importType);
    console.log("info", info);
    const reader = new FileReader();
    reader.onload = function (e) {
      const res = e.target.result;
      //console.log("res", res)
      const parsedData = d3.csvParse(res);
      console.log("parsed", parsedData);
      if(importType === "datasets"){
        //name convention for datasets is simply the ownername,
        //and (optional) whether owner is a user or a group eg name-user or name-group
        //part 2 (nameParts[1])
        const ownerName = info[0];
        const ownerType = info[1] || "user";
        console.log("save datasets")
      }else if(importType === "datapoints"){
        //name convention: ownerName (user or group) - datasetKey
        const ownerName = info[0];
        const datasetKey = info[1];

        //check if combination of datasetKey/owner username is in the users administeredDatasets
        //if so, get the datasetId from it
        //note - it is possible that the signed in user is the owner but that
        //they also administer another dataset that they are not teh owber of that
        //has the same name, so need to check owner to get the right dataset
        
        //include mutually owned public datasets ie those that dont have owner
        const isPublic = dset => !dset.userOwner && !dset.groupOwner;
        const applicableDatasets = datasets
          .filter(dset => isPublic(dset) || dset.userOwner === ownerName || dset.groupOwner === ownerName)
        
        const dataset = applicableDatasets.find(dset => dset.key === datasetKey);
        console.log("dataset", dataset)

        if(!dataset){
          alert("Sorry, we can't find a dataset that you own with that key.");
          setImportState("");
          return;
        }
        const datapoints = createDatapointsFromData(parsedData, dataset);
        console.log("datapoints", datapoints);
        //submit(datapoints, importType, { datasetId:dataset._id })

        //then save datapoints to that dataset using correct url route
        // eg /datasets/datasetId/datapoints/create or make oen that adds multiple datapoints
        //or adapt this one to handle multiple points ie so it saves an array of length 1 in CreateDatapoint
        //and then instead of using .push in controller, add all points using equiv of spread
        //for mongodb api
      }
      else if(importType === "users"){
        console.log("save users")
      }
      else if(importType === "groups"){
        console.log("save groups")
      }
      

      //temp mock 
      setTimeout(() => {
        setImportState("");
      },1000)
  
      //identify what the fle is about,
      //call api action to save rows eg as datapoints, datasets, users or groups
    };
    reader.readAsText(input);

  };

  const getMesg = () => {
    switch(importState){
      case "entered":{ return "Release to start import"; }
      case "importing": {return "Importing..."; }
      case "error": { return ""; }
      default: { return "Drag Your File on"; }
    }
  }

  return (
    <div className={classes.root}>
        <div id="drop_zone"
            className={classes.dropZone}
            onDrop={e => handleDrop(e)}
            onDragOver={e => handleDragOver(e)}
            onDragEnter={e => handleDragEnter(e)}
            onDragLeave={e => handleDragLeave(e)} >
            <p>{getMesg()}</p>
        </div>
    </div>
  )
}

export default ImportData;

ImportData.defaultProps = {
}
