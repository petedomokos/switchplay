import React, {useState, useEffect} from 'react'
import { Redirect } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Publish from '@material-ui/icons/Publish'
import { makeStyles } from '@material-ui/core/styles'
import { profilePages, PROFILE_PAGES, getURLForUser } from "./constants"
import { sortDescending } from '../../util/ArrayHelpers';

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
  selectedImgWrapper:{
    width:"100%",
    height:"calc(100% - 40px - 40px)",
    margin:0,//"5%",
    background:"aqua"
  },
  selectedImage:{
    border:"solid"

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
  },
  galleryPhotosArea:{
    width:"100%",
    display:"flex",
    flexWrap:"wrap",
    justifyContent:"flex-start",
    alignItems:"start"
  },
  galleryPhoto:{
    height:"40px",
    margin:"5px",
    //background:"grey"
  }
}))

//next - use formiddible in here to format photo for server before saving
//then save to server
//then retrieve it to display it
export default function Photos({ userId, userPhotos, selectedPhotoId, locationKey/*width, height*/, onSavePhoto, onSelect }) {
  //console.log("Photos", userPhotos)
  //console.log("selectedPhoto", selectedPhotoId)
  const [action, setAction] = useState("");
  const [newSelected, setNewSelected] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState("");
  const classes = useStyles({
    selectedWrapperHeight:!action ? "50%" : (action === "editPhoto" ? "calc(100% - 80px)" : "80px"),
    galleryWrapperHeight:!action ? "50%" : (action === "editGallery" ? "calc(100% - 80px)" : "80px"),
    galleryHeight:action === "editGallery" ? "calc(100% - 70px - 40px)" : "calc(100% - 40px - 40px)",
    display:{
      upload:action === "editGallery" ? "flex" : "none"
    }
  })
  //@todo - d.added should be converted to Date in hydrate function
  const orderedPhotos = sortDescending(userPhotos, d => new Date(d.added));
  //const orderedPhotos = [..._orderedPhotos, ..._orderedPhotos, ..._orderedPhotos, ..._orderedPhotos]
  //console.log("orderd", orderedPhotos)
  const pageInfo = PROFILE_PAGES.find(page => page.key === locationKey) || {};
  const { photoDimns, label="" } = pageInfo;
  const viewboxWidth = photoDimns?.width || 100;
  const viewboxHeight = photoDimns?.height || 150;

  const toggleEditPhoto = () => { setAction(prevState => prevState === "editPhoto" ? "" : "editPhoto"); }
  const toggleEditGallery = () => { setAction(prevState => prevState === "editGallery" ? "" : "editGallery"); }
  const onUploadPhoto = e => { 
    const photo = e.target.files[0];
    setUploadingPhoto(photo);
    onSavePhoto(photo);
    //@todo: animation whilst uploading...setUploading(true); 
  }

  const clickSubmit = () => { }

  const getURL = getURLForUser(userId);
  
  
  const onClickPhoto = (photo) => {
    console.log("photo", photo)
    onSelect({ 
      locationKey, 
      mediaId:photo._id
    })
  }

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
              {!action && <div className={classes.selectedImgWrapper}>
                <img className={classes.selectedImage} src={getURL(selectedPhotoId || orderedPhotos[0]._id)} alt="Not loaded" width="150" height="100"/>
              </div>}
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
              <Gallery photos={orderedPhotos} selectedId={selectedPhotoId} getURL={getURL} onClick={onClickPhoto} classes={classes} />
              <UploadPhoto onUpload={onUploadPhoto} photo={uploadingPhoto} classes={classes} />
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
            accept="selectedImage/*" onChange={onUpload} style={{ display:"none", height:0 }}
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

function Gallery({ userId, photos, getURL, selectedId, onClick, classes }){
  return (
    <div className={classes.gallery}>
      <div className={classes.galleryPhotosArea}>
        {photos.map((photo,i) => (
          <div key={`photo-${i}`} className={classes.galleryPhoto} onClick={() => onClick(photo)}>
            <img className={classes.selectedImage} src={getURL(photo._id)} alt="Not loaded" height="100%"/>
          </div>
        ))}
      </div>
    </div>
  )
}

