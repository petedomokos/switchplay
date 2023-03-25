import React, {useState, useEffect} from 'react'
import { Redirect } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Publish from '@material-ui/icons/Publish'
import { makeStyles } from '@material-ui/core/styles'
import { profilePages, PROFILE_PAGES } from "./constants"

const useStyles = makeStyles(theme => ({
  card: {
    //maxWidth: 600,
    width:"100%",
    height:"100%",
    margin:0,
    padding:0,
    //margin: 'auto',
    textAlign: 'center',
    //marginTop: theme.spacing(5),
    //paddingBottom: theme.spacing(2)
  },
  cardContent:{
    margin:0,
    padding:0,
    width:"100%",
    height:"calc(100% - 60px)",
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    border:"solid"
  },
  cardActions:{
    height:"60px"
  },
  editPhoto:{
    width:"90%",
    height:"90%",
    border:"solid"
  },
  title: {
    //margin: theme.spacing(2),
    height:"60px",
    color: theme.palette.protectedTitle,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  mainContents:{
    width:"100%",
    height:"calc(100% - 60px)",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  selectedWrapper:{
    width:"90%",
    height:props => props.selectedWrapperHeight,
    //margin:"5% 0",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center",
    background:"yellow",
    border:"solid",
    borderWidth:"thin"
  },
  galleryWrapper:{
    width:"90%",
    height:props => props.galleryWrapperHeight,
    //margin:"5% 0%",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center",
    background:"yellow",
    border:"solid",
    borderWidth:"thin"
  },
  sectionTitle:{
    alignSelf:"flex-start",
    background:"pink",
    height:"40px",
    margin:0,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  imgWrapper:{
    width:"100%",
    height:"calc(100% - 40px - 40px)",
    margin:0,//"5%",
    background:"aqua"
  },
  editPhoto:{
    width:"100%",
    height:"calc(100% - 40px - 40px)",
    margin:0,//"5%",
    background:"blue"
  },
  gallery:{
    width:"100%",
    height:props => props.galleryHeight,
    margin:0,//"5%",
    background:"aqua",
  },
  upload:{
    width:"90%",
    height:"70px",
    //maxHeight:"40px",
    //minHeight:"40px",
    margin:0,
    padding:0,
    display:props => props.display.upload,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
    background:"red"
    //margin:"5%",
  },
  sectionCtrls:{
    alignSelf:"flex-end",
    width:"100%",
    height:"40px",
    display:"flex",
    justifyContent:"flex-end",
    background:"orange"
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  btn: {
    margin:"1.5%"
    //margin:"2%",
    //marginLeft: "5px",
    //marginBottom: theme.spacing(2)
  },
  uploadInput:{
    border:"solid",
    padding:0,
    margin:0,//"2.5% 2.5% 0 2.5%",
    width:"100%",
    height:"300px",//"20px",
    display:"flex",
    justifyContent:"flex-start",
    alignItems:"center"
  },
  uploadLabel:{
  },
  filename:{
  }
}))

//next - use formiddible in here to format photo for server before saving
//then save to server
//then retrieve it to display it
export default function Photos({ locationKey/*width, height*/, onSavePhoto }) {
  const [action, setAction] = useState("");
  const [newSelected, setNewSelected] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState("");
  const classes = useStyles({
    selectedWrapperHeight:!action ? "50%" : (action === "editPhoto" ? "calc(100% - 80px)" : "80px"),
    galleryWrapperHeight:!action ? "50%" : (action === "editGallery" ? "calc(100% - 80px)" : "80px"),
    galleryHeight:action === "editGallery" ? "calc(100% - 70px - 40px)" : "calc(100% - 40px - 40px)",
    display:{
      upload:action === "editGallery" ? "flex" : "none"
    }
  })
  const pageInfo = PROFILE_PAGES.find(page => page.key === locationKey) || {};
  const { photoDimns, label="" } = pageInfo;
  const viewboxWidth = photoDimns?.width || 100;
  const viewboxHeight = photoDimns?.height || 150;

  const toggleEditPhoto = () => { setAction(prevState => prevState === "editPhoto" ? "" : "editPhoto"); }
  const toggleEditGallery = () => { setAction(prevState => prevState === "editGallery" ? "" : "editGallery"); }
  const onUploadPhoto = e => { 
    const photo = e.target.files[0];
    console.log("new photo", photo)
    setUploadedPhoto(photo);
    onSavePhoto(photo);
    //@todo: animation whilst uploading...setUploading(true); 
  }

  const clickSubmit = () => { }
  

  //note - editing a photo only applies the edit to the photoLocationType
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h6" className={classes.title}>
          {label} Photo
        </Typography>
        <div className={classes.mainContents}>
          <div className={classes.selectedWrapper}>
              <h5 className={classes.sectionTitle}>Selected</h5>
              {!action && <div className={classes.imgWrapper}></div>}
              {action === "editPhoto" && 
                <div className={classes.editPhoto}> Edit Area - pinch to zoom, or drag</div>
              }
              <div className={classes.sectionCtrls}>
                  {newSelected && 
                    <Button color="primary" variant="contained" onClick={clickSubmit} 
                            className={classes.btn}>Save</Button>
                  }
                  <Button color="primary" variant="contained" 
                          onClick={toggleEditPhoto} className={classes.btn}>Edit</Button>
              </div>
          </div>
              
          <div className={classes.galleryWrapper}>
              <h5 className={classes.sectionTitle}>Gallery</h5>
              <div className={classes.gallery}>
                {uploadedPhoto && <div>show image here</div>}
              </div>
              <UploadPhoto onUpload={onUploadPhoto} photo={uploadedPhoto} classes={classes} />
              <div className={classes.sectionCtrls}>
                  {/**<UploadPhoto/>*/}
                  <Button color="primary" variant="contained" 
                        onClick={toggleEditGallery} className={classes.btn}>
                        {action === "editGallery" ? "Close" : "Edit"}
                </Button>
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

Photos.defaultProps = {
  locationKey: ""
}

//todo - initValue should be the photoForUpload so we dont need to remove it when user closes
function UploadPhoto({ photo, onUpload, classes }){
  return (
    <div className={classes.upload}>
        <input 
            accept="image/*" onChange={onUpload} style={{ display:"none", height:0 }}
            id="icon-button-file" type="file" />
        <label htmlFor="icon-button-file" className={classes.uploadLabel} >
          <Button variant="contained" color="default" component="span">
            Upload
            <Publish/>
          </Button>
        </label>
        <span className={classes.filename}>{photo ? photo.name : ''}</span>
    </div>
  )
}

