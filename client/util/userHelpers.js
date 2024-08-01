export const createPlayerFromUser = user => ({
    _id:user._id,
    username:user.username,
    firstname:user.firstname,
    surname:user.surname,
    initials:user.initials,
    position:user.position,
    photos:user.photos,
    profilePhoto:user.profilePhoto,  
})